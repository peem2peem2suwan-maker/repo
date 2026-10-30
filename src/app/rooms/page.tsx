'use client';

import React, { useState, useEffect } from 'react';
import { Room } from '@/types';
import { RoomCard } from '@/components/rooms/RoomCard';
import { RoomFilter } from '@/components/rooms/RoomFilter';
import { BookingModal } from '@/components/bookings/BookingModal';
import { Plus, Building2, X, AlertCircle } from 'lucide-react';
import { useToast } from '@/components/ui/Toast';

export default function RoomsPage() {
  const { showToast } = useToast();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [capacityFilter, setCapacityFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [buildingFilter, setBuildingFilter] = useState('ALL');
  const [equipmentFilter, setEquipmentFilter] = useState('ALL');

  // Booking Modal
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);

  // Admin Add/Edit Room Modal
  const [roomModalOpen, setRoomModalOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [roomFormData, setRoomFormData] = useState({
    code: '',
    name: '',
    building: 'อาคาร A',
    floor: 1,
    capacity: 10,
    description: '',
    imageUrl: '',
    status: 'AVAILABLE',
  });

  const fetchRooms = async () => {
    try {
      const params = new URLSearchParams();
      if (capacityFilter) params.append('capacity', capacityFilter);
      if (statusFilter !== 'ALL') params.append('status', statusFilter);
      if (buildingFilter !== 'ALL') params.append('building', buildingFilter);
      if (equipmentFilter !== 'ALL') params.append('equipment', equipmentFilter);

      const res = await fetch(`/api/rooms?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setRooms(data.rooms || []);
      }
    } catch (err) {
      console.error('Error fetching rooms:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCurrentUser = async () => {
    try {
      const res = await fetch('/api/auth/me');
      if (res.ok) {
        const data = await res.json();
        setCurrentUser(data.user);
      }
    } catch {}
  };

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  useEffect(() => {
    fetchRooms();
  }, [capacityFilter, statusFilter, buildingFilter, equipmentFilter]);

  const handleResetFilters = () => {
    setCapacityFilter('');
    setStatusFilter('ALL');
    setBuildingFilter('ALL');
    setEquipmentFilter('ALL');
  };

  const handleOpenBooking = (room: Room) => {
    setSelectedRoom(room);
    setBookingModalOpen(true);
  };

  const handleOpenCreateRoom = () => {
    setEditingRoom(null);
    setRoomFormData({
      code: `RM-${Math.floor(100 + Math.random() * 900)}`,
      name: '',
      building: 'อาคาร A',
      floor: 1,
      capacity: 10,
      description: '',
      imageUrl: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800',
      status: 'AVAILABLE',
    });
    setRoomModalOpen(true);
  };

  const handleOpenEditRoom = (room: Room) => {
    setEditingRoom(room);
    setRoomFormData({
      code: room.code,
      name: room.name,
      building: room.building,
      floor: room.floor,
      capacity: room.capacity,
      description: room.description || '',
      imageUrl: room.imageUrl || '',
      status: room.status,
    });
    setRoomModalOpen(true);
  };

  const handleDeleteRoom = async (room: Room) => {
    if (!confirm(`คุณต้องการลบห้อง "${room.name}" (${room.code}) หรือไม่?`)) return;

    try {
      const res = await fetch(`/api/rooms/${room.id}`, { method: 'DELETE' });
      if (res.ok) {
        showToast('success', `ลบห้อง ${room.name} สำเร็จ`);
        fetchRooms();
      } else {
        const data = await res.json();
        showToast('error', data.error || 'ไม่สามารถลบห้องได้');
      }
    } catch {
      showToast('error', 'เกิดข้อผิดพลาดในการลบห้อง');
    }
  };

  const handleSaveRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingRoom ? `/api/rooms/${editingRoom.id}` : '/api/rooms';
      const method = editingRoom ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(roomFormData),
      });

      const data = await res.json();
      if (res.ok) {
        showToast('success', editingRoom ? 'อัปเดตห้องสำเร็จ' : 'เพิ่มห้องประชุมใหม่สำเร็จ');
        setRoomModalOpen(false);
        fetchRooms();
      } else {
        showToast('error', data.error || 'ไม่สามารถบันทึกข้อมูลได้');
      }
    } catch {
      showToast('error', 'เกิดข้อผิดพลาดในการบันทึกห้อง');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header and Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            ห้องประชุมทั้งหมด (Meeting Rooms)
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            เลือกดูห้องประชุม ตรวจสอบสถานะแบบ Real-time และกดจองได้ทันที
          </p>
        </div>

        {currentUser?.role === 'ADMIN' && (
          <button
            onClick={handleOpenCreateRoom}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white text-xs sm:text-sm font-semibold rounded-xl shadow-md shadow-blue-600/20 transition flex items-center gap-2 self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>เพิ่มห้องประชุมใหม่</span>
          </button>
        )}
      </div>

      {/* Filter Component */}
      <RoomFilter
        capacity={capacityFilter}
        onCapacityChange={setCapacityFilter}
        status={statusFilter}
        onStatusChange={setStatusFilter}
        building={buildingFilter}
        onBuildingChange={setBuildingFilter}
        equipment={equipmentFilter}
        onEquipmentChange={setEquipmentFilter}
        onReset={handleResetFilters}
      />

      {/* Room Grid */}
      {isLoading ? (
        <div className="py-20 flex justify-center">
          <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : rooms.length === 0 ? (
        <div className="py-16 text-center bg-white rounded-3xl border border-slate-200 p-8 space-y-3">
          <Building2 className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="font-bold text-slate-800 text-base">ไม่พบห้องประชุมที่ตรงกับเงื่อนไข</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            ลองปรับเปลี่ยนตัวกรอง หรือกด "ล้างตัวกรองทั้งหมด" เพื่อดูห้องประชุมทั้งหมด
          </p>
          <button
            onClick={handleResetFilters}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl"
          >
            ล้างตัวกรอง
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {rooms.map((room) => (
            <RoomCard
              key={room.id}
              room={room}
              onBook={handleOpenBooking}
              onEdit={handleOpenEditRoom}
              onDelete={handleDeleteRoom}
              isAdmin={currentUser?.role === 'ADMIN'}
            />
          ))}
        </div>
      )}

      {/* Booking Modal */}
      {selectedRoom && (
        <BookingModal
          room={selectedRoom}
          isOpen={bookingModalOpen}
          onClose={() => setBookingModalOpen(false)}
          onSuccess={() => fetchRooms()}
          allRooms={rooms}
        />
      )}

      {/* Admin Add/Edit Room Modal */}
      {roomModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-6 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base">
                {editingRoom ? `แก้ไขห้อง ${editingRoom.name}` : 'เพิ่มห้องประชุมใหม่'}
              </h3>
              <button
                onClick={() => setRoomModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveRoom} className="py-4 space-y-4 max-h-[75vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    รหัสห้อง (Room Code) *
                  </label>
                  <input
                    type="text"
                    required
                    value={roomFormData.code}
                    disabled={!!editingRoom}
                    onChange={(e) => setRoomFormData({ ...roomFormData, code: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    สถานะห้อง *
                  </label>
                  <select
                    value={roomFormData.status}
                    onChange={(e) => setRoomFormData({ ...roomFormData, status: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    <option value="AVAILABLE">ว่าง (Available)</option>
                    <option value="MAINTENANCE">ปิดปรับปรุง (Maintenance)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  ชื่อห้องประชุม (Room Name) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="เช่น Diamond Boardroom"
                  value={roomFormData.name}
                  onChange={(e) => setRoomFormData({ ...roomFormData, name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    อาคาร *
                  </label>
                  <input
                    type="text"
                    required
                    value={roomFormData.building}
                    onChange={(e) => setRoomFormData({ ...roomFormData, building: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    ชั้น *
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={roomFormData.floor}
                    onChange={(e) => setRoomFormData({ ...roomFormData, floor: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    ความจุ (คน) *
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={roomFormData.capacity}
                    onChange={(e) => setRoomFormData({ ...roomFormData, capacity: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  URL รูปภาพห้อง
                </label>
                <input
                  type="url"
                  placeholder="https://..."
                  value={roomFormData.imageUrl}
                  onChange={(e) => setRoomFormData({ ...roomFormData, imageUrl: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  คำอธิบาย
                </label>
                <textarea
                  rows={2}
                  value={roomFormData.description}
                  onChange={(e) => setRoomFormData({ ...roomFormData, description: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setRoomModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl shadow-md"
                >
                  บันทึกข้อมูลห้อง
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
