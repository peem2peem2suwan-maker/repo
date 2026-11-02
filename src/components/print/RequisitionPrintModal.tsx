'use client';

import React from 'react';
import { Booking } from '@/types';
import { Printer, X, Download } from 'lucide-react';

interface RequisitionPrintModalProps {
  booking: Booking | null;
  isOpen: boolean;
  onClose: () => void;
}

export function RequisitionPrintModal({
  booking,
  isOpen,
  onClose,
}: RequisitionPrintModalProps) {
  if (!isOpen || !booking) return null;

  const handlePrint = () => {
    window.print();
  };

  const roomTitle = booking.room?.name || booking.customRoomName || 'ห้องประชุม';

  const formatThaiDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('th-TH', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  const formatTime = (timeStr: string) => {
    try {
      return timeStr.slice(11, 16) + ' น.';
    } catch {
      return timeStr;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm overflow-y-auto print:p-0 print:bg-white print:static">
      {/* Modal Container */}
      <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-slate-300 overflow-hidden print:border-none print:shadow-none print:max-w-none print:w-full">
        {/* Screen Action Bar (Hidden when printing) */}
        <div className="flex items-center justify-between px-6 py-3.5 bg-slate-800 text-white print:hidden">
          <div className="flex items-center gap-2">
            <Printer className="w-5 h-5 text-blue-400" />
            <span className="font-semibold text-sm">
              ตัวอย่างแบบคำขออนุญาตใช้ห้องประชุม ขนาด A4 (สำหรับตรวจรับระบบ)
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold shadow transition-all active:scale-95"
            >
              <Printer className="w-4 h-4" />
              <span>สั่งพิมพ์ / บันทึกเป็น PDF (A4)</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable A4 Content */}
        <div className="p-8 sm:p-12 print:p-6 text-slate-900 bg-white font-serif max-h-[85vh] overflow-y-auto print:max-h-none print:overflow-visible">
          {/* Header */}
          <div className="text-center pb-4 border-b-2 border-slate-900 mb-6">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
              แบบคำขออนุญาตใช้ห้องประชุมและอุปกรณ์โสตทัศนูปกรณ์
            </h1>
            <p className="text-sm font-medium text-slate-700 mt-1">
              งานศูนย์ดิจิทัลเพื่อการศึกษา ฝ่ายบริหารและยุทธศาสตร์
            </p>
            <div className="flex justify-between items-center text-xs text-slate-600 mt-3 pt-2 border-t border-slate-300">
              <span><strong>เลขที่คำขอ:</strong> {booking.bookingCode}</span>
              <span><strong>วันที่ยื่นคำขอ:</strong> {formatThaiDate(booking.createdAt)}</span>
              <span><strong>สถานะ:</strong> {booking.status}</span>
            </div>
          </div>

          {/* Part 1: ข้อมูลผู้ขอ */}
          <div className="space-y-3 mb-5 text-sm">
            <h2 className="font-bold text-base text-slate-900 border-b border-slate-200 pb-1">
              ส่วนที่ 1: ข้อมูลผู้ขอรับบริการและรายละเอียดกิจกรรม
            </h2>
            <div className="grid grid-cols-2 gap-x-6 gap-y-2">
              <div>
                <span className="font-semibold">ชื่อ-นามสกุล: </span>
                <span>{booking.requesterName}</span>
              </div>
              <div>
                <span className="font-semibold">ตำแหน่ง: </span>
                <span>{booking.position}</span>
              </div>
              <div>
                <span className="font-semibold">หน่วยงาน / แผนกวิชา: </span>
                <span>{booking.department}</span>
              </div>
              <div>
                <span className="font-semibold">เบอร์โทรศัพท์ติดต่อ: </span>
                <span>{booking.phone}</span>
              </div>
            </div>

            <div className="pt-2">
              <span className="font-semibold">หัวข้อการประชุม / กิจกรรม: </span>
              <span className="font-medium">{booking.title}</span>
            </div>
            {booking.description && (
              <div>
                <span className="font-semibold">วัตถุประสงค์: </span>
                <span>{booking.description}</span>
              </div>
            )}
            <div className="grid grid-cols-2 gap-x-6 gap-y-2 pt-1">
              <div>
                <span className="font-semibold">ห้องประชุมที่ขอใช้: </span>
                <span className="font-bold text-blue-900">{roomTitle}</span>
              </div>
              <div>
                <span className="font-semibold">จำนวนผู้เข้าร่วม: </span>
                <span>{booking.participantsCount} คน</span>
              </div>
              <div>
                <span className="font-semibold">วันที่ใช้งาน: </span>
                <span>{formatThaiDate(booking.startTime)}</span>
              </div>
              <div>
                <span className="font-semibold">เวลา: </span>
                <span>{formatTime(booking.startTime)} ถึง {formatTime(booking.endTime)}</span>
              </div>
            </div>
          </div>

          {/* Part 2: ครุภัณฑ์และอุปกรณ์ */}
          <div className="space-y-2 mb-5 text-sm">
            <h2 className="font-bold text-base text-slate-900 border-b border-slate-200 pb-1">
              ส่วนที่ 2: รายการครุภัณฑ์และสิ่งอำนวยความสะดวกที่ขอรับการสนับสนุน
            </h2>
            <ul className="list-disc list-inside space-y-1 pl-2 text-slate-800">
              {booking.selectedEquipments && booking.selectedEquipments.length > 0 ? (
                booking.selectedEquipments.map((eq, i) => <li key={i}>{eq}</li>)
              ) : (
                <li>ขอใช้อุปกรณ์พื้นฐานประจำห้อง</li>
              )}
            </ul>
            <div className="flex gap-8 pt-1 text-slate-800">
              <span><strong>โต๊ะเพิ่มเติม:</strong> {booking.extraTables || 0} ตัว</span>
              <span><strong>เก้าอี้เพิ่มเติม:</strong> {booking.extraChairs || 0} ตัว</span>
            </div>
            {booking.extraEquipmentNote && (
              <div>
                <span className="font-semibold">ความต้องการเพิ่มเติม: </span>
                <span>{booking.extraEquipmentNote}</span>
              </div>
            )}
          </div>

          {/* Part 3: คำรับรอง */}
          <div className="p-3 bg-slate-50 border border-slate-300 rounded text-xs text-slate-800 leading-relaxed mb-6">
            <strong>คำรับรองการดูแลทรัพย์สินราชการ:</strong> ข้าพเจ้ายินยอมและขอรับรองว่าจะดูแลรักษาทรัพย์สิน ครุภัณฑ์
            และสถานที่ของทางราชการให้อยู่ในสภาพเรียบร้อย และยินยอมปฏิบัติตามระเบียบการใช้ห้องประชุมอย่างเคร่งครัด
          </div>

          {/* Part 4: 4-Level Signatures (นายวัชรพงศ์ โสภา / นายเอกราช เขียวทอง / นายชาตรี เริงชัยภูมิ) */}
          <div className="grid grid-cols-2 gap-6 pt-2 border-t-2 border-slate-900 text-xs">
            {/* 1. ผู้ขอใช้บริการ */}
            <div className="text-center p-3 border border-slate-200 rounded">
              <p className="font-semibold text-slate-800 mb-8">ลงชื่อ......................................................ผู้ขอใช้บริการ</p>
              <p className="font-bold">({booking.requesterName})</p>
              <p className="text-slate-600">{booking.position}</p>
              <p className="text-slate-500 mt-1">วันที่ {formatThaiDate(booking.createdAt)}</p>
            </div>

            {/* 2. เจ้าหน้าที่ตรวจห้อง: นายวัชรพงศ์ โสภา */}
            <div className="text-center p-3 border border-slate-200 rounded">
              <div className="mb-1 text-left font-semibold">
                ความเห็นเจ้าหน้าที่ตรวจห้อง/โสตฯ:
                <span className={`ml-1 font-bold ${booking.stage1?.status === 'PASSED' ? 'text-emerald-700' : 'text-amber-700'}`}>
                  [{booking.stage1?.status === 'PASSED' ? '✓ ตรวจแล้วพร้อมใช้' : 'รอการตรวจสอบ'}]
                </span>
              </div>
              <p className="text-slate-600 text-left italic text-[11px] mb-4">
                {booking.stage1?.note || 'ตรวจความพร้อมห้องประชุมและระบบโสตฯ'}
              </p>
              <p className="font-semibold text-slate-800 mb-4">ลงชื่อ......................................................ผู้ตรวจห้อง</p>
              <p className="font-bold">(นายวัชรพงศ์ โสภา)</p>
              <p className="text-slate-600">เจ้าหน้าที่ตรวจห้อง / โสตทัศนูปกรณ์</p>
              <p className="text-slate-500 mt-1">
                {booking.stage1?.actionDate ? `วันที่ ${formatThaiDate(booking.stage1.actionDate)}` : 'วันที่......./......./.......'}
              </p>
            </div>

            {/* 3. ผู้รับรอง: นายเอกราช เขียวทอง */}
            <div className="text-center p-3 border border-slate-200 rounded">
              <div className="mb-1 text-left font-semibold">
                ความเห็นหัวหน้างานศูนย์ดิจิทัลฯ:
                <span className={`ml-1 font-bold ${booking.stage2?.status === 'PASSED' ? 'text-emerald-700' : 'text-amber-700'}`}>
                  [{booking.stage2?.status === 'PASSED' ? '✓ เห็นควรรับรอง' : 'รอการรับรอง'}]
                </span>
              </div>
              <p className="text-slate-600 text-left italic text-[11px] mb-4">
                {booking.stage2?.note || 'ตรวจสอบความเหมาะสมและรับรองคำขอ'}
              </p>
              <p className="font-semibold text-slate-800 mb-4">ลงชื่อ......................................................ผู้รับรอง</p>
              <p className="font-bold">(นายเอกราช เขียวทอง)</p>
              <p className="text-slate-600">หัวหน้างานศูนย์ดิจิทัลเพื่อการศึกษา</p>
              <p className="text-slate-500 mt-1">
                {booking.stage2?.actionDate ? `วันที่ ${formatThaiDate(booking.stage2.actionDate)}` : 'วันที่......./......./.......'}
              </p>
            </div>

            {/* 4. ผู้อนุมัติ: นายชาตรี เริงชัยภูมิ */}
            <div className="text-center p-3 border border-slate-200 rounded">
              <div className="mb-1 text-left font-semibold">
                คำสั่งการพิจารณาอนุมัติ:
                <span className={`ml-1 font-bold ${booking.stage3?.status === 'APPROVED' ? 'text-emerald-700' : 'text-amber-700'}`}>
                  [{booking.stage3?.status === 'APPROVED' ? '✓ อนุมัติแล้ว' : 'รอการอนุมัติ'}]
                </span>
              </div>
              <p className="text-slate-600 text-left italic text-[11px] mb-4">
                {booking.stage3?.note || 'พิจารณาอนุมัติให้ใช้สถานที่ตามคำขอ'}
              </p>
              <p className="font-semibold text-slate-800 mb-4">ลงชื่อ......................................................ผู้อนุมัติ</p>
              <p className="font-bold">(นายชาตรี เริงชัยภูมิ)</p>
              <p className="text-slate-600">รองผู้อำนวยการ / ผู้อนุมัติ</p>
              <p className="text-slate-500 mt-1">
                {booking.stage3?.actionDate ? `วันที่ ${formatThaiDate(booking.stage3.actionDate)}` : 'วันที่......./......./.......'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
