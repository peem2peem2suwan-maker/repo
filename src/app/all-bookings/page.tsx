'use client';

import React, { useState, useEffect } from 'react';
import { Booking, User } from '@/types';
import { useToast } from '@/components/ui/Toast';
import {
  CheckSquare,
  Check,
  X,
  MapPin,
  Clock,
  Users,
  AlertCircle,
  Printer,
  Download,
  Webhook,
  Send,
  UserCheck,
  Sparkles,
  ChevronRight,
  ShieldCheck,
  Building,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { RequisitionPrintModal } from '@/components/print/RequisitionPrintModal';
import Swal from 'sweetalert2';

export default function AllBookingsPage() {
  const { showToast } = useToast();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchDept, setSearchDept] = useState('');

  // Print modal
  const [selectedBookingForPrint, setSelectedBookingForPrint] = useState<Booking | null>(null);

  // Webhook settings modal
  const [isWebhookModalOpen, setIsWebhookModalOpen] = useState(false);
  const [webhookUrl, setWebhookUrl] = useState('');
  const [isTestingWebhook, setIsTestingWebhook] = useState(false);

  const fetchCurrentUser = async () => {
    try {
      const res = await fetch('/api/auth/me');
      if (res.ok) {
        const data = await res.json();
        setCurrentUser(data.user);
      }
    } catch {}
  };

  const fetchBookings = async () => {
    try {
      let url = '/api/bookings';
      const params = new URLSearchParams();
      if (statusFilter !== 'ALL') params.append('status', statusFilter);
      if (searchDept.trim()) params.append('department', searchDept.trim());
      if (params.toString()) url += `?${params.toString()}`;

      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setBookings(data.bookings || []);
      }
    } catch (err) {
      console.error('Error fetching bookings:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchWebhookUrl = async () => {
    try {
      const res = await fetch('/api/webhook');
      if (res.ok) {
        const data = await res.json();
        setWebhookUrl(data.webhookUrl || '');
      }
    } catch {}
  };

  useEffect(() => {
    fetchCurrentUser();
    fetchBookings();
    fetchWebhookUrl();

    const handleUpdate = () => {
      fetchBookings();
      fetchCurrentUser();
    };
    window.addEventListener('mock-db-updated', handleUpdate);
    window.addEventListener('mock-auth-changed', handleUpdate);
    return () => {
      window.removeEventListener('mock-db-updated', handleUpdate);
      window.removeEventListener('mock-auth-changed', handleUpdate);
    };
  }, [statusFilter, searchDept]);

  // Stage 1 Action: นายวัชรพงศ์ โสภา (ตรวจห้อง)
  const handleStage1Action = async (booking: Booking, status: 'PASSED' | 'FAILED') => {
    const actionText = status === 'PASSED' ? 'ผ่านการตรวจห้อง' : 'ไม่ผ่านการตรวจห้อง';
    const { value: note } = await Swal.fire({
      title: `${actionText}`,
      text: `บันทึกความเห็นของเจ้าหน้าที่ตรวจห้อง (นายวัชรพงศ์ โสภา):`,
      input: 'text',
      inputValue: status === 'PASSED' ? 'ตรวจความพร้อมห้องประชุมและระบบโสตฯ เรียบร้อย' : 'อุปกรณ์ไม่พร้อมใช้งาน',
      showCancelButton: true,
      confirmButtonText: 'ยืนยัน',
      cancelButtonText: 'ยกเลิก',
      confirmButtonColor: status === 'PASSED' ? '#16a34a' : '#dc2626',
    });

    if (note !== undefined) {
      try {
        const res = await fetch(`/api/bookings/${booking.id}/stage1`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status, note }),
        });
        if (res.ok) {
          Swal.fire({
            icon: status === 'PASSED' ? 'success' : 'error',
            title: 'บันทึกผลการตรวจห้องแล้ว',
            text: status === 'PASSED' ? 'ส่งคำขอต่อให้นายเอกราช เขียวทอง รับรองต่อไป' : 'ปฏิเสธคำขอเรียบร้อยแล้ว',
            timer: 2000,
            showConfirmButton: false,
          });
          fetchBookings();
        }
      } catch {
        showToast('error', 'เกิดข้อผิดพลาดในการบันทึก');
      }
    }
  };

  // Stage 2 Action: นายเอกราช เขียวทอง (รับรอง)
  const handleStage2Action = async (booking: Booking, status: 'PASSED' | 'FAILED') => {
    const actionText = status === 'PASSED' ? 'รับรองคำขอ' : 'ไม่รับรองคำขอ';
    const { value: note } = await Swal.fire({
      title: `${actionText}`,
      text: `บันทึกความเห็นของหัวหน้างานศูนย์ดิจิทัลฯ (นายเอกราช เขียวทอง):`,
      input: 'text',
      inputValue: status === 'PASSED' ? 'ตรวจสอบแล้วเห็นควรรับรองคำขอ' : 'ไม่เห็นควรรับรอง',
      showCancelButton: true,
      confirmButtonText: 'ยืนยัน',
      cancelButtonText: 'ยกเลิก',
      confirmButtonColor: status === 'PASSED' ? '#2563eb' : '#dc2626',
    });

    if (note !== undefined) {
      try {
        const res = await fetch(`/api/bookings/${booking.id}/stage2`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status, note }),
        });
        if (res.ok) {
          Swal.fire({
            icon: status === 'PASSED' ? 'success' : 'error',
            title: 'บันทึกการรับรองแล้ว',
            text: status === 'PASSED' ? 'ส่งคำขอต่อให้นายชาตรี เริงชัยภูมิ พิจารณาอนุมัติ' : 'ปฏิเสธคำขอเรียบร้อยแล้ว',
            timer: 2000,
            showConfirmButton: false,
          });
          fetchBookings();
        }
      } catch {
        showToast('error', 'เกิดข้อผิดพลาดในการบันทึก');
      }
    }
  };

  // Stage 3 Action: นายชาตรี เริงชัยภูมิ (อนุมัติ)
  const handleStage3Action = async (booking: Booking, status: 'APPROVED' | 'REJECTED') => {
    const actionText = status === 'APPROVED' ? 'อนุมัติการใช้งาน' : 'ไม่อนุมัติคำขอ';
    const { value: note } = await Swal.fire({
      title: `${actionText}`,
      text: `คำสั่งการพิจารณาอนุมัติของรองผู้อำนวยการ (นายชาตรี เริงชัยภูมิ):`,
      input: 'text',
      inputValue: status === 'APPROVED' ? 'อนุมัติให้ใช้ห้องประชุมและอุปกรณ์ตามที่ขอ' : 'ไม่อนุมัติ',
      showCancelButton: true,
      confirmButtonText: 'ยืนยัน',
      cancelButtonText: 'ยกเลิก',
      confirmButtonColor: status === 'APPROVED' ? '#16a34a' : '#dc2626',
    });

    if (note !== undefined) {
      try {
        const res = await fetch(`/api/bookings/${booking.id}/stage3`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status, note }),
        });
        if (res.ok) {
          Swal.fire({
            icon: status === 'APPROVED' ? 'success' : 'error',
            title: status === 'APPROVED' ? 'อนุมัติคำขอเรียบร้อยแล้ว!' : 'ไม่อนุมัติคำขอ',
            text: status === 'APPROVED' ? 'ส่งการแจ้งเตือนไปยังผู้ขอและยิง Webhook เรียบร้อยแล้ว' : 'ส่งการแจ้งเตือนปฏิเสธแล้ว',
            timer: 2500,
            showConfirmButton: false,
          });
          fetchBookings();
        }
      } catch {
        showToast('error', 'เกิดข้อผิดพลาดในการบันทึก');
      }
    }
  };

  // Export CSV / Excel
  const handleExportCSV = () => {
    window.location.href = '/api/reports/export';
    Swal.fire({
      icon: 'success',
      title: 'ดาวน์โหลดไฟล์ตารางข้อมูลสำเร็จ',
      text: 'ระบบกำลังดาวน์โหลดรายงานข้อมูลการจองในรูปแบบ CSV (รองรับภาษาไทยสำหรับ Excel)',
      timer: 2000,
      showConfirmButton: false,
    });
  };

  // Save & Test Webhook
  const handleSaveWebhook = async (test = false) => {
    setIsTestingWebhook(true);
    try {
      const res = await fetch('/api/webhook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ webhookUrl, test }),
      });
      if (res.ok) {
        Swal.fire({
          icon: 'success',
          title: test ? 'ทดสอบส่งข้อความเข้า Webhook แล้ว' : 'บันทึก Webhook สำเร็จ',
          text: test ? 'ยิงสัญญาณแจ้งเตือนไปยัง Webhook URL เรียบร้อย' : 'บันทึกการตั้งค่าแล้ว',
          confirmButtonText: 'ตกลง',
        });
        if (!test) setIsWebhookModalOpen(false);
      }
    } catch {
      showToast('error', 'ไม่สามารถเชื่อมต่อ Webhook ได้');
    } finally {
      setIsTestingWebhook(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full w-fit mb-1.5">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>ระบบหลังบ้าน การอนุมัติ 3 ระดับ และรายงาน (หมวดที่ 3)</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            จัดการคำขอและอนุมัติ 3 ระดับ (All Bookings & Approvals)
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            ตรวจห้อง (นายวัชรพงศ์ โสภา) → รับรอง (นายเอกราช เขียวทอง) → อนุมัติ (นายชาตรี เริงชัยภูมิ)
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => setIsWebhookModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold rounded-xl text-xs border border-indigo-200 transition-colors"
            title="ตั้งค่า Webhook แจ้งเตือนเรียลไทม์"
          >
            <Webhook className="w-4 h-4" />
            <span>ตั้งค่า Webhook</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl text-xs shadow-sm transition-all active:scale-95"
            title="ดาวน์โหลดตารางข้อมูลเป็นไฟล์ Excel / CSV"
          >
            <Download className="w-4 h-4" />
            <span>Export Excel / CSV</span>
          </button>
        </div>
      </div>

      {/* Role Notice Banner */}
      <div className="p-4 bg-slate-900 text-white rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-600/30 flex items-center justify-center text-blue-400 font-bold shrink-0">
            <UserCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">บทบาทปัจจุบันของคุณ:</span>
              <span className="text-sm font-bold text-white">{currentUser?.name}</span>
              <span className="text-xs px-2 py-0.5 bg-blue-500/20 text-blue-300 rounded-md border border-blue-400/30">
                {currentUser?.position}
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              สามารถสลับบทบาทเป็นผู้มีอำนาจตรวจรับระบบแต่ละท่านได้ที่เมนู <strong>"สลับบทบาทตรวจรับระบบ"</strong> ที่แถบ Header ด้านบน
            </p>
          </div>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 bg-white border border-slate-200 rounded-2xl shadow-xs">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs font-semibold text-slate-500 whitespace-nowrap">กรองสถานะ:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs font-medium px-3 py-1.5 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none"
          >
            <option value="ALL">ทุกสถานะการอนุมัติ</option>
            <option value="PENDING">รอตรวจห้อง (ระดับ 1)</option>
            <option value="CHECKED">ตรวจห้องแล้ว / รอรับรอง (ระดับ 2)</option>
            <option value="ENDORSED">รับรองแล้ว / รออนุมัติ (ระดับ 3)</option>
            <option value="APPROVED">อนุมัติเรียบร้อยแล้ว</option>
            <option value="REJECTED">ถูกปฏิเสธ</option>
          </select>
        </div>

        <div className="w-full sm:w-64">
          <input
            type="text"
            placeholder="ค้นหาตามแผนกวิชา เช่น ช่างยนต์..."
            value={searchDept}
            onChange={(e) => setSearchDept(e.target.value)}
            className="w-full text-xs px-3 py-1.5 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none"
          />
        </div>
      </div>

      {/* Bookings Table with 3-Level Approval Actions */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                <th className="py-3.5 px-4">รหัส / ผู้ขอ</th>
                <th className="py-3.5 px-4">ห้องประชุม / วัน-เวลา</th>
                <th className="py-3.5 px-4">หัวข้อและครุภัณฑ์</th>
                <th className="py-3.5 px-4 text-center">ผังการอนุมัติ 3 ระดับ (Workflow)</th>
                <th className="py-3.5 px-4 text-center">จัดการคำขอ</th>
                <th className="py-3.5 px-4 text-right">พิมพ์ A4</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {bookings.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    ไม่พบรายการคำขอที่ตรงกับเงื่อนไข
                  </td>
                </tr>
              ) : (
                bookings.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-50/60 transition-colors">
                    {/* รหัส & ผู้ขอ */}
                    <td className="py-4 px-4 align-top">
                      <span className="font-mono font-bold text-blue-600 block">{b.bookingCode}</span>
                      <p className="font-semibold text-slate-800 mt-1">{b.requesterName}</p>
                      <p className="text-[11px] text-slate-500">{b.position}</p>
                      <span className="inline-block mt-1 px-2 py-0.5 rounded bg-slate-100 text-[10px] text-slate-600 font-medium">
                        {b.department}
                      </span>
                    </td>

                    {/* ห้องประชุม & เวลา */}
                    <td className="py-4 px-4 align-top">
                      <p className="font-bold text-slate-900">{b.room?.name || b.customRoomName}</p>
                      <div className="flex items-center gap-1.5 text-slate-500 mt-1 text-[11px]">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>{b.startTime.slice(0, 10)}</span>
                      </div>
                      <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                        {b.startTime.slice(11, 16)} - {b.endTime.slice(11, 16)} น.
                      </p>
                      <p className="text-[11px] text-slate-500 mt-1">ผู้เข้าร่วม {b.participantsCount} คน</p>
                    </td>

                    {/* หัวข้อ & ครุภัณฑ์ */}
                    <td className="py-4 px-4 align-top max-w-xs">
                      <p className="font-semibold text-slate-800 line-clamp-2">{b.title}</p>
                      <div className="mt-1 text-[11px] text-slate-500">
                        <span className="font-medium text-slate-700">ครุภัณฑ์: </span>
                        <span>{(b.selectedEquipments || []).length} รายการ</span>
                        {(b.extraTables || 0) > 0 && <span className="ml-1">(โต๊ะ {b.extraTables})</span>}
                        {(b.extraChairs || 0) > 0 && <span className="ml-1">(เก้าอี้ {b.extraChairs})</span>}
                      </div>
                    </td>

                    {/* 3-Level Approval Stepper */}
                    <td className="py-4 px-4 align-top min-w-[280px]">
                      <div className="space-y-2 p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                        {/* Level 1: นายวัชรพงศ์ โสภา */}
                        <div className="flex items-center justify-between text-[11px]">
                          <div>
                            <span className="font-semibold text-slate-700">1. ตรวจห้อง: </span>
                            <span className="text-slate-600">นายวัชรพงศ์ โสภา</span>
                          </div>
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                              b.stage1?.status === 'PASSED'
                                ? 'bg-emerald-100 text-emerald-800'
                                : b.stage1?.status === 'FAILED'
                                ? 'bg-rose-100 text-rose-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {b.stage1?.status === 'PASSED' ? '✓ ผ่าน' : b.stage1?.status === 'FAILED' ? '✕ ไม่ผ่าน' : 'รอตรวจ'}
                          </span>
                        </div>

                        {/* Level 2: นายเอกราช เขียวทอง */}
                        <div className="flex items-center justify-between text-[11px]">
                          <div>
                            <span className="font-semibold text-slate-700">2. รับรอง: </span>
                            <span className="text-slate-600">นายเอกราช เขียวทอง</span>
                          </div>
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                              b.stage2?.status === 'PASSED'
                                ? 'bg-emerald-100 text-emerald-800'
                                : b.stage2?.status === 'FAILED'
                                ? 'bg-rose-100 text-rose-800'
                                : 'bg-slate-200 text-slate-600'
                            }`}
                          >
                            {b.stage2?.status === 'PASSED' ? '✓ รับรองแล้ว' : b.stage2?.status === 'FAILED' ? '✕ ไม่รับรอง' : 'รอรับรอง'}
                          </span>
                        </div>

                        {/* Level 3: นายชาตรี เริงชัยภูมิ */}
                        <div className="flex items-center justify-between text-[11px]">
                          <div>
                            <span className="font-semibold text-slate-700">3. อนุมัติ: </span>
                            <span className="text-slate-600">นายชาตรี เริงชัยภูมิ</span>
                          </div>
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                              b.stage3?.status === 'APPROVED'
                                ? 'bg-emerald-100 text-emerald-800'
                                : b.stage3?.status === 'REJECTED'
                                ? 'bg-rose-100 text-rose-800'
                                : 'bg-slate-200 text-slate-600'
                            }`}
                          >
                            {b.stage3?.status === 'APPROVED' ? '✓ อนุมัติแล้ว' : b.stage3?.status === 'REJECTED' ? '✕ ไม่อนุมัติ' : 'รออนุมัติ'}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Action Buttons for 3-Level Officials */}
                    <td className="py-4 px-4 align-middle text-center">
                      <div className="flex flex-col gap-1.5 items-center justify-center">
                        {/* If Stage 1 Pending */}
                        {b.stage1?.status === 'PENDING' && (
                          <div className="space-y-1 w-full">
                            <span className="text-[10px] text-amber-700 font-semibold block">
                              รอ นายวัชรพงศ์ ตรวจห้อง:
                            </span>
                            <div className="flex gap-1 justify-center">
                              <button
                                onClick={() => handleStage1Action(b, 'PASSED')}
                                className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[10px] font-semibold"
                              >
                                ตรวจผ่าน
                              </button>
                              <button
                                onClick={() => handleStage1Action(b, 'FAILED')}
                                className="px-2 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-[10px] font-semibold"
                              >
                                ไม่ผ่าน
                              </button>
                            </div>
                          </div>
                        )}

                        {/* If Stage 2 Pending */}
                        {b.stage1?.status === 'PASSED' && b.stage2?.status === 'PENDING' && (
                          <div className="space-y-1 w-full">
                            <span className="text-[10px] text-blue-700 font-semibold block">
                              รอ นายเอกราช รับรอง:
                            </span>
                            <div className="flex gap-1 justify-center">
                              <button
                                onClick={() => handleStage2Action(b, 'PASSED')}
                                className="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-[10px] font-semibold"
                              >
                                รับรองคำขอ
                              </button>
                              <button
                                onClick={() => handleStage2Action(b, 'FAILED')}
                                className="px-2 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-[10px] font-semibold"
                              >
                                ไม่รับรอง
                              </button>
                            </div>
                          </div>
                        )}

                        {/* If Stage 3 Pending */}
                        {b.stage2?.status === 'PASSED' && b.stage3?.status === 'PENDING' && (
                          <div className="space-y-1 w-full">
                            <span className="text-[10px] text-purple-700 font-semibold block">
                              รอ นายชาตรี อนุมัติ:
                            </span>
                            <div className="flex gap-1 justify-center">
                              <button
                                onClick={() => handleStage3Action(b, 'APPROVED')}
                                className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[10px] font-semibold shadow-xs"
                              >
                                อนุมัติ
                              </button>
                              <button
                                onClick={() => handleStage3Action(b, 'REJECTED')}
                                className="px-2 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-[10px] font-semibold"
                              >
                                ไม่อนุมัติ
                              </button>
                            </div>
                          </div>
                        )}

                        {/* If Completed */}
                        {b.status === 'APPROVED' && (
                          <span className="inline-flex items-center gap-1 text-emerald-700 font-bold text-xs">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                            <span>อนุมัติเรียบร้อย</span>
                          </span>
                        )}

                        {b.status === 'REJECTED' && (
                          <span className="inline-flex items-center gap-1 text-rose-700 font-bold text-xs">
                            <XCircle className="w-4 h-4 text-rose-600" />
                            <span>ถูกปฏิเสธ</span>
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Print A4 Button */}
                    <td className="py-4 px-4 align-middle text-right">
                      <button
                        onClick={() => setSelectedBookingForPrint(b)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-blue-600 hover:text-white text-slate-700 rounded-xl font-semibold transition-all active:scale-95"
                        title="เปิดแบบคำขออนุญาตขนาด A4 ตามเอกสารราชการ"
                      >
                        <Printer className="w-4 h-4" />
                        <span>พิมพ์ A4</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Webhook Configuration Modal */}
      {isWebhookModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white">
              <div className="flex items-center gap-2">
                <Webhook className="w-5 h-5 text-indigo-400" />
                <h3 className="font-bold text-sm">ตั้งค่าระบบแจ้งเตือน Webhook (เรียลไทม์)</h3>
              </div>
              <button
                onClick={() => setIsWebhookModalOpen(false)}
                className="text-white/80 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Webhook URL (เช่น Discord Webhook / LINE Notify Relay)
                </label>
                <input
                  type="url"
                  value={webhookUrl}
                  onChange={(e) => setWebhookUrl(e.target.value)}
                  placeholder="https://discord.com/api/webhooks/... หรือ https://webhook.site/..."
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 font-mono"
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  ระบบจะยิงแจ้งเตือนทันทีเมื่อมีผู้ยื่นคำขอใหม่ หรือเมื่อนายชาตรี เริงชัยภูมิ กดอนุมัติ
                </p>
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  disabled={isTestingWebhook || !webhookUrl}
                  onClick={() => handleSaveWebhook(true)}
                  className="flex items-center gap-1.5 px-3 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl text-xs font-semibold disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isTestingWebhook ? 'กำลังส่งทดสอบ...' : 'ทดสอบส่งข้อความเข้า Webhook'}</span>
                </button>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setIsWebhookModalOpen(false)}
                    className="px-4 py-2 text-xs text-slate-600 hover:bg-slate-100 rounded-xl font-medium"
                  >
                    ปิด
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSaveWebhook(false)}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-sm"
                  >
                    บันทึก URL
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* A4 Requisition Print Modal */}
      <RequisitionPrintModal
        booking={selectedBookingForPrint}
        isOpen={Boolean(selectedBookingForPrint)}
        onClose={() => setSelectedBookingForPrint(null)}
      />
    </div>
  );
}
