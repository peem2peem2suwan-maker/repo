'use client';

import React, { useState, useEffect } from 'react';
import { ScrollText, Filter, Clock, ShieldCheck, User, Info } from 'lucide-react';

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionFilter, setActionFilter] = useState('ALL');

  const fetchLogs = async () => {
    try {
      const url = actionFilter !== 'ALL' ? `/api/audit-logs?action=${actionFilter}` : '/api/audit-logs';
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setLogs(data.logs || []);
      }
    } catch (err) {
      console.error('Error fetching audit logs:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [actionFilter]);

  const getActionColor = (action: string) => {
    if (action.includes('CREATE')) return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    if (action.includes('APPROVE')) return 'bg-blue-50 text-blue-700 border-blue-200';
    if (action.includes('REJECT') || action.includes('CANCEL') || action.includes('DELETE'))
      return 'bg-rose-50 text-rose-700 border-rose-200';
    if (action.includes('LOGIN')) return 'bg-slate-100 text-slate-700 border-slate-200';
    return 'bg-amber-50 text-amber-700 border-amber-200';
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            ประวัติการทำงานของระบบ (Audit Logs)
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            บันทึกการกระทำและกิจกรรมความปลอดภัยทั้งหมดในระบบ
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 shadow-xs focus:outline-none"
          >
            <option value="ALL">กิจกรรมทั้งหมด</option>
            <option value="CREATE_BOOKING">CREATE_BOOKING</option>
            <option value="APPROVE_BOOKING">APPROVE_BOOKING</option>
            <option value="REJECT_BOOKING">REJECT_BOOKING</option>
            <option value="CANCEL_BOOKING">CANCEL_BOOKING</option>
            <option value="LOGIN">LOGIN</option>
            <option value="UPDATE_ROOM">UPDATE_ROOM</option>
            <option value="UPDATE_USER">UPDATE_USER</option>
          </select>
        </div>
      </div>

      {isLoading ? (
        <div className="py-24 flex justify-center">
          <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : logs.length === 0 ? (
        <div className="py-16 text-center bg-white rounded-3xl border border-slate-200 p-8 space-y-3">
          <ScrollText className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="font-bold text-slate-800 text-base">ไม่พบบันทึกกิจกรรม</h3>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-semibold">
                <tr>
                  <th className="px-5 py-4">วันและเวลา</th>
                  <th className="px-5 py-4">การกระทำ (Action)</th>
                  <th className="px-5 py-4">ผู้กระทำ</th>
                  <th className="px-5 py-4">หมวดหมู่</th>
                  <th className="px-5 py-4">รายละเอียด (Metadata)</th>
                  <th className="px-5 py-4">IP Address</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/80 transition">
                    <td className="px-5 py-4 text-slate-500 font-sans">
                      {new Date(log.createdAt).toLocaleString('th-TH', { dateStyle: 'short', timeStyle: 'medium' })}
                    </td>
                    <td className="px-5 py-4">
                      <span className={`px-2 py-0.5 rounded-md font-bold border ${getActionColor(log.action)}`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="px-5 py-4 font-sans">
                      <span className="font-bold text-slate-800 block">
                        {log.user ? log.user.name : 'System'}
                      </span>
                      {log.user && (
                        <span className="text-[10px] text-slate-400 block">{log.user.email}</span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-slate-600 font-sans font-medium">{log.entity}</td>
                    <td className="px-5 py-4 text-slate-600 max-w-xs truncate" title={log.details || ''}>
                      {log.details || '-'}
                    </td>
                    <td className="px-5 py-4 text-slate-400">{log.ipAddress || '127.0.0.1'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
