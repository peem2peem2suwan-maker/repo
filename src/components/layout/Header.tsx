'use client';

import React, { useState } from 'react';
import { Menu, Search, Radio, User, Shield, LogOut, ChevronDown } from 'lucide-react';
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
  onQuickSwitchRole: (role: 'ADMIN' | 'MANAGER' | 'USER') => void;
  isSSEConnected: boolean;
}

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
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="ค้นหาห้องประชุม หรือรหัสการจอง..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
          />
        </form>
      </div>

      {/* Right: Quick Demo Switcher + Real-time Status + Notification + User Pill */}
      <div className="flex items-center gap-2 sm:gap-4">
        {/* Quick Role Switcher Pill for Testing */}
        <div className="hidden md:flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-medium text-slate-600">
          <span className="px-2 text-[11px] text-slate-400 font-semibold uppercase">สลับบทบาท:</span>
          {(['ADMIN', 'MANAGER', 'USER'] as const).map((r) => (
            <button
              key={r}
              onClick={() => onQuickSwitchRole(r)}
              className={`px-2.5 py-1 rounded-lg transition-all text-xs font-semibold ${
                currentUser?.role === r
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'hover:text-slate-900 text-slate-600'
              }`}
            >
              {r === 'ADMIN' ? 'Admin' : r === 'MANAGER' ? 'Manager' : 'User'}
            </button>
          ))}
        </div>

        {/* Real-time SSE indicator */}
        <div
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium border ${
            isSSEConnected
              ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
              : 'bg-amber-50 border-amber-200 text-amber-700'
          }`}
          title={isSSEConnected ? 'เชื่อมต่อ Real-time สำเร็จ' : 'กำลังเชื่อมต่อ Real-time...'}
        >
          <span
            className={`w-2 h-2 rounded-full ${
              isSSEConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
            }`}
          />
          <span className="hidden xl:inline">{isSSEConnected ? 'Real-time Live' : 'Connecting'}</span>
        </div>

        {/* Notifications */}
        <NotificationDropdown
          notifications={notifications}
          unreadCount={unreadCount}
          onMarkAllAsRead={onMarkAllNotificationsAsRead}
          onItemClick={onNotificationClick}
        />

        {/* User Pill & Menu */}
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
              <p className="text-[10px] text-slate-400 capitalize flex items-center gap-1">
                {currentUser?.role === 'ADMIN' && <Shield className="w-2.5 h-2.5 text-blue-600" />}
                {currentUser?.role || 'User'}
              </p>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white shadow-xl border border-slate-100 py-2 z-50 animate-in fade-in slide-in-from-top-2">
              <div className="px-4 py-2 border-b border-slate-100">
                <p className="text-xs font-semibold text-slate-900">{currentUser?.name}</p>
                <p className="text-[11px] text-slate-500 truncate">{currentUser?.email}</p>
                <span className="inline-block mt-1 px-2 py-0.5 text-[10px] font-semibold bg-blue-50 text-blue-700 rounded-md">
                  {currentUser?.department || 'องค์กร'}
                </span>
              </div>
              <div className="px-2 py-1 md:hidden">
                <p className="text-[10px] uppercase font-semibold text-slate-400 px-2 py-1">สลับบทบาททดสอบ</p>
                <button
                  onClick={() => { onQuickSwitchRole('ADMIN'); setShowUserMenu(false); }}
                  className="w-full text-left px-2 py-1.5 text-xs rounded hover:bg-slate-50 text-slate-700"
                >
                  Admin
                </button>
                <button
                  onClick={() => { onQuickSwitchRole('MANAGER'); setShowUserMenu(false); }}
                  className="w-full text-left px-2 py-1.5 text-xs rounded hover:bg-slate-50 text-slate-700"
                >
                  Manager
                </button>
                <button
                  onClick={() => { onQuickSwitchRole('USER'); setShowUserMenu(false); }}
                  className="w-full text-left px-2 py-1.5 text-xs rounded hover:bg-slate-50 text-slate-700"
                >
                  User
                </button>
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
