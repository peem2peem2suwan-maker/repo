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

    const now = new Date();

    // Today boundaries
    const startOfToday = new Date(now);
    startOfToday.setHours(0, 0, 0, 0);
    const endOfToday = new Date(now);
    endOfToday.setHours(23, 59, 59, 999);

    // Week boundaries (last 7 days or start of week)
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    // Month boundaries
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

    // 1. Total rooms and live room status
    const allRooms = await prisma.room.findMany({
      include: {
        bookings: {
          where: {
            status: 'APPROVED',
            startTime: { lte: endOfToday },
            endTime: { gte: startOfToday },
          },
        },
      },
    });

    const totalRooms = allRooms.length;
    let occupiedCount = 0;
    let reservedCount = 0;
    let maintenanceCount = 0;
    let availableCount = 0;

    allRooms.forEach((room) => {
      if (room.status === 'MAINTENANCE') {
        maintenanceCount++;
      } else {
        const isOccupiedNow = room.bookings.some(
          (b) => now >= b.startTime && now < b.endTime
        );
        if (isOccupiedNow) {
          occupiedCount++;
        } else {
          const isReservedToday = room.bookings.some((b) => b.startTime > now);
          if (isReservedToday) {
            reservedCount++;
          } else {
            availableCount++;
          }
        }
      }
    });

    // 2. Booking counts
    const todayBookingsCount = await prisma.booking.count({
      where: {
        startTime: { gte: startOfToday, lte: endOfToday },
        status: { in: ['APPROVED', 'PENDING'] },
      },
    });

    const weekBookingsCount = await prisma.booking.count({
      where: {
        startTime: { gte: startOfWeek },
        status: { in: ['APPROVED', 'PENDING'] },
      },
    });

    const monthBookingsCount = await prisma.booking.count({
      where: {
        startTime: { gte: startOfMonth, lte: endOfMonth },
        status: { in: ['APPROVED', 'PENDING'] },
      },
    });

    const pendingApprovalsCount = await prisma.booking.count({
      where: { status: 'PENDING' },
    });

    // 3. Most used room (by total approved booking count)
    const bookingsByRoom = await prisma.booking.groupBy({
      by: ['roomId'],
      where: { status: 'APPROVED' },
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
      take: 1,
    });

    let mostUsedRoomName = 'ยังไม่มีข้อมูล';
    if (bookingsByRoom.length > 0) {
      const topRoom = allRooms.find((r) => r.id === bookingsByRoom[0].roomId);
      if (topRoom) {
        mostUsedRoomName = `${topRoom.name} (${bookingsByRoom[0]._count.id} ครั้ง)`;
      }
    }

    // 4. Daily bookings for past 7 days (Chart data)
    const dailyStats = [];
    const thaiDays = ['อา.', 'จ.', 'อ.', 'พ.', 'พฤ.', 'ศ.', 'ส.'];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dayStart = new Date(d);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(d);
      dayEnd.setHours(23, 59, 59, 999);

      const count = await prisma.booking.count({
        where: {
          startTime: { gte: dayStart, lte: dayEnd },
          status: { in: ['APPROVED', 'COMPLETED'] },
        },
      });

      dailyStats.push({
        date: `${thaiDays[d.getDay()]} ${d.getDate()}/${d.getMonth() + 1}`,
        count,
      });
    }

    // 5. Room usage count for donut/bar chart
    const roomUsage = await Promise.all(
      allRooms.map(async (r) => {
        const count = await prisma.booking.count({
          where: { roomId: r.id, status: { in: ['APPROVED', 'COMPLETED'] } },
        });
        return {
          name: r.name,
          code: r.code,
          count,
        };
      })
    );

    // 6. Upcoming Meetings (next 5)
    const upcomingMeetings = await prisma.booking.findMany({
      where: {
        status: 'APPROVED',
        endTime: { gte: now },
      },
      include: {
        room: true,
        user: { select: { name: true, department: true } },
      },
      orderBy: { startTime: 'asc' },
      take: 5,
    });

    // 7. Recent Bookings (last 5)
    const recentBookings = await prisma.booking.findMany({
      include: {
        room: true,
        user: { select: { name: true, department: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 5,
    });

    // 8. Overall utilization rate
    // Theoretical total available hours per room: 10 hrs/day (8:00 - 18:00) * totalRooms * 30 days
    const totalPossibleHours = totalRooms * 10 * 30;
    const allApprovedBookings = await prisma.booking.findMany({
      where: {
        status: { in: ['APPROVED', 'COMPLETED'] },
        startTime: { gte: startOfMonth },
      },
      select: { startTime: true, endTime: true },
    });

    let totalBookedHours = 0;
    allApprovedBookings.forEach((b) => {
      const hours = (b.endTime.getTime() - b.startTime.getTime()) / (1000 * 60 * 60);
      totalBookedHours += Math.max(0, hours);
    });

    const utilizationRate = Math.min(
      100,
      Math.round((totalBookedHours / Math.max(1, totalPossibleHours)) * 100)
    );

    return NextResponse.json({
      cards: {
        totalRooms,
        availableCount,
        occupiedCount,
        reservedCount,
        maintenanceCount,
        todayBookingsCount,
        weekBookingsCount,
        monthBookingsCount,
        pendingApprovalsCount,
        mostUsedRoomName,
        utilizationRate,
      },
      charts: {
        dailyStats,
        roomUsage,
      },
      upcomingMeetings,
      recentBookings,
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return NextResponse.json({ error: 'เกิดข้อผิดพลาดในการโหลดข้อมูล Dashboard' }, { status: 500 });
  }
}
