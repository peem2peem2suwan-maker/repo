'use client';

// Client-Side Mock Database & API Interceptor for System Verification Checklist

import { User, Room, Equipment, Booking, Announcement, NotificationItem, AuditLogItem } from '@/types';

const STORAGE_KEY = 'meetspace_verification_db_v2';
const CURRENT_USER_KEY = 'meetspace_current_user_v2';
const WEBHOOK_KEY = 'meetspace_webhook_url_v2';

function getSeedData() {
  const users: User[] = [
    {
      id: 'usr-checker-1',
      email: 'watcharapong@college.ac.th',
      name: 'นายวัชรพงศ์ โสภา',
      role: 'CHECKER',
      position: 'เจ้าหน้าที่ตรวจห้อง / โสตทัศนูปกรณ์',
      department: 'งานศูนย์ดิจิทัลเพื่อการศึกษา',
      phone: '081-234-5671',
      status: 'ACTIVE',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'usr-endorser-1',
      email: 'ekkaraj@college.ac.th',
      name: 'นายเอกราช เขียวทอง',
      role: 'ENDORSER',
      position: 'หัวหน้างานศูนย์ดิจิทัลเพื่อการศึกษา',
      department: 'งานศูนย์ดิจิทัลเพื่อการศึกษา',
      phone: '081-234-5672',
      status: 'ACTIVE',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'usr-approver-1',
      email: 'chatree@college.ac.th',
      name: 'นายชาตรี เริงชัยภูมิ',
      role: 'APPROVER',
      position: 'รองผู้อำนวยการ / ผู้อนุมัติ',
      department: 'ฝ่ายบริหารและยุทธศาสตร์',
      phone: '081-234-5673',
      status: 'ACTIVE',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'usr-staff-1',
      email: 'nares@college.ac.th',
      name: 'นายนเรศ สุขสวัสดิ์',
      role: 'USER',
      position: 'หัวหน้าแผนกวิชาช่างยนต์',
      department: 'แผนกวิชาช่างยนต์',
      phone: '089-876-5432',
      status: 'ACTIVE',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'usr-staff-2',
      email: 'siriporn@college.ac.th',
      name: 'นางสาวศิริพร เจริญสุข',
      role: 'USER',
      position: 'ครูประจำแผนกวิชาคอมพิวเตอร์ธุรกิจ',
      department: 'แผนกวิชาคอมพิวเตอร์ธุรกิจ',
      phone: '086-555-4321',
      status: 'ACTIVE',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
      createdAt: new Date().toISOString(),
    },
  ];

  const equipments: Equipment[] = [
    { id: 'eq-1', name: 'เครื่องฉายโปรเจกเตอร์ / จอภาพ (Projector & Screen)', icon: 'Projector', category: 'Display' },
    { id: 'eq-2', name: 'สมาร์ททีวี 75 นิ้ว 4K (Smart TV)', icon: 'Tv', category: 'Display' },
    { id: 'eq-3', name: 'ระบบเครื่องเสียงและไมโครโฟนไร้สาย (Audio & Wireless Mic)', icon: 'Mic', category: 'Audio' },
    { id: 'eq-4', name: 'ระบบวิดีโอคอนเฟอเรนซ์ (Zoom/Teams Rooms)', icon: 'Video', category: 'Conference' },
    { id: 'eq-5', name: 'กระดานไวท์บอร์ดอัจฉริยะ (Smart Whiteboard)', icon: 'Presentation', category: 'Display' },
    { id: 'eq-6', name: 'คอมพิวเตอร์/โน้ตบุ๊กสำหรับนำเสนอ (Presentation Laptop)', icon: 'Laptop', category: 'Computer' },
  ];

  const rooms: Room[] = [
    {
      id: 'rm-101',
      code: 'RM-101',
      name: 'ห้องประชุมราชพฤกษ์ (ห้องประชุม 1)',
      building: 'อาคารเฉลิมพระเกียรติฯ',
      floor: 3,
      capacity: 50,
      description: 'ห้องประชุมใหญ่ระดับผู้บริหาร ตกแต่งพร้อมระบบแสงเสียงและประชุมทางไกลครบชุด',
      imageUrl: 'https://images.unsplash.com/photo-1517502884422-41eaead166d4?w=800',
      status: 'AVAILABLE',
      equipment: [
        { id: 'req-1', roomId: 'rm-101', equipmentId: 'eq-1', quantity: 1, equipment: equipments[0] },
        { id: 'req-2', roomId: 'rm-101', equipmentId: 'eq-3', quantity: 2, equipment: equipments[2] },
        { id: 'req-3', roomId: 'rm-101', equipmentId: 'eq-4', quantity: 1, equipment: equipments[3] },
      ],
    },
    {
      id: 'rm-102',
      code: 'RM-102',
      name: 'ห้องประชุมชัยพฤกษ์ (ห้องประชุม 2)',
      building: 'อาคาร 1',
      floor: 2,
      capacity: 30,
      description: 'ห้องประชุมสัมมนาและอบรมขนาดกลาง บรรยากาศโปร่งสบาย',
      imageUrl: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800',
      status: 'AVAILABLE',
      equipment: [
        { id: 'req-4', roomId: 'rm-102', equipmentId: 'eq-2', quantity: 1, equipment: equipments[1] },
        { id: 'req-5', roomId: 'rm-102', equipmentId: 'eq-3', quantity: 2, equipment: equipments[2] },
        { id: 'req-6', roomId: 'rm-102', equipmentId: 'eq-5', quantity: 1, equipment: equipments[4] },
      ],
    },
    {
      id: 'rm-201',
      code: 'RM-201',
      name: 'ห้องประชุมทองกวาว (ห้องประชุม 3)',
      building: 'อาคารวิทยบริการ',
      floor: 4,
      capacity: 20,
      description: 'ห้องประชุมสำหรับทีมงาน คณะทำงาน และการตรวจประเมินผล',
      imageUrl: 'https://images.unsplash.com/photo-1497215728101-856f4ea42174?w=800',
      status: 'AVAILABLE',
      equipment: [
        { id: 'req-7', roomId: 'rm-201', equipmentId: 'eq-2', quantity: 1, equipment: equipments[1] },
        { id: 'req-8', roomId: 'rm-201', equipmentId: 'eq-5', quantity: 1, equipment: equipments[4] },
      ],
    },
    {
      id: 'rm-202',
      code: 'RM-202',
      name: 'ห้องประชุมอินทนิล (ห้องประชุม 4)',
      building: 'อาคารปฏิบัติการ',
      floor: 1,
      capacity: 15,
      description: 'ห้องเวิร์กช็อปและฝึกอบรมเชิงปฏิบัติการ จัดโต๊ะได้หลากหลายรูปแบบ',
      imageUrl: 'https://images.unsplash.com/photo-1527192491265-7e15c55b1ed2?w=800',
      status: 'AVAILABLE',
      equipment: [
        { id: 'req-9', roomId: 'rm-202', equipmentId: 'eq-1', quantity: 1, equipment: equipments[0] },
        { id: 'req-10', roomId: 'rm-202', equipmentId: 'eq-6', quantity: 1, equipment: equipments[5] },
      ],
    },
    {
      id: 'rm-301',
      code: 'RM-301',
      name: 'ห้องประชุมเฟื่องฟ้า (ห้องประชุม 5)',
      building: 'อาคารบริหาร',
      floor: 2,
      capacity: 12,
      description: 'ห้องระดมความคิดขนาดกะทัดรัด พร้อมผนังกระจกเขียนได้',
      imageUrl: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=800',
      status: 'AVAILABLE',
      equipment: [
        { id: 'req-11', roomId: 'rm-301', equipmentId: 'eq-2', quantity: 1, equipment: equipments[1] },
        { id: 'req-12', roomId: 'rm-301', equipmentId: 'eq-5', quantity: 1, equipment: equipments[4] },
      ],
    },
    {
      id: 'rm-302',
      code: 'RM-302',
      name: 'ห้องประชุมการะเกด (ห้องประชุม 6)',
      building: 'อาคารศูนย์ดิจิทัลฯ',
      floor: 1,
      capacity: 8,
      description: 'ห้องประชุมกลุ่มย่อยและจัดรายการ Podcast อยู่ระหว่างปรับปรุงระบบบันทึกเสียง',
      imageUrl: 'https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=800',
      status: 'MAINTENANCE',
      equipment: [
        { id: 'req-13', roomId: 'rm-302', equipmentId: 'eq-3', quantity: 1, equipment: equipments[2] },
      ],
    },
  ];

  const now = new Date();
  const today09AM = new Date(now);
  today09AM.setHours(9, 0, 0, 0);
  const today12PM = new Date(now);
  today12PM.setHours(12, 0, 0, 0);

  const today13PM = new Date(now);
  today13PM.setHours(13, 0, 0, 0);
  const today16PM = new Date(now);
  today16PM.setHours(16, 0, 0, 0);

  const tomorrow10AM = new Date(now);
  tomorrow10AM.setDate(tomorrow10AM.getDate() + 1);
  tomorrow10AM.setHours(10, 0, 0, 0);
  const tomorrow12PM = new Date(now);
  tomorrow12PM.setDate(tomorrow12PM.getDate() + 1);
  tomorrow12PM.setHours(12, 0, 0, 0);

  const bookings: Booking[] = [
    {
      id: 'bkg-001',
      bookingCode: 'REQ-20261102-001',
      roomId: 'rm-101',
      userId: 'usr-staff-1',
      requesterName: 'นายนเรศ สุขสวัสดิ์',
      position: 'หัวหน้าแผนกวิชาช่างยนต์',
      department: 'แผนกวิชาช่างยนต์',
      phone: '089-876-5432',
      title: 'ประชุมเตรียมความพร้อมแข่งขันทักษะวิชาชีพ ระดับภาคฯ',
      description: 'ประชุมวางแผนงบประมาณ การฝึกซ้อม และจัดเตรียมยานพาหนะของนักศึกษา',
      startTime: today09AM.toISOString(),
      endTime: today12PM.toISOString(),
      participantsCount: 35,
      organizerName: 'นายนเรศ สุขสวัสดิ์',
      status: 'APPROVED',
      selectedEquipments: [
        'เครื่องฉายโปรเจกเตอร์ / จอภาพ (Projector & Screen)',
        'ระบบเครื่องเสียงและไมโครโฟนไร้สาย (Audio & Wireless Mic)',
      ],
      extraTables: 5,
      extraChairs: 20,
      extraEquipmentNote: 'ขอปลั๊กพ่วงสายไฟยาว 10 เมตร จำนวน 2 จุด',
      agreedGovProperty: true,
      stage1: {
        status: 'PASSED',
        officer: 'นายวัชรพงศ์ โสภา',
        roleTitle: 'เจ้าหน้าที่ตรวจห้อง / โสตทัศนูปกรณ์',
        actionDate: new Date(now.getTime() - 7200000).toISOString(),
        note: 'ตรวจความพร้อมห้องและอุปกรณ์โสตฯ เรียบร้อย ใช้งานได้ปกติ',
      },
      stage2: {
        status: 'PASSED',
        officer: 'นายเอกราช เขียวทอง',
        roleTitle: 'หัวหน้างานศูนย์ดิจิทัลเพื่อการศึกษา',
        actionDate: new Date(now.getTime() - 3600000).toISOString(),
        note: 'ตรวจสอบข้อมูลและรับรองความถูกต้อง ไม่ทับซ้อนกับภารกิจอื่น',
      },
      stage3: {
        status: 'APPROVED',
        officer: 'นายชาตรี เริงชัยภูมิ',
        roleTitle: 'รองผู้อำนวยการ / ผู้อนุมัติ',
        actionDate: new Date(now.getTime() - 1800000).toISOString(),
        note: 'อนุมัติให้ใช้ห้องประชุมและอุปกรณ์ตามที่ขอ',
      },
      reminderSent: false,
      createdAt: new Date(now.getTime() - 86400000).toISOString(),
      updatedAt: now.toISOString(),
      room: rooms[0],
      user: users[3],
    },
    {
      id: 'bkg-002',
      bookingCode: 'REQ-20261102-002',
      roomId: 'rm-102',
      userId: 'usr-staff-2',
      requesterName: 'นางสาวศิริพร เจริญสุข',
      position: 'ครูประจำแผนกวิชาคอมพิวเตอร์ธุรกิจ',
      department: 'แผนกวิชาคอมพิวเตอร์ธุรกิจ',
      phone: '086-555-4321',
      title: 'อบรมเชิงปฏิบัติการการพัฒนาสื่อดิจิทัลและ AI',
      description: 'การนำ Generative AI มาประยุกต์ใช้ในการจัดการเรียนการสอน',
      startTime: today13PM.toISOString(),
      endTime: today16PM.toISOString(),
      participantsCount: 25,
      organizerName: 'นางสาวศิริพร เจริญสุข',
      status: 'ENDORSED',
      selectedEquipments: [
        'สมาร์ททีวี 75 นิ้ว 4K (Smart TV)',
        'ระบบวิดีโอคอนเฟอเรนซ์ (Zoom/Teams Rooms)',
        'คอมพิวเตอร์/โน้ตบุ๊กสำหรับนำเสนอ (Presentation Laptop)',
      ],
      extraTables: 0,
      extraChairs: 10,
      extraEquipmentNote: 'ขอความเร็วอินเทอร์เน็ต Wi-Fi เสถียรสำหรับผู้เข้าร่วม',
      agreedGovProperty: true,
      stage1: {
        status: 'PASSED',
        officer: 'นายวัชรพงศ์ โสภา',
        roleTitle: 'เจ้าหน้าที่ตรวจห้อง / โสตทัศนูปกรณ์',
        actionDate: new Date(now.getTime() - 5400000).toISOString(),
        note: 'ตรวจสอบระบบสมาร์ททีวีและโน้ตบุ๊กพร้อมใช้งาน',
      },
      stage2: {
        status: 'PASSED',
        officer: 'นายเอกราช เขียวทอง',
        roleTitle: 'หัวหน้างานศูนย์ดิจิทัลเพื่อการศึกษา',
        actionDate: new Date(now.getTime() - 1800000).toISOString(),
        note: 'รับรองคำขอ ส่งต่อให้รองผู้อำนวยการพิจารณาอนุมัติ',
      },
      stage3: {
        status: 'PENDING',
        officer: 'นายชาตรี เริงชัยภูมิ',
        roleTitle: 'รองผู้อำนวยการ / ผู้อนุมัติ',
      },
      reminderSent: false,
      createdAt: new Date(now.getTime() - 43200000).toISOString(),
      updatedAt: now.toISOString(),
      room: rooms[1],
      user: users[4],
    },
    {
      id: 'bkg-003',
      bookingCode: 'REQ-20261103-001',
      roomId: 'rm-201',
      userId: 'usr-staff-1',
      requesterName: 'นายนเรศ สุขสวัสดิ์',
      position: 'หัวหน้าแผนกวิชาช่างยนต์',
      department: 'แผนกวิชาช่างยนต์',
      phone: '089-876-5432',
      title: 'ประชุมนิเทศนักศึกษาฝึกงานสถานประกอบการ',
      description: 'ซักซ้อมความเข้าใจครูนิเทศก์ประจำภาคเรียนที่ 2',
      startTime: tomorrow10AM.toISOString(),
      endTime: tomorrow12PM.toISOString(),
      participantsCount: 15,
      organizerName: 'นายนเรศ สุขสวัสดิ์',
      status: 'PENDING',
      selectedEquipments: [
        'สมาร์ททีวี 75 นิ้ว 4K (Smart TV)',
        'กระดานไวท์บอร์ดอัจฉริยะ (Smart Whiteboard)',
      ],
      extraTables: 2,
      extraChairs: 5,
      agreedGovProperty: true,
      stage1: {
        status: 'PENDING',
        officer: 'นายวัชรพงศ์ โสภา',
        roleTitle: 'เจ้าหน้าที่ตรวจห้อง / โสตทัศนูปกรณ์',
      },
      stage2: {
        status: 'PENDING',
        officer: 'นายเอกราช เขียวทอง',
        roleTitle: 'หัวหน้างานศูนย์ดิจิทัลเพื่อการศึกษา',
      },
      stage3: {
        status: 'PENDING',
        officer: 'นายชาตรี เริงชัยภูมิ',
        roleTitle: 'รองผู้อำนวยการ / ผู้อนุมัติ',
      },
      reminderSent: false,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
      room: rooms[2],
      user: users[3],
    },
  ];

  const announcements: Announcement[] = [
    {
      id: 'anc-1',
      title: 'ประกาศปรับปรุงระบบเสียงห้องประชุมการะเกด (ห้องประชุม 6)',
      content: 'งานศูนย์ดิจิทัลเพื่อการศึกษา ขอแจ้งปิดปรับปรุงระบบเครื่องเสียงและไมโครโฟนห้องประชุมการะเกด ตั้งแต่วันที่ 1-10 พฤศจิกายน 2569 จึงของดให้บริการชั่วคราว ขออภัยในความไม่สะดวก',
      date: '1 พ.ย. 2569',
      author: 'งานศูนย์ดิจิทัลเพื่อการศึกษา',
      priority: 'HIGH',
    },
    {
      id: 'anc-2',
      title: 'ขอความร่วมมือตรวจสอบทรัพย์สินและปิดเครื่องปรับอากาศหลังการใช้งาน',
      content: 'เพื่อการประหยัดพลังงานและการดูแลรักษาครุภัณฑ์ของทางราชการ ขอให้ผู้ขอใช้ห้องประชุมทุกท่านตรวจสอบความเรียบร้อย ปิดไฟ ปิดเครื่องปรับอากาศ และเก็บอุปกรณ์โสตฯ ให้เข้าที่ทุกครั้งหลังเสร็จสิ้นการประชุม',
      date: '28 ต.ค. 2569',
      author: 'นายวัชรพงศ์ โสภา (เจ้าหน้าที่โสตฯ)',
      priority: 'NORMAL',
    },
    {
      id: 'anc-3',
      title: 'การยืม-คืนอุปกรณ์โสตทัศนูปกรณ์และโน้ตบุ๊กสำหรับนำเสนอ',
      content: 'แผนกวิชาที่ประสงค์จะยืมโน้ตบุ๊ก ปลั๊กพ่วง หรือพอยน์เตอร์เพิ่มเติม กรุณาติดต่อขอรับอุปกรณ์ที่ห้องงานศูนย์ดิจิทัลฯ อาคาร 1 ก่อนเวลาเริ่มประชุมอย่างน้อย 15 นาที',
      date: '25 ต.ค. 2569',
      author: 'นายเอกราช เขียวทอง (หัวหน้างานศูนย์ดิจิทัลฯ)',
      priority: 'NORMAL',
    },
  ];

  const notifications: NotificationItem[] = [
    {
      id: 'notif-1',
      userId: 'usr-checker-1',
      bookingId: 'bkg-003',
      title: 'มีคำขอใช้ห้องประชุมใหม่ รอการตรวจห้อง',
      message: 'นายนเรศ สุขสวัสดิ์ ได้ส่งคำขอใช้ห้องประชุมทองกวาว รอการตรวจความพร้อม',
      type: 'BOOKING_CREATED',
      isRead: false,
      linkUrl: '/all-bookings',
      createdAt: now.toISOString(),
    },
    {
      id: 'notif-2',
      userId: 'usr-approver-1',
      bookingId: 'bkg-002',
      title: 'มีคำขอใช้ห้องประชุมรอการอนุมัติ',
      message: 'นายเอกราช เขียวทอง ได้รับรองคำขอห้องประชุมชัยพฤกษ์ รอการอนุมัติขั้นสุดท้าย',
      type: 'BOOKING_ENDORSED',
      isRead: false,
      linkUrl: '/all-bookings',
      createdAt: now.toISOString(),
    },
  ];

  const auditLogs: AuditLogItem[] = [
    {
      id: 'log-1',
      userId: 'usr-checker-1',
      action: 'SYSTEM_INIT',
      entity: 'DATABASE',
      details: 'ระบบตรวจสอบการจองห้องประชุมและเอกสารราชการพร้อมใช้งาน',
      ipAddress: '127.0.0.1',
      createdAt: now.toISOString(),
      user: {
        name: users[0].name,
        email: users[0].email,
        role: users[0].role,
      },
    },
  ];

  return {
    users,
    equipments,
    rooms,
    bookings,
    announcements,
    notifications,
    auditLogs,
  };
}

