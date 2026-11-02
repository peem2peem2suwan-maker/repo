'use client';

// Client-Side Mock Database & API Interceptor for GitHub Pages (Static Export)

export interface MockUser {
  id: string;
  email: string;
  name: string;
  role: 'ADMIN' | 'MANAGER' | 'USER';
  department: string;
  avatar?: string;
  status: string;
}

export interface MockEquipment {
  id: string;
  name: string;
  icon?: string;
  category: string;
}

export interface MockRoom {
  id: string;
  code: string;
  name: string;
  building: string;
  floor: number;
  capacity: number;
  description?: string;
  imageUrl?: string;
  status: 'AVAILABLE' | 'OCCUPIED' | 'RESERVED' | 'MAINTENANCE';
  equipment: Array<{
    id: string;
    quantity: number;
    equipment: MockEquipment;
  }>;
}

export interface MockBooking {
  id: string;
  bookingCode: string;
  roomId: string;
  userId: string;
  title: string;
  description?: string;
  startTime: string;
  endTime: string;
  participantsCount: number;
  organizerName: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED' | 'COMPLETED';
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
  room?: MockRoom;
  user?: {
    id: string;
    name: string;
    email: string;
    department: string;
    avatar?: string;
  };
  participants?: Array<{ id: string; name: string; email?: string }>;
  equipment?: Array<{ id: string; equipment: MockEquipment }>;
}

export interface MockNotification {
  id: string;
  userId: string;
  bookingId?: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  linkUrl?: string;
  createdAt: string;
}

export interface MockAuditLog {
  id: string;
  userId?: string;
  action: string;
  entity: string;
  entityId?: string;
  details?: string;
  ipAddress?: string;
  createdAt: string;
  user?: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
}

const STORAGE_KEY = 'meetspace_static_db_v1';
const CURRENT_USER_KEY = 'meetspace_current_user_v1';

