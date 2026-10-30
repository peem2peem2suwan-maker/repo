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
      return NextResponse.json({ error: 'ไม่มีสิทธิ์ปฏิเสธ ต้องเป็น Manager หรือ Admin เท่านั้น' }, { status: 403 });
    }

    const { reason } = await req.json();

    const booking = await prisma.booking.findUnique({
      where: { id: params.id },
      include: { room: true, user: true },
    });

    if (!booking) {
      return NextResponse.json({ error: 'ไม่พบรายการจอง' }, { status: 404 });
    }

    const rejected = await prisma.booking.update({
      where: { id: params.id },
      data: {
        status: 'REJECTED',
        rejectionReason: reason || 'ไม่ผ่านเกณฑ์การอนุมัติ',
      },
      include: { room: true },
    });

    // Notify user in real-time
    const notif = await prisma.notification.create({
      data: {
        userId: booking.userId,
        bookingId: booking.id,
        title: 'การจองห้องประชุมของคุณถูกปฏิเสธ',
        message: `ห้อง ${booking.room.name} หัวข้อ "${booking.title}" ถูกปฏิเสธ: ${reason || 'ไม่ระบุเหตุผล'}`,
        type: 'BOOKING_REJECTED',
        linkUrl: '/my-bookings',
      },
    });

    await logAudit({
      userId: user.id,
      action: 'REJECT_BOOKING',
      entity: 'BOOKING',
      entityId: booking.id,
      details: { bookingCode: booking.bookingCode, reason, rejectedBy: user.name },
    });

    broadcastEvent(RealtimeEvents.BOOKING_REJECTED, { booking: rejected });
    broadcastEvent(RealtimeEvents.NOTIFICATION_NEW, { notification: notif }, booking.userId);

    return NextResponse.json({ success: true, booking: rejected });
  } catch (error) {
    console.error('Error rejecting booking:', error);
    return NextResponse.json({ error: 'เกิดข้อผิดพลาดในการปฏิเสธการจอง' }, { status: 500 });
  }
}
