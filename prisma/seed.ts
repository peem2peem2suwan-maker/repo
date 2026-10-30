import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // 1. Clean existing records
  await prisma.auditLog.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.bookingParticipant.deleteMany();
  await prisma.bookingEquipment.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.roomEquipment.deleteMany();
  await prisma.equipment.deleteMany();
  await prisma.room.deleteMany();
  await prisma.user.deleteMany();

  // 2. Create Users
  const passwordHash = await bcrypt.hash('password123', 10);

  const admin = await prisma.user.create({
    data: {
      email: 'admin@company.com',
      passwordHash,
      name: 'สมชาย ประเสริฐ (Admin)',
      role: 'ADMIN',
      department: 'ฝ่ายเทคโนโลยีสารสนเทศ (IT)',
      status: 'ACTIVE',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    },
  });

  const manager = await prisma.user.create({
    data: {
      email: 'manager@company.com',
      passwordHash,
      name: 'สุภาพร วงศ์สุวรรณ (Manager)',
      role: 'MANAGER',
      department: 'ฝ่ายบริหารทรัพยากรบุคคล (HR)',
      status: 'ACTIVE',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
    },
  });

  const user1 = await prisma.user.create({
    data: {
      email: 'user@company.com',
      passwordHash,
      name: 'อนันต์ สุขสำราญ (Staff)',
      role: 'USER',
      department: 'ฝ่ายการตลาดและประชาสัมพันธ์ (Marketing)',
      status: 'ACTIVE',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    },
  });

  const user2 = await prisma.user.create({
    data: {
      email: 'kanya@company.com',
      passwordHash,
      name: 'กัญญา รัตนกุล (Staff)',
      role: 'USER',
      department: 'ฝ่ายบัญชีและการเงิน (Finance)',
      status: 'ACTIVE',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    },
  });

  console.log('✅ Created 4 users (Admin, Manager, 2 Users)');

  // 3. Create Equipment
  const eqList = [
    { name: 'โปรเจกเตอร์ 4K Ultra HD', icon: 'Projector', category: 'Display' },
    { name: 'สมาร์ททีวี 75 นิ้ว 4K', icon: 'Tv', category: 'Display' },
    { name: 'ระบบวิดีโอคอนเฟอเรนซ์ (Zoom/Teams Rooms)', icon: 'Video', category: 'Conference' },
    { name: 'กระดานไวท์บอร์ดอัจฉริยะ', icon: 'Presentation', category: 'Display' },
    { name: 'ไมโครโฟนไร้สาย (2 ตัว)', icon: 'Mic', category: 'Audio' },
    { name: 'ระบบเครื่องเสียงและลำโพงรอบทิศทาง', icon: 'Volume2', category: 'Audio' },
    { name: 'อินเทอร์เน็ตความเร็วสูง Wi-Fi 6', icon: 'Wifi', category: 'Network' },
    { name: 'ปลั๊กไฟและแท่นชาร์จไร้สายประจำโต๊ะ', icon: 'Zap', category: 'Power' },
  ];

  const equipmentRecords: Record<string, any> = {};
  for (const eq of eqList) {
    const created = await prisma.equipment.create({ data: eq });
    equipmentRecords[eq.name] = created;
  }
  console.log(`✅ Created ${eqList.length} equipments`);

  // 4. Create Rooms
  const roomsData = [
    {
      code: 'RM-101',
      name: 'Diamond Boardroom',
      building: 'อาคาร A (Executive Wing)',
      floor: 10,
      capacity: 30,
      description: 'ห้องประชุมใหญ่ระดับผู้บริหาร วิวมุมสูงรอบทิศ ตกแต่งหรูหรา พร้อมระบบประชุมทางไกลครบชุด',
      imageUrl: 'https://images.unsplash.com/photo-1517502884422-41eaead166d4?w=800',
      status: 'AVAILABLE',
      equipments: [
        'โปรเจกเตอร์ 4K Ultra HD',
        'ระบบวิดีโอคอนเฟอเรนซ์ (Zoom/Teams Rooms)',
        'ไมโครโฟนไร้สาย (2 ตัว)',
        'ระบบเครื่องเสียงและลำโพงรอบทิศทาง',
        'อินเทอร์เน็ตความเร็วสูง Wi-Fi 6',
      ],
    },
    {
      code: 'RM-102',
      name: 'Sapphire Conference Room',
      building: 'อาคาร A',
      floor: 4,
      capacity: 16,
      description: 'ห้องประชุมขนาดกลาง เหมาะสำหรับการประชุมร่วมกับลูกค้าและทีมโปรเจกต์',
      imageUrl: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800',
      status: 'AVAILABLE',
      equipments: [
        'สมาร์ททีวี 75 นิ้ว 4K',
        'ระบบวิดีโอคอนเฟอเรนซ์ (Zoom/Teams Rooms)',
        'กระดานไวท์บอร์ดอัจฉริยะ',
        'อินเทอร์เน็ตความเร็วสูง Wi-Fi 6',
      ],
    },
    {
      code: 'RM-201',
      name: 'Emerald Meeting Room',
      building: 'อาคาร B',
      floor: 2,
      capacity: 10,
      description: 'ห้องประชุมสำหรับทีมขนาดเล็ก บรรยากาศเป็นกันเอง โปร่งสบาย แสงธรรมชาติทั่วถึง',
      imageUrl: 'https://images.unsplash.com/photo-1497215728101-856f4ea42174?w=800',
      status: 'AVAILABLE',
      equipments: [
        'สมาร์ททีวี 75 นิ้ว 4K',
        'กระดานไวท์บอร์ดอัจฉริยะ',
        'อินเทอร์เน็ตความเร็วสูง Wi-Fi 6',
      ],
    },
    {
      code: 'RM-202',
      name: 'Ruby Workshop Studio',
      building: 'อาคาร B',
      floor: 3,
      capacity: 24,
      description: 'ห้องเวิร์กช็อปและฝึกอบรม จัดโต๊ะได้หลายรูปแบบ เหมาะสำหรับการระดมความคิดและเทรนนิ่ง',
      imageUrl: 'https://images.unsplash.com/photo-1527192491265-7e15c55b1ed2?w=800',
      status: 'AVAILABLE',
      equipments: [
        'โปรเจกเตอร์ 4K Ultra HD',
        'ไมโครโฟนไร้สาย (2 ตัว)',
        'กระดานไวท์บอร์ดอัจฉริยะ',
        'ปลั๊กไฟและแท่นชาร์จไร้สายประจำโต๊ะ',
        'อินเทอร์เน็ตความเร็วสูง Wi-Fi 6',
      ],
    },
    {
      code: 'RM-301',
      name: 'Opal Brainstorm Hub',
      building: 'อาคาร A',
      floor: 2,
      capacity: 6,
      description: 'ห้องระดมความคิดขนาดกะทัดรัด พร้อมผนังกระจกเขียนได้ เหมาะสำหรับ Sprint Planning',
      imageUrl: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=800',
      status: 'AVAILABLE',
      equipments: [
        'สมาร์ททีวี 75 นิ้ว 4K',
        'กระดานไวท์บอร์ดอัจฉริยะ',
        'อินเทอร์เน็ตความเร็วสูง Wi-Fi 6',
      ],
    },
    {
      code: 'RM-302',
      name: 'Amber Focus Room',
      building: 'อาคาร C',
      floor: 1,
      capacity: 4,
      description: 'ห้องประชุมเก็บเสียงสำหรับ One-on-One หรือเจรจาสัญญาปิด ปัจจุบันอยู่ระหว่างปิดบำรุงรักษาระบบปรับอากาศ',
      imageUrl: 'https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=800',
      status: 'MAINTENANCE',
      equipments: [
        'สมาร์ททีวี 75 นิ้ว 4K',
        'อินเทอร์เน็ตความเร็วสูง Wi-Fi 6',
      ],
    },
  ];

  const createdRooms: Record<string, any> = {};
  for (const r of roomsData) {
    const { equipments, ...data } = r;
    const room = await prisma.room.create({ data });
    createdRooms[room.code] = room;

    for (const eqName of equipments) {
      if (equipmentRecords[eqName]) {
        await prisma.roomEquipment.create({
          data: {
            roomId: room.id,
            equipmentId: equipmentRecords[eqName].id,
            quantity: 1,
          },
        });
      }
    }
  }
  console.log(`✅ Created ${roomsData.length} rooms with attached equipments`);

  // 5. Create Initial Bookings for Today and Tomorrow
  const now = new Date();
  
  // Today's Bookings
  const today10AM = new Date(now);
  today10AM.setHours(10, 0, 0, 0);
  const today1130AM = new Date(now);
  today1130AM.setHours(11, 30, 0, 0);

  const today13PM = new Date(now);
  today13PM.setHours(13, 0, 0, 0);
  const today15PM = new Date(now);
  today15PM.setHours(15, 0, 0, 0);

  const tomorrow09AM = new Date(now);
  tomorrow09AM.setDate(tomorrow09AM.getDate() + 1);
  tomorrow09AM.setHours(9, 0, 0, 0);
  const tomorrow11AM = new Date(now);
  tomorrow11AM.setDate(tomorrow11AM.getDate() + 1);
  tomorrow11AM.setHours(11, 0, 0, 0);

  // Booking 1: Diamond Room
  const b1 = await prisma.booking.create({
    data: {
      bookingCode: 'BKG-20261029-001',
      roomId: createdRooms['RM-101'].id,
      userId: admin.id,
      title: 'ประชุมคณะกรรมการบริหารประจำไตรมาส (Executive Q3 Review)',
      description: 'ทบทวนผลการดำเนินงานไตรมาสที่ 3 และวางแผนยุทธศาสตร์ประจำปี',
      startTime: today10AM,
      endTime: today1130AM,
      participantsCount: 20,
      organizerName: admin.name,
      status: 'APPROVED',
      participants: {
        create: [
          { name: 'คุณสมชาย ประเสริฐ', email: 'admin@company.com' },
          { name: 'คุณสุภาพร วงศ์สุวรรณ', email: 'manager@company.com' },
        ],
      },
    },
  });

  // Booking 2: Sapphire Room
  const b2 = await prisma.booking.create({
    data: {
      bookingCode: 'BKG-20261029-002',
      roomId: createdRooms['RM-102'].id,
      userId: user1.id,
      title: 'Product Launch Marketing Strategy',
      description: 'ประชุมวางแผนแคมเปญการเปิดตัวผลิตภัณฑ์ใหม่ร่วมกับเอเจนซี่',
      startTime: today13PM,
      endTime: today15PM,
      participantsCount: 12,
      organizerName: user1.name,
      status: 'APPROVED',
      participants: {
        create: [
          { name: 'อนันต์ สุขสำราญ', email: 'user@company.com' },
          { name: 'กัญญา รัตนกุล', email: 'kanya@company.com' },
        ],
      },
    },
  });

  // Booking 3: Pending Booking for Tomorrow
  const b3 = await prisma.booking.create({
    data: {
      bookingCode: 'BKG-20261030-001',
      roomId: createdRooms['RM-201'].id,
      userId: user2.id,
      title: 'สรุปงบประมาณและรายงานบัญชีประจำเดือน',
      description: 'เตรียมการประชุมปิดยอดบัญชี',
      startTime: tomorrow09AM,
      endTime: tomorrow11AM,
      participantsCount: 8,
      organizerName: user2.name,
      status: 'PENDING',
      participants: {
        create: [{ name: 'กัญญา รัตนกุล', email: 'kanya@company.com' }],
      },
    },
  });

  console.log('✅ Created 3 sample bookings (2 APPROVED, 1 PENDING)');

  // 6. Create Initial Notifications
  await prisma.notification.createMany({
    data: [
      {
        userId: admin.id,
        bookingId: b3.id,
        title: 'มีการจองห้องประชุมใหม่รอการอนุมัติ',
        message: 'คุณ กัญญา รัตนกุล ได้ทำการจองห้อง Emerald Meeting Room สำหรับวันพรุ่งนี้',
        type: 'BOOKING_CREATED',
        linkUrl: '/all-bookings',
      },
      {
        userId: user1.id,
        bookingId: b2.id,
        title: 'การจองห้องประชุมของคุณได้รับการอนุมัติแล้ว',
        message: 'ห้อง Sapphire Conference Room ได้รับการอนุมัติเรียบร้อยแล้ว',
        type: 'BOOKING_APPROVED',
        linkUrl: '/my-bookings',
      },
    ],
  });
  console.log('✅ Created sample notifications');

  // 7. Create Audit Log
  await prisma.auditLog.create({
    data: {
      userId: admin.id,
      action: 'SYSTEM_SEED',
      entity: 'DATABASE',
      details: JSON.stringify({ message: 'Initial database seed completed successfully' }),
      ipAddress: '127.0.0.1',
    },
  });

  console.log('🎉 Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
