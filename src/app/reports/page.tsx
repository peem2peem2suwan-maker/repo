'use client';

import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  Download,
  Printer,
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  Building,
  Users,
} from 'lucide-react';
import { useToast } from '@/components/ui/Toast';

export default function ReportsPage() {
  const { showToast } = useToast();
  const [range, setRange] = useState('month');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reportData, setReportData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchReport = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('range', range);
      if (range === 'custom' && startDate && endDate) {
        params.append('startDate', startDate);
        params.append('endDate', endDate);
      }

      const res = await fetch(`/api/reports?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setReportData(data);
      }
    } catch (err) {
      console.error('Failed to fetch report', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [range]);

  const handleExportCSV = () => {
    window.location.href = `/api/reports/export?range=${range}`;
    showToast('success', 'ดาวน์โหลดไฟล์ CSV เรียบร้อยแล้ว');
  };

  const handlePrintPDF = () => {
    window.print();
  };

  const summary = reportData?.summary || {};

  return (
    <div className="space-y-6 print:p-0">
      {/* Header and Export Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            รายงานและสถิติการใช้งานห้องประชุม (Reports)
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            สรุปข้อมูลสถิติ ชั่วโมงการใช้งาน อัตราการยกเลิก และส่งออกรายงาน
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Range Selector */}
          <select
            value={range}
            onChange={(e) => setRange(e.target.value)}
            className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 shadow-xs focus:outline-none"
          >
            <option value="today">วันนี้ (Today)</option>
            <option value="week">สัปดาห์นี้ (This Week)</option>
            <option value="month">เดือนนี้ (This Month)</option>
            <option value="year">ปีนี้ (This Year)</option>
            <option value="custom">กำหนดเอง (Custom)</option>
          </select>

          {/* Export Buttons */}
          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold rounded-xl shadow-xs transition flex items-center gap-1.5"
          >
            <Download className="w-4 h-4 text-emerald-600" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={handlePrintPDF}
            className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl shadow-md shadow-blue-600/20 transition flex items-center gap-1.5"
          >
            <Printer className="w-4 h-4" />
            <span>พิมพ์รายงาน / PDF</span>
          </button>
        </div>
      </div>

      {/* Custom Date Pickers if range === custom */}
      {range === 'custom' && (
        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3 print:hidden">
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
          />
          <span className="text-xs text-slate-400">ถึง</span>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
          />
          <button
            onClick={fetchReport}
            className="px-3 py-1.5 bg-blue-600 text-white rounded-xl text-xs font-semibold"
          >
            ค้นหา
          </button>
        </div>
      )}

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
            จำนวนการจองทั้งหมด
          </span>
          <span className="text-2xl font-black text-slate-900 mt-1 block">
            {summary.totalBookings || 0} ครั้ง
          </span>
          <span className="text-[11px] text-emerald-600 font-medium block mt-1">
            อนุมัติแล้ว {summary.approvedCount || 0} ครั้ง
          </span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
            ชั่วโมงการใช้งานรวม
          </span>
          <span className="text-2xl font-black text-blue-600 mt-1 block">
            {summary.totalUsageHours || 0} ชม.
          </span>
          <span className="text-[11px] text-slate-400 font-medium block mt-1">
            เฉลี่ยการประชุมสำเร็จ
          </span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
            ห้องที่ถูกใช้มากที่สุด
          </span>
          <span className="text-base font-bold text-slate-900 mt-1 block truncate">
            {summary.mostUsedRoom || '-'}
          </span>
          <span className="text-[11px] text-slate-400 font-medium block mt-1 truncate">
            น้อยที่สุด: {summary.leastUsedRoom || '-'}
          </span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
            การยกเลิก / ปฏิเสธ
          </span>
          <span className="text-2xl font-black text-rose-600 mt-1 block">
            {(summary.cancellationsCount || 0) + (summary.rejectedCount || 0)} รายการ
          </span>
          <span className="text-[11px] text-slate-400 font-medium block mt-1">
            ยกเลิก {summary.cancellationsCount || 0} | ปฏิเสธ {summary.rejectedCount || 0}
          </span>
        </div>
      </div>

      {/* Breakdowns Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Room Breakdown Table */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
          <h3 className="font-bold text-slate-900 text-sm mb-4">
            สถิติการใช้งานแยกตามห้องประชุม
          </h3>
          <div className="divide-y divide-slate-100">
            {(reportData?.roomBreakdown || []).map((item: any) => (
              <div key={item.room.id} className="py-2.5 flex items-center justify-between text-xs">
                <div>
                  <span className="font-semibold text-slate-800">{item.room.name}</span>
                  <span className="text-slate-400 ml-1">({item.room.code})</span>
                </div>
                <div className="text-right">
                  <span className="font-bold text-slate-900">{item.count} ครั้ง</span>
                  <span className="text-slate-400 ml-2">({item.hours} ชม.)</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* User Breakdown Table */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
          <h3 className="font-bold text-slate-900 text-sm mb-4">
            สถิติการจองแยกตามผู้ใช้งาน
          </h3>
          <div className="divide-y divide-slate-100">
            {(reportData?.userBreakdown || []).length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">ไม่มีข้อมูลผู้ใช้งาน</p>
            ) : (
              (reportData?.userBreakdown || []).map((item: any, idx: number) => (
                <div key={idx} className="py-2.5 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-semibold text-slate-800">{item.user?.name || 'ไม่ระบุ'}</span>
                    <span className="text-slate-400 ml-1">({item.user?.department})</span>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-slate-900">{item.count} ครั้ง</span>
                    <span className="text-slate-400 ml-2">({item.hours} ชม.)</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Full Bookings History Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100">
          <h3 className="font-bold text-slate-900 text-sm">
            รายละเอียดรายการจองทั้งหมดในรอบรายงาน
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold">
              <tr>
                <th className="px-4 py-3">รหัสการจอง</th>
                <th className="px-4 py-3">หัวข้อประชุม</th>
                <th className="px-4 py-3">ห้องประชุม</th>
                <th className="px-4 py-3">ผู้จัด</th>
                <th className="px-4 py-3">วันเวลา</th>
                <th className="px-4 py-3">ระยะเวลา</th>
                <th className="px-4 py-3">สถานะ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {(reportData?.bookingsList || []).map((b: any) => (
                <tr key={b.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-mono text-slate-400 font-bold">{b.bookingCode}</td>
                  <td className="px-4 py-3 font-semibold text-slate-900">{b.title}</td>
                  <td className="px-4 py-3 text-slate-700">{b.roomName}</td>
                  <td className="px-4 py-3 text-slate-700">{b.organizer}</td>
                  <td className="px-4 py-3 text-slate-600">
                    {new Date(b.startTime).toLocaleString('th-TH', { dateStyle: 'short', timeStyle: 'short' })}
                  </td>
                  <td className="px-4 py-3 font-medium text-slate-800">{b.durationHours} ชม.</td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        b.status === 'APPROVED'
                          ? 'bg-emerald-100 text-emerald-800'
                          : b.status === 'PENDING'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {b.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