class VerificationMockDb {
  private data: ReturnType<typeof getSeedData>;

  constructor() {
    this.data = this.loadData();
  }

  private loadData() {
    if (typeof window === 'undefined') return getSeedData();
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {}
    const initial = getSeedData();
    this.saveData(initial);
    return initial;
  }

  public saveData(data: ReturnType<typeof getSeedData>) {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {}
  }

  public getDb() {
    return this.data;
  }

  public persist() {
    this.saveData(this.data);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('mock-db-updated'));
    }
  }

  public getCurrentUser(): User {
    if (typeof window === 'undefined') return this.data.users[0];
    try {
      const stored = localStorage.getItem(CURRENT_USER_KEY);
      if (stored) {
        const found = this.data.users.find((u) => u.id === stored);
        if (found) return found;
      }
    } catch {}
    return this.data.users[0]; // Default: นายวัชรพงศ์ โสภา
  }

  public setCurrentUser(user: User) {
    if (typeof window !== 'undefined') {
      localStorage.setItem(CURRENT_USER_KEY, user.id);
      window.dispatchEvent(new CustomEvent('mock-auth-changed', { detail: user }));
    }
  }

  public getWebhookUrl(): string {
    if (typeof window === 'undefined') return '';
    return localStorage.getItem(WEBHOOK_KEY) || '';
  }

  public setWebhookUrl(url: string) {
    if (typeof window !== 'undefined') {
      localStorage.setItem(WEBHOOK_KEY, url);
    }
  }

  public async triggerWebhook(event: string, payload: any) {
    const webhookUrl = this.getWebhookUrl();
    if (!webhookUrl) return { success: false, reason: 'No webhook configured' };

    try {
      await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: `📢 [ระบบจองห้องประชุม] เหตุการณ์: **${event}**`,
          embeds: [
            {
              title: payload.title || 'อัปเดตสถานะการจอง',
              description: payload.message || payload.description || '',
              color: event.includes('APPROVED') ? 0x10b981 : 0x3b82f6,
              fields: [
                { name: 'ห้องประชุม', value: payload.roomName || '-', inline: true },
                { name: 'ผู้ขอ', value: payload.requesterName || '-', inline: true },
                { name: 'เวลา', value: payload.time || '-', inline: true },
              ],
              timestamp: new Date().toISOString(),
            },
          ],
        }),
      });
      return { success: true };
    } catch (err: any) {
      console.warn('Webhook dispatch simulated or failed:', err);
      return { success: false, error: err.message };
    }
  }

  public emitSSE(eventName: string, data: any) {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('mock-sse', { detail: { eventName, data } }));
    }
  }
}

