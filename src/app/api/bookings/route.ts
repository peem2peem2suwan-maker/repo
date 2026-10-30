import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { checkBookingConflict } from '@/lib/collision';
import { logAudit } from '@/lib/audit';
import { broadcastEvent, RealtimeEvents } from '@/lib/sse';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'กรุณาเข้าสู่ระบบก่อน' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const roomId = searchParams.get('roomId');
    const scope = searchParams.get('scope'); // 'mine' or 'all'

    const where: any = {};

    // Standard user can only see their own bookings unless viewing all for calendar/room view
    if (user.role === 'USER' || scope === 'mine') {
      where.userId = user.id;
    }

    if (status && status !== 'ALL') {
      where.status = status;
    }

    if (roomId && roomId !== 'ALL') {
      where.roomId = roomId;
    }

    const bookings = await prisma.booking.findMany({
      where,
      include: {
        room: {
          include: {
            equipment: { include: { equipment: true } },
          },
        },
        user: {
          select: { id: true, name: true, email: true, department: true, role: true, avatar: true },
        },
        participants: true,
        equipmentRequested: {
          include: { equipment: true },
        },
      },
      orderBy: { startTime: 'desc' },
    });

    return NextResponse.json({ bookings });
  } catch (error) {
    console.error('Error fetching bookings:', error);
    return NextResponse.json({ error: 'เกิดข้อผิดพลาดในการดึงข้อมูลการจอง' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'กรุณาเข้าสู่ระบบก่อนทำการจองห้อง' }, { status: 401 });
    }

    const body = await req.json();
    const {
      roomId,
      title,
      description,
      startTime,
      endTime,
      participantsCount,
      organizerName,
      participants,
      equipmentIds,
    } = body;

    if (!roomId || !title || !startTime || !endTime || !participantsCount) {
      return NextResponse.json({ error: 'กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน' }, { status: 400 });
    }

    const start = new Date(startTime);
    const end = new Date(endTime);
    const pCount = Number(participantsCount);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return NextResponse.json({ error: 'รูปแบบวันเวลาไม่ถูกต้อง' }, { status: 400 });
    }

    if (start >= end) {
      return NextResponse.json({ error: 'เวลาสิ้นสุดต้องมากกว่าเวลาเริ่มต้น' }, { status: 400 });
    }

    // 1. Check conflicts using collision detector
    const conflictResult = await checkBookingConflict(roomId, start, end, pCount);
    if (conflictResult.hasConflict) {
      return NextResponse.json(
        {
          error: conflictResult.reason,
          conflictDetails: conflictResult,
        },
        { status: 409 }
      );
    }

    // 2. Determine initial status: Admin / Manager can auto-approve, standard User is PENDING
    const initialStatus = user.role === 'ADMIN' ? 'APPROVED' : 'PENDING';

    // 3. Generate unique booking code
    const dateStr = start.toISOString().slice(0, 10).replace(/-/g, '');
    const randomSuffix = Math.floor(100 + Math.random() * 900);
    const bookingCode = `BKG-${dateStr}-${randomSuffix}`;

    // 4. Execute creation in ACID transaction with second lock check
    const booking = await prisma.$transaction(async (tx) => {
      // Re-verify conflict inside transaction to prevent race conditions
      const overlap = await tx.booking.findFirst({
        where: {
          roomId,
          status: { in: ['APPROVED', 'PENDING'] },
          AND: [
            { startTime: { lt: end } },
            { endTime: { gt: start } },
          ],
        },
      });

      if (overlap) {
        throw new Error('ช่วงเวลานี้เพิ่งถูกจองโดยผู้อื่น กรุณาลองเลือกเวลาหรือห้องใหม่');
      }

      return await tx.booking.create({
        data: {
          bookingCode,
          roomId,
          userId: user.id,
          title,
          description,
          startTime: start,
          endTime: end,
          participantsCount: pCount,
          organizerName: organizerName || user.name,
          status: initialStatus,
          participants: participants && participants.length > 0 ? {
            create: participants.map((p: any) => ({
              name: typeof p === 'string' ? p : p.name,
              email: typeof p === 'string' ? null : p.email,
            })),
          } : undefined,
          equipmentRequested: equipmentIds && equipmentIds.length > 0 ? {
            create: equipmentIds.map((eqId: string) => ({
              equipmentId: eqId,
            })),
          } : undefined,
        },
        include: {
          room: true,
          user: true,
          participants: true,
        },
      });
    });

    // 5. Create notifications for Managers & Admins if PENDING, or for the user if APPROVED
    if (initialStatus === 'PENDING') {
      const managersAndAdmins = await prisma.user.findMany({
        where: { role: { in: ['ADMIN', 'MANAGER'] }, status: 'ACTIVE' },
        select: { id: true },
      });

      for (const m of managersAndAdmins) {
        await prisma.notification.create({
          data: {
            userId: m.id,
            bookingId: booking.id,
            title: 'มีการจองห้องประชุมใหม่รอการอนุมัติ',
            message: `${booking.organizerName} ได้ส่งคำขอจองห้อง ${booking.room.name} วันที่ ${start.toLocaleDateString('th-TH')}`,
            type: 'BOOKING_CREATED',
            linkUrl: '/all-bookings',
          },
        });
      }
    } else {
      await prisma.notification.create({
        data: {
          userId: user.id,
          bookingId: booking.id,
          title: 'การจองห้องประชุมสำเร็จ',
          message: `การจองห้อง ${booking.room.name} ได้รับการอนุมัติแล้ว`,
          type: 'BOOKING_APPROVED',
          linkUrl: '/my-bookings',
        },
      });
    }

    // 6. Log audit
    await logAudit({
      userId: user.id,
      action: 'CREATE_BOOKING',
      entity: 'BOOKING',
      entityId: booking.id,
      details: {
        bookingCode: booking.bookingCode,
        room: booking.room.name,
        status: booking.status,
      },
    });

    // 7. Broadcast real-time SSE event to all connected clients
    broadcastEvent(RealtimeEvents.BOOKING_CREATED, {
      booking: {
        id: booking.id,
        bookingCode: booking.bookingCode,
        roomId: booking.roomId,
        title: booking.title,
        startTime: booking.startTime,
        endTime: booking.endTime,
        status: booking.status,
      },
      room: booking.room,
    });

    return NextResponse.json({ success: true, booking }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating booking:', error);
    return NextResponse.json(
      { error: error.message || 'เกิดข้อผิดพลาดในการบันทึกการจองห้องประชุม' },
      { status: 500 }
    );
  }
}
