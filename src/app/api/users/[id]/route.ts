import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser, hashPassword } from '@/lib/auth';
import { logAudit } from '@/lib/audit';

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'เฉพาะผู้ดูแลระบบ (Admin) เท่านั้นที่สามารถจัดการผู้ใช้' }, { status: 403 });
    }

    const body = await req.json();
    const { name, role, department, status, newPassword } = body;

    const targetUser = await prisma.user.findUnique({ where: { id: params.id } });
    if (!targetUser) {
      return NextResponse.json({ error: 'ไม่พบผู้ใช้ที่ระบุ' }, { status: 404 });
    }

    const data: any = {};
    if (name) data.name = name;
    if (role) data.role = role;
    if (department) data.department = department;
    if (status) data.status = status;
    if (newPassword) {
      data.passwordHash = await hashPassword(newPassword);
    }

    const updatedUser = await prisma.user.update({
      where: { id: params.id },
      data,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        department: true,
        status: true,
      },
    });

    await logAudit({
      userId: user.id,
      action: 'UPDATE_USER',
      entity: 'USER',
      entityId: updatedUser.id,
      details: { changes: body },
    });

    return NextResponse.json({ success: true, user: updatedUser });
  } catch (error) {
    return NextResponse.json({ error: 'เกิดข้อผิดพลาดในการอัปเดตผู้ใช้' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'เฉพาะผู้ดูแลระบบ (Admin) เท่านั้น' }, { status: 403 });
    }

    if (params.id === user.id) {
      return NextResponse.json({ error: 'ไม่สามารถลบบัญชีของตนเองได้' }, { status: 400 });
    }

    await prisma.user.delete({ where: { id: params.id } });

    await logAudit({
      userId: user.id,
      action: 'DELETE_USER',
      entity: 'USER',
      entityId: params.id,
    });

    return NextResponse.json({ success: true, message: 'ลบผู้ใช้สำเร็จ' });
  } catch (error) {
    return NextResponse.json({ error: 'เกิดข้อผิดพลาดในการลบผู้ใช้' }, { status: 500 });
  }
}