let dbInstance: VerificationMockDb | null = null;
export function getDb() {
  if (!dbInstance) {
    dbInstance = new VerificationMockDb();
  }
  return dbInstance;
}

// Request Handler for all /api endpoints
async function handleMockRequest(url: string, options?: RequestInit): Promise<Response> {
  const db = getDb();
  const data = db.getDb();
  const method = (options?.method || 'GET').toUpperCase();

  const urlObj = new URL(url, 'http://localhost');
  let pathname = urlObj.pathname;
  if (pathname.startsWith('/repo')) {
    pathname = pathname.replace('/repo', '');
  }
  const searchParams = urlObj.searchParams;

  const jsonResponse = (body: any, status = 200) => {
    return new Response(JSON.stringify(body), {
      status,
      headers: { 'Content-Type': 'application/json' },
    });
  };

  let bodyJson: any = null;
  if (options?.body) {
    try {
      bodyJson = JSON.parse(options.body as string);
    } catch {}
  }

  // Auth: /api/auth/me
  if (pathname === '/api/auth/me') {
    return jsonResponse({ user: db.getCurrentUser() });
  }

  // Auth: /api/auth/quick-switch
  if (pathname === '/api/auth/quick-switch' && method === 'POST') {
    const { role, userId } = bodyJson || {};
    let matched: User | undefined;
    if (userId) {
      matched = data.users.find((u) => u.id === userId);
    } else if (role) {
      matched = data.users.find((u) => u.role === role);
    }
    if (!matched) matched = data.users[0];
    db.setCurrentUser(matched);
    return jsonResponse({ success: true, user: matched });
  }

  // Announcements: /api/announcements
  if (pathname === '/api/announcements') {
    return jsonResponse({ announcements: data.announcements });
  }

  // Webhook settings: /api/webhook
  if (pathname === '/api/webhook') {
    if (method === 'GET') {
      return jsonResponse({ webhookUrl: db.getWebhookUrl() });
    }
    if (method === 'POST') {
      db.setWebhookUrl(bodyJson.webhookUrl || '');
      if (bodyJson.test) {
        await db.triggerWebhook('ทดสอบการเชื่อมต่อ Webhook', {
          title: 'การเชื่อมต่อระบบแจ้งเตือนสำเร็จ',
          message: 'ระบบจองห้องประชุมสามารถส่งการแจ้งเตือนไปยัง Webhook ได้เรียบร้อยแล้ว',
          roomName: 'ห้องประชุมราชพฤกษ์',
          requesterName: db.getCurrentUser().name,
          time: new Date().toLocaleTimeString('th-TH'),
        });
      }
      return jsonResponse({ success: true, webhookUrl: db.getWebhookUrl() });
    }
  }

  // Rooms: /api/rooms
  if (pathname === '/api/rooms') {
    return jsonResponse({ rooms: data.rooms });
  }

  // Check Conflict: /api/bookings/check-availability
  if (pathname === '/api/bookings/check-availability' && method === 'POST') {
    const { roomId, startTime, endTime, participantsCount, excludeBookingId } = bodyJson || {};
    const room = data.rooms.find((r) => r.id === roomId);

    if (roomId !== 'other' && room && room.status === 'MAINTENANCE') {
      return jsonResponse({
        hasConflict: true,
        reason: 'ห้องประชุมนี้อยู่ระหว่างการปิดปรับปรุง (Maintenance) ไม่สามารถจองได้',
      });
    }

    if (roomId !== 'other' && room && participantsCount && Number(participantsCount) > room.capacity) {
      return jsonResponse({
        hasConflict: true,
        reason: `จำนวนผู้เข้าร่วม (${participantsCount} คน) เกินความจุของห้องที่รองรับได้สูงสุด (${room.capacity} คน)`,
      });
    }

    const start = new Date(startTime).getTime();
    const end = new Date(endTime).getTime();

    if (roomId !== 'other') {
      const conflicting = data.bookings.find((b) => {
        if (b.id === excludeBookingId) return false;
        if (b.roomId !== roomId) return false;
        if (['REJECTED', 'CANCELLED'].includes(b.status)) return false;
        const bStart = new Date(b.startTime).getTime();
        const bEnd = new Date(b.endTime).getTime();
        return start < bEnd && end > bStart;
      });

      if (conflicting) {
        const suggestedRooms = data.rooms
          .filter((r) => r.id !== roomId && r.status === 'AVAILABLE' && r.capacity >= (participantsCount || 1))
          .map((r) => ({
            id: r.id,
            name: r.name,
            code: r.code,
            capacity: r.capacity,
            building: r.building,
            floor: r.floor,
          }));

        return jsonResponse({
          hasConflict: true,
          reason: `ห้องนี้มีรายการจองแล้วในช่วงเวลาดังกล่าว (${conflicting.title} โดย ${conflicting.requesterName})`,
          conflictingBooking: {
            id: conflicting.id,
            bookingCode: conflicting.bookingCode,
            title: conflicting.title,
            startTime: conflicting.startTime,
            endTime: conflicting.endTime,
            organizerName: conflicting.requesterName,
          },
          suggestedRooms,
        });
      }
    }

    return jsonResponse({ hasConflict: false });
  }

  // Bookings: /api/bookings
  if (pathname === '/api/bookings') {
    if (method === 'GET') {
      const roomId = searchParams.get('roomId');
      const department = searchParams.get('department');
      const status = searchParams.get('status');

      let list = [...data.bookings];
      if (roomId) list = list.filter((b) => b.roomId === roomId);
      if (department) list = list.filter((b) => b.department.includes(department));
      if (status) list = list.filter((b) => b.status === status);

      list.sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());
      return jsonResponse({ bookings: list });
    }

    if (method === 'POST') {
      const curUser = db.getCurrentUser();
      const targetRoom = data.rooms.find((r) => r.id === bodyJson.roomId);
      const now = new Date();

      const newBooking: Booking = {
        id: `bkg-${Date.now()}`,
        bookingCode: `REQ-${now.toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(100 + Math.random() * 900)}`,
        roomId: bodyJson.roomId,
        customRoomName: bodyJson.customRoomName || '',
        userId: curUser.id,
        requesterName: bodyJson.requesterName || curUser.name,
        position: bodyJson.position || curUser.position || 'เจ้าหน้าที่',
        department: bodyJson.department || curUser.department || 'งานศูนย์ดิจิทัลเพื่อการศึกษา',
        phone: bodyJson.phone || curUser.phone || '',
        title: bodyJson.title,
        description: bodyJson.description,
        startTime: bodyJson.startTime,
        endTime: bodyJson.endTime,
        participantsCount: Number(bodyJson.participantsCount || 1),
        organizerName: bodyJson.requesterName || curUser.name,
        status: 'PENDING',
        selectedEquipments: bodyJson.selectedEquipments || [],
        extraTables: Number(bodyJson.extraTables || 0),
        extraChairs: Number(bodyJson.extraChairs || 0),
        extraEquipmentNote: bodyJson.extraEquipmentNote || '',
        agreedGovProperty: Boolean(bodyJson.agreedGovProperty),
        stage1: {
          status: 'PENDING',
          officer: 'นายวัชรพงศ์ โสภา',
          roleTitle: 'เจ้าหน้าที่ตรวจห้อง / โสตทัศนูปกรณ์',
        },
        stage2: {
          status: 'PENDING',
          officer: 'นายเอกราช เขียวทอง',
          roleTitle: 'หัวหน้างานศูนย์ดิจิทัลเพื่อการศึกษา',
        },
        stage3: {
          status: 'PENDING',
          officer: 'นายชาตรี เริงชัยภูมิ',
          roleTitle: 'รองผู้อำนวยการ / ผู้อนุมัติ',
        },
        reminderSent: false,
        createdAt: now.toISOString(),
        updatedAt: now.toISOString(),
        room: targetRoom,
        user: curUser,
      };

      data.bookings.unshift(newBooking);

      // Notification to Checker (นายวัชรพงศ์ โสภา)
      const notif: NotificationItem = {
        id: `notif-${Date.now()}`,
        userId: 'usr-checker-1',
        bookingId: newBooking.id,
        title: 'มีคำขอจองห้องประชุมใหม่ รอการตรวจห้อง',
        message: `${newBooking.requesterName} (${newBooking.department}) ได้ส่งคำขอใช้ห้อง ${targetRoom?.name || newBooking.customRoomName}`,
        type: 'BOOKING_CREATED',
        isRead: false,
        linkUrl: '/all-bookings',
        createdAt: now.toISOString(),
      };
      data.notifications.unshift(notif);

      db.persist();
      db.emitSSE('BOOKING_CREATED', { booking: newBooking });

      // Trigger Webhook
      await db.triggerWebhook('ส่งแบบคำขอใหม่', {
        title: 'ยื่นคำขออนุญาตใช้ห้องประชุม',
        message: newBooking.title,
        roomName: targetRoom?.name || newBooking.customRoomName || 'ห้องประชุม',
        requesterName: `${newBooking.requesterName} (${newBooking.department})`,
        time: `${newBooking.startTime.slice(0, 10)} เวลา ${newBooking.startTime.slice(11, 16)} - ${newBooking.endTime.slice(11, 16)}`,
      });

      return jsonResponse({ booking: newBooking });
    }
  }

  // 3-Level Approval Routes
  // Level 1: Stage 1 (นายวัชรพงศ์ โสภา - ตรวจห้อง)
  const stage1Match = pathname.match(/^\/api\/bookings\/([^/]+)\/stage1$/);
  if (stage1Match && method === 'POST') {
    const bookingId = stage1Match[1];
    const b = data.bookings.find((item) => item.id === bookingId);
    if (!b) return jsonResponse({ error: 'Booking not found' }, 404);

    const { status, note } = bodyJson; // status: 'PASSED' | 'FAILED'
    b.stage1.status = status;
    b.stage1.note = note || (status === 'PASSED' ? 'ตรวจความพร้อมห้องและอุปกรณ์เรียบร้อย' : 'ห้องหรืออุปกรณ์ไม่พร้อมใช้งาน');
    b.stage1.actionDate = new Date().toISOString();

    if (status === 'PASSED') {
      b.status = 'CHECKED';
      // notify stage 2 (นายเอกราช เขียวทอง)
      data.notifications.unshift({
        id: `notif-${Date.now()}`,
        userId: 'usr-endorser-1',
        bookingId: b.id,
        title: 'มีคำขอที่ผ่านการตรวจห้องแล้ว รอการรับรอง',
        message: `ห้อง ${b.room?.name || b.customRoomName} ผ่านการตรวจห้องโดยนายวัชรพงศ์ โสภา แล้ว รอท่านรับรอง`,
        type: 'BOOKING_CHECKED',
        isRead: false,
        linkUrl: '/all-bookings',
        createdAt: new Date().toISOString(),
      });
    } else {
      b.status = 'REJECTED';
      b.rejectionReason = `ไม่ผ่านการตรวจห้อง: ${b.stage1.note}`;
    }

    db.persist();
    db.emitSSE('BOOKING_STATUS_CHANGED', { booking: b });
    return jsonResponse({ success: true, booking: b });
  }

  // Level 2: Stage 2 (นายเอกราช เขียวทอง - รับรอง)
  const stage2Match = pathname.match(/^\/api\/bookings\/([^/]+)\/stage2$/);
  if (stage2Match && method === 'POST') {
    const bookingId = stage2Match[1];
    const b = data.bookings.find((item) => item.id === bookingId);
    if (!b) return jsonResponse({ error: 'Booking not found' }, 404);

    const { status, note } = bodyJson; // status: 'PASSED' | 'FAILED'
    b.stage2.status = status;
    b.stage2.note = note || (status === 'PASSED' ? 'รับรองคำขอใช้บริการ' : 'ไม่รับรองคำขอ');
    b.stage2.actionDate = new Date().toISOString();

    if (status === 'PASSED') {
      b.status = 'ENDORSED';
      // notify stage 3 (นายชาตรี เริงชัยภูมิ)
      data.notifications.unshift({
        id: `notif-${Date.now()}`,
        userId: 'usr-approver-1',
        bookingId: b.id,
        title: 'มีคำขอรอการอนุมัติขั้นสุดท้าย',
        message: `ห้อง ${b.room?.name || b.customRoomName} ได้รับการรับรองแล้ว รอท่านพิจารณาอนุมัติ`,
        type: 'BOOKING_ENDORSED',
        isRead: false,
        linkUrl: '/all-bookings',
        createdAt: new Date().toISOString(),
      });
    } else {
      b.status = 'REJECTED';
      b.rejectionReason = `ไม่ได้รับการรับรอง: ${b.stage2.note}`;
    }

    db.persist();
    db.emitSSE('BOOKING_STATUS_CHANGED', { booking: b });
    return jsonResponse({ success: true, booking: b });
  }

  // Level 3: Stage 3 (นายชาตรี เริงชัยภูมิ - อนุมัติ)
  const stage3Match = pathname.match(/^\/api\/bookings\/([^/]+)\/stage3$/);
  if (stage3Match && method === 'POST') {
    const bookingId = stage3Match[1];
    const b = data.bookings.find((item) => item.id === bookingId);
    if (!b) return jsonResponse({ error: 'Booking not found' }, 404);

    const { status, note } = bodyJson; // status: 'APPROVED' | 'REJECTED'
    b.stage3.status = status;
    b.stage3.note = note || (status === 'APPROVED' ? 'อนุมัติให้ใช้งานตามคำขอ' : 'ไม่อนุมัติ');
    b.stage3.actionDate = new Date().toISOString();

    if (status === 'APPROVED') {
      b.status = 'APPROVED';
      data.notifications.unshift({
        id: `notif-${Date.now()}`,
        userId: b.userId,
        bookingId: b.id,
        title: 'คำขอใช้ห้องประชุมได้รับการอนุมัติแล้ว',
        message: `คำขอห้อง ${b.room?.name || b.customRoomName} ได้รับการอนุมัติจากนายชาตรี เริงชัยภูมิ เรียบร้อยแล้ว`,
        type: 'BOOKING_APPROVED',
        isRead: false,
        linkUrl: '/my-bookings',
        createdAt: new Date().toISOString(),
      });

      // Webhook dispatch
      await db.triggerWebhook('อนุมัติการใช้ห้องประชุม', {
        title: 'คำขอได้รับการอนุมัติแล้ว',
        message: `${b.title} (อนุมัติโดยนายชาตรี เริงชัยภูมิ)`,
        roomName: b.room?.name || b.customRoomName || 'ห้องประชุม',
        requesterName: `${b.requesterName} (${b.department})`,
        time: `${b.startTime.slice(0, 10)} เวลา ${b.startTime.slice(11, 16)} - ${b.endTime.slice(11, 16)}`,
      });
    } else {
      b.status = 'REJECTED';
      b.rejectionReason = `ไม่อนุมัติ: ${b.stage3.note}`;
    }

    db.persist();
    db.emitSSE('BOOKING_STATUS_CHANGED', { booking: b });
    return jsonResponse({ success: true, booking: b });
  }

  // Booking Cancel: /api/bookings/:id DELETE
  const cancelMatch = pathname.match(/^\/api\/bookings\/([^/]+)$/);
  if (cancelMatch && method === 'DELETE') {
    const bookingId = cancelMatch[1];
    const b = data.bookings.find((item) => item.id === bookingId);
    if (!b) return jsonResponse({ error: 'Booking not found' }, 404);

    b.status = 'CANCELLED';
    b.updatedAt = new Date().toISOString();
    db.persist();
    db.emitSSE('BOOKING_CANCELLED', { booking: b });
    return jsonResponse({ success: true });
  }

  // Dashboard Stats: /api/dashboard/stats
  if (pathname === '/api/dashboard/stats') {
    const now = new Date();
    const startOfToday = new Date(now);
    startOfToday.setHours(0, 0, 0, 0);
    const endOfToday = new Date(now);
    endOfToday.setHours(23, 59, 59, 999);

    const todayBookingsCount = data.bookings.filter((b) => {
      const s = new Date(b.startTime);
      return s >= startOfToday && s <= endOfToday && !['CANCELLED', 'REJECTED'].includes(b.status);
    }).length;

    const pendingApprovalsCount = data.bookings.filter((b) => ['PENDING', 'CHECKED', 'ENDORSED'].includes(b.status)).length;
    const approvedBookingsCount = data.bookings.filter((b) => b.status === 'APPROVED').length;

    let totalAttendees = 0;
    data.bookings.forEach((b) => {
      if (b.status === 'APPROVED') {
        totalAttendees += Number(b.participantsCount || 0);
      }
    });

    // 1. Chart: Most Used Rooms (จัดอันดับห้องประชุมใช้งานสูงสุด)
    const roomRanking = data.rooms.map((r) => {
      const count = data.bookings.filter((b) => b.roomId === r.id && b.status === 'APPROVED').length;
      return { name: r.name.replace('ห้องประชุม', '').trim(), fullName: r.name, count };
    }).sort((a, b) => b.count - a.count);

    // 2. Chart: Top Requesting Departments (จัดอันดับแผนกวิชาที่ขอใช้บริการ)
    const deptMap: Record<string, number> = {};
    data.bookings.forEach((b) => {
      if (!['CANCELLED', 'REJECTED'].includes(b.status)) {
        const d = b.department || 'ไม่ระบุ';
        deptMap[d] = (deptMap[d] || 0) + 1;
      }
    });

    const departmentRanking = Object.entries(deptMap)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);

    const upcomingBookings = data.bookings
      .filter((b) => b.status === 'APPROVED' && new Date(b.endTime).getTime() >= now.getTime())
      .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
      .slice(0, 5);

    return jsonResponse({
      cards: {
        todayBookingsCount,
        pendingApprovalsCount,
        approvedBookingsCount,
        totalAttendees: totalAttendees > 0 ? totalAttendees : 60,
      },
      charts: {
        roomRanking,
        departmentRanking,
      },
      announcements: data.announcements,
      upcomingBookings,
      allRooms: data.rooms,
    });
  }

  // Calendar: /api/calendar
  if (pathname === '/api/calendar') {
    return jsonResponse({ bookings: data.bookings });
  }

  // Notifications: /api/notifications
  if (pathname === '/api/notifications') {
    if (method === 'GET') {
      const curUser = db.getCurrentUser();
      const list = data.notifications.filter((n) => n.userId === curUser.id || ['CHECKER', 'ENDORSER', 'APPROVER', 'ADMIN'].includes(curUser.role));
      const unreadCount = list.filter((n) => !n.isRead).length;
      return jsonResponse({ notifications: list, unreadCount });
    }
    if (method === 'PUT') {
      data.notifications.forEach((n) => (n.isRead = true));
      db.persist();
      return jsonResponse({ success: true });
    }
  }

  // Users: /api/users
  if (pathname === '/api/users') {
    return jsonResponse({ users: data.users });
  }

  // Export CSV: /api/reports/export
  if (pathname === '/api/reports/export') {
    const csvContent =
      '\uFEFF' + // UTF-8 BOM for Excel
      'รหัสคำขอ,ชื่อผู้ขอ,ตำแหน่ง,แผนกวิชา,เบอร์โทร,ห้องประชุม,หัวข้อการประชุม,วันที่,เวลาเริ่มต้น,เวลาสิ้นสุด,จำนวนคน,อุปกรณ์ที่ขอ,ตรวจห้อง(นายวัชรพงศ์),รับรอง(นายเอกราช),อนุมัติ(นายชาตรี),สถานะรวม\n' +
      data.bookings
        .map((b) => {
          const roomTitle = b.room?.name || b.customRoomName || '-';
          const eqList = (b.selectedEquipments || []).join('; ');
          return `"${b.bookingCode}","${b.requesterName}","${b.position}","${b.department}","${b.phone}","${roomTitle}","${b.title}","${b.startTime.slice(0, 10)}","${b.startTime.slice(11, 16)}","${b.endTime.slice(11, 16)}","${b.participantsCount}","${eqList}","${b.stage1.status}","${b.stage2.status}","${b.stage3.status}","${b.status}"`;
        })
        .join('\n');

    return new Response(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': 'attachment; filename="meeting_room_verification_report.csv"',
      },
    });
  }

  return jsonResponse({ error: `Not found: ${method} ${pathname}` }, 404);
}

