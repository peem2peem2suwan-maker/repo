'use client';

import React, { useState, useEffect } from 'react';
import {
  Building2,
  CheckCircle2,
  Clock,
  CalendarDays,
  CalendarCheck2,
  TrendingUp,
  AlertCircle,
  Users,
  ArrowRight,
  Plus,
} from 'lucide-react';
import { StatCard } from '@/components/dashboard/StatCard';
import { DashboardCharts } from '@/components/dashboard/Charts';
import { BookingModal } from '@/components/bookings/BookingModal';
import { Room } from '@/types';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState<any>(null);
  const [allRooms, setAllRooms] = useState<Room[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [selectedRoomForBooking, setSelectedRoomForBooking] = useState<Room | null>(null);

  const fetchDashboardData = async () => {
    try {
      const [statsRes, roomsRes] = await Promise.all([
        fetch('/api/dashboard/stats'),
        fetch('/api/rooms'),
      ]);

      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
      }

      if (roomsRes.ok) {
        const roomsData = await roomsRes.json();
        setAllRooms(roomsData.rooms || []);
      }
    } catch (err) {
      console.error('Failed to load dashboard', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleOpenQuickBooking = () => {
    if (allRooms.length > 0) {
      // Pick first available room
      const freeRoom = allRooms.find((r) => r.status === 'AVAILABLE') || allRooms[0];
      setSelectedRoomForBooking(freeRoom);
      setIsBookingModalOpen(true);
    } else {
      router.push('/rooms');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-slate-500 font-medium">กำลังโหลดข้อมูล Dashboard...</p>
        </div>
      </div>
    );
  }

  const cards = stats?.cards || {};

  return (
    <div className="space-y-6">
      {/* Top Banner with Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 to-slate-800 text-white p-6 sm:p-8 rounded-3xl shadow-xl shadow-slate-900/10">
        <div>
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-300 border border-blue-400/30">
            ภาพรวมองค์กรแบบ Real-time
          </span>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight mt-2">
            แดชบอร์ดระบบจองห้องประชุม
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-xl">
            ตรวจสอบความพร้อมของห้องประชุม ติดตามการใช้งาน และอนุมัติคำขอจองแบบทันท่วงที
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            onClick={handleOpenQuickBooking}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white text-xs sm:text-sm font-semibold rounded-xl shadow-lg shadow-blue-600/30 transition flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>จองห้องประชุมด่วน</span>
          </button>
          <Link
            href="/calendar"
            className="px-4 py-2.5 bg-white/10 hover:bg-white/15 text-white text-xs sm:text-sm font-semibold rounded-xl transition border border-white/10"
          >
            เปิดปฏิทิน
          </Link>
        </div>
      </div>

      {/* Row 1: Key Performance Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
        <StatCard
          title="ห้องทั้งหมด"
          value={cards.totalRooms || 0}
          subtitle={`กำลังปรับปรุง ${cards.maintenanceCount || 0} ห้อง`}
          icon={Building2}
          color="slate"
        />
        <StatCard
          title="ห้องที่ว่างขณะนี้"
          value={cards.availableCount || 0}
          subtitle={`พร้อมใช้งานทันที`}
          icon={CheckCircle2}
          color="emerald"
          trend="พร้อมจอง"
          trendType="positive"
        />
        <StatCard
          title="ห้องที่กำลังใช้งาน"
          value={cards.occupiedCount || 0}
          subtitle={`จองไว้ล่วงหน้าวันนี้ ${cards.reservedCount || 0} ห้อง`}
          icon={Clock}
          color="rose"
        />
        <StatCard
          title="การจองวันนี้"
          value={cards.todayBookingsCount || 0}
          subtitle={`สัปดาห์นี้ ${cards.weekBookingsCount || 0} | เดือนนี้ ${cards.monthBookingsCount || 0}`}
          icon={CalendarCheck2}
          color="blue"
        />
      </div>

      {/* Secondary Highlights Row: Pending & Most Used */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-amber-50/80 border border-amber-200/80 rounded-2xl p-4 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-amber-800">คำขอรอการอนุมัติ</p>
            <p className="text-xl font-extrabold text-amber-900 mt-0.5">
              {cards.pendingApprovalsCount || 0} รายการ
            </p>
          </div>
          <Link
            href="/all-bookings"
            className="text-xs font-semibold text-amber-700 hover:text-amber-900 bg-white px-3 py-1.5 rounded-lg border border-amber-200 shadow-xs"
          >
            จัดการอนุมัติ
          </Link>
        </div>

        <div className="bg-blue-50/80 border border-blue-200/80 rounded-2xl p-4 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-blue-800">ห้องที่ใช้งานมากที่สุด</p>
            <p className="text-sm font-bold text-blue-900 mt-0.5 truncate max-w-[200px]">
              {cards.mostUsedRoomName}
            </p>
          </div>
          <Link
            href="/reports"
            className="text-xs font-semibold text-blue-700 hover:text-blue-900 bg-white px-3 py-1.5 rounded-lg border border-blue-200 shadow-xs"
          >
            ดูรายงาน
          </Link>
        </div>

        <div className="bg-emerald-50/80 border border-emerald-200/80 rounded-2xl p-4 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-emerald-800">อัตราการใช้งานห้อง (Utilization)</p>
            <p className="text-xl font-extrabold text-emerald-900 mt-0.5">
              {cards.utilizationRate || 0}%
            </p>
          </div>
          <span className="text-[11px] font-medium text-emerald-700 bg-white px-2.5 py-1 rounded-lg border border-emerald-200">
            ประสิทธิภาพสูง
          </span>
        </div>
      </div>

      {/* Row 2: Charts & Visualizations */}
      <DashboardCharts
        dailyStats={stats?.charts?.dailyStats || []}
        roomUsage={stats?.charts?.roomUsage || []}
      />

      {/* Row 3: Upcoming Meetings & Recent Bookings */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Meetings */}
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                การประชุมที่กำลังจะเริ่มถัดไป (Upcoming)
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">การประชุมที่ได้รับการอนุมัติ</p>
            </div>
            <Link
              href="/calendar"
              className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
            >
              ดูทั้งหมด <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="divide-y divide-slate-100 flex-1">
            {(!stats?.upcomingMeetings || stats.upcomingMeetings.length === 0) ? (
              <div className="p-8 text-center text-slate-400 text-xs">
                ไม่มีการประชุมถัดไปในวันนี้
              </div>
            ) : (
              stats.upcomingMeetings.map((b: any) => (
                <div key={b.id} className="py-3 flex items-center justify-between gap-3">
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center text-xs font-bold shrink-0">
                      {new Date(b.startTime).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-900 truncate">{b.title}</p>
                      <p className="text-[11px] text-slate-500 truncate">
                        {b.room.name} • ผู้จัด: {b.organizerName || b.user.name} ({b.participantsCount} คน)
                      </p>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 text-[10px] font-semibold bg-emerald-100 text-emerald-800 rounded-md shrink-0">
                    อนุมัติแล้ว
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Bookings Activity */}
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                รายการจองล่าสุด (Recent Bookings)
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">ประวัติคำขอจองห้องประชุมล่าสุด</p>
            </div>
            <Link
              href="/all-bookings"
              className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
            >
              ดูทั้งหมด <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="divide-y divide-slate-100 flex-1">
            {(!stats?.recentBookings || stats.recentBookings.length === 0) ? (
              <div className="p-8 text-center text-slate-400 text-xs">
                ยังไม่มีข้อมูลการจอง
              </div>
            ) : (
              stats.recentBookings.map((b: any) => (
                <div key={b.id} className="py-3 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono text-slate-400">{b.bookingCode}</span>
                      <p className="text-xs font-bold text-slate-900 truncate">{b.title}</p>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      {b.room.name} • {new Date(b.startTime).toLocaleDateString('th-TH')}
                    </p>
                  </div>
                  <span
                    className={`px-2 py-0.5 text-[10px] font-semibold rounded-md shrink-0 ${
                      b.status === 'APPROVED'
                        ? 'bg-emerald-100 text-emerald-800'
                        : b.status === 'PENDING'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {b.status}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Booking Modal */}
      {selectedRoomForBooking && (
        <BookingModal
          room={selectedRoomForBooking}
          isOpen={isBookingModalOpen}
          onClose={() => setIsBookingModalOpen(false)}
          onSuccess={() => fetchDashboardData()}
          allRooms={allRooms}
        />
      )}
    </div>
  );
}