// Seed Initial Data
function getSeedData() {
  const users: MockUser[] = [
    {
      id: 'usr-admin-1',
      email: 'admin@company.com',
      name: 'สมชาย ประเสริฐ (Admin)',
      role: 'ADMIN',
      department: 'ฝ่ายเทคโนโลยีสารสนเทศ (IT)',
      status: 'ACTIVE',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    },
    {
      id: 'usr-mgr-1',
      email: 'manager@company.com',
      name: 'สุภาพร วงศ์สุวรรณ (Manager)',
      role: 'MANAGER',
      department: 'ฝ่ายบริหารทรัพยากรบุคคล (HR)',
      status: 'ACTIVE',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
    },
    {
      id: 'usr-staff-1',
      email: 'user@company.com',
      name: 'อนันต์ สุขสำราญ (Staff)',
      role: 'USER',
      department: 'ฝ่ายการตลาดและประชาสัมพันธ์ (Marketing)',
      status: 'ACTIVE',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    },
    {
      id: 'usr-staff-2',
      email: 'kanya@company.com',
      name: 'กัญญา รัตนกุล (Staff)',
      role: 'USER',
      department: 'ฝ่ายบัญชีและการเงิน (Finance)',
      status: 'ACTIVE',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    },
  ];

  const equipments: MockEquipment[] = [
    { id: 'eq-1', name: 'โปรเจกเตอร์ 4K Ultra HD', icon: 'Projector', category: 'Display' },
    { id: 'eq-2', name: 'สมาร์ททีวี 75 นิ้ว 4K', icon: 'Tv', category: 'Display' },
    { id: 'eq-3', name: 'ระบบวิดีโอคอนเฟอเรนซ์ (Zoom/Teams Rooms)', icon: 'Video', category: 'Conference' },
    { id: 'eq-4', name: 'กระดานไวท์บอร์ดอัจฉริยะ', icon: 'Presentation', category: 'Display' },
    { id: 'eq-5', name: 'ไมโครโฟนไร้สาย (2 ตัว)', icon: 'Mic', category: 'Audio' },
    { id: 'eq-6', name: 'ระบบเครื่องเสียงและลำโพงรอบทิศทาง', icon: 'Volume2', category: 'Audio' },
    { id: 'eq-7', name: 'อินเทอร์เน็ตความเร็วสูง Wi-Fi 6', icon: 'Wifi', category: 'Network' },
    { id: 'eq-8', name: 'ปลั๊กไฟและแท่นชาร์จไร้สายประจำโต๊ะ', icon: 'Zap', category: 'Power' },
  ];

  const rooms: MockRoom[] = [
    {
      id: 'rm-101',
      code: 'RM-101',
      name: 'Diamond Boardroom',
      building: 'อาคาร A (Executive Wing)',
      floor: 10,
      capacity: 30,
      description: 'ห้องประชุมใหญ่ระดับผู้บริหาร วิวมุมสูงรอบทิศ ตกแต่งหรูหรา พร้อมระบบประชุมทางไกลครบชุด',
      imageUrl: 'https://images.unsplash.com/photo-1517502884422-41eaead166d4?w=800',
      status: 'AVAILABLE',
      equipment: [
        { id: 'req-1', quantity: 1, equipment: equipments[0] },
        { id: 'req-2', quantity: 1, equipment: equipments[2] },
        { id: 'req-3', quantity: 2, equipment: equipments[4] },
        { id: 'req-4', quantity: 1, equipment: equipments[5] },
        { id: 'req-5', quantity: 1, equipment: equipments[6] },
      ],
    },
    {
      id: 'rm-102',
      code: 'RM-102',
      name: 'Sapphire Conference Room',
      building: 'อาคาร A',
      floor: 4,
      capacity: 16,
      description: 'ห้องประชุมขนาดกลาง เหมาะสำหรับการประชุมร่วมกับลูกค้าและทีมโปรเจกต์',
      imageUrl: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800',
      status: 'AVAILABLE',
      equipment: [
        { id: 'req-6', quantity: 1, equipment: equipments[1] },
        { id: 'req-7', quantity: 1, equipment: equipments[2] },
        { id: 'req-8', quantity: 1, equipment: equipments[3] },
        { id: 'req-9', quantity: 1, equipment: equipments[6] },
      ],
    },
    {
      id: 'rm-201',
      code: 'RM-201',
      name: 'Emerald Meeting Room',
      building: 'อาคาร B',
      floor: 2,
      capacity: 10,
      description: 'ห้องประชุมสำหรับทีมขนาดเล็ก บรรยากาศเป็นกันเอง โปร่งสบาย แสงธรรมชาติทั่วถึง',
      imageUrl: 'https://images.unsplash.com/photo-1497215728101-856f4ea42174?w=800',
      status: 'AVAILABLE',
      equipment: [
        { id: 'req-10', quantity: 1, equipment: equipments[1] },
        { id: 'req-11', quantity: 1, equipment: equipments[3] },
        { id: 'req-12', quantity: 1, equipment: equipments[6] },
      ],
    },
    {
      id: 'rm-202',
      code: 'RM-202',
      name: 'Ruby Workshop Studio',
      building: 'อาคาร B',
      floor: 3,
      capacity: 24,
      description: 'ห้องเวิร์กช็อปและฝึกอบรม จัดโต๊ะได้หลายรูปแบบ เหมาะสำหรับการระดมความคิดและเทรนนิ่ง',
      imageUrl: 'https://images.unsplash.com/photo-1527192491265-7e15c55b1ed2?w=800',
      status: 'AVAILABLE',
      equipment: [
        { id: 'req-13', quantity: 1, equipment: equipments[0] },
        { id: 'req-14', quantity: 2, equipment: equipments[4] },
        { id: 'req-15', quantity: 1, equipment: equipments[3] },
        { id: 'req-16', quantity: 1, equipment: equipments[7] },
      ],
    },
    {
      id: 'rm-301',
      code: 'RM-301',
      name: 'Opal Brainstorm Hub',
      building: 'อาคาร A',
      floor: 2,
      capacity: 6,
      description: 'ห้องระดมความคิดขนาดกะทัดรัด พร้อมผนังกระจกเขียนได้ เหมาะสำหรับ Sprint Planning',
      imageUrl: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=800',
      status: 'AVAILABLE',
      equipment: [
        { id: 'req-17', quantity: 1, equipment: equipments[1] },
        { id: 'req-18', quantity: 1, equipment: equipments[3] },
        { id: 'req-19', quantity: 1, equipment: equipments[6] },
      ],
    },
    {
      id: 'rm-302',
      code: 'RM-302',
      name: 'Amber Focus Room',
      building: 'อาคาร C',
      floor: 1,
      capacity: 4,
      description: 'ห้องประชุมเก็บเสียงสำหรับ One-on-One ปัจจุบันอยู่ระหว่างปิดบำรุงรักษาระบบปรับอากาศ',
      imageUrl: 'https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=800',
      status: 'MAINTENANCE',
      equipment: [
        { id: 'req-20', quantity: 1, equipment: equipments[1] },
        { id: 'req-21', quantity: 1, equipment: equipments[6] },
      ],
    },
  ];

  const now = new Date();
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

  const bookings: MockBooking[] = [
    {
      id: 'bkg-1',
      bookingCode: 'BKG-20261029-001',
      roomId: 'rm-101',
      userId: 'usr-admin-1',
      title: 'ประชุมคณะกรรมการบริหารประจำไตรมาส (Executive Q3 Review)',
      description: 'ทบทวนผลการดำเนินงานไตรมาสที่ 3 และวางแผนยุทธศาสตร์ประจำปี',
      startTime: today10AM.toISOString(),
      endTime: today1130AM.toISOString(),
      participantsCount: 20,
      organizerName: 'สมชาย ประเสริฐ (Admin)',
      status: 'APPROVED',
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
      room: rooms[0],
      user: {
        id: users[0].id,
        name: users[0].name,
        email: users[0].email,
        department: users[0].department,
        avatar: users[0].avatar,
      },
      participants: [
        { id: 'p-1', name: 'คุณสมชาย ประเสริฐ', email: 'admin@company.com' },
        { id: 'p-2', name: 'คุณสุภาพร วงศ์สุวรรณ', email: 'manager@company.com' },
      ],
    },
    {
      id: 'bkg-2',
      bookingCode: 'BKG-20261029-002',
      roomId: 'rm-102',
      userId: 'usr-staff-1',
      title: 'Product Launch Marketing Strategy',
      description: 'ประชุมวางแผนแคมเปญการเปิดตัวผลิตภัณฑ์ใหม่ร่วมกับเอเจนซี่',
      startTime: today13PM.toISOString(),
      endTime: today15PM.toISOString(),
      participantsCount: 12,
      organizerName: 'อนันต์ สุขสำราญ (Staff)',
      status: 'APPROVED',
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
      room: rooms[1],
      user: {
        id: users[2].id,
        name: users[2].name,
        email: users[2].email,
        department: users[2].department,
        avatar: users[2].avatar,
      },
      participants: [
        { id: 'p-3', name: 'อนันต์ สุขสำราญ', email: 'user@company.com' },
        { id: 'p-4', name: 'กัญญา รัตนกุล', email: 'kanya@company.com' },
      ],
    },
    {
      id: 'bkg-3',
      bookingCode: 'BKG-20261030-001',
      roomId: 'rm-201',
      userId: 'usr-staff-2',
      title: 'สรุปงบประมาณและรายงานบัญชีประจำเดือน',
      description: 'เตรียมการประชุมปิดยอดบัญชี',
      startTime: tomorrow09AM.toISOString(),
      endTime: tomorrow11AM.toISOString(),
      participantsCount: 8,
      organizerName: 'กัญญา รัตนกุล (Staff)',
      status: 'PENDING',
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
      room: rooms[2],
      user: {
        id: users[3].id,
        name: users[3].name,
        email: users[3].email,
        department: users[3].department,
        avatar: users[3].avatar,
      },
      participants: [{ id: 'p-5', name: 'กัญญา รัตนกุล', email: 'kanya@company.com' }],
    },
  ];

  const notifications: MockNotification[] = [
    {
      id: 'notif-1',
      userId: 'usr-admin-1',
      bookingId: 'bkg-3',
      title: 'มีการจองห้องประชุมใหม่รอการอนุมัติ',
      message: 'คุณ กัญญา รัตนกุล ได้ทำการจองห้อง Emerald Meeting Room สำหรับวันพรุ่งนี้',
      type: 'BOOKING_CREATED',
      isRead: false,
      linkUrl: '/all-bookings',
      createdAt: now.toISOString(),
    },
    {
      id: 'notif-2',
      userId: 'usr-staff-1',
      bookingId: 'bkg-2',
      title: 'การจองห้องประชุมของคุณได้รับการอนุมัติแล้ว',
      message: 'ห้อง Sapphire Conference Room ได้รับการอนุมัติเรียบร้อยแล้ว',
      type: 'BOOKING_APPROVED',
      isRead: true,
      linkUrl: '/my-bookings',
      createdAt: now.toISOString(),
    },
  ];

  const auditLogs: MockAuditLog[] = [
    {
      id: 'log-1',
      userId: 'usr-admin-1',
      action: 'SYSTEM_SEED',
      entity: 'DATABASE',
      details: JSON.stringify({ message: 'Static Client Database initialized successfully' }),
      ipAddress: '127.0.0.1',
      createdAt: now.toISOString(),
      user: {
        id: users[0].id,
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
    notifications,
    auditLogs,
  };
}

// Database Helper
class MockDatabase {
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

  private saveData(data: ReturnType<typeof getSeedData>) {
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

  public getCurrentUser(): MockUser {
    if (typeof window === 'undefined') return this.data.users[0];
    try {
      const stored = localStorage.getItem(CURRENT_USER_KEY);
      if (stored) {
        const found = this.data.users.find((u) => u.id === stored);
        if (found) return found;
      }
    } catch {}
    return this.data.users[0]; // Default: Admin
  }

  public setCurrentUser(user: MockUser) {
    if (typeof window !== 'undefined') {
      localStorage.setItem(CURRENT_USER_KEY, user.id);
      window.dispatchEvent(new CustomEvent('mock-auth-changed', { detail: user }));
    }
  }

  public emitSSE(eventName: string, data: any) {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('mock-sse', { detail: { eventName, data } }));
    }
  }
}

let dbInstance: MockDatabase | null = null;
function getDbInstance() {
  if (!dbInstance) {
    dbInstance = new MockDatabase();
  }
  return dbInstance;
}

// SSE Polyfill for /api/realtime
class MockEventSource {
  public url: string;
  private listeners: Record<string, Array<(e: any) => void>> = {};
  public onerror: ((e: any) => void) | null = null;

  constructor(url: string) {
    this.url = url;

    setTimeout(() => {
      this.dispatchEvent('connected', { data: JSON.stringify({ message: 'Connected to Mock Real-Time' }) });
    }, 50);

    if (typeof window !== 'undefined') {
      const handler = (e: CustomEvent) => {
        const { eventName, data } = e.detail || {};
        if (eventName) {
          this.dispatchEvent(eventName, { data: JSON.stringify(data) });
        }
      };
      window.addEventListener('mock-sse' as any, handler);
    }
  }

  public addEventListener(event: string, callback: (e: any) => void) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);
  }

  public removeEventListener(event: string, callback: (e: any) => void) {
    if (!this.listeners[event]) return;
    this.listeners[event] = this.listeners[event].filter((cb) => cb !== callback);
  }

  private dispatchEvent(event: string, eventObj: any) {
    const list = this.listeners[event] || [];
    list.forEach((cb) => {
      try {
        cb(eventObj);
      } catch {}
    });
  }

  public close() {}
}

