'use client';

import React, { useState } from 'react';
import { Menu, Search, Radio, User, Shield, LogOut, ChevronDown, CheckCircle, UserCheck } from 'lucide-react';
import { User as UserType, NotificationItem } from '@/types';
import { NotificationDropdown } from './NotificationDropdown';
import { useRouter } from 'next/navigation';

interface HeaderProps {
  currentUser: UserType | null;
  unreadCount: number;
  notifications: NotificationItem[];
  onToggleSidebar: () => void;
  onMarkAllNotificationsAsRead: () => void;
  onNotificationClick: (item: NotificationItem) => void;
  onQuickSwitchRole: (userId: string) => void;
  isSSEConnected: boolean;
}

const OFFICIAL_USERS = [
  { id: 'usr-checker-1', name: 'นายวัชรพงศ์ โสภา', roleTitle: 'ตรวจห้อง / โสตฯ', role: 'CHECKER' },
  { id: 'usr-endorser-1', name: 'นายเอกราช เขียวทอง', roleTitle: 'หัวหน้างาน / รับรอง', role: 'ENDORSER' },
  { id: 'usr-approver-1', name: 'นายชาตรี เริงชัยภูมิ', roleTitle: 'รอง ผอ. / ผู้อนุมัติ', role: 'APPROVER' },
  { id: 'usr-staff-1', name: 'นายนเรศ สุขสวัสดิ์', roleTitle: 'หัวหน้าแผนกช่างยนต์ / ผู้ขอ', role: 'USER' },
];

export function Header({
  currentUser,
  unreadCount,
  notifications,
  onToggleSidebar,
  onMarkAllNotificationsAsRead,
  onNotificationClick,
  onQuickSwitchRole,
  isSSEConnected,
}: HeaderProps) {
  const router = useRouter();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showSwitcher, setShowSwitcher] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/login');
      router.refresh();
    } catch (err) {
      console.error('Logout error', err);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      router.push(`/rooms?search=${encodeURIComponent(searchTerm.trim())}`);
    }
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200/80 bg-white/90 px-4 sm:px-6 backdrop-blur-md">
      {/* Left: Mobile hamburger + Global Search */}
      <div className="flex items-center gap-3 lg:gap-4 flex-1 max-w-md">
        <button
          onClick={onToggleSidebar}
          className="lg:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors"
          title="เมนู"
        >
          <Menu className="w-5 h-5" />
        </button>

        <form onSubmit={handleSearchSubmit} className="relative w-full hidden sm:block">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="ค้นหาห้องประชุม ครุภัณฑ์ หรือแผนกวิชา..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 bg-slate-100 hover:bg-slate-200/60 focus:bg-white text-xs sm:text-sm text-slate-800 placeholder-slate-400 rounded-xl border border-transparent focus:border-blue-500 focus:outline-none transition-all"
          />
        </form>
      </div>

      {/* Right: Quick Switcher for Verification + SSE Status + Notifications + User */}
      <div className="flex items-center gap-2 sm:gap-4">
        {/* Quick Role Switcher for System Verification */}
        <div className="relative">
          <button
            onClick={() => setShowSwitcher(!showSwitcher)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl border border-blue-200/60 text-xs font-semibold shadow-xs transition-colors"
            title="สลับบทบาทตรวจรับระบบ (นายวัชรพงศ์ / นายเอกราช / นายชาตรี)"
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">สลับบทบาทตรวจรับระบบ</span>
            <ChevronDown className="w-3 h-3" />
          </button>

          {showSwitcher && (
            <div className="absolute right-0 mt-2 w-72 rounded-2xl bg-white shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in slide-in-from-top-2">
              <div className="px-3 py-1.5 border-b border-slate-100">
                <p className="text-[11px] font-bold text-slate-900">เลือกบทบาทสำหรับทดสอบตรวจรับระบบ</p>
                <p className="text-[10px] text-slate-500">ทดสอบการอนุมัติ 3 ระดับ และการยื่นคำขอ</p>
              </div>
              <div className="p-1 space-y-1">
                {OFFICIAL_USERS.map((u) => {
                  const isCurrent = currentUser?.id === u.id;
                  return (
                    <button
                      key={u.id}
                      onClick={() => {
                        onQuickSwitchRole(u.id);
                        setShowSwitcher(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-xl text-xs transition-colors flex items-center justify-between ${
                        isCurrent
                          ? 'bg-blue-50 text-blue-900 font-semibold'
                          : 'hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <div>
                        <p className="text-slate-900">{u.name}</p>
                        <p className="text-[10px] text-slate-500">{u.roleTitle}</p>
                      </div>
                      {isCurrent && <CheckCircle className="w-4 h-4 text-blue-600 shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Real-time Indicator */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 text-[11px] font-medium text-slate-600">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="hidden md:inline">Real-time</span>
        </div>

        {/* Notification Dropdown */}
        <NotificationDropdown
          unreadCount={unreadCount}
          notifications={notifications}
          onMarkAllAsRead={onMarkAllNotificationsAsRead}
          onItemClick={onNotificationClick}
        />

        {/* User Profile Pill */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 p-1.5 pl-2 sm:pl-3 rounded-xl hover:bg-slate-100 border border-slate-200/80 transition-colors"
          >
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-xs overflow-hidden">
              {currentUser?.avatar ? (
                <img src={currentUser.avatar} alt={currentUser.name} className="w-full h-full object-cover" />
              ) : (
                currentUser?.name?.charAt(0) || 'U'
              )}
            </div>
            <div className="hidden md:block text-left pr-1">
              <p className="text-xs font-semibold text-slate-800 line-clamp-1">{currentUser?.name || 'ผู้ใช้งาน'}</p>
              <p className="text-[10px] text-slate-500 line-clamp-1">
                {currentUser?.position || currentUser?.role || 'User'}
              </p>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-white shadow-xl border border-slate-100 py-2 z-50">
              <div className="px-4 py-2 border-b border-slate-100">
                <p className="text-xs font-semibold text-slate-900">{currentUser?.name}</p>
                <p className="text-[11px] text-slate-500">{currentUser?.position}</p>
                <p className="text-[10px] text-blue-600 mt-0.5">{currentUser?.department}</p>
              </div>
              <div className="border-t border-slate-100 my-1" />
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 transition font-medium"
              >
                <LogOut className="w-4 h-4" />
                ออกจากระบบ
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
