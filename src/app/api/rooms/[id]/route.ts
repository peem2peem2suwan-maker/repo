import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { logAudit } from '@/lib/audit';
import { broadcastEvent, RealtimeEvents } from '@/lib/sse';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const room = await prisma.room.findUnique({
      where: { id: params.id },
      include: {
        equipment: {
          include: { equipment: true },
        },
        bookings: {
          where: {
            status: { in: ['APPROVED', 'PENDING'] },
            endTime: { gte: new Date() },
          },
          orderBy: { startTime: 'asc' },
          take: 10,
          include: {
            user: { select: { name: true, department: true } },
          },
        },
      },
    });

    if (!room) {
      return NextResponse.json({ error: 'ไม่พบห้องประชุม' }, { status: 404 });
    }

    return NextResponse.json({ room });
  } catch (error) {
    return NextResponse.json({ error: 'เกิดข้อผิดพลาดในการดึงข้อมูลห้อง' }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user || !['ADMIN', 'MANAGER'].includes(user.role)) {
      return NextResponse.json({ error: 'ไม่มีสิทธิ์แก้ไขข้อมูลห้อง' }, { status: 403 });
    }

    const body = await req.json();
    const { name, building, floor, capacity, description, imageUrl, status, equipmentIds } = body;

    const existingRoom = await prisma.room.findUnique({ where: { id: params.id } });
    if (!existingRoom) {
      return NextResponse.json({ error: 'ไม่พบห้องประชุม' }, { status: 404 });
    }

    // Update equipments if provided
    if (equipmentIds && Array.isArray(equipmentIds)) {
      await prisma.roomEquipment.deleteMany({ where: { roomId: params.id } });
      await prisma.roomEquipment.createMany({
        data: equipmentIds.map((eqId: string) => ({
          roomId: params.id,
          equipmentId: eqId,
          quantity: 1,
        })),
      });
    }

    const updatedRoom = await prisma.room.update({
      where: { id: params.id },
      data: {
        name: name !== undefined ? name : existingRoom.name,
        building: building !== undefined ? building : existingRoom.building,
        floor: floor !== undefined ? Number(floor) : existingRoom.floor,
        capacity: capacity !== undefined ? Number(capacity) : existingRoom.capacity,
        description: description !== undefined ? description : existingRoom.description,
        imageUrl: imageUrl !== undefined ? imageUrl : existingRoom.imageUrl,
        status: status !== undefined ? status : existingRoom.status,
      },
      include: {
        equipment: { include: { equipment: true } },
      },
    });

    await logAudit({
      userId: user.id,
      action: 'UPDATE_ROOM',
      entity: 'ROOM',
      entityId: updatedRoom.id,
      details: { updatedFields: body },
    });

    broadcastEvent(RealtimeEvents.ROOM_STATUS_CHANGED, { room: updatedRoom });

    return NextResponse.json({ success: true, room: updatedRoom });
  } catch (error) {
    console.error('Error updating room:', error);
    return NextResponse.json({ error: 'เกิดข้อผิดพลาดในการอัปเดตข้อมูลห้อง' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'เฉพาะผู้ดูแลระบบ (Admin) เท่านั้นที่สามารถลบห้องได้' }, { status: 403 });
    }

    const room = await prisma.room.findUnique({ where: { id: params.id } });
    if (!room) {
      return NextResponse.json({ error: 'ไม่พบห้องประชุม' }, { status: 404 });
    }

    await prisma.room.delete({ where: { id: params.id } });

    await logAudit({
      userId: user.id,
      action: 'DELETE_ROOM',
      entity: 'ROOM',
      entityId: room.id,
      details: { code: room.code, name: room.name },
    });

    broadcastEvent(RealtimeEvents.ROOM_STATUS_CHANGED, { deletedRoomId: room.id });

    return NextResponse.json({ success: true, message: 'ลบห้องประชุมสำเร็จ' });
  } catch (error) {
    return NextResponse.json({ error: 'เกิดข้อผิดพลาดในการลบห้องประชุม' }, { status: 500 });
  }
}