// Mock API Route Handlers
async function handleMockRequest(url: string, options?: RequestInit): Promise<Response> {
  const db = getDbInstance();
  const data = db.getDb();
  const method = (options?.method || 'GET').toUpperCase();

  // Normalize path by stripping query string and base path
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

  // Parse Body
  let bodyJson: any = null;
  if (options?.body) {
    try {
      bodyJson = JSON.parse(options.body as string);
    } catch {}
  }

  // 1. Auth: /api/auth/me
  if (pathname === '/api/auth/me') {
    const user = db.getCurrentUser();
    return jsonResponse({ user });
  }

  // 2. Auth: /api/auth/login
  if (pathname === '/api/auth/login' && method === 'POST') {
    const { email } = bodyJson || {};
    const found = data.users.find((u) => u.email === email) || data.users[0];
    db.setCurrentUser(found);
    return jsonResponse({ success: true, user: found });
  }

  // 3. Auth: /api/auth/logout
  if (pathname === '/api/auth/logout' && method === 'POST') {
    return jsonResponse({ success: true });
  }

  // 4. Auth: /api/auth/quick-switch
  if (pathname === '/api/auth/quick-switch' && method === 'POST') {
    const { role } = bodyJson || {};
    const matched = data.users.find((u) => u.role === role) || data.users[0];
    db.setCurrentUser(matched);
    return jsonResponse({ success: true, user: matched });
  }

  // 5. Users: /api/users
  if (pathname === '/api/users' && method === 'GET') {
    return jsonResponse({ users: data.users });
  }
  if (pathname === '/api/users' && method === 'POST') {
    const newUser: MockUser = {
      id: `usr-${Date.now()}`,
      email: bodyJson.email,
      name: bodyJson.name,
      role: bodyJson.role || 'USER',
      department: bodyJson.department || 'General',
      status: bodyJson.status || 'ACTIVE',
    };
    data.users.push(newUser);
    db.persist();
    return jsonResponse({ user: newUser });
  }

  // 6. Rooms: /api/rooms
  if (pathname === '/api/rooms' && method === 'GET') {
    return jsonResponse({ rooms: data.rooms });
  }
  if (pathname === '/api/rooms' && method === 'POST') {
    const newRoom: MockRoom = {
      id: `rm-${Date.now()}`,
      code: bodyJson.code || `RM-${Math.floor(Math.random() * 900 + 100)}`,
      name: bodyJson.name,
      building: bodyJson.building || 'อาคารหลัก',
      floor: Number(bodyJson.floor || 1),
      capacity: Number(bodyJson.capacity || 10),
      description: bodyJson.description || '',
      imageUrl: bodyJson.imageUrl || 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800',
      status: bodyJson.status || 'AVAILABLE',
      equipment: (bodyJson.equipments || []).map((eqName: string, i: number) => ({
        id: `req-${Date.now()}-${i}`,
        quantity: 1,
        equipment: { id: `eq-${i}`, name: eqName, category: 'General' },
      })),
    };
    data.rooms.push(newRoom);
    db.persist();
    return jsonResponse({ room: newRoom });
  }

  // 7. Room by ID: /api/rooms/:id
  const roomMatch = pathname.match(/^\/api\/rooms\/([^/]+)$/);
  if (roomMatch) {
    const roomId = roomMatch[1];
    const room = data.rooms.find((r) => r.id === roomId || r.code === roomId);
    if (!room) return jsonResponse({ error: 'Room not found' }, 404);

    if (method === 'GET') {
      return jsonResponse(room);
    }
    if (method === 'PUT') {
      Object.assign(room, bodyJson);
      db.persist();
      return jsonResponse({ room });
    }
    if (method === 'DELETE') {
      data.rooms = data.rooms.filter((r) => r.id !== roomId);
      db.persist();
      return jsonResponse({ success: true });
    }
  }

  // 8. Bookings Check Availability: /api/bookings/check-availability
  if (pathname === '/api/bookings/check-availability' && method === 'POST') {
    const { roomId, startTime, endTime, participantsCount, excludeBookingId } = bodyJson || {};
    const room = data.rooms.find((r) => r.id === roomId);
    if (!room) return jsonResponse({ hasConflict: true, reason: 'ไม่พบห้องประชุม' });

    if (room.status === 'MAINTENANCE') {
      return jsonResponse({
        hasConflict: true,
        reason: 'ห้องประชุมนี้อยู่ระหว่างการปิดปรับปรุง (Maintenance)',
      });
    }

    if (participantsCount && Number(participantsCount) > room.capacity) {
      return jsonResponse({
        hasConflict: true,
        reason: `จำนวนผู้เข้าร่วม (${participantsCount} คน) เกินความจุของห้องที่รองรับได้สูงสุด (${room.capacity} คน)`,
      });
    }

    const start = new Date(startTime).getTime();
    const end = new Date(endTime).getTime();

    const conflicting = data.bookings.find((b) => {
      if (b.id === excludeBookingId) return false;
      if (b.roomId !== roomId) return false;
      if (!['APPROVED', 'PENDING'].includes(b.status)) return false;
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
        reason: `ห้องนี้ถูกจองแล้วในช่วงเวลาดังกล่าว (${conflicting.title})`,
        conflictingBooking: {
          id: conflicting.id,
          bookingCode: conflicting.bookingCode,
          title: conflicting.title,
          startTime: conflicting.startTime,
          endTime: conflicting.endTime,
          organizerName: conflicting.organizerName,
        },
        suggestedRooms,
      });
    }

    return jsonResponse({ hasConflict: false });
  }

  // 9. Bookings: /api/bookings
  if (pathname === '/api/bookings') {
    if (method === 'GET') {
      const roomId = searchParams.get('roomId');
      const userId = searchParams.get('userId');
      const status = searchParams.get('status');

      let results = [...data.bookings];
      if (roomId) results = results.filter((b) => b.roomId === roomId);
      if (userId) results = results.filter((b) => b.userId === userId);
      if (status) results = results.filter((b) => b.status === status);

      results.sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());
      return jsonResponse({ bookings: results });
    }

    if (method === 'POST') {
      const curUser = db.getCurrentUser();
      const targetRoom = data.rooms.find((r) => r.id === bodyJson.roomId) || data.rooms[0];
      const now = new Date();

      const newBooking: MockBooking = {
        id: `bkg-${Date.now()}`,
        bookingCode: `BKG-${now.toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(100 + Math.random() * 900)}`,
        roomId: bodyJson.roomId,
        userId: curUser.id,
        title: bodyJson.title,
        description: bodyJson.description,
        startTime: bodyJson.startTime,
        endTime: bodyJson.endTime,
        participantsCount: Number(bodyJson.participantsCount || 1),
        organizerName: bodyJson.organizerName || curUser.name,
        status: curUser.role === 'ADMIN' ? 'APPROVED' : 'PENDING',
        createdAt: now.toISOString(),
        updatedAt: now.toISOString(),
        room: targetRoom,
        user: {
          id: curUser.id,
          name: curUser.name,
          email: curUser.email,
          department: curUser.department,
          avatar: curUser.avatar,
        },
        participants: (bodyJson.participants || []).map((p: string, idx: number) => ({
          id: `p-${Date.now()}-${idx}`,
          name: p,
        })),
      };

      data.bookings.unshift(newBooking);

      // Add Notification
      const newNotif: MockNotification = {
        id: `notif-${Date.now()}`,
        userId: 'usr-admin-1',
        bookingId: newBooking.id,
        title: 'มีการจองห้องประชุมใหม่',
        message: `${curUser.name} ได้ทำการจองห้อง ${targetRoom.name}`,
        type: 'BOOKING_CREATED',
        isRead: false,
        linkUrl: '/all-bookings',
        createdAt: now.toISOString(),
      };
      data.notifications.unshift(newNotif);

      // Audit Log
      data.auditLogs.unshift({
        id: `log-${Date.now()}`,
        userId: curUser.id,
        action: 'CREATE_BOOKING',
        entity: 'BOOKING',
        entityId: newBooking.id,
        details: JSON.stringify({ title: newBooking.title, room: targetRoom.name }),
        ipAddress: '127.0.0.1',
        createdAt: now.toISOString(),
        user: curUser,
      });

      db.persist();
      db.emitSSE('BOOKING_CREATED', { room: targetRoom, booking: newBooking });
      db.emitSSE('NOTIFICATION_NEW', { notification: newNotif });

      return jsonResponse({ booking: newBooking });
    }
  }

  // 10. Booking Approve: /api/bookings/:id/approve
  const approveMatch = pathname.match(/^\/api\/bookings\/([^/]+)\/approve$/);
  if (approveMatch && method === 'POST') {
    const bookingId = approveMatch[1];
    const b = data.bookings.find((item) => item.id === bookingId);
    if (!b) return jsonResponse({ error: 'Booking not found' }, 404);

    b.status = 'APPROVED';
    b.updatedAt = new Date().toISOString();

    const notif: MockNotification = {
      id: `notif-${Date.now()}`,
      userId: b.userId,
      bookingId: b.id,
      title: 'การจองห้องประชุมได้รับการอนุมัติ',
      message: `ห้อง ${b.room?.name || 'ประชุม'} ได้รับการอนุมัติแล้ว`,
      type: 'BOOKING_APPROVED',
      isRead: false,
      linkUrl: '/my-bookings',
      createdAt: new Date().toISOString(),
    };
    data.notifications.unshift(notif);
    db.persist();

    db.emitSSE('BOOKING_APPROVED', { booking: b });
    return jsonResponse({ success: true, booking: b });
  }

  // 11. Booking Reject: /api/bookings/:id/reject
  const rejectMatch = pathname.match(/^\/api\/bookings\/([^/]+)\/reject$/);
  if (rejectMatch && method === 'POST') {
    const bookingId = rejectMatch[1];
    const b = data.bookings.find((item) => item.id === bookingId);
    if (!b) return jsonResponse({ error: 'Booking not found' }, 404);

    b.status = 'REJECTED';
    b.rejectionReason = bodyJson?.reason || 'ปฏิเสธโดยผู้ดูแลระบบ';
    b.updatedAt = new Date().toISOString();

    const notif: MockNotification = {
      id: `notif-${Date.now()}`,
      userId: b.userId,
      bookingId: b.id,
      title: 'คำขอจองห้องประชุมถูกปฏิเสธ',
      message: `ห้อง ${b.room?.name || 'ประชุม'} ถูกปฏิเสธ: ${b.rejectionReason}`,
      type: 'BOOKING_REJECTED',
      isRead: false,
      linkUrl: '/my-bookings',
      createdAt: new Date().toISOString(),
    };
    data.notifications.unshift(notif);
    db.persist();

    db.emitSSE('BOOKING_REJECTED', { booking: b });
    return jsonResponse({ success: true, booking: b });
  }

  // 12. Booking by ID: /api/bookings/:id
  const singleBookingMatch = pathname.match(/^\/api\/bookings\/([^/]+)$/);
  if (singleBookingMatch) {
    const bookingId = singleBookingMatch[1];
    const b = data.bookings.find((item) => item.id === bookingId);
    if (!b) return jsonResponse({ error: 'Booking not found' }, 404);

    if (method === 'GET') return jsonResponse(b);
    if (method === 'PUT') {
      Object.assign(b, bodyJson);
      b.updatedAt = new Date().toISOString();
      db.persist();
      return jsonResponse({ booking: b });
    }
    if (method === 'DELETE') {
      b.status = 'CANCELLED';
      b.updatedAt = new Date().toISOString();
      db.persist();
      db.emitSSE('BOOKING_CANCELLED', { booking: b });
      return jsonResponse({ success: true });
    }
  }

  // 13. Calendar: /api/calendar
  if (pathname === '/api/calendar') {
    return jsonResponse({ bookings: data.bookings });
  }

  // 14. Dashboard Stats: /api/dashboard/stats
  if (pathname === '/api/dashboard/stats') {
    const now = new Date();
    const startOfToday = new Date(now);
    startOfToday.setHours(0, 0, 0, 0);
    const endOfToday = new Date(now);
    endOfToday.setHours(23, 59, 59, 999);

    const totalRooms = data.rooms.length;
    let availableCount = 0;
    let occupiedCount = 0;
    let reservedCount = 0;
    let maintenanceCount = 0;

    data.rooms.forEach((r) => {
      if (r.status === 'MAINTENANCE') {
        maintenanceCount++;
      } else {
        const roomBookings = data.bookings.filter(
          (b) => b.roomId === r.id && b.status === 'APPROVED'
        );
        const isOccupied = roomBookings.some((b) => {
          const s = new Date(b.startTime).getTime();
          const e = new Date(b.endTime).getTime();
          return now.getTime() >= s && now.getTime() < e;
        });

        if (isOccupied) {
          occupiedCount++;
        } else {
          const isReserved = roomBookings.some((b) => new Date(b.startTime).getTime() > now.getTime());
          if (isReserved) reservedCount++;
          else availableCount++;
        }
      }
    });

    const todayBookingsCount = data.bookings.filter((b) => {
      const s = new Date(b.startTime);
      return s >= startOfToday && s <= endOfToday && ['APPROVED', 'PENDING'].includes(b.status);
    }).length;

    const pendingApprovalsCount = data.bookings.filter((b) => b.status === 'PENDING').length;

    // Daily stats (past 7 days)
    const dailyStats = [];
    const thaiDays = ['อา.', 'จ.', 'อ.', 'พ.', 'พฤ.', 'ศ.', 'ส.'];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const ds = new Date(d);
      ds.setHours(0, 0, 0, 0);
      const de = new Date(d);
      de.setHours(23, 59, 59, 999);

      const count = data.bookings.filter((b) => {
        const s = new Date(b.startTime);
        return s >= ds && s <= de;
      }).length;

      dailyStats.push({
        date: `${thaiDays[d.getDay()]} ${d.getDate()}/${d.getMonth() + 1}`,
        count,
      });
    }

    const roomUsage = data.rooms.map((r) => {
      const count = data.bookings.filter((b) => b.roomId === r.id).length;
      return { name: r.name, code: r.code, count };
    });

    const upcomingMeetings = data.bookings
      .filter((b) => b.status === 'APPROVED' && new Date(b.endTime).getTime() >= now.getTime())
      .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
      .slice(0, 5);

    const recentBookings = [...data.bookings]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5);

    return jsonResponse({
      cards: {
        totalRooms,
        availableCount,
        occupiedCount,
        reservedCount,
        maintenanceCount,
        todayBookingsCount,
        weekBookingsCount: todayBookingsCount + 5,
        monthBookingsCount: data.bookings.length,
        pendingApprovalsCount,
        mostUsedRoomName: data.rooms[0]?.name || '-',
        utilizationRate: 68,
      },
      charts: {
        dailyStats,
        roomUsage,
      },
      upcomingMeetings,
      recentBookings,
    });
  }

  // 15. Notifications: /api/notifications
  if (pathname === '/api/notifications') {
    if (method === 'GET') {
      const curUser = db.getCurrentUser();
      const list = data.notifications.filter((n) => n.userId === curUser.id || curUser.role === 'ADMIN');
      const unreadCount = list.filter((n) => !n.isRead).length;
      return jsonResponse({ notifications: list, unreadCount });
    }
    if (method === 'PUT') {
      data.notifications.forEach((n) => (n.isRead = true));
      db.persist();
      return jsonResponse({ success: true });
    }
  }

  // 16. Reports: /api/reports
  if (pathname === '/api/reports') {
    const completedOrApproved = data.bookings.filter((b) => ['APPROVED', 'COMPLETED'].includes(b.status));
    const cancellationsCount = data.bookings.filter((b) => b.status === 'CANCELLED').length;
    const rejectedCount = data.bookings.filter((b) => b.status === 'REJECTED').length;

    const roomMap: Record<string, { room: any; count: number; hours: number }> = {};
    data.rooms.forEach((r) => {
      roomMap[r.id] = { room: r, count: 0, hours: 0 };
    });

    completedOrApproved.forEach((b) => {
      if (roomMap[b.roomId]) {
        roomMap[b.roomId].count++;
        const hrs = (new Date(b.endTime).getTime() - new Date(b.startTime).getTime()) / (1000 * 60 * 60);
        roomMap[b.roomId].hours += Math.max(1, hrs);
      }
    });

    const roomBreakdown = Object.values(roomMap).sort((a, b) => b.count - a.count);

    return jsonResponse({
      summary: {
        totalBookings: data.bookings.length,
        approvedBookings: completedOrApproved.length,
        cancelledBookings: cancellationsCount,
        rejectedBookings: rejectedCount,
        totalUsageHours: 42,
        mostUsedRoom: roomBreakdown[0]?.room?.name || '-',
        leastUsedRoom: roomBreakdown[roomBreakdown.length - 1]?.room?.name || '-',
      },
      roomBreakdown,
      departmentBreakdown: [
        { department: 'ฝ่ายเทคโนโลยีสารสนเทศ (IT)', count: 8, hours: 14 },
        { department: 'ฝ่ายบริหารทรัพยากรบุคคล (HR)', count: 5, hours: 9 },
        { department: 'ฝ่ายการตลาดและประชาสัมพันธ์ (Marketing)', count: 4, hours: 7 },
        { department: 'ฝ่ายบัญชีและการเงิน (Finance)', count: 3, hours: 5 },
      ],
      hourlyHeatmap: [
        { hour: '09:00', count: 6 },
        { hour: '10:00', count: 12 },
        { hour: '11:00', count: 9 },
        { hour: '13:00', count: 14 },
        { hour: '14:00', count: 15 },
        { hour: '15:00', count: 11 },
        { hour: '16:00', count: 7 },
      ],
      bookings: data.bookings,
    });
  }

  // 17. Reports Export: /api/reports/export
  if (pathname === '/api/reports/export') {
    const csvContent =
      'BookingCode,Title,Room,Organizer,Date,StartTime,EndTime,Status\n' +
      data.bookings
        .map(
          (b) =>
            `"${b.bookingCode}","${b.title}","${b.room?.name || ''}","${b.organizerName}","${b.startTime.slice(0, 10)}","${b.startTime.slice(11, 16)}","${b.endTime.slice(11, 16)}","${b.status}"`
        )
        .join('\n');

    return new Response(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': 'attachment; filename="meeting_room_report.csv"',
      },
    });
  }

  // 18. Audit Logs: /api/audit-logs
  if (pathname === '/api/audit-logs') {
    return jsonResponse({ logs: data.auditLogs });
  }

  return jsonResponse({ error: `Not found: ${method} ${pathname}` }, 404);
}

// Global Interceptor Installation
let isInitialized = false;

export function initMockApi() {
  if (typeof window === 'undefined' || isInitialized) return;
  isInitialized = true;

  // Initialize DB
  getDbInstance();

  // Mock EventSource for Real-Time SSE
  (window as any).EventSource = MockEventSource;

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
