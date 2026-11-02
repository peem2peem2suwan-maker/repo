'use client';

import React, { useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  User,
  Users,
  CheckCircle,
  AlertTriangle,
  X,
  Printer,
  Search,
  Filter,
} from 'lucide-react';
import { Booking } from '@/types';
import { RequisitionPrintModal } from '@/components/print/RequisitionPrintModal';

interface CalendarViewProps {
  bookings: Booking[];
  rooms: any[];
  onRefresh?: () => void;
}

type ViewMode = 'month' | 'week' | 'day' | 'agenda';

const ROOM_COLORS: Record<string, { bg: string; text: string; border: string; dot: string; label: string }> = {
  'rm-101': { bg: 'bg-blue-100', text: 'text-blue-900', border: 'border-blue-400', dot: 'bg-blue-600', label: 'ราชพฤกษ์ (ห้อง 1)' },
  'rm-102': { bg: 'bg-indigo-100', text: 'text-indigo-900', border: 'border-indigo-400', dot: 'bg-indigo-600', label: 'ชัยพฤกษ์ (ห้อง 2)' },
  'rm-201': { bg: 'bg-emerald-100', text: 'text-emerald-900', border: 'border-emerald-400', dot: 'bg-emerald-600', label: 'ทองกวาว (ห้อง 3)' },
  'rm-202': { bg: 'bg-purple-100', text: 'text-purple-900', border: 'border-purple-400', dot: 'bg-purple-600', label: 'อินทนิล (ห้อง 4)' },
  'rm-301': { bg: 'bg-amber-100', text: 'text-amber-900', border: 'border-amber-400', dot: 'bg-amber-600', label: 'เฟื่องฟ้า (ห้อง 5)' },
  'rm-302': { bg: 'bg-rose-100', text: 'text-rose-900', border: 'border-rose-400', dot: 'bg-rose-600', label: 'การะเกด (ห้อง 6)' },
};

