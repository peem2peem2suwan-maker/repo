import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { checkBookingConflict } from '@/lib/collision';
import { logAudit } from '@/lib/audit';
import { broadcastEvent, RealtimeEvents } from '@/lib/sse';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const booking = await prisma.booking.findUnique({
      where: { id: params.id },
      include: {
        room: {
          include: { equipment: { include: { equipment: true } } },
        },
        user: { select: { id: true, name: true, email: true, department: true } },
        participants: true,
        equipmentRequested: { include: { equipment: true } },
      },
    });

    if (!booking) {
      return NextResponse.json({ error: 'ไม่พบรายการจอง' }, { status: 404 });
    }

    return NextResponse.json({ booking });
  } catch (error) {
    return NextResponse.json({ error: 'เกิดข้อผิดพลาดในการดึงข้อมูลการจอง' }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'กรุณาเข้าสู่ระบบ' }, { status: 401 });
    }

    const booking = await prisma.booking.findUnique({
      where: { id: params.id },
      include: { room: true },
    });

    if (!booking) {
      return NextResponse.json({ error: 'ไม่พบรายการจอง' }, { status: 404 });
    }

    // Role check: User can only edit own booking
    if (user.role === 'USER' && booking.userId !== user.id) {
      return NextResponse.json({ error: 'คุณไม่มีสิทธิ์แก้ไขการจองของผู้อื่น' }, { status: 403 });
    }

    const body = await req.json();
    const { title, description, startTime, endTime, participantsCount, organizerName, roomId } = body;

    const targetRoomId = roomId || booking.roomId;
    const start = startTime ? new Date(startTime) : booking.startTime;
    const end = endTime ? new Date(endTime) : booking.endTime;
    const pCount = participantsCount ? Number(participantsCount) : booking.participantsCount;

    // Check collision excluding current booking
    const conflictResult = await checkBookingConflict(targetRoomId, start, end, pCount, booking.id);
    if (conflictResult.hasConflict) {
      return NextResponse.json(
        { error: conflictResult.reason, conflictDetails: conflictResult },
        { status: 409 }
      );
    }

    const updated = await prisma.booking.update({
      where: { id: params.id },
      data: {
        roomId: targetRoomId,
        title: title !== undefined ? title : booking.title,
        description: description !== undefined ? description : booking.description,
        startTime: start,
        endTime: end,
        participantsCount: pCount,
        organizerName: organizerName !== undefined ? organizerName : booking.organizerName,
      },
      include: { room: true, user: true },
    });

    await logAudit({
      userId: user.id,
      action: 'UPDATE_BOOKING',
      entity: 'BOOKING',
      entityId: updated.id,
      details: { bookingCode: updated.bookingCode },
    });

    broadcastEvent(RealtimeEvents.BOOKING_UPDATED, { booking: updated });

    return NextResponse.json({ success: true, booking: updated });
  } catch (error: any) {
    console.error('Error updating booking:', error);
    return NextResponse.json({ error: 'เกิดข้อผิดพลาดในการแก้ไขการจอง' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'กรุณาเข้าสู่ระบบ' }, { status: 401 });
    }

    const booking = await prisma.booking.findUnique({
      where: { id: params.id },
      include: { room: true, user: true },
    });

    if (!booking) {
      return NextResponse.json({ error: 'ไม่พบรายการจอง' }, { status: 404 });
    }

    if (user.role === 'USER' && booking.userId !== user.id) {
      return NextResponse.json({ error: 'คุณไม่มีสิทธิ์ยกเลิกการจองของผู้อื่น' }, { status: 403 });
    }

    // Mark as CANCELLED rather than hard delete to retain reports accuracy
    const cancelled = await prisma.booking.update({
      where: { id: params.id },
      data: { status: 'CANCELLED' },
      include: { room: true },
    });

    // Notify user if cancelled by manager/admin, or notify managers if cancelled by user
    if (booking.userId !== user.id) {
      await prisma.notification.create({
        data: {
          userId: booking.userId,
          bookingId: booking.id,
          title: 'การจองห้องประชุมถูกยกเลิก',
          message: `การจองห้อง ${booking.room.name} (${booking.title}) ได้ถูกยกเลิกโดยผู้ดูแลระบบ`,
          type: 'BOOKING_CANCELLED',
          linkUrl: '/my-bookings',
        },
      });
    }

    await logAudit({
      userId: user.id,
      action: 'CANCEL_BOOKING',
      entity: 'BOOKING',
      entityId: booking.id,
      details: { bookingCode: booking.bookingCode, cancelledBy: user.name },
    });

    broadcastEvent(RealtimeEvents.BOOKING_CANCELLED, { booking: cancelled });

    return NextResponse.json({ success: true, message: 'ยกเลิกการจองห้องประชุมสำเร็จ' });
  } catch (error) {
    return NextResponse.json({ error: 'เกิดข้อผิดพลาดในการยกเลิกการจอง' }, { status: 500 });
  }
}
