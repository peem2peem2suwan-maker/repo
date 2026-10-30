export type UserRole = 'USER' | 'MANAGER' | 'ADMIN';

export type RoomStatus = 'AVAILABLE' | 'OCCUPIED' | 'RESERVED' | 'MAINTENANCE';

export type BookingStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED' | 'COMPLETED';

export type NotificationType =
  | 'BOOKING_CREATED'
  | 'BOOKING_APPROVED'
  | 'BOOKING_REJECTED'
  | 'BOOKING_CANCELLED'
  | 'REMINDER_15MIN'
  | 'SYSTEM';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  department: string;
  avatar?: string | null;
  status: 'ACTIVE' | 'DISABLED';
  lastLoginAt?: string | null;
  createdAt: string;
}

export interface Equipment {
  id: string;
  name: string;
  icon?: string | null;
  category: string;
}

export interface RoomEquipment {
  id: string;
  roomId: string;
  equipmentId: string;
  quantity: number;
  equipment: Equipment;
}

export interface Room {
  id: string;
  code: string;
  name: string;
  building: string;
  floor: number;
  capacity: number;
  description?: string | null;
  imageUrl?: string | null;
  status: RoomStatus;
  equipment: RoomEquipment[];
  currentBooking?: Booking | null;
}

export interface BookingParticipant {
  id: string;
  bookingId: string;
  name: string;
  email?: string | null;
}

export interface BookingEquipment {
  id: string;
  bookingId: string;
  equipmentId: string;
  equipment: Equipment;
}

export interface Booking {
  id: string;
  bookingCode: string;
  roomId: string;
  userId: string;
  title: string;
  description?: string | null;
  startTime: string;
  endTime: string;
  participantsCount: number;
  organizerName: string;
  status: BookingStatus;
  rejectionReason?: string | null;
  reminderSent: boolean;
  createdAt: string;
  updatedAt: string;
  room?: Room;
  user?: User;
  participants?: BookingParticipant[];
  equipmentRequested?: BookingEquipment[];
}

export interface NotificationItem {
  id: string;
  userId: string;
  bookingId?: string | null;
  title: string;
  message: string;
  type: NotificationType;
  isRead: boolean;
  linkUrl?: string | null;
  createdAt: string;
}

export interface AuditLogItem {
  id: string;
  userId?: string | null;
  action: string;
  entity: string;
  entityId?: string | null;
  details?: string | null;
  ipAddress?: string | null;
  createdAt: string;
  user?: {
    name: string;
    email: string;
    role: string;
  } | null;
}
