'use client';

import React, { useState, useEffect } from 'react';
import { CalendarView } from '@/components/calendar/CalendarView';
import { Room, Booking } from '@/types';
import { Plus } from 'lucide-react';
import { BookingModal } from '@/components/bookings/BookingModal';

export default function CalendarPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [bookingModalOpen, setBookingModalOpen] = useState(false);

  const fetchCalendarData = async () => {
    try {
      const [bookingsRes, roomsRes] = await Promise.all([
        fetch('/api/bookings'),
        fetch('/api/rooms'),
      ]);

      if (bookingsRes.ok) {
        const bData = await bookingsRes.json();
        setBookings(bData.bookings || []);
      }

      if (roomsRes.ok) {
        const rData = await roomsRes.json();
        setRooms(rData.rooms || []);
      }
    } catch (err) {
      console.error('Error fetching calendar data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCalendarData();

    const handleUpdate = () => fetchCalendarData();
    window.addEventListener('mock-db-updated', handleUpdate);
    return () => window.removeEventListener('mock-db-updated', handleUpdate);
  }, []);

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            ปฏิทินการจองห้องประชุม (Interactive Calendar)
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            แยกสีตามห้องประชุม 6 ห้องหลัก พร้อมตัวกรองรายห้องและค้นหาตามแผนกวิชา
          </p>
        </div>

        <button
          onClick={() => setBookingModalOpen(true)}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-semibold rounded-xl shadow-md shadow-blue-600/20 transition flex items-center gap-2 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>ยื่นแบบคำขอจองห้อง</span>
        </button>
      </div>

      {/* Calendar View Component */}
      {isLoading ? (
        <div className="py-24 flex justify-center">
          <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <CalendarView
          bookings={bookings}
          rooms={rooms}
          onRefresh={fetchCalendarData}
        />
      )}

      {/* Booking Modal */}
      <BookingModal
        room={rooms[0] || null}
        isOpen={bookingModalOpen}
        onClose={() => setBookingModalOpen(false)}
        onSuccess={() => fetchCalendarData()}
        allRooms={rooms}
      />
    </div>
  );
}
