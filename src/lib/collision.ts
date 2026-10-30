import { prisma } from './prisma';

export interface CollisionCheckResult {
  hasConflict: boolean;
  reason?: string;
  conflictingBooking?: {
    id: string;
    bookingCode: string;
    title: string;
    startTime: string;
    endTime: string;
    organizerName: string;
  };
  suggestedRooms?: Array<{
    id: string;
    name: string;
    code: string;
    capacity: number;
    building: string;
    floor: number;
  }>;
  suggestedSlots?: Array<{
    startTime: string;
    endTime: string;
  }>;
}

export async function checkBookingConflict(
  roomId: string,
  startTime: Date,
  endTime: Date,
  participantsCount: number,
  excludeBookingId?: string
): Promise<CollisionCheckResult> {
  // 1. Fetch Room and check maintenance / capacity
  const room = await prisma.room.findUnique({
    where: { id: roomId },
  });

  if (!room) {
    return {
      hasConflict: true,
      reason: 'ไม่พบห้องประชุมที่ระบุในระบบ',
    };
  }

  if (room.status === 'MAINTENANCE') {
    return {
      hasConflict: true,
      reason: 'ห้องประชุมนี้อยู่ระหว่างการปิดปรับปรุง (Maintenance) ไม่สามารถจองได้',
    };
  }

  if (participantsCount > room.capacity) {
    return {
      hasConflict: true,
      reason: `จำนวนผู้เข้าร่วม (${participantsCount} คน) เกินความจุของห้องที่รองรับได้สูงสุด (${room.capacity} คน)`,
    };
  }

  if (startTime >= endTime) {
    return {
      hasConflict: true,
      reason: 'เวลาสิ้นสุดต้องมากกว่าเวลาเริ่มต้น',
    };
  }

  // 2. Check overlap collision: new_start < existing_end && new_end > existing_start
  const conflictingBookings = await prisma.booking.findMany({
    where: {
      roomId,
      id: excludeBookingId ? { not: excludeBookingId } : undefined,
      status: { in: ['APPROVED', 'PENDING'] },
      AND: [
        { startTime: { lt: endTime } },
        { endTime: { gt: startTime } },
      ],
    },
    include: {
      user: { select: { name: true } },
    },
  });

  if (conflictingBookings.length > 0) {
    const conflict = conflictingBookings[0];

    // Find alternative rooms with capacity >= participantsCount that are free at this exact time
    const busyRoomIds = (
      await prisma.booking.findMany({
        where: {
          status: { in: ['APPROVED', 'PENDING'] },
          AND: [
            { startTime: { lt: endTime } },
            { endTime: { gt: startTime } },
          ],
        },
        select: { roomId: true },
      })
    ).map((b) => b.roomId);

    const alternativeRooms = await prisma.room.findMany({
      where: {
        id: { notIn: [roomId, ...busyRoomIds] },
        status: { not: 'MAINTENANCE' },
        capacity: { gte: participantsCount },
      },
      take: 4,
      orderBy: { capacity: 'asc' },
    });

    // Find alternative slots for the current room on the same day (between 08:00 and 18:00)
    const durationMs = endTime.getTime() - startTime.getTime();
    const dayStart = new Date(startTime);
    dayStart.setHours(8, 0, 0, 0);
    const dayEnd = new Date(startTime);
    dayEnd.setHours(18, 0, 0, 0);

    const dayBookings = await prisma.booking.findMany({
      where: {
        roomId,
        status: { in: ['APPROVED', 'PENDING'] },
        startTime: { gte: dayStart, lt: dayEnd },
      },
      orderBy: { startTime: 'asc' },
    });

    const suggestedSlots: Array<{ startTime: string; endTime: string }> = [];
    let currentSlotStart = new Date(dayStart);

    while (
      currentSlotStart.getTime() + durationMs <= dayEnd.getTime() &&
      suggestedSlots.length < 3
    ) {
      const currentSlotEnd = new Date(currentSlotStart.getTime() + durationMs);

      // Check if slot overlaps with dayBookings or requested slot
      const isOverlap = dayBookings.some(
        (b) => currentSlotStart < b.endTime && currentSlotEnd > b.startTime
      );

      if (!isOverlap && currentSlotStart.getTime() !== startTime.getTime()) {
        suggestedSlots.push({
          startTime: currentSlotStart.toISOString(),
          endTime: currentSlotEnd.toISOString(),
        });
      }

      // Step by 1 hour
      currentSlotStart = new Date(currentSlotStart.getTime() + 60 * 60 * 1000);
    }

    return {
      hasConflict: true,
      reason: 'ไม่สามารถจองห้องนี้ได้ เนื่องจากมีการจองในช่วงเวลาดังกล่าวแล้ว',
      conflictingBooking: {
        id: conflict.id,
        bookingCode: conflict.bookingCode,
        title: conflict.title,
        startTime: conflict.startTime.toISOString(),
        endTime: conflict.endTime.toISOString(),
        organizerName: conflict.organizerName,
      },
      suggestedRooms: alternativeRooms.map((r) => ({
        id: r.id,
        name: r.name,
        code: r.code,
        capacity: r.capacity,
        building: r.building,
        floor: r.floor,
      })),
      suggestedSlots,
    };
  }

  return { hasConflict: false };
}