export function CalendarView({ bookings, rooms, onRefresh }: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>('month');
  const [selectedRoomId, setSelectedRoomId] = useState<string>('ALL');
  const [searchDept, setSearchDept] = useState<string>('');
  const [activeBooking, setActiveBooking] = useState<Booking | null>(null);
  const [printBooking, setPrintBooking] = useState<Booking | null>(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const handlePrev = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNext = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  // Filter Bookings by Room and Department
  const filteredBookings = bookings.filter((b) => {
    if (selectedRoomId !== 'ALL' && b.roomId !== selectedRoomId) return false;
    if (searchDept.trim() && !b.department?.toLowerCase().includes(searchDept.trim().toLowerCase())) return false;
    return true;
  });

  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const prevMonthDays = new Date(year, month, 0).getDate();

  const thaiMonths = [
    'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
    'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม',
  ];

  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6 space-y-6">
      {/* Top Filter Bar: Room Selector + Department Search */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-3 w-full md:w-auto">
          {/* Room Filter */}
          <div className="flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-xl border border-slate-200 w-full sm:w-auto">
            <Filter className="w-4 h-4 text-slate-500 shrink-0" />
            <select
              value={selectedRoomId}
              onChange={(e) => setSelectedRoomId(e.target.value)}
              className="text-xs font-semibold text-slate-800 bg-transparent focus:outline-none w-full"
            >
              <option value="ALL">ห้องประชุมทั้งหมด (6 ห้องหลัก)</option>
              {rooms.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.code} - {r.name}
                </option>
              ))}
            </select>
          </div>

          {/* Department Search */}
          <div className="relative w-full sm:w-60">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="ค้นหาตามแผนกวิชา..."
              value={searchDept}
              onChange={(e) => setSearchDept(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Month Navigator */}
        <div className="flex items-center gap-2 w-full md:w-auto justify-between md:justify-end">
          <div className="flex items-center gap-1">
            <button
              onClick={handlePrev}
              className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 transition"
              title="เดือนก่อนหน้า"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleToday}
              className="px-3 py-1 text-xs font-semibold rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 transition"
            >
              วันนี้
            </button>
            <button
              onClick={handleNext}
              className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 transition"
              title="เดือนถัดไป"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <h2 className="text-base font-bold text-slate-900 tracking-tight">
            {thaiMonths[month]} {year + 543}
          </h2>
        </div>
      </div>

      {/* Room Color Legend (แยกสีตามห้องประชุม) */}
      <div className="flex items-center gap-3 overflow-x-auto pb-2 text-[11px] font-medium text-slate-600 border-b border-slate-100">
        <span className="font-semibold text-slate-400 text-xs shrink-0">สีประจำห้อง:</span>
        {Object.entries(ROOM_COLORS).map(([id, col]) => (
          <div key={id} className="flex items-center gap-1.5 shrink-0 px-2 py-0.5 rounded-lg bg-slate-50 border border-slate-200">
            <span className={`w-2.5 h-2.5 rounded-full ${col.dot}`} />
            <span>{col.label}</span>
          </div>
        ))}
      </div>

      {/* Calendar Grid (Month View) */}
      <div>
        <div className="grid grid-cols-7 gap-px bg-slate-200 rounded-2xl overflow-hidden border border-slate-200">
          {['อาทิตย์', 'จันทร์', 'อังคาร', 'พุธ', 'พฤหัสบดี', 'ศุกร์', 'เสาร์'].map((day, i) => (
            <div
              key={day}
              className={`py-2 text-center text-xs font-bold bg-slate-100 ${
                i === 0 || i === 6 ? 'text-rose-600' : 'text-slate-700'
              }`}
            >
              {day}
            </div>
          ))}

          {/* Previous Month trailing days */}
          {Array.from({ length: firstDayOfMonth }).map((_, i) => {
            const dayNum = prevMonthDays - firstDayOfMonth + i + 1;
            return (
              <div key={`prev-${i}`} className="min-h-[110px] p-2 bg-slate-50/50 text-slate-300">
                <span className="text-xs font-medium">{dayNum}</span>
              </div>
            );
          })}

          {/* Current Month days */}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const dayNum = i + 1;
            const curDateObj = new Date(year, month, dayNum);
            const dateStr = curDateObj.toISOString().slice(0, 10);
            const isToday =
              new Date().toDateString() === curDateObj.toDateString();

            const dayBookings = filteredBookings.filter((b) => {
              const bStart = b.startTime.slice(0, 10);
              return bStart === dateStr;
            });

            return (
              <div
                key={`current-${dayNum}`}
                className={`min-h-[110px] p-1.5 sm:p-2 bg-white flex flex-col justify-between hover:bg-slate-50/80 transition-colors ${
                  isToday ? 'bg-blue-50/30' : ''
                }`}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`text-xs font-semibold w-6 h-6 flex items-center justify-center rounded-full ${
                      isToday
                        ? 'bg-blue-600 text-white font-bold'
                        : 'text-slate-700'
                    }`}
                  >
                    {dayNum}
                  </span>
                  {dayBookings.length > 0 && (
                    <span className="text-[10px] text-slate-400 font-medium">
                      {dayBookings.length} รายการ
                    </span>
                  )}
                </div>

                {/* Events list */}
                <div className="space-y-1 mt-1 overflow-y-auto max-h-[85px]">
                  {dayBookings.map((b) => {
                    const col = ROOM_COLORS[b.roomId] || {
                      bg: 'bg-slate-100',
                      text: 'text-slate-800',
                      border: 'border-slate-300',
                      dot: 'bg-slate-600',
                    };

                    return (
                      <button
                        key={b.id}
                        onClick={() => setActiveBooking(b)}
                        className={`w-full text-left p-1.5 rounded-lg border text-[11px] font-medium leading-tight shadow-2xs transition-all hover:scale-[1.02] flex flex-col gap-0.5 ${col.bg} ${col.text} ${col.border}`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold truncate">{b.room?.name || b.customRoomName}</span>
                          <span className="text-[9px] opacity-75 font-mono">{b.startTime.slice(11, 16)}</span>
                        </div>
                        <span className="truncate text-[10px] opacity-90">{b.title}</span>
                        <span className="truncate text-[9px] text-slate-500">[{b.department}]</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Booking Detail Popup Modal */}
      {activeBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-blue-700 to-indigo-700 text-white">
              <div>
                <span className="text-[10px] font-mono tracking-wider opacity-80 uppercase block">
                  {activeBooking.bookingCode}
                </span>
                <h3 className="text-base font-bold">{activeBooking.title}</h3>
              </div>
              <button
                onClick={() => setActiveBooking(null)}
                className="text-white/80 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div>
                  <span className="text-slate-400 block text-[10px]">ห้องประชุม</span>
                  <span className="font-bold text-slate-900 text-sm">{activeBooking.room?.name || activeBooking.customRoomName}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">สถานะการอนุมัติ</span>
                  <span className="font-bold text-emerald-600 text-sm">{activeBooking.status}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">ผู้ขอใช้บริการ</span>
                  <span className="font-semibold text-slate-800">{activeBooking.requesterName}</span>
                  <p className="text-[10px] text-slate-500">{activeBooking.department}</p>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">วัน-เวลา</span>
                  <span className="font-semibold text-slate-800">{activeBooking.startTime.slice(0, 10)}</span>
                  <p className="text-[10px] text-slate-500">{activeBooking.startTime.slice(11, 16)} - {activeBooking.endTime.slice(11, 16)} น.</p>
                </div>
              </div>

              {activeBooking.description && (
                <div>
                  <span className="font-bold text-slate-700 block mb-0.5">วัตถุประสงค์:</span>
                  <p className="text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-200">{activeBooking.description}</p>
                </div>
              )}

              {/* 3-Level Approval Summary */}
              <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-200 space-y-1.5">
                <span className="font-bold text-blue-900 block text-[11px]">สถานะการตรวจสอบ 3 ระดับ:</span>
                <div className="grid grid-cols-3 gap-2 text-center text-[10px]">
                  <div className="p-1.5 bg-white rounded-lg border border-blue-100">
                    <p className="font-semibold text-slate-700">1. ตรวจห้อง</p>
                    <p className="text-slate-500">นายวัชรพงศ์ โสภา</p>
                    <span className="font-bold text-emerald-600">{activeBooking.stage1?.status}</span>
                  </div>
                  <div className="p-1.5 bg-white rounded-lg border border-blue-100">
                    <p className="font-semibold text-slate-700">2. รับรอง</p>
                    <p className="text-slate-500">นายเอกราช เขียวทอง</p>
                    <span className="font-bold text-blue-600">{activeBooking.stage2?.status}</span>
                  </div>
                  <div className="p-1.5 bg-white rounded-lg border border-blue-100">
                    <p className="font-semibold text-slate-700">3. อนุมัติ</p>
                    <p className="text-slate-500">นายชาตรี เริงชัยภูมิ</p>
                    <span className="font-bold text-indigo-600">{activeBooking.stage3?.status}</span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setPrintBooking(activeBooking);
                  }}
                  className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold shadow-sm transition"
                >
                  <Printer className="w-4 h-4" />
                  <span>พิมพ์แบบคำขอ A4</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveBooking(null)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-medium"
                >
                  ปิด
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* A4 Requisition Print Modal */}
      <RequisitionPrintModal
        booking={printBooking}
        isOpen={Boolean(printBooking)}
        onClose={() => setPrintBooking(null)}
      />
    </div>
  );
}
