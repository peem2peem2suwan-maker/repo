'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  Calendar,
  Clock,
  Users,
  AlertTriangle,
  CheckCircle2,
  Building,
  Sparkles,
  Phone,
  Briefcase,
  Layers,
  FileText,
  ShieldCheck,
  CheckSquare,
  Square,
  Package,
} from 'lucide-react';
import { Room } from '@/types';
import Swal from 'sweetalert2';

interface BookingModalProps {
  room: Room | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newBooking?: any) => void;
  allRooms?: Room[];
}

const DEFAULT_EQUIPMENTS = [
  'เครื่องฉายโปรเจกเตอร์ / จอภาพ (Projector & Screen)',
  'สมาร์ททีวี 75 นิ้ว 4K (Smart TV)',
  'ระบบเครื่องเสียงและไมโครโฟนไร้สาย (Audio & Wireless Mic)',
  'ระบบวิดีโอคอนเฟอเรนซ์ (Zoom/Teams Rooms)',
  'กระดานไวท์บอร์ดอัจฉริยะ (Smart Whiteboard)',
  'คอมพิวเตอร์/โน้ตบุ๊กสำหรับนำเสนอ (Presentation Laptop)',
];

export function BookingModal({
  room: initialRoom,
  isOpen,
  onClose,
  onSuccess,
  allRooms = [],
}: BookingModalProps) {
  // Form fields according to Checklist
  const [selectedRoomId, setSelectedRoomId] = useState<string>(initialRoom?.id || '');
  const [customRoomName, setCustomRoomName] = useState<string>('');
  const [requesterName, setRequesterName] = useState<string>('นายนเรศ สุขสวัสดิ์');
  const [position, setPosition] = useState<string>('หัวหน้าแผนกวิชาช่างยนต์');
  const [department, setDepartment] = useState<string>('แผนกวิชาช่างยนต์');
  const [phone, setPhone] = useState<string>('089-876-5432');
  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [date, setDate] = useState<string>(() => new Date().toISOString().slice(0, 10));
  const [startTime, setStartTime] = useState<string>('09:00');
  const [endTime, setEndTime] = useState<string>('12:00');
  const [participantsCount, setParticipantsCount] = useState<number>(20);

  // Equipments & Additional items
  const [selectedEquipments, setSelectedEquipments] = useState<string[]>([
    'เครื่องฉายโปรเจกเตอร์ / จอภาพ (Projector & Screen)',
    'ระบบเครื่องเสียงและไมโครโฟนไร้สาย (Audio & Wireless Mic)',
  ]);
  const [extraTables, setExtraTables] = useState<number>(0);
  const [extraChairs, setExtraChairs] = useState<number>(0);
  const [extraEquipmentNote, setExtraEquipmentNote] = useState<string>('');

  // Civil service property declaration
  const [agreedGovProperty, setAgreedGovProperty] = useState<boolean>(false);

  // Conflict state
  const [isCheckingConflict, setIsCheckingConflict] = useState<boolean>(false);
  const [conflictData, setConflictData] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  useEffect(() => {
    if (initialRoom) {
      setSelectedRoomId(initialRoom.id);
    } else if (allRooms.length > 0 && !selectedRoomId) {
      setSelectedRoomId(allRooms[0].id);
    }
  }, [initialRoom, allRooms]);

  // Conflict Detection
  useEffect(() => {
    if (!isOpen || !selectedRoomId || !date || !startTime || !endTime) return;
    if (selectedRoomId === 'other') {
      setConflictData({ hasConflict: false });
      return;
    }

    const startDateTime = `${date}T${startTime}:00`;
    const endDateTime = `${date}T${endTime}:00`;

    if (new Date(startDateTime) >= new Date(endDateTime)) {
      setConflictData({
        hasConflict: true,
        reason: 'เวลาสิ้นสุดต้องมากกว่าเวลาเริ่มต้น',
      });
      return;
    }

    const timer = setTimeout(async () => {
      setIsCheckingConflict(true);
      try {
        const res = await fetch('/api/bookings/check-availability', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            roomId: selectedRoomId,
            startTime: startDateTime,
            endTime: endDateTime,
            participantsCount,
          }),
        });
        const data = await res.json();
        setConflictData(data);
      } catch (err) {
        console.error('Failed to check conflict', err);
      } finally {
        setIsCheckingConflict(false);
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [isOpen, selectedRoomId, date, startTime, endTime, participantsCount]);

  if (!isOpen) return null;

  const currentRoomObj = allRooms.find((r) => r.id === selectedRoomId);

  const toggleEquipment = (eq: string) => {
    if (selectedEquipments.includes(eq)) {
      setSelectedEquipments(selectedEquipments.filter((item) => item !== eq));
    } else {
      setSelectedEquipments([...selectedEquipments, eq]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!agreedGovProperty) {
      Swal.fire({
        icon: 'warning',
        title: 'กรุณายืนยันข้อตกลง',
        text: 'กรุณากดติ๊กถูกยืนยันการดูแลรักษาทรัพย์สินของทางราชการก่อนส่งคำขอ',
        confirmButtonText: 'รับทราบ',
        confirmButtonColor: '#2563eb',
      });
      return;
    }

    if (conflictData?.hasConflict) {
      Swal.fire({
        icon: 'error',
        title: 'ช่วงเวลาทับซ้อน (Conflict)',
        text: conflictData.reason || 'ห้องประชุมไม่ว่างในช่วงเวลาดังกล่าว กรุณาเปลี่ยนห้องหรือเวลา',
        confirmButtonText: 'ตกลง',
        confirmButtonColor: '#dc2626',
      });
      return;
    }

    if (selectedRoomId === 'other' && !customRoomName.trim()) {
      Swal.fire({
        icon: 'warning',
        title: 'กรุณาระบุห้องประชุม',
        text: 'กรุณาระบุชื่อห้องประชุมที่ต้องการขอใช้บริการ',
        confirmButtonText: 'ตกลง',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        roomId: selectedRoomId,
        customRoomName: selectedRoomId === 'other' ? customRoomName : '',
        requesterName,
        position,
        department,
        phone,
        title,
        description,
        startTime: `${date}T${startTime}:00`,
        endTime: `${date}T${endTime}:00`,
        participantsCount,
        selectedEquipments,
        extraTables,
        extraChairs,
        extraEquipmentNote,
        agreedGovProperty: true,
      };

      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error('Failed to create booking');
      const data = await res.json();

      Swal.fire({
        icon: 'success',
        title: 'ส่งแบบคำขอสำเร็จ!',
        html: `
          <div class="text-left text-sm space-y-1">
            <p><strong>รหัสคำขอ:</strong> <span class="text-blue-600 font-mono">${data.booking?.bookingCode}</span></p>
            <p><strong>ห้องประชุม:</strong> ${currentRoomObj?.name || customRoomName}</p>
            <p><strong>ผู้ขอ:</strong> ${requesterName} (${department})</p>
            <p><strong>สถานะปัจจุบัน:</strong> <span class="text-amber-600 font-semibold">รอการตรวจห้อง (นายวัชรพงศ์ โสภา)</span></p>
          </div>
        `,
        confirmButtonText: 'ตกลง / ดูรายการการจอง',
        confirmButtonColor: '#16a34a',
      });

      onSuccess(data.booking);
      onClose();
    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: 'error',
        title: 'เกิดข้อผิดพลาด',
        text: 'ไม่สามารถบันทึกคำขอได้ กรุณาลองใหม่อีกครั้ง',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-3xl my-8 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-800 text-white">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/10 rounded-xl backdrop-blur-sm">
              <FileText className="w-6 h-6 text-blue-200" />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight">แบบคำขออนุญาตใช้ห้องประชุมและอุปกรณ์</h2>
              <p className="text-xs text-blue-100">งานศูนย์ดิจิทัลเพื่อการศึกษา (แบบฟอร์มตรวจสอบตรวจรับระบบราชการ)</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {/* Section 1: ข้อมูลผู้ขอใช้บริการ */}
          <div>
            <div className="flex items-center gap-2 mb-3 pb-1 border-b border-slate-200 text-slate-800 font-semibold text-sm">
              <Briefcase className="w-4 h-4 text-blue-600" />
              <span>1. ข้อมูลผู้ขอใช้บริการ (ตามใบคำขอ)</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  ชื่อ-นามสกุล ผู้ขอ <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={requesterName}
                  onChange={(e) => setRequesterName(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="เช่น นายนเรศ สุขสวัสดิ์"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  ตำแหน่ง <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={position}
                  onChange={(e) => setPosition(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="เช่น หัวหน้าแผนกวิชา / ครู"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  หน่วยงาน / แผนกวิชา <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="เช่น แผนกวิชาช่างยนต์ / งานศูนย์ดิจิทัลฯ"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  เบอร์โทรศัพท์ติดต่อ <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="08X-XXX-XXXX"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: เลือกห้องประชุมและเวลา */}
          <div>
            <div className="flex items-center gap-2 mb-3 pb-1 border-b border-slate-200 text-slate-800 font-semibold text-sm">
              <Building className="w-4 h-4 text-blue-600" />
              <span>2. ห้องประชุมและช่วงเวลาที่ขอใช้</span>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  เลือกห้องประชุมหลัก 6 ห้อง หรือระบุอื่นๆ <span className="text-red-500">*</span>
                </label>
                <select
                  value={selectedRoomId}
                  onChange={(e) => setSelectedRoomId(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-medium"
                >
                  {allRooms.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name} - {r.building} (รองรับ {r.capacity} คน)
                    </option>
                  ))}
                  <option value="other">ห้องประชุมอื่นๆ (ระบุชื่อห้องเอง)</option>
                </select>
              </div>

              {selectedRoomId === 'other' && (
                <div>
                  <label className="block text-xs font-semibold text-blue-800 mb-1">
                    ระบุชื่อห้องประชุมที่ต้องการ <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={customRoomName}
                    onChange={(e) => setCustomRoomName(e.target.value)}
                    placeholder="เช่น ห้องประชุมแผนกวิชาคอมพิวเตอร์ หรือ ลานอเนกประสงค์"
                    className="w-full px-3 py-2 text-sm border border-blue-300 bg-blue-50/50 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              )}

              {/* Title & Description */}
              <div className="grid grid-cols-1 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    หัวข้อการประชุม / กิจกรรม <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="เช่น ประชุมเตรียมความพร้อมการจัดกิจกรรมแข่งขันทักษะวิชาชีพ"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    วัตถุประสงค์ / รายละเอียดเพิ่มเติม
                  </label>
                  <textarea
                    rows={2}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="ระบุวัตถุประสงค์หรือข้อมูลสำหรับการจัดเตรียมสถานที่..."
                  />
                </div>
              </div>

              {/* Date & Time Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    วันที่ขอใช้ <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="date"
                      required
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    เวลาเริ่มต้น <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="time"
                    required
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    เวลาสิ้นสุด <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="time"
                    required
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  จำนวนผู้เข้าร่วม (คน) <span className="text-red-500">*</span>
                </label>
                <div className="relative max-w-xs">
                  <Users className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="number"
                    min={1}
                    max={currentRoomObj ? currentRoomObj.capacity * 2 : 200}
                    value={participantsCount}
                    onChange={(e) => setParticipantsCount(Number(e.target.value))}
                    className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Conflict Detection Banner */}
              {isCheckingConflict ? (
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600 flex items-center gap-2">
                  <div className="w-3.5 h-3.5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                  <span>กำลังตรวจสอบความพร้อมและเวลาชนกัน...</span>
                </div>
              ) : conflictData?.hasConflict ? (
                <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 space-y-2">
                  <div className="flex items-center gap-2 font-semibold text-sm text-red-800">
                    <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                    <span>ไม่สามารถจองได้: {conflictData.reason}</span>
                  </div>
                  {conflictData.suggestedRooms?.length > 0 && (
                    <div className="pt-2 border-t border-red-200">
                      <span className="font-semibold">ห้องอื่นที่ว่างในเวลานี้: </span>
                      {conflictData.suggestedRooms.map((sr: any) => (
                        <button
                          type="button"
                          key={sr.id}
                          onClick={() => setSelectedRoomId(sr.id)}
                          className="inline-block ml-1 underline hover:text-red-950 font-medium"
                        >
                          {sr.name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>ห้องว่างพร้อมใช้งานในช่วงเวลาที่เลือก (ไม่มีการจองทับซ้อน)</span>
                </div>
              )}
            </div>
          </div>

          {/* Section 3: ครุภัณฑ์ 6 รายการ + โต๊ะเก้าอี้ */}
          <div>
            <div className="flex items-center gap-2 mb-3 pb-1 border-b border-slate-200 text-slate-800 font-semibold text-sm">
              <Package className="w-4 h-4 text-blue-600" />
              <span>3. ครุภัณฑ์และอุปกรณ์ที่ขอใช้ (ครบ 6 รายการหลัก + เพิ่มเติม)</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-4">
              {DEFAULT_EQUIPMENTS.map((eq) => {
                const checked = selectedEquipments.includes(eq);
                return (
                  <label
                    key={eq}
                    onClick={() => toggleEquipment(eq)}
                    className={`flex items-start gap-2.5 p-2.5 rounded-xl border text-xs cursor-pointer transition-all ${
                      checked
                        ? 'border-blue-500 bg-blue-50/60 text-blue-900 font-medium'
                        : 'border-slate-200 hover:border-slate-300 text-slate-700'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => {}}
                      className="mt-0.5 rounded text-blue-600 focus:ring-blue-500"
                    />
                    <span>{eq}</span>
                  </label>
                );
              })}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-3 bg-slate-50 border border-slate-200 rounded-xl">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  ขอโต๊ะเพิ่มเติม (จำนวนตัว)
                </label>
                <input
                  type="number"
                  min={0}
                  max={50}
                  value={extraTables}
                  onChange={(e) => setExtraTables(Number(e.target.value))}
                  className="w-full px-3 py-1.5 text-sm border border-slate-300 rounded-lg bg-white"
                  placeholder="0"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  ขอเก้าอี้เพิ่มเติม (จำนวนตัว)
                </label>
                <input
                  type="number"
                  min={0}
                  max={200}
                  value={extraChairs}
                  onChange={(e) => setExtraChairs(Number(e.target.value))}
                  className="w-full px-3 py-1.5 text-sm border border-slate-300 rounded-lg bg-white"
                  placeholder="0"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  อุปกรณ์โสตทัศนูปกรณ์หรือสิ่งอำนวยความสะดวกอื่นๆ (ระบุ)
                </label>
                <input
                  type="text"
                  value={extraEquipmentNote}
                  onChange={(e) => setExtraEquipmentNote(e.target.value)}
                  placeholder="เช่น ปลั๊กพ่วง 3 ตา, พอยน์เตอร์เลเซอร์, ขาตั้งไมค์"
                  className="w-full px-3 py-1.5 text-sm border border-slate-300 rounded-lg bg-white"
                />
              </div>
            </div>
          </div>

          {/* Section 4: ข้อตกลงการดูแลรักษาทรัพย์สินราชการ */}
          <div className="p-4 bg-amber-50/80 border border-amber-300 rounded-2xl">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                required
                checked={agreedGovProperty}
                onChange={(e) => setAgreedGovProperty(e.target.checked)}
                className="mt-1 w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-amber-400"
              />
              <div className="text-xs text-amber-900 leading-relaxed">
                <span className="font-bold block text-sm mb-0.5">
                  ข้อตกลงและคำรับรองการดูแลรักษาทรัพย์สินของทางราชการ <span className="text-red-600">*</span>
                </span>
                ข้าพเจ้ายินยอมและยืนยันที่จะดูแลรักษาทรัพย์สิน ครุภัณฑ์ และสถานที่ของทางราชการให้อยู่ในสภาพเรียบร้อย สะอาด
                พร้อมทั้งยินดีรับผิดชอบชดใช้ค่าเสียหายหากเกิดการชำรุด เสียหาย หรือสูญหายอันเนื่องมาจากการใช้งาน
              </div>
            </label>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              disabled={isSubmitting || conflictData?.hasConflict || !agreedGovProperty}
              className={`px-6 py-2.5 text-sm font-semibold text-white rounded-xl shadow-md transition-all flex items-center gap-2 ${
                isSubmitting || conflictData?.hasConflict || !agreedGovProperty
                  ? 'bg-slate-400 cursor-not-allowed opacity-60'
                  : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-blue-500/25 active:scale-[0.98]'
              }`}
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>กำลังส่งคำขอ...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>ส่งแบบคำขอใช้ห้องประชุม</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
