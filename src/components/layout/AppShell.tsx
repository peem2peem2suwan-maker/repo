'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { User, NotificationItem } from '@/types';
import { useToast } from '../ui/Toast';
import { useRouter, usePathname } from 'next/navigation';

export function AppShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { showToast } = useToast();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isSSEConnected, setIsSSEConnected] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);

  // 1. Fetch current logged in user
  const fetchCurrentUser = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/me');
      if (res.status === 401 && pathname !== '/login') {
        router.push('/login');
        return;
      }
      const data = await res.json();
      if (data.user) {
        setCurrentUser(data.user);
      }
    } catch (err) {
      console.error('Failed to fetch current user', err);
    } finally {
      setIsLoadingAuth(false);
    }
  }, [pathname, router]);

  // 2. Fetch notifications
  const fetchNotifications = useCallback(async () => {
    try {
      const res = await fetch('/api/notifications');
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications || []);
        setUnreadCount(data.unreadCount || 0);
      }
    } catch (err) {
      console.error('Failed to fetch notifications', err);
    }
  }, []);

  useEffect(() => {
    if (pathname !== '/login') {
      fetchCurrentUser();
      fetchNotifications();
    }
  }, [pathname, fetchCurrentUser, fetchNotifications]);

  // 3. Connect to Real-Time Server-Sent Events (SSE)
  useEffect(() => {
    if (pathname === '/login') return;

    let eventSource: EventSource | null = null;
    let reconnectTimeout: any = null;

    const connectSSE = () => {
      eventSource = new EventSource('/api/realtime');

      eventSource.addEventListener('connected', () => {
        setIsSSEConnected(true);
      });

      eventSource.addEventListener('BOOKING_CREATED', (e: any) => {
        try {
          const payload = JSON.parse(e.data);
          showToast(
            'notification',
            `มีการจองห้อง ${payload.room?.name || 'ประชุม'} ใหม่`,
            'การจองห้องประชุม'
          );
          fetchNotifications();
          router.refresh();
        } catch {}
      });

      eventSource.addEventListener('BOOKING_APPROVED', (e: any) => {
        try {
          const payload = JSON.parse(e.data);
          showToast(
            'success',
            `การจองห้อง ${payload.booking?.room?.name || ''} ได้รับการอนุมัติแล้ว`,
            'อนุมัติการจอง'
          );
          fetchNotifications();
          router.refresh();
        } catch {}
      });

      eventSource.addEventListener('BOOKING_REJECTED', (e: any) => {
        try {
          const payload = JSON.parse(e.data);
          showToast(
            'error',
            `การจองห้อง ${payload.booking?.room?.name || ''} ถูกปฏิเสธ`,
            'คำขอถูกปฏิเสธ'
          );
          fetchNotifications();
          router.refresh();
        } catch {}
      });

      eventSource.addEventListener('BOOKING_CANCELLED', (e: any) => {
        try {
          const payload = JSON.parse(e.data);
          showToast(
            'info',
            `การจองห้อง ${payload.booking?.room?.name || ''} ถูกยกเลิก`,
            'ยกเลิกการจอง'
          );
          fetchNotifications();
          router.refresh();
        } catch {}
      });

      eventSource.addEventListener('ROOM_STATUS_CHANGED', () => {
        router.refresh();
      });

      eventSource.addEventListener('NOTIFICATION_NEW', (e: any) => {
        try {
          const payload = JSON.parse(e.data);
          showToast('notification', payload.notification?.message || 'มีการแจ้งเตือนใหม่', payload.notification?.title);
          fetchNotifications();
        } catch {}
      });

      eventSource.onerror = () => {
        setIsSSEConnected(false);
        if (eventSource) eventSource.close();
        reconnectTimeout = setTimeout(connectSSE, 5000);
      };
    };

    connectSSE();

    return () => {
      if (eventSource) eventSource.close();
      if (reconnectTimeout) clearTimeout(reconnectTimeout);
    };
  }, [pathname, showToast, fetchNotifications, router]);

  // Quick switch user/role
  const handleQuickSwitch = async (userIdOrRole: string) => {
    try {
      const res = await fetch('/api/auth/quick-switch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: userIdOrRole, role: userIdOrRole }),
      });
      if (res.ok) {
        const data = await res.json();
        showToast('success', `สลับเป็น ${data.user?.name || userIdOrRole} เรียบร้อยแล้ว`);
        await fetchCurrentUser();
        router.refresh();
      }
    } catch {
      showToast('error', 'สลับบทบาทไม่สำเร็จ');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ markAll: true }),
      });
      setUnreadCount(0);
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      showToast('info', 'ทำเครื่องหมายว่าอ่านทั้งหมดแล้ว');
    } catch {}
  };

  const handleNotificationClick = async (item: NotificationItem) => {
    try {
      await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: item.id }),
      });
      setNotifications((prev) =>
        prev.map((n) => (n.id === item.id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
      if (item.linkUrl) {
        router.push(item.linkUrl);
      }
    } catch {}
  };

  // If on login page, render bare without sidebar and header
  if (pathname === '/login') {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen bg-bg">
      <Sidebar
        role={currentUser?.role}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      <div className="flex flex-1 flex-col min-w-0">
        <Header
          currentUser={currentUser}
          unreadCount={unreadCount}
          notifications={notifications}
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          onMarkAllNotificationsAsRead={handleMarkAllAsRead}
          onNotificationClick={handleNotificationClick}
          onQuickSwitchRole={handleQuickSwitch}
          isSSEConnected={isSSEConnected}
        />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
