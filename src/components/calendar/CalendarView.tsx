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
  Edit3,
  Trash2,
} from 'lucide-react';

interface CalendarEvent {
  id: string;
  bookingCode: string;
  title: string;
  start: string;
  end: string;
  status: string;
  room: {
    id: string;
    code: string;
    name: string;
    building: string;
    floor: number;
    capacity: number;
  };
  organizer: {
    id: string;
    name: string;
    department: string;
    email: string;
  };
  participantsCount: number;
  description?: string;
  isOwner: boolean;
}

interface CalendarViewProps {
  events: CalendarEvent[];
  onCancelBooking: (id: string) => void;
  onEditBooking?: (event: CalendarEvent) => void;
  currentUserRole?: string;
}

type ViewMode = 'month' | 'week' | 'day' | 'agenda';

export function CalendarView({
  events,
  onCancelBooking,
  onEditBooking,
  currentUserRole,
}: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>('month');
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);

  // Month navigation helpers
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const handlePrev = () => {
    if (viewMode === 'month') {
      setCurrentDate(new Date(year, month - 1, 1));
    } else if (viewMode === 'week') {
      const d = new Date(currentDate);
      d.setDate(d.getDate() - 7);
      setCurrentDate(d);
    } else {
      const d = new Date(currentDate);
      d.setDate(d.getDate() - 1);
      setCurrentDate(d);
    }
  };

  const handleNext = () => {
    if (viewMode === 'month') {
      setCurrentDate(new Date(year, month + 1, 1));
    } else if (viewMode === 'week') {
      const d = new Date(currentDate);
      d.setDate(d.getDate() + 7);
      setCurrentDate(d);
    } else {
      const d = new Date(currentDate);
      d.setDate(d.getDate() + 1);
      setCurrentDate(d);
    }
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  // Build days for month view
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const prevMonthDays = new Date(year, month, 0).getDate();

  const thaiMonths = [
    'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
    'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม',
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'PENDING':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'CANCELLED':
        return 'bg-slate-100 text-slate-500 border-slate-300 line-through';
      default:
        return 'bg-blue-100 text-blue-800 border-blue-300';
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden flex flex-col">
      {/* Calendar Header Controls */}
      <div className="p-4 sm:p-6 border-b border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-50/50">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-xl p-1 shadow-sm">
            <button
              onClick={handlePrev}
              className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600 transition"
              title="ก่อนหน้า"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleToday}
              className="px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-lg transition"
            >
              วันนี้
            </button>
            <button
              onClick={handleNext}
              className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600 transition"
              title="ถัดไป"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <h2 className="text-base sm:text-lg font-bold text-slate-900">
            {thaiMonths[month]} {year + 543}
          </h2>
        </div>

        {/* View Mode Switcher */}
        <div className="flex items-center bg-slate-200/70 p-1 rounded-xl text-xs font-semibold text-slate-600">
          {(['month', 'week', 'day', 'agenda'] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className={`px-3 py-1.5 rounded-lg transition-all capitalize ${
                viewMode === mode
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'hover:text-slate-900'
              }`}
            >
              {mode === 'month' ? 'รายเดือน' : mode === 'week' ? 'รายสัปดาห์' : mode === 'day' ? 'รายวัน' : 'กำหนดการ'}
            </button>
          ))}
        </div>
      </div>

      {/* Main View Area */}
      <div className="flex-1 overflow-x-auto">
        {viewMode === 'month' && (
          <div className="min-w-[700px]">
            {/* Days of week header */}
            <div className="grid grid-cols-7 border-b border-slate-100 bg-slate-50/80 text-center py-2.5 text-xs font-semibold text-slate-500">
              <span className="text-rose-500">อา.</span>
              <span>จ.</span>
              <span>อ.</span>
              <span>พ.</span>
              <span>พฤ.</span>
              <span>ศ.</span>
              <span className="text-blue-500">ส.</span>
            </div>

            {/* Grid Days */}
            <div className="grid grid-cols-7 auto-rows-fr divide-x divide-y divide-slate-100">
              {/* Previous month padding days */}
              {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                <div key={`prev-${i}`} className="min-h-[100px] p-2 bg-slate-50/30 text-slate-300 text-xs">
                  {prevMonthDays - firstDayOfMonth + i + 1}
                </div>
              ))}

              {/* Current month days */}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const dayNum = i + 1;
                const dateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
                const dayEvents = events.filter((e) => e.start.startsWith(dateKey));

                const isToday =
                  new Date().toDateString() === new Date(year, month, dayNum).toDateString();

                return (
                  <div
                    key={`day-${dayNum}`}
                    className={`min-h-[110px] p-1.5 sm:p-2 transition-colors hover:bg-blue-50/20 ${
                      isToday ? 'bg-blue-50/40' : ''
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span
                        className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-semibold ${
                          isToday
                            ? 'bg-blue-600 text-white shadow-sm'
                            : 'text-slate-700'
                        }`}
                      >
                        {dayNum}
                      </span>
                      {dayEvents.length > 0 && (
                        <span className="text-[10px] font-semibold text-slate-400">
                          {dayEvents.length} รายการ
                        </span>
                      )}
                    </div>

                    {/* Day Events List */}
                    <div className="space-y-1 overflow-y-auto max-h-[85px]">
                      {dayEvents.map((evt) => {
                        const timeStr = new Date(evt.start).toLocaleTimeString('th-TH', {
                          hour: '2-digit',
                          minute: '2-digit',
                        });
                        return (
                          <div
                            key={evt.id}
                            onClick={() => setSelectedEvent(evt)}
                            className={`p-1 sm:p-1.5 rounded-lg text-[11px] font-medium border cursor-pointer truncate transition-transform hover:scale-[1.02] shadow-xs ${getStatusColor(
                              evt.status
                            )}`}
                            title={`${evt.title} (${evt.room.name})`}
                          >
                            <span className="font-bold mr-1">{timeStr}</span>
                            <span>{evt.title}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Agenda View */}
        {viewMode === 'agenda' && (
          <div className="divide-y divide-slate-100 p-4 sm:p-6 space-y-4">
            {events.length === 0 ? (
              <div className="text-center py-12 text-slate-400 text-sm">
                ไม่มีกำหนดการจองห้องประชุม
              </div>
            ) : (
              events.map((evt) => (
                <div
                  key={evt.id}
                  onClick={() => setSelectedEvent(evt)}
                  className="p-4 rounded-2xl hover:bg-slate-50 transition border border-transparent hover:border-slate-200 cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs shrink-0">
                      {new Date(evt.start).getDate()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-slate-900 text-sm">{evt.title}</h4>
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-semibold border ${getStatusColor(evt.status)}`}>
                          {evt.status}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1 flex flex-wrap items-center gap-3">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          {evt.room.name} ({evt.room.code})
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          {new Date(evt.start).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })} - {new Date(evt.end).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        <span className="flex items-center gap-1">
                          <User className="w-3.5 h-3.5 text-slate-400" />
                          {evt.organizer.name}
                        </span>
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedEvent(evt);
                    }}
                    className="text-xs font-semibold text-blue-600 hover:text-blue-800 self-end sm:self-center"
                  >
                    ดูรายละเอียด
                  </button>
                </div>
              ))
            )}
          </div>
        )}

        {/* Day / Week Fallback message */}
        {(viewMode === 'week' || viewMode === 'day') && (
          <div className="p-8 text-center text-slate-500 text-sm">
            <p className="font-semibold text-slate-700 mb-1">
              {viewMode === 'week' ? 'ตารางการจองประจำสัปดาห์' : 'ตารางการจองประจำวัน'}
            </p>
            <p className="text-xs text-slate-400 mb-4">
              คลิกมุมมอง "กำหนดการ (Agenda)" หรือ "รายเดือน (Month)" เพื่อดูรายการการจองแบบเต็มรูป
            </p>
            <div className="max-w-xl mx-auto space-y-2 text-left">
              {events.slice(0, 5).map((evt) => (
                <div
                  key={evt.id}
                  onClick={() => setSelectedEvent(evt)}
                  className="p-3 bg-slate-50 hover:bg-slate-100 rounded-xl cursor-pointer text-xs flex justify-between items-center"
                >
                  <span className="font-medium text-slate-800">{evt.title} ({evt.room.name})</span>
                  <span className="text-slate-500">{new Date(evt.start).toLocaleString('th-TH', { dateStyle: 'short', timeStyle: 'short' })}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Event Detail Modal Popover */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${getStatusColor(selectedEvent.status)}`}>
                {selectedEvent.status === 'APPROVED' ? 'อนุมัติแล้ว' : selectedEvent.status === 'PENDING' ? 'รออนุมัติ' : selectedEvent.status}
              </span>
              <button
                onClick={() => setSelectedEvent(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-4 space-y-3">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  รหัสการจอง: {selectedEvent.bookingCode}
                </span>
                <h3 className="text-base font-bold text-slate-900 mt-0.5">
                  {selectedEvent.title}
                </h3>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl space-y-2 text-xs text-slate-600">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-blue-600 shrink-0" />
                  <span className="font-medium text-slate-900">{selectedEvent.room.name}</span>
                  <span className="text-slate-400">({selectedEvent.room.code} • {selectedEvent.room.building} ชั้น {selectedEvent.room.floor})</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>
                    {new Date(selectedEvent.start).toLocaleString('th-TH', { dateStyle: 'medium', timeStyle: 'short' })} - {new Date(selectedEvent.end).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>ผู้จัด: {selectedEvent.organizer.name} ({selectedEvent.organizer.department})</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>จำนวนผู้เข้าร่วม: {selectedEvent.participantsCount} คน</span>
                </div>
              </div>

              {selectedEvent.description && (
                <div>
                  <p className="text-[11px] font-semibold text-slate-400 mb-1">รายละเอียดเพิ่มเติม</p>
                  <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl">
                    {selectedEvent.description}
                  </p>
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
              {(selectedEvent.isOwner || currentUserRole === 'ADMIN' || currentUserRole === 'MANAGER') && (
                <button
                  onClick={() => {
                    if (confirm('คุณต้องการยกเลิกการจองนี้ใช่หรือไม่?')) {
                      onCancelBooking(selectedEvent.id);
                      setSelectedEvent(null);
                    }
                  }}
                  className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-600 font-semibold text-xs rounded-xl transition flex items-center gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  ยกเลิกการจอง
                </button>
              )}
              <button
                onClick={() => setSelectedEvent(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition"
              >
                ปิด
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
