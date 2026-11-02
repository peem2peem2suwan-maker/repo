import type { Metadata } from 'next';
import './globals.css';
import { ToastProvider } from '@/components/ui/Toast';
import { AppShell } from '@/components/layout/AppShell';
import { MockApiInit } from '@/components/MockApiInit';

export const metadata: Metadata = {
  title: 'MeetSpace - ระบบจองห้องประชุม Enterprise',
  description: 'ระบบบริหารจัดการและจองห้องประชุมแบบครบวงจร Real-time สำหรับองค์กร',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="th">
      <body className="min-h-screen bg-slate-50 text-slate-900 selection:bg-blue-600 selection:text-white">
        <MockApiInit />
        <ToastProvider>
          <AppShell>{children}</AppShell>
        </ToastProvider>
      </body>
    </html>
  );
}
