import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { logAudit } from '@/lib/audit';
import { broadcastEvent, RealtimeEvents } from '@/lib/sse';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const capacity = searchParams.get('capacity');
    const building = searchParams.get('building');
    const floor = searchParams.get('floor');
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    const equipment = searchParams.get('equipment'); // comma-separated or single

    const where: any = {};

    if (capacity) {
      where.capacity = { gte: parseInt(capacity, 10) };
    }

    if (building && building !== 'ALL') {
      where.building = { contains: building };
    }

    if (floor && floor !== 'ALL') {
      where.floor = parseInt(floor, 10);
    }

    if (status && status !== 'ALL') {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { code: { contains: search } },
        { building: { contains: search } },
      ];
    }

    if (equipment && equipment !== 'ALL') {
      where.equipment = {
        some: {
          equipment: {
            name: { contains: equipment },
          },
        },
      };
    }

    const rooms = await prisma.room.findMany({
      where,
      include: {
        equipment: {
          include: {
            equipment: true,
          },
        },
      },
      orderBy: { code: 'asc' },
    });

    // Calculate dynamic real-time room status based on current active bookings
    const now = new Date();
    const endOfDay = new Date(now);
    endOfDay.setHours(23, 59, 59, 999);

    const activeBookings = await prisma.booking.findMany({
      where: {
        status: 'APPROVED',
        startTime: { lte: endOfDay },
        endTime: { gte: now },
      },
      include: {
        user: { select: { name: true, department: true } },
      },
    });

    const enrichedRooms = rooms.map((room) => {
      if (room.status === 'MAINTENANCE') {
        return { ...room, status: 'MAINTENANCE', currentBooking: null };
      }

      // Check if currently occupied right now
      const currentBooking = activeBookings.find(
        (b) => b.roomId === room.id && now >= b.startTime && now < b.endTime
      );

      if (currentBooking) {
        return {
          ...room,
          status: 'OCCUPIED' as const,
          currentBooking,
        };
      }

      // Check if reserved for later today
      const upcomingToday = activeBookings.find(
        (b) => b.roomId === room.id && b.startTime > now
      );

      if (upcomingToday) {
        return {
          ...room,
          status: 'RESERVED' as const,
          currentBooking: upcomingToday,
        };
      }

      return {
        ...room,
        status: 'AVAILABLE' as const,
        currentBooking: null,
      };
    });

    return NextResponse.json({ rooms: enrichedRooms });
  } catch (error) {
    console.error('Error fetching rooms:', error);
    return NextResponse.json({ error: 'เกิดข้อผิดพลาดในการดึงข้อมูลห้องประชุม' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'ไม่มีสิทธิ์ดำเนินการ ต้องเป็น Admin เท่านั้น' }, { status: 403 });
    }

    const body = await req.json();
    const { code, name, building, floor, capacity, description, imageUrl, status, equipmentIds } = body;

    if (!code || !name || !building || !floor || !capacity) {
      return NextResponse.json({ error: 'กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน' }, { status: 400 });
    }

    const existing = await prisma.room.findUnique({ where: { code } });
    if (existing) {
      return NextResponse.json({ error: `รหัสห้อง ${code} มีอยู่ในระบบแล้ว` }, { status: 400 });
    }

    const room = await prisma.room.create({
      data: {
        code,
        name,
        building,
        floor: Number(floor),
        capacity: Number(capacity),
        description,
        imageUrl: imageUrl || 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800',
        status: status || 'AVAILABLE',
        equipment: equipmentIds && equipmentIds.length > 0 ? {
          create: equipmentIds.map((eqId: string) => ({
            equipmentId: eqId,
            quantity: 1,
          })),
        } : undefined,
      },
      include: {
        equipment: { include: { equipment: true } },
      },
    });

    await logAudit({
      userId: user.id,
      action: 'CREATE_ROOM',
      entity: 'ROOM',
      entityId: room.id,
      details: { code: room.code, name: room.name },
    });

    broadcastEvent(RealtimeEvents.ROOM_STATUS_CHANGED, { room });

    return NextResponse.json({ success: true, room }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating room:', error);
    return NextResponse.json({ error: 'เกิดข้อผิดพลาดในการสร้างห้องประชุม' }, { status: 500 });
  }
}
