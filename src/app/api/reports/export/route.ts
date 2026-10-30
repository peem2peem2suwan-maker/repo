import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || !['ADMIN', 'MANAGER'].includes(user.role)) {
      return NextResponse.json({ error: 'ไม่มีสิทธิ์ Export รายงาน' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const range = searchParams.get('range') || 'month';

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
    } else {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    }

    const bookings = await prisma.booking.findMany({
      where: {
        startTime: { gte: startDate, lte: endDate },
      },
      include: {
        room: true,
        user: { select: { name: true, department: true } },
      },
      orderBy: { startTime: 'desc' },
    });

    // Generate CSV string with UTF-8 BOM
    const headers = [
      'รหัสการจอง',
      'หัวข้อการประชุม',
      'ห้องประชุม',
      'รหัสห้อง',
      'ผู้จัดประชุม',
      'แผนก',
      'วันเวลาเริ่ม',
      'วันเวลาสิ้นสุด',
      'ชั่วโมงที่ใช้',
      'จำนวนผู้เข้าร่วม',
      'สถานะ',
    ];

    const escapeCsv = (str: any) => {
      const val = str === null || str === undefined ? '' : String(str);
      return `"${val.replace(/"/g, '""')}"`;
    };

    const rows = bookings.map((b) => {
      const durationHours = Math.round(((b.endTime.getTime() - b.startTime.getTime()) / (1000 * 60 * 60)) * 10) / 10;
      return [
        escapeCsv(b.bookingCode),
        escapeCsv(b.title),
        escapeCsv(b.room.name),
        escapeCsv(b.room.code),
        escapeCsv(b.organizerName || b.user.name),
        escapeCsv(b.user.department),
        escapeCsv(new Date(b.startTime).toLocaleString('th-TH')),
        escapeCsv(new Date(b.endTime).toLocaleString('th-TH')),
        escapeCsv(durationHours),
        escapeCsv(b.participantsCount),
        escapeCsv(b.status),
      ].join(',');
    });

    // Add UTF-8 BOM prefix (\uFEFF) so Excel opens Thai language correctly
    const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\r\n');

    const fileName = `meeting-room-report-${new Date().toISOString().slice(0, 10)}.csv`;

    return new Response(csvContent, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${fileName}"`,
      },
    });
  } catch (error) {
    console.error('Export error:', error);
    return NextResponse.json({ error: 'เกิดข้อผิดพลาดในการดาวน์โหลด CSV' }, { status: 500 });
  }
}
