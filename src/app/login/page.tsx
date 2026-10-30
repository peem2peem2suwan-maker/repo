'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Sparkles, Lock, Mail, AlertCircle, ArrowRight, ShieldCheck, UserCheck, Users } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'การเข้าสู่ระบบไม่สำเร็จ กรุณาตรวจสอบข้อมูล');
        return;
      }

      router.push('/');
      router.refresh();
    } catch {
      setError('เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickDemoLogin = async (role: 'ADMIN' | 'MANAGER' | 'USER') => {
    setError('');
    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/quick-switch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role }),
      });
      if (!res.ok) throw new Error();
      router.push('/');
      router.refresh();
    } catch {
      setError('ไม่สามารถเข้าสู่ระบบแบบทดสอบได้');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-blue-950 flex flex-col justify-center items-center p-4 sm:p-6 text-slate-100">
      <div className="w-full max-w-md">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 text-white shadow-xl shadow-blue-500/25 mb-4">
            <Sparkles className="w-7 h-7" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            MeetSpace Enterprise
          </h1>
          <p className="text-sm text-slate-400 mt-1.5">
            ระบบจองและบริหารจัดการห้องประชุมอัจฉริยะ
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white/10 backdrop-blur-xl border border-white/15 rounded-3xl p-6 sm:p-8 shadow-2xl">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-white">เข้าสู่ระบบ</h2>
            <p className="text-xs text-slate-300 mt-0.5">
              กรอกข้อมูลเพื่อเข้าใช้งานบัญชีองค์กรของคุณ
            </p>
          </div>

          {error && (
            <div className="mb-5 p-3.5 bg-rose-500/20 border border-rose-500/40 rounded-xl text-rose-200 text-xs sm:text-sm flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                อีเมลองค์กร (Email / Username)
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  required
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/15 rounded-xl text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-medium text-slate-300">
                  รหัสผ่าน (Password)
                </label>
                <button
                  type="button"
                  onClick={() => alert('สำหรับระบบตัวอย่างนี้ รหัสผ่านเริ่มต้นคือ: password123')}
                  className="text-xs text-blue-400 hover:text-blue-300 transition"
                >
                  ลืมรหัสผ่าน?
                </button>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/15 rounded-xl text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                />
              </div>
            </div>

            <div className="flex items-center">
              <input
                id="rememberMe"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded border-slate-700 bg-white/10 text-blue-600 focus:ring-blue-500 focus:ring-offset-0"
              />
              <label htmlFor="rememberMe" className="ml-2 text-xs text-slate-300 cursor-pointer">
                จดจำการเข้าสู่ระบบ (Remember me)
              </label>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-semibold rounded-xl text-sm shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>เข้าสู่ระบบ</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Switcher Section */}
          <div className="mt-8 pt-6 border-t border-white/10">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 text-center mb-3">
              หรือเข้าสู่ระบบด่วนเพื่อทดสอบสิทธิ์ (Demo Roles)
            </p>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleQuickDemoLogin('ADMIN')}
                className="p-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-center transition group"
              >
                <ShieldCheck className="w-5 h-5 text-amber-400 mx-auto mb-1 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-semibold text-white block">Admin</span>
                <span className="text-[10px] text-slate-400 block">สิทธิ์สูงสุด</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemoLogin('MANAGER')}
                className="p-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-center transition group"
              >
                <UserCheck className="w-5 h-5 text-blue-400 mx-auto mb-1 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-semibold text-white block">Manager</span>
                <span className="text-[10px] text-slate-400 block">อนุมัติการจอง</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemoLogin('USER')}
                className="p-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-center transition group"
              >
                <Users className="w-5 h-5 text-emerald-400 mx-auto mb-1 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-semibold text-white block">User</span>
                <span className="text-[10px] text-slate-400 block">ผู้ใช้งานทั่วไป</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <p className="text-center text-xs text-slate-500 mt-6">
          MeetSpace v1.0 • พัฒนาด้วย Next.js 14, Tailwind CSS & Prisma
        </p>
      </div>
    </div>
  );
}
