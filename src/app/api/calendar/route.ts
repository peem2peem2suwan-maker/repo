import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'กรุณาเข้าสู่ระบบ' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const roomId = searchParams.get('roomId');
    const startStr = searchParams.get('start');
    const endStr = searchParams.get('end');

    const where: any = {
      status: { in: ['APPROVED', 'PENDING'] },
    };

    if (roomId && roomId !== 'ALL') {
      where.roomId = roomId;
    }

    if (startStr && endStr) {
      where.startTime = { gte: new Date(startStr) };
      where.endTime = { lte: new Date(endStr) };
    }

    const bookings = await prisma.booking.findMany({
      where,
      include: {
        room: true,
        user: { select: { id: true, name: true, email: true, department: true } },
        participants: true,
      },
      orderBy: { startTime: 'asc' },
    });

    const events = bookings.map((b) => ({
      id: b.id,
      bookingCode: b.bookingCode,
      title: b.title,
      start: b.startTime.toISOString(),
      end: b.endTime.toISOString(),
      status: b.status,
      room: {
        id: b.room.id,
        code: b.room.code,
        name: b.room.name,
        building: b.room.building,
        floor: b.room.floor,
        capacity: b.room.capacity,
      },
      organizer: {
        id: b.user.id,
        name: b.organizerName || b.user.name,
        department: b.user.department,
        email: b.user.email,
      },
      participantsCount: b.participantsCount,
      description: b.description,
      isOwner: b.userId === user.id,
    }));

    return NextResponse.json({ events });
  } catch (error) {
    console.error('Error fetching calendar events:', error);
    return NextResponse.json({ error: 'เกิดข้อผิดพลาดในการดึงข้อมูลปฏิทิน' }, { status: 500 });
  }
}
