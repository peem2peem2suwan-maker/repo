'use client';

import React, { useState, useEffect } from 'react';
import { Booking } from '@/types';
import { useToast } from '@/components/ui/Toast';
import { BookmarkCheck, Calendar, Clock, MapPin, Users, Trash2, X, Plus, AlertCircle } from 'lucide-react';
import Link from 'next/link';

export default function MyBookingsPage() {
  const { showToast } = useToast();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');

  const fetchMyBookings = async () => {
    try {
      const url = statusFilter !== 'ALL' ? `/api/bookings?scope=mine&status=${statusFilter}` : '/api/bookings?scope=mine';
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setBookings(data.bookings || []);
      }
    } catch (err) {
      console.error('Error fetching my bookings:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMyBookings();
  }, [statusFilter]);

  const handleCancel = async (id: string, code: string) => {
    if (!confirm(`คุณต้องการยกเลิกการจอง ${code} ใช่หรือไม่?`)) return;

    try {
      const res = await fetch(`/api/bookings/${id}`, { method: 'DELETE' });
      if (res.ok) {
        showToast('success', 'ยกเลิกการจองเรียบร้อยแล้ว');
        fetchMyBookings();
      } else {
        const data = await res.json();
        showToast('error', data.error || 'ไม่สามารถยกเลิกการจองได้');
      }
    } catch {
      showToast('error', 'เกิดข้อผิดพลาดในการยกเลิก');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return <span className="px-2.5 py-1 text-xs font-bold rounded-lg bg-emerald-100 text-emerald-800">อนุมัติแล้ว</span>;
      case 'PENDING':
        return <span className="px-2.5 py-1 text-xs font-bold rounded-lg bg-amber-100 text-amber-800">รออนุมัติ</span>;
      case 'REJECTED':
        return <span className="px-2.5 py-1 text-xs font-bold rounded-lg bg-rose-100 text-rose-800">ถูกปฏิเสธ</span>;
      case 'CANCELLED':
        return <span className="px-2.5 py-1 text-xs font-bold rounded-lg bg-slate-100 text-slate-500">ยกเลิกแล้ว</span>;
      default:
        return <span className="px-2.5 py-1 text-xs font-bold rounded-lg bg-slate-100 text-slate-700">{status}</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header and Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            การจองของฉัน (My Bookings)
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            ประวัติและสถานะคำขอจองห้องประชุมทั้งหมดของคุณ
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 shadow-xs focus:outline-none"
          >
            <option value="ALL">สถานะทั้งหมด</option>
            <option value="APPROVED">อนุมัติแล้ว (Approved)</option>
            <option value="PENDING">รออนุมัติ (Pending)</option>
            <option value="REJECTED">ถูกปฏิเสธ (Rejected)</option>
            <option value="CANCELLED">ยกเลิกแล้ว (Cancelled)</option>
          </select>

          <Link
            href="/rooms"
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white text-xs sm:text-sm font-semibold rounded-xl shadow-md shadow-blue-600/20 transition flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>จองห้องเพิ่ม</span>
          </Link>
        </div>
      </div>

      {/* Bookings List */}
      {isLoading ? (
        <div className="py-24 flex justify-center">
          <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : bookings.length === 0 ? (
        <div className="py-16 text-center bg-white rounded-3xl border border-slate-200 p-8 space-y-3">
          <BookmarkCheck className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="font-bold text-slate-800 text-base">ไม่พบรายการจองห้องประชุมของคุณ</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            คุณยังไม่มีรายการจองห้องประชุม หรือไม่มีรายการที่ตรงกับตัวกรองนี้
          </p>
          <Link
            href="/rooms"
            className="inline-block px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl shadow-sm"
          >
            ไปที่หน้าห้องประชุมเพื่อจอง
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {bookings.map((booking) => (
            <div
              key={booking.id}
              className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-md transition flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex flex-col items-center justify-center shrink-0 border border-blue-100">
                  <span className="text-[10px] uppercase font-bold text-blue-400">
                    {new Date(booking.startTime).toLocaleDateString('th-TH', { month: 'short' })}
                  </span>
                  <span className="text-base font-extrabold leading-none">
                    {new Date(booking.startTime).getDate()}
                  </span>
                </div>

                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-mono font-bold text-slate-400">
                      {booking.bookingCode}
                    </span>
                    <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                      {booking.title}
                    </h3>
                    {getStatusBadge(booking.status)}
                  </div>

                  <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-slate-500 mt-1.5">
                    <span className="flex items-center gap-1 font-semibold text-slate-700">
                      <MapPin className="w-3.5 h-3.5 text-blue-600" />
                      {booking.room?.name} ({booking.room?.code})
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      {new Date(booking.startTime).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })} - {new Date(booking.endTime).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="w-3.5 h-3.5 text-slate-400" />
                      {booking.participantsCount} คน
                    </span>
                  </div>

                  {booking.rejectionReason && (
                    <p className="text-xs text-rose-600 font-medium mt-1 bg-rose-50 px-2 py-1 rounded-lg inline-block">
                      เหตุผลที่ถูกปฏิเสธ: {booking.rejectionReason}
                    </p>
                  )}
                </div>
              </div>

              {/* Action buttons */}
              {['PENDING', 'APPROVED'].includes(booking.status) && (
                <div className="flex items-center gap-2 self-end sm:self-center">
                  <button
                    onClick={() => handleCancel(booking.id, booking.bookingCode)}
                    className="px-3.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-semibold rounded-xl transition flex items-center gap-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>ยกเลิกการจอง</span>
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
