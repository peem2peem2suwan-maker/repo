'use client';

import React, { useState, useEffect } from 'react';
import { CalendarView } from '@/components/calendar/CalendarView';
import { Room } from '@/types';
import { useToast } from '@/components/ui/Toast';
import { Calendar as CalendarIcon, Filter, Plus } from 'lucide-react';
import { BookingModal } from '@/components/bookings/BookingModal';

export default function CalendarPage() {
  const { showToast } = useToast();
  const [events, setEvents] = useState<any[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [selectedRoomId, setSelectedRoomId] = useState('ALL');
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [bookingModalOpen, setBookingModalOpen] = useState(false);

  const fetchCalendarEvents = async () => {
    try {
      const url = selectedRoomId !== 'ALL' ? `/api/calendar?roomId=${selectedRoomId}` : '/api/calendar';
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setEvents(data.events || []);
      }
    } catch (err) {
      console.error('Error fetching calendar events:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchRooms = async () => {
    try {
      const res = await fetch('/api/rooms');
      if (res.ok) {
        const data = await res.json();
        setRooms(data.rooms || []);
      }
    } catch {}
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
    fetchRooms();
    fetchCurrentUser();
  }, []);

  useEffect(() => {
    fetchCalendarEvents();
  }, [selectedRoomId]);

  const handleCancelBooking = async (id: string) => {
    try {
      const res = await fetch(`/api/bookings/${id}`, { method: 'DELETE' });
      if (res.ok) {
        showToast('success', 'ยกเลิกการจองเรียบร้อยแล้ว');
        fetchCalendarEvents();
      } else {
        const data = await res.json();
        showToast('error', data.error || 'ไม่สามารถยกเลิกการจองได้');
      }
    } catch {
      showToast('error', 'เกิดข้อผิดพลาดในการยกเลิก');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            ปฏิทินการจองห้องประชุม (Calendar)
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            ดูตารางการจอง ตรวจสอบช่วงเวลาว่าง และจัดการการประชุมทั้งหมด
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Room Filter Selector */}
          <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-xl border border-slate-200 shadow-xs">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedRoomId}
              onChange={(e) => setSelectedRoomId(e.target.value)}
              className="text-xs font-semibold text-slate-800 bg-transparent focus:outline-none"
            >
              <option value="ALL">ห้องประชุมทั้งหมด</option>
              {rooms.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.code} - {r.name}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={() => setBookingModalOpen(true)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white text-xs sm:text-sm font-semibold rounded-xl shadow-md shadow-blue-600/20 transition flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>จองห้อง</span>
          </button>
        </div>
      </div>

      {/* Calendar View Component */}
      {isLoading ? (
        <div className="py-24 flex justify-center">
          <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <CalendarView
          events={events}
          onCancelBooking={handleCancelBooking}
          currentUserRole={currentUser?.role}
        />
      )}

      {/* Booking Modal */}
      {rooms.length > 0 && (
        <BookingModal
          room={rooms[0]}
          isOpen={bookingModalOpen}
          onClose={() => setBookingModalOpen(false)}
          onSuccess={() => fetchCalendarEvents()}
          allRooms={rooms}
        />
      )}
    </div>
  );
}
