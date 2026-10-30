import { NextRequest, NextResponse } from 'next/server';
import { checkBookingConflict } from '@/lib/collision';

export async function POST(req: NextRequest) {
  try {
    const { roomId, startTime, endTime, participantsCount, excludeBookingId } = await req.json();

    if (!roomId || !startTime || !endTime) {
      return NextResponse.json(
        { error: 'กรุณาระบุห้องประชุม วันและเวลาเริ่มต้น-สิ้นสุด' },
        { status: 400 }
      );
    }

    const start = new Date(startTime);
    const end = new Date(endTime);
    const participants = Number(participantsCount || 1);

    const result = await checkBookingConflict(roomId, start, end, participants, excludeBookingId);

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Check availability error:', error);
    return NextResponse.json(
      { error: 'เกิดข้อผิดพลาดในการตรวจสอบห้องว่าง' },
      { status: 500 }
    );
  }
}
