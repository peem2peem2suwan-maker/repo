'use client';

import React, { useState, useEffect } from 'react';
import { Booking } from '@/types';
import { useToast } from '@/components/ui/Toast';
import { CheckSquare, Check, X, MapPin, Clock, Users, User, AlertCircle } from 'lucide-react';

export default function AllBookingsPage() {
  const { showToast } = useToast();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Reject modal
  const [rejectingBooking, setRejectingBooking] = useState<Booking | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchAllBookings = async () => {
    try {
      const url = statusFilter !== 'ALL' ? `/api/bookings?scope=all&status=${statusFilter}` : '/api/bookings?scope=all';
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setBookings(data.bookings || []);
      }
    } catch (err) {
      console.error('Error fetching all bookings:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAllBookings();
  }, [statusFilter]);

  const handleApprove = async (booking: Booking) => {
    try {
      const res = await fetch(`/api/bookings/${booking.id}/approve`, {
        method: 'POST',
      });
      if (res.ok) {
        showToast('success', `อนุมัติการจอง ${booking.bookingCode} เรียบร้อยแล้ว`);
        fetchAllBookings();
      } else {
        const data = await res.json();
        showToast('error', data.error || 'ไม่สามารถอนุมัติได้');
      }
    } catch {
      showToast('error', 'เกิดข้อผิดพลาดในการอนุมัติ');
    }
  };

  const handleRejectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectingBooking) return;

    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/bookings/${rejectingBooking.id}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: rejectionReason }),
      });

      if (res.ok) {
        showToast('info', `ปฏิเสธคำขอจอง ${rejectingBooking.bookingCode} แล้ว`);
        setRejectingBooking(null);
        setRejectionReason('');
        fetchAllBookings();
      } else {
        const data = await res.json();
        showToast('error', data.error || 'ไม่สามารถปฏิเสธคำขอได้');
      }
    } catch {
      showToast('error', 'เกิดข้อผิดพลาดในการส่งข้อมูล');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return <span className="px-2.5 py-1 text-xs font-bold rounded-lg bg-emerald-100 text-emerald-800">อนุมัติแล้ว</span>;
      case 'PENDING':
        return <span className="px-2.5 py-1 text-xs font-bold rounded-lg bg-amber-100 text-amber-800 animate-pulse">รออนุมัติ</span>;
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            การจองทั้งหมดและการอนุมัติ (All Bookings)
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            ศูนย์กลางการตรวจสอบ อนุมัติ และบริหารคำขอจองห้องประชุมทั้งองค์กร
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 shadow-xs focus:outline-none"
          >
            <option value="ALL">สถานะทั้งหมด</option>
            <option value="PENDING">🟡 รออนุมัติ (Pending)</option>
            <option value="APPROVED">🟢 อนุมัติแล้ว (Approved)</option>
            <option value="REJECTED">🔴 ถูกปฏิเสธ (Rejected)</option>
            <option value="CANCELLED">⚫ ยกเลิกแล้ว (Cancelled)</option>
          </select>
        </div>
      </div>

      {isLoading ? (
        <div className="py-24 flex justify-center">
          <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : bookings.length === 0 ? (
        <div className="py-16 text-center bg-white rounded-3xl border border-slate-200 p-8 space-y-3">
          <CheckSquare className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="font-bold text-slate-800 text-base">ไม่พบรายการจองตามเงื่อนไข</h3>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200/80 text-slate-500 uppercase font-semibold">
                <tr>
                  <th className="px-5 py-4">รหัส / หัวข้อ</th>
                  <th className="px-5 py-4">ห้องประชุม</th>
                  <th className="px-5 py-4">ผู้จัด / แผนก</th>
                  <th className="px-5 py-4">วันและเวลา</th>
                  <th className="px-5 py-4">สถานะ</th>
                  <th className="px-5 py-4 text-right">การจัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {bookings.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-50/80 transition">
                    <td className="px-5 py-4">
                      <span className="font-mono text-[11px] font-bold text-slate-400 block">
                        {b.bookingCode}
                      </span>
                      <span className="font-bold text-slate-900 text-sm block mt-0.5">
                        {b.title}
                      </span>
                      {b.description && (
                        <span className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                          {b.description}
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <span className="font-semibold text-slate-800 block">{b.room?.name}</span>
                      <span className="text-[11px] text-slate-400 block">{b.room?.building} ชั้น {b.room?.floor}</span>
                    </td>
                    <td className="px-5 py-4">
                      <span className="font-semibold text-slate-800 block">{b.organizerName || b.user?.name}</span>
                      <span className="text-[11px] text-slate-500 block">{b.user?.department}</span>
                    </td>
                    <td className="px-5 py-4">
                      <span className="font-medium text-slate-800 block">
                        {new Date(b.startTime).toLocaleDateString('th-TH')}
                      </span>
                      <span className="text-[11px] text-slate-500 block">
                        {new Date(b.startTime).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })} - {new Date(b.endTime).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </td>
                    <td className="px-5 py-4">{getStatusBadge(b.status)}</td>
                    <td className="px-5 py-4 text-right">
                      {b.status === 'PENDING' ? (
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleApprove(b)}
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-semibold rounded-lg shadow-xs transition flex items-center gap-1"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>อนุมัติ</span>
                          </button>
                          <button
                            onClick={() => {
                              setRejectingBooking(b);
                              setRejectionReason('');
                            }}
                            className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 font-semibold rounded-lg transition flex items-center gap-1"
                          >
                            <X className="w-3.5 h-3.5" />
                            <span>ปฏิเสธ</span>
                          </button>
                        </div>
                      ) : (
                        <span className="text-[11px] text-slate-400">เรียบร้อยแล้ว</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {rejectingBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 animate-in fade-in zoom-in-95">
            <h3 className="font-bold text-slate-900 text-base mb-1">
              ปฏิเสธคำขอจอง: {rejectingBooking.bookingCode}
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              กรุณาระบุเหตุผลเพื่อให้ผู้จอง ({rejectingBooking.organizerName || rejectingBooking.user?.name}) รับทราบ
            </p>

            <form onSubmit={handleRejectSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  เหตุผลการปฏิเสธคำขอ *
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="เช่น ติดภารกิจด่วนของผู้บริหาร หรือจัดกิจกรรมปรับปรุงระบบ..."
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-rose-500 focus:outline-none"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setRejectingBooking(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold rounded-xl shadow-md"
                >
                  ยืนยันปฏิเสธคำขอ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
