'use client';

import React, { useState, useEffect } from 'react';
import {
  CalendarDays,
  Clock,
  CheckCircle2,
  Users,
  Megaphone,
  AlertCircle,
  Plus,
  ArrowRight,
  Printer,
  Sparkles,
} from 'lucide-react';
import { StatCard } from '@/components/dashboard/StatCard';
import { DashboardCharts } from '@/components/dashboard/Charts';
import { BookingModal } from '@/components/bookings/BookingModal';
import { RequisitionPrintModal } from '@/components/print/RequisitionPrintModal';
import { Room, Booking, Announcement } from '@/types';
import Link from 'next/link';

export default function DashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [allRooms, setAllRooms] = useState<Room[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [selectedBookingForPrint, setSelectedBookingForPrint] = useState<Booking | null>(null);

  const fetchDashboardData = async () => {
    try {
      const [statsRes, roomsRes, annRes] = await Promise.all([
        fetch('/api/dashboard/stats'),
        fetch('/api/rooms'),
        fetch('/api/announcements'),
      ]);

      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
      }

      if (roomsRes.ok) {
        const roomsData = await roomsRes.json();
        setAllRooms(roomsData.rooms || []);
      }

      if (annRes.ok) {
        const annData = await annRes.json();
        setAnnouncements(annData.announcements || []);
      }
    } catch (err) {
      console.error('Failed to load dashboard', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();

    const handleUpdate = () => fetchDashboardData();
    window.addEventListener('mock-db-updated', handleUpdate);
    return () => window.removeEventListener('mock-db-updated', handleUpdate);
  }, []);

  const cards = stats?.cards || {
    todayBookingsCount: 0,
    pendingApprovalsCount: 0,
    approvedBookingsCount: 0,
    totalAttendees: 0,
  };

  return (
    <div className="space-y-8">
      {/* Page Title & Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full w-fit mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>ระบบบริหารจัดการห้องประชุมและอุปกรณ์โสตฯ (ตรวจรับระบบ)</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
            ภาพรวมระบบและการจอง (Analytics & Overview)
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            รายงานสถิติแบบ Real-time, ประกาศงานศูนย์ดิจิทัลฯ และติดตามสถานะคำขอ
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/all-bookings"
            className="px-4 py-2.5 bg-white border border-slate-200 text-slate-700 font-semibold rounded-xl hover:bg-slate-50 text-sm shadow-sm transition-all"
          >
            จัดการการอนุมัติ 3 ระดับ
          </Link>
          <button
            onClick={() => setIsBookingModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-sm shadow-md shadow-blue-500/20 transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>ยื่นแบบคำขอจองห้อง</span>
          </button>
        </div>
      </div>

      {/* หมวดที่ 2 ข้อ 1: การ์ดสรุปยอดรวม 4 ใบ แบบ Real-time */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="การจองวันนี้"
          value={cards.todayBookingsCount}
          subtitle="รายการใช้งานประจำวันนี้"
          icon={CalendarDays}
          color="blue"
          trend="+12%"
          trendType="positive"
        />
        <StatCard
          title="รออนุมัติ (3 ระดับ)"
          value={cards.pendingApprovalsCount}
          subtitle="รอตรวจห้อง / รับรอง / อนุมัติ"
          icon={Clock}
          color="amber"
        />
        <StatCard
          title="อนุมัติแล้ว"
          value={cards.approvedBookingsCount}
          subtitle="คำขอที่ได้รับการอนุมัติสมบูรณ์"
          icon={CheckCircle2}
          color="emerald"
        />
        <StatCard
          title="จำนวนผู้เข้าใช้รวม"
          value={`${cards.totalAttendees} คน`}
          subtitle="ผู้เข้าร่วมประชุมสะสมทั้งหมด"
          icon={Users}
          color="blue"
        />
      </div>

      {/* หมวดที่ 2 ข้อ 4: ส่วนประกาศประชาสัมพันธ์สถานะห้องประชุมหรือข่าวสารจากงานศูนย์ดิจิทัลฯ */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white p-6 rounded-3xl shadow-lg border border-blue-800">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-blue-500/20 text-blue-300 rounded-xl backdrop-blur-sm">
            <Megaphone className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold tracking-tight">
              ประกาศประชาสัมพันธ์สถานะห้องประชุมและข่าวสาร (งานศูนย์ดิจิทัลเพื่อการศึกษา)
            </h2>
            <p className="text-xs text-blue-200">
              ข้อความแจ้งเตือน การบำรุงรักษาอุปกรณ์ และมาตรการความปลอดภัยของทางราชการ
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {announcements.map((item) => (
            <div
              key={item.id}
              className="p-4 bg-white/10 hover:bg-white/15 rounded-2xl backdrop-blur-md border border-white/10 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      item.priority === 'HIGH'
                        ? 'bg-rose-500/30 text-rose-200 border border-rose-400/40'
                        : 'bg-blue-500/30 text-blue-200 border border-blue-400/30'
                    }`}
                  >
                    {item.priority === 'HIGH' ? 'ด่วน / ปรับปรุง' : 'ข่าวสารทั่วไป'}
                  </span>
                  <span className="text-[11px] text-slate-300">{item.date}</span>
                </div>
                <h3 className="font-semibold text-sm text-white mb-1.5 leading-snug">{item.title}</h3>
                <p className="text-xs text-slate-200/90 leading-relaxed line-clamp-3">{item.content}</p>
              </div>
              <div className="mt-3 pt-2 border-t border-white/10 text-[11px] text-blue-200 flex items-center justify-between">
                <span>{item.author}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* หมวดที่ 2 ข้อ 2: กราฟจัดอันดับห้องประชุมสูงสุด และจัดอันดับแผนกวิชา */}
      <DashboardCharts
        roomRanking={stats?.charts?.roomRanking || []}
        departmentRanking={stats?.charts?.departmentRanking || []}
      />

      {/* รายการการจองล่าสุด พร้อมปุ่มพิมพ์แบบคำขอ A4 */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              รายการการจองและการอนุมัติล่าสุด (Recent Requests)
            </h2>
            <p className="text-xs text-slate-500">
              คลิกปุ่มพิมพ์เพื่อดูแบบคำขออนุญาตขนาด A4 ตามระเบียบราชการ
            </p>
          </div>
          <Link
            href="/all-bookings"
            className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
          >
            <span>ดูรายการทั้งหมด</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 font-semibold uppercase tracking-wider">
                <th className="py-3 px-3">รหัสคำขอ</th>
                <th className="py-3 px-3">ห้องประชุม</th>
                <th className="py-3 px-3">ผู้ขอ / แผนกวิชา</th>
                <th className="py-3 px-3">หัวข้อการประชุม</th>
                <th className="py-3 px-3">วันและเวลา</th>
                <th className="py-3 px-3">สถานะ 3 ขั้น</th>
                <th className="py-3 px-3 text-right">พิมพ์ A4</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {(stats?.upcomingBookings || []).map((b: Booking) => (
                <tr key={b.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-3 font-mono font-medium text-blue-600">{b.bookingCode}</td>
                  <td className="py-3 px-3 font-semibold text-slate-800">
                    {b.room?.name || b.customRoomName}
                  </td>
                  <td className="py-3 px-3">
                    <p className="font-medium text-slate-900">{b.requesterName}</p>
                    <p className="text-[11px] text-slate-500">{b.department}</p>
                  </td>
                  <td className="py-3 px-3 text-slate-700 font-medium">{b.title}</td>
                  <td className="py-3 px-3 text-slate-600 whitespace-nowrap">
                    {b.startTime.slice(0, 10)} ({b.startTime.slice(11, 16)} - {b.endTime.slice(11, 16)})
                  </td>
                  <td className="py-3 px-3">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                        b.status === 'APPROVED'
                          ? 'bg-emerald-100 text-emerald-800'
                          : b.status === 'REJECTED'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {b.status === 'APPROVED'
                        ? 'อนุมัติเรียบร้อย'
                        : b.status === 'ENDORSED'
                        ? 'ผ่านการรับรอง'
                        : b.status === 'CHECKED'
                        ? 'ตรวจห้องแล้ว'
                        : 'รอการตรวจสอบ'}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right">
                    <button
                      onClick={() => setSelectedBookingForPrint(b)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 text-slate-700 bg-slate-100 hover:bg-blue-50 hover:text-blue-700 rounded-lg font-medium transition-colors"
                      title="พิมพ์แบบคำขอ A4"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>พิมพ์</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Booking Modal */}
      <BookingModal
        room={null}
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        onSuccess={() => fetchDashboardData()}
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
