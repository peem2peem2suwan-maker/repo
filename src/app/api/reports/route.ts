import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || !['ADMIN', 'MANAGER'].includes(user.role)) {
      return NextResponse.json({ error: 'ไม่มีสิทธิ์เข้าถึงรายงาน' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const range = searchParams.get('range') || 'month'; // today, week, month, year, custom
    const startDateParam = searchParams.get('startDate');
    const endDateParam = searchParams.get('endDate');

    const now = new Date();
    let startDate: Date;
    let endDate: Date = new Date(now);
    endDate.setHours(23, 59, 59, 999);

    if (range === 'today') {
      startDate = new Date(now);
      startDate.setHours(0, 0, 0, 0);
    } else if (range === 'week') {
      startDate = new Date(now);
      startDate.setDate(now.getDate() - 7);
      startDate.setHours(0, 0, 0, 0);
    } else if (range === 'year') {
      startDate = new Date(now.getFullYear(), 0, 1);
    } else if (range === 'custom' && startDateParam && endDateParam) {
      startDate = new Date(startDateParam);
      endDate = new Date(endDateParam);
      endDate.setHours(23, 59, 59, 999);
    } else {
      // Default: this month
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    }

    const where = {
      startTime: { gte: startDate, lte: endDate },
    };

    // 1. Fetch bookings in range
    const bookings = await prisma.booking.findMany({
      where,
      include: {
        room: true,
        user: { select: { id: true, name: true, department: true, email: true } },
      },
      orderBy: { startTime: 'desc' },
    });

    const totalBookings = bookings.length;
    const completedOrApproved = bookings.filter((b) => ['APPROVED', 'COMPLETED'].includes(b.status));
    const cancellationsCount = bookings.filter((b) => b.status === 'CANCELLED').length;
    const rejectedCount = bookings.filter((b) => b.status === 'REJECTED').length;

    // Calculate total hours
    let totalUsageHours = 0;
    completedOrApproved.forEach((b) => {
      const hrs = (b.endTime.getTime() - b.startTime.getTime()) / (1000 * 60 * 60);
      totalUsageHours += Math.max(0, hrs);
    });

    // Group by room
    const roomMap: Record<string, { room: any; count: number; hours: number }> = {};
    const allRooms = await prisma.room.findMany();
    allRooms.forEach((r) => {
      roomMap[r.id] = { room: r, count: 0, hours: 0 };
    });

    completedOrApproved.forEach((b) => {
      if (roomMap[b.roomId]) {
        roomMap[b.roomId].count++;
        const hrs = (b.endTime.getTime() - b.startTime.getTime()) / (1000 * 60 * 60);
        roomMap[b.roomId].hours += Math.max(0, hrs);
      }
    });

    const roomBreakdown = Object.values(roomMap).sort((a, b) => b.count - a.count);
    const mostUsedRoom = roomBreakdown.length > 0 && roomBreakdown[0].count > 0 ? roomBreakdown[0].room.name : '-';
    const leastUsedRoom = roomBreakdown.length > 0 ? roomBreakdown[roomBreakdown.length - 1].room.name : '-';

    // Group by user
    const userMap: Record<string, { user: any; count: number; hours: number }> = {};
    completedOrApproved.forEach((b) => {
      if (!userMap[b.userId]) {
        userMap[b.userId] = { user: b.user, count: 0, hours: 0 };
      }
      userMap[b.userId].count++;
      const hrs = (b.endTime.getTime() - b.startTime.getTime()) / (1000 * 60 * 60);
      userMap[b.userId].hours += Math.max(0, hrs);
    });

    const userBreakdown = Object.values(userMap).sort((a, b) => b.count - a.count);

    return NextResponse.json({
      summary: {
        totalBookings,
        approvedCount: completedOrApproved.length,
        totalUsageHours: Math.round(totalUsageHours * 10) / 10,
        mostUsedRoom,
        leastUsedRoom,
        cancellationsCount,
        rejectedCount,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      },
      roomBreakdown,
      userBreakdown,
      bookingsList: bookings.map((b) => ({
        id: b.id,
        bookingCode: b.bookingCode,
        title: b.title,
        roomName: b.room.name,
        roomCode: b.room.code,
        organizer: b.organizerName || b.user.name,
        department: b.user.department,
        startTime: b.startTime,
        endTime: b.endTime,
        durationHours: Math.round(((b.endTime.getTime() - b.startTime.getTime()) / (1000 * 60 * 60)) * 10) / 10,
        participantsCount: b.participantsCount,
        status: b.status,
      })),
    });
  } catch (error) {
    console.error('Error generating report:', error);
    return NextResponse.json({ error: 'เกิดข้อผิดพลาดในการสร้างรายงาน' }, { status: 500 });
  }
}
