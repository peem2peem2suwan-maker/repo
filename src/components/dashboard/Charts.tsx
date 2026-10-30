'use client';

import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

interface DailyStat {
  date: string;
  count: number;
}

interface RoomUsage {
  name: string;
  code: string;
  count: number;
}

interface ChartsProps {
  dailyStats: DailyStat[];
  roomUsage: RoomUsage[];
}

const COLORS = ['#2563EB', '#3B82F6', '#60A5FA', '#93C5FD', '#10B981', '#F59E0B', '#64748B'];

export function DashboardCharts({ dailyStats, roomUsage }: ChartsProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Daily Bookings Bar Chart */}
      <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-bold text-slate-900 text-sm sm:text-base">
              สถิติการจองรายวัน (7 วันย้อนหลัง)
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              จำนวนการประชุมที่ได้รับการอนุมัติและเสร็จสิ้น
            </p>
          </div>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={dailyStats} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#64748B' }} axisLine={false} tickLine={false} />
              <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#64748B' }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0F172A',
                  color: '#FFFFFF',
                  borderRadius: '12px',
                  border: 'none',
                  fontSize: '12px',
                }}
                formatter={(val: any) => [`${val} ครั้ง`, 'จำนวนการจอง']}
              />
              <Bar dataKey="count" fill="#2563EB" radius={[6, 6, 0, 0]} barSize={32} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Room Usage Distribution */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
        <div className="mb-4">
          <h3 className="font-bold text-slate-900 text-sm sm:text-base">
            สัดส่วนการใช้งานแต่ละห้อง
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            ความถี่ในการจองห้องประชุมทั้งหมด
          </p>
        </div>

        <div className="h-48 w-full flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={roomUsage}
                dataKey="count"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={45}
                outerRadius={75}
                paddingAngle={4}
              >
                {roomUsage.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0F172A',
                  color: '#FFFFFF',
                  borderRadius: '12px',
                  border: 'none',
                  fontSize: '12px',
                }}
                formatter={(val: any) => [`${val} ครั้ง`, 'จำนวนครั้ง']}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Legend */}
        <div className="space-y-1.5 max-h-28 overflow-y-auto pt-2 border-t border-slate-100">
          {roomUsage.map((entry, index) => (
            <div key={entry.code} className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 truncate">
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                />
                <span className="text-slate-600 truncate">{entry.name}</span>
              </div>
              <span className="font-bold text-slate-800 ml-2">{entry.count} ครั้ง</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
