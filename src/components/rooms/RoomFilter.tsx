'use client';

import React from 'react';
import { Filter, Users, Building, Sparkles, CheckCircle2 } from 'lucide-react';

interface RoomFilterProps {
  capacity: string;
  onCapacityChange: (val: string) => void;
  status: string;
  onStatusChange: (val: string) => void;
  building: string;
  onBuildingChange: (val: string) => void;
  equipment: string;
  onEquipmentChange: (val: string) => void;
  onReset: () => void;
}

export function RoomFilter({
  capacity,
  onCapacityChange,
  status,
  onStatusChange,
  building,
  onBuildingChange,
  equipment,
  onEquipmentChange,
  onReset,
}: RoomFilterProps) {
  return (
    <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-blue-600" />
          <h3 className="text-xs sm:text-sm font-bold text-slate-900">ตัวกรองห้องประชุม</h3>
        </div>
        <button
          onClick={onReset}
          className="text-xs text-blue-600 hover:text-blue-800 font-semibold"
        >
          ล้างตัวกรองทั้งหมด
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Status Filter */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
            สถานะห้อง
          </label>
          <select
            value={status}
            onChange={(e) => onStatusChange(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="ALL">สถานะทั้งหมด</option>
            <option value="AVAILABLE">🟢 ว่าง (Available)</option>
            <option value="OCCUPIED">🔴 กำลังใช้งาน (Occupied)</option>
            <option value="RESERVED">🟡 จองแล้ว (Reserved)</option>
            <option value="MAINTENANCE">⚫ ปิดปรับปรุง (Maintenance)</option>
          </select>
        </div>

        {/* Capacity Filter */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
            จำนวนคนรองรับ (Capacity)
          </label>
          <select
            value={capacity}
            onChange={(e) => onCapacityChange(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">ความจุทั้งหมด</option>
            <option value="4">อย่างน้อย 4 คน</option>
            <option value="8">อย่างน้อย 8 คน</option>
            <option value="12">อย่างน้อย 12 คน</option>
            <option value="20">อย่างน้อย 20 คน ขึ้นไป</option>
          </select>
        </div>

        {/* Building Filter */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
            อาคาร / ที่ตั้ง
          </label>
          <select
            value={building}
            onChange={(e) => onBuildingChange(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="ALL">ทุกอาคาร</option>
            <option value="อาคาร A">อาคาร A</option>
            <option value="อาคาร B">อาคาร B</option>
            <option value="อาคาร C">อาคาร C</option>
          </select>
        </div>

        {/* Equipment Filter */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
            อุปกรณ์ที่ต้องการ
          </label>
          <select
            value={equipment}
            onChange={(e) => onEquipmentChange(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="ALL">อุปกรณ์ทั้งหมด</option>
            <option value="โปรเจกเตอร์">โปรเจกเตอร์ 4K</option>
            <option value="ทีวี">สมาร์ททีวี 75"</option>
            <option value="คอนเฟอเรนซ์">Video Conference</option>
            <option value="ไวท์บอร์ด">ไวท์บอร์ดอัจฉริยะ</option>
            <option value="ไมโครโฟน">ไมโครโฟนไร้สาย</option>
          </select>
        </div>
      </div>
    </div>
  );
}
