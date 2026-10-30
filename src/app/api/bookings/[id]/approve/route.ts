import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { logAudit } from '@/lib/audit';
import { broadcastEvent, RealtimeEvents } from '@/lib/sse';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user || !['ADMIN', 'MANAGER'].includes(user.role)) {
      return NextResponse.json({ error: 'ไม่มีสิทธิ์อนุมัติ ต้องเป็น Manager หรือ Admin เท่านั้น' }, { status: 403 });
    }

    const booking = await prisma.booking.findUnique({
      where: { id: params.id },
      include: { room: true, user: true },
    });

    if (!booking) {
      return NextResponse.json({ error: 'ไม่พบรายการจอง' }, { status: 404 });
    }

    const approved = await prisma.booking.update({
      where: { id: params.id },
      data: { status: 'APPROVED' },
      include: { room: true },
    });

    // Notify user in real-time
    const notif = await prisma.notification.create({
      data: {
        userId: booking.userId,
        bookingId: booking.id,
        title: 'การจองห้องประชุมของคุณได้รับการอนุมัติแล้ว',
        message: `ห้อง ${booking.room.name} หัวข้อ "${booking.title}" ได้รับการอนุมัติแล้ว`,
        type: 'BOOKING_APPROVED',
        linkUrl: '/my-bookings',
      },
    });

    await logAudit({
      userId: user.id,
      action: 'APPROVE_BOOKING',
      entity: 'BOOKING',
      entityId: booking.id,
      details: { bookingCode: booking.bookingCode, approvedBy: user.name },
    });

    broadcastEvent(RealtimeEvents.BOOKING_APPROVED, { booking: approved });
    broadcastEvent(RealtimeEvents.NOTIFICATION_NEW, { notification: notif }, booking.userId);

    return NextResponse.json({ success: true, booking: approved });
  } catch (error) {
    console.error('Error approving booking:', error);
    return NextResponse.json({ error: 'เกิดข้อผิดพลาดในการอนุมัติการจอง' }, { status: 500 });
  }
}
