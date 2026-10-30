'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Building2,
  CalendarDays,
  BookmarkCheck,
  CheckSquare,
  BarChart3,
  Bell,
  Users,
  ScrollText,
  X,
  Sparkles,
} from 'lucide-react';
import { UserRole } from '@/types';

interface SidebarProps {
  role?: UserRole;
  isOpen: boolean;
  onClose: () => void;
}

interface NavItem {
  name: string;
  href: string;
  icon: any;
  badge?: string;
}

interface NavGroup {
  title: string;
  roles?: string[];
  items: NavItem[];
}

export function Sidebar({ role = 'USER', isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();

  const navigation: NavGroup[] = [
    {
      title: 'เมนูหลัก',
      items: [
        { name: 'Dashboard', href: '/', icon: LayoutDashboard },
        { name: 'Meeting Rooms', href: '/rooms', icon: Building2 },
        { name: 'Calendar', href: '/calendar', icon: CalendarDays },
        { name: 'My Bookings', href: '/my-bookings', icon: BookmarkCheck },
      ],
    },
    {
      title: 'การบริหารจัดการ',
      roles: ['MANAGER', 'ADMIN'],
      items: [
        { name: 'All Bookings', href: '/all-bookings', icon: CheckSquare, badge: 'อนุมัติ' },
        { name: 'Reports', href: '/reports', icon: BarChart3 },
      ],
    },
    {
      title: 'ระบบและการตั้งค่า',
      items: [
        { name: 'Notifications', href: '/notifications', icon: Bell },
        ...(role === 'ADMIN'
          ? [
              { name: 'Users', href: '/users', icon: Users },
              { name: 'Audit Logs', href: '/audit-logs', icon: ScrollText },
            ]
          : []),
      ],
    },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm lg:hidden transition-opacity"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 flex w-64 flex-col border-r border-slate-200/80 bg-white transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Logo Header */}
        <div className="flex h-16 items-center justify-between px-6 border-b border-slate-200/80">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-slate-900 to-blue-600 text-white shadow-md">
              <Sparkles className="w-5 h-5 text-blue-200" />
            </div>
            <div>
              <span className="text-base font-bold tracking-tight text-slate-900 block leading-tight">
                MeetSpace
              </span>
              <span className="text-[10px] text-slate-500 font-medium">Enterprise Booking</span>
            </div>
          </Link>
          <button
            onClick={onClose}
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Nav Links */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-6">
          {navigation.map((group, groupIdx) => {
            if (group.roles && !group.roles.includes(role)) return null;

            return (
              <div key={groupIdx} className="space-y-1">
                <p className="px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  {group.title}
                </p>
                <div className="space-y-1 pt-1">
                  {group.items.map((item) => {
                    const isActive = pathname === item.href;
                    const Icon = item.icon;

                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={onClose}
                        className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all ${
                          isActive
                            ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                            : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                          <span>{item.name}</span>
                        </div>
                        {item.badge && !isActive && (
                          <span className="px-1.5 py-0.5 text-[10px] font-semibold bg-amber-100 text-amber-700 rounded-md">
                            {item.badge}
                          </span>
                        )}
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* System Version Footnote */}
        <div className="p-4 border-t border-slate-100 text-[11px] text-slate-400 flex items-center justify-between">
          <span>v1.0 Enterprise</span>
          <span className="flex items-center gap-1 text-emerald-600 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Online
          </span>
        </div>
      </aside>
    </>
  );
}
