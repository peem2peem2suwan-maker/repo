'use client';

import React, { useState, useEffect } from 'react';
import { Booking } from '@/types';
import { useToast } from '@/components/ui/Toast';
import { BookmarkCheck, Calendar, Clock, MapPin, Users, Trash2, Printer, Plus, AlertCircle } from 'lucide-react';
import { RequisitionPrintModal } from '@/components/print/RequisitionPrintModal';
import { BookingModal } from '@/components/bookings/BookingModal';
import Swal from 'sweetalert2';

export default function MyBookingsPage() {
  const { showToast } = useToast();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [allRooms, setAllRooms] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedBookingForPrint, setSelectedBookingForPrint] = useState<Booking | null>(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);

  const fetchMyBookings = async () => {
    try {
      const [bookingsRes, roomsRes] = await Promise.all([
        fetch('/api/bookings'),
        fetch('/api/rooms'),
      ]);

      if (bookingsRes.ok) {
        const data = await bookingsRes.json();
        setBookings(data.bookings || []);
      }
      if (roomsRes.ok) {
        const rData = await roomsRes.json();
        setAllRooms(rData.rooms || []);
      }
    } catch (err) {
      console.error('Error fetching bookings:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMyBookings();

    const handleUpdate = () => fetchMyBookings();
    window.addEventListener('mock-db-updated', handleUpdate);
    return () => window.removeEventListener('mock-db-updated', handleUpdate);
  }, [statusFilter]);

  const handleCancel = async (id: string, code: string) => {
    const result = await Swal.fire({
      title: 'ยืนยันการยกเลิกคำขอ?',
      text: `คุณต้องการยกเลิกคำขอใช้ห้องประชุม ${code} ใช่หรือไม่?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'ใช่, ขอยกเลิก',
      cancelButtonText: 'ไม่ยกเลิก',
      confirmButtonColor: '#dc2626',
    });

    if (result.isConfirmed) {
      try {
        const res = await fetch(`/api/bookings/${id}`, { method: 'DELETE' });
        if (res.ok) {
          Swal.fire({
            icon: 'success',
            title: 'ยกเลิกคำขอแล้ว',
            timer: 1500,
            showConfirmButton: false,
          });
          fetchMyBookings();
        }
      } catch {
        showToast('error', 'เกิดข้อผิดพลาดในการยกเลิก');
      }
    }
  };

  const filteredBookings = bookings.filter((b) => {
    if (statusFilter !== 'ALL' && b.status !== statusFilter) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            ประวัติและคำขอของฉัน (My Requests)
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            ติดตามสถานะคำขออนุญาตใช้ห้องประชุม 3 ระดับ และพิมพ์ใบคำขอ A4
          </p>
        </div>

        <button
          onClick={() => setIsBookingModalOpen(true)}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-semibold rounded-xl shadow-md transition flex items-center gap-2 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>ยื่นคำขอใหม่</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto text-xs font-semibold text-slate-600">
        {['ALL', 'PENDING', 'CHECKED', 'ENDORSED', 'APPROVED', 'REJECTED'].map((st) => (
          <button
            key={st}
            onClick={() => setStatusFilter(st)}
            className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
              statusFilter === st
                ? 'bg-blue-600 text-white'
                : 'hover:bg-slate-100 text-slate-600'
            }`}
          >
            {st === 'ALL'
              ? 'ทั้งหมด'
              : st === 'PENDING'
              ? 'รอตรวจห้อง'
              : st === 'CHECKED'
              ? 'ตรวจห้องแล้ว'
              : st === 'ENDORSED'
              ? 'รับรองแล้ว'
              : st === 'APPROVED'
              ? 'อนุมัติแล้ว'
              : 'ถูกปฏิเสธ'}
          </button>
        ))}
      </div>

      {/* Bookings Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredBookings.length === 0 ? (
          <div className="col-span-full py-16 text-center text-slate-400 bg-white rounded-3xl border border-slate-200">
            ไม่พบรายการคำขอ
          </div>
        ) : (
          filteredBookings.map((b) => (
            <div
              key={b.id}
              className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono font-bold text-xs text-blue-600">
                    {b.bookingCode}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      b.status === 'APPROVED'
                        ? 'bg-emerald-100 text-emerald-800'
                        : b.status === 'REJECTED'
                        ? 'bg-rose-100 text-rose-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {b.status === 'APPROVED'
                      ? '✓ อนุมัติแล้ว'
                      : b.status === 'ENDORSED'
                      ? '✓ รับรองแล้ว'
                      : b.status === 'CHECKED'
                      ? '✓ ตรวจห้องแล้ว'
                      : 'รอตรวจสอบ'}
                  </span>
                </div>

                <h3 className="font-bold text-slate-900 text-base leading-snug mb-2">
                  {b.title}
                </h3>

                <div className="space-y-1.5 text-xs text-slate-600">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="font-semibold text-slate-800">
                      {b.room?.name || b.customRoomName}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>
                      {b.startTime.slice(0, 10)} เวลา {b.startTime.slice(11, 16)} - {b.endTime.slice(11, 16)} น.
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>ผู้เข้าร่วม {b.participantsCount} คน</span>
                  </div>
                </div>

                {/* 3-Level Steps Preview */}
                <div className="mt-3 p-2.5 bg-slate-50 rounded-xl border border-slate-200/80 text-[10px] space-y-1">
                  <p className="font-bold text-slate-700">ลำดับการอนุมัติ 3 ระดับ:</p>
                  <p className="text-slate-600">
                    1. ตรวจห้อง: <strong>นายวัชรพงศ์ โสภา</strong> ({b.stage1?.status})
                  </p>
                  <p className="text-slate-600">
                    2. รับรอง: <strong>นายเอกราช เขียวทอง</strong> ({b.stage2?.status})
                  </p>
                  <p className="text-slate-600">
                    3. อนุมัติ: <strong>นายชาตรี เริงชัยภูมิ</strong> ({b.stage3?.status})
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs">
                <button
                  onClick={() => setSelectedBookingForPrint(b)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-xl font-semibold transition"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>พิมพ์แบบคำขอ A4</span>
                </button>

                {b.status !== 'CANCELLED' && b.status !== 'APPROVED' && (
                  <button
                    onClick={() => handleCancel(b.id, b.bookingCode)}
                    className="flex items-center gap-1 text-slate-400 hover:text-rose-600 font-medium transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>ยกเลิก</span>
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Booking Modal */}
      <BookingModal
        room={null}
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        onSuccess={() => fetchMyBookings()}
        allRooms={allRooms}
      />

      {/* A4 Requisition Print Modal */}
      <RequisitionPrintModal
        booking={selectedBookingForPrint}
        isOpen={Boolean(selectedBookingForPrint)}
        onClose={() => setSelectedBookingForPrint(null)}
      />
    </div>
  );
}