// Global Interceptor Installation
let isInitialized = false;

export function initMockApi() {
  if (typeof window === 'undefined' || isInitialized) return;
  isInitialized = true;

  getDb();

  // Mock EventSource
  (window as any).EventSource = class {
    private listeners: Record<string, Function[]> = {};
    constructor() {
      setTimeout(() => {
        this.dispatchEvent('connected', { data: JSON.stringify({ message: 'Connected' }) });
      }, 50);

      window.addEventListener('mock-sse' as any, (e: CustomEvent) => {
        const { eventName, data } = e.detail || {};
        if (eventName) {
          this.dispatchEvent(eventName, { data: JSON.stringify(data) });
        }
      });
    }

    addEventListener(event: string, fn: Function) {
      if (!this.listeners[event]) this.listeners[event] = [];
      this.listeners[event].push(fn);
    }

    removeEventListener(event: string, fn: Function) {
      if (!this.listeners[event]) return;
      this.listeners[event] = this.listeners[event].filter((f) => f !== fn);
    }

    private dispatchEvent(event: string, obj: any) {
      (this.listeners[event] || []).forEach((fn) => fn(obj));
    }

    close() {}
  };

  // Intercept window.fetch
  const originalFetch = window.fetch;
  window.fetch = async function (input: RequestInfo | URL, init?: RequestInit) {
    const urlString = typeof input === 'string' ? input : input instanceof URL ? input.toString() : input.url;

    if (urlString.includes('/api/')) {
      return handleMockRequest(urlString, init);
    }

    return originalFetch.apply(this, [input, init]);
  };
}
