import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createSessionToken } from '@/lib/auth';
import { logAudit } from '@/lib/audit';

export async function POST(req: NextRequest) {
  try {
    const { role } = await req.json();

    if (!['ADMIN', 'MANAGER', 'USER'].includes(role)) {
      return NextResponse.json({ error: 'บทบาทไม่ถูกต้อง' }, { status: 400 });
    }

    const user = await prisma.user.findFirst({
      where: { role, status: 'ACTIVE' },
    });

    if (!user) {
      return NextResponse.json({ error: `ไม่พบผู้ใช้งานบทบาท ${role}` }, { status: 404 });
    }

    const token = await createSessionToken({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role as any,
      department: user.department,
    });

    await logAudit({
      userId: user.id,
      action: 'QUICK_SWITCH_LOGIN',
      entity: 'AUTH',
      entityId: user.id,
      details: { role: user.role, email: user.email },
      ipAddress: req.headers.get('x-forwarded-for') || '127.0.0.1',
    });

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        department: user.department,
        avatar: user.avatar,
      },
    });

    response.cookies.set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (error) {
    return NextResponse.json({ error: 'เกิดข้อผิดพลาดในการสลับผู้ใช้' }, { status: 500 });
  }
}
