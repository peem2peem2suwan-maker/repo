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
  Cell,
} from 'recharts';
import { Building2, Layers } from 'lucide-react';

interface RankingItem {
  name: string;
  fullName?: string;
  count: number;
}

interface ChartsProps {
  roomRanking?: RankingItem[];
  departmentRanking?: RankingItem[];
}

const ROOM_COLORS = ['#2563EB', '#3B82F6', '#06B6D4', '#10B981', '#F59E0B', '#8B5CF6'];
const DEPT_COLORS = ['#4F46E5', '#6366F1', '#EC4899', '#F43F5E', '#14B8A6', '#84CC16'];

export function DashboardCharts({ roomRanking = [], departmentRanking = [] }: ChartsProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Chart 1: จัดอันดับห้องประชุมที่ถูกใช้งานสูงสุด */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-sm sm:text-base">
              จัดอันดับห้องประชุมที่ถูกใช้งานสูงสุด
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              ความถี่การใช้งานห้องประชุม 6 ห้องหลัก (รายการที่อนุมัติแล้ว)
            </p>
          </div>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={roomRanking}
              layout="vertical"
              margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#F1F5F9" />
              <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11, fill: '#64748B' }} axisLine={false} />
              <YAxis
                type="category"
                dataKey="name"
                tick={{ fontSize: 11, fill: '#1E293B', fontWeight: 500 }}
                axisLine={false}
                tickLine={false}
                width={80}
              />
              <Tooltip
                formatter={(val: any) => [`${val} ครั้ง`, 'จำนวนการจอง']}
                contentStyle={{
                  backgroundColor: '#0F172A',
                  color: '#FFFFFF',
                  borderRadius: '12px',
                  border: 'none',
                  fontSize: '12px',
                }}
              />
              <Bar dataKey="count" radius={[0, 8, 8, 0]}>
                {roomRanking.map((_, index) => (
                  <Cell key={`cell-room-${index}`} fill={ROOM_COLORS[index % ROOM_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Chart 2: จัดอันดับแผนกวิชาที่ขอใช้บริการ */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-sm sm:text-base">
              จัดอันดับแผนกวิชาที่ขอใช้บริการ
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              สถิติการยื่นคำขออนุญาตใช้ห้องประชุมแยกตามแผนกวิชา / หน่วยงาน
            </p>
          </div>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={departmentRanking}
              margin={{ top: 10, right: 10, left: -20, bottom: 25 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 10, fill: '#64748B' }}
                axisLine={false}
                tickLine={false}
                angle={-15}
                textAnchor="end"
                interval={0}
              />
              <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#64748B' }} axisLine={false} tickLine={false} />
              <Tooltip
                formatter={(val: any) => [`${val} ครั้ง`, 'จำนวนคำขอ']}
                contentStyle={{
                  backgroundColor: '#0F172A',
                  color: '#FFFFFF',
                  borderRadius: '12px',
                  border: 'none',
                  fontSize: '12px',
                }}
              />
              <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                {departmentRanking.map((_, index) => (
                  <Cell key={`cell-dept-${index}`} fill={DEPT_COLORS[index % DEPT_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
