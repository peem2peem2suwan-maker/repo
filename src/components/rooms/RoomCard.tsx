'use client';

import React from 'react';
import { Room, RoomStatus } from '@/types';
import { Users, MapPin, Tv, Video, Mic, Wifi, Zap, Presentation, Settings, Trash2, Calendar, AlertCircle } from 'lucide-react';

interface RoomCardProps {
  room: Room;
  onBook: (room: Room) => void;
  onEdit?: (room: Room) => void;
  onDelete?: (room: Room) => void;
  isAdmin?: boolean;
}

export function RoomCard({ room, onBook, onEdit, onDelete, isAdmin }: RoomCardProps) {
  const getStatusBadge = (status: RoomStatus) => {
    switch (status) {
      case 'AVAILABLE':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/90 text-white backdrop-blur-md shadow-sm">
            <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
            ว่าง (Available)
          </span>
        );
      case 'OCCUPIED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-600/90 text-white backdrop-blur-md shadow-sm">
            <span className="w-2 h-2 rounded-full bg-white animate-ping" />
            กำลังใช้งาน (Occupied)
          </span>
        );
      case 'RESERVED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/90 text-white backdrop-blur-md shadow-sm">
            <span className="w-2 h-2 rounded-full bg-white" />
            จองแล้ว (Reserved)
          </span>
        );
      case 'MAINTENANCE':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-800/90 text-white backdrop-blur-md shadow-sm">
            <span className="w-2 h-2 rounded-full bg-slate-400" />
            ปิดปรับปรุง (Maintenance)
          </span>
        );
    }
  };

  const getEquipmentIcon = (name: string) => {
    if (name.includes('ทีวี') || name.includes('TV')) return <Tv className="w-3.5 h-3.5" />;
    if (name.includes('วิดีโอ') || name.includes('Zoom')) return <Video className="w-3.5 h-3.5" />;
    if (name.includes('ไมโครโฟน') || name.includes('Mic')) return <Mic className="w-3.5 h-3.5" />;
    if (name.includes('Wi-Fi') || name.includes('อินเทอร์เน็ต')) return <Wifi className="w-3.5 h-3.5" />;
    if (name.includes('ไวท์บอร์ด') || name.includes('กระดาน')) return <Presentation className="w-3.5 h-3.5" />;
    return <Zap className="w-3.5 h-3.5" />;
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col overflow-hidden group">
      {/* Room Image and Status Overlay */}
      <div className="relative h-48 sm:h-52 w-full overflow-hidden bg-slate-100">
        <img
          src={room.imageUrl || 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800'}
          alt={room.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent" />

        {/* Status Badge */}
        <div className="absolute top-3 left-3">{getStatusBadge(room.status)}</div>

        {/* Room Code Badge */}
        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-lg text-[11px] font-bold text-slate-800 shadow-sm">
          {room.code}
        </div>

        {/* Bottom image overlay: Capacity & Location */}
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white text-xs">
          <div className="flex items-center gap-1.5 font-medium bg-black/40 backdrop-blur-md px-2.5 py-1 rounded-lg">
            <Users className="w-3.5 h-3.5 text-blue-300" />
            <span>รองรับ {room.capacity} ที่นั่ง</span>
          </div>
          <div className="flex items-center gap-1 font-medium bg-black/40 backdrop-blur-md px-2.5 py-1 rounded-lg">
            <MapPin className="w-3.5 h-3.5 text-rose-300" />
            <span>{room.building} ชั้น {room.floor}</span>
          </div>
        </div>
      </div>

      {/* Card Content */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-bold text-base text-slate-900 group-hover:text-blue-600 transition-colors">
              {room.name}
            </h3>
            {isAdmin && (
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                {onEdit && (
                  <button
                    onClick={() => onEdit(room)}
                    className="p-1 text-slate-400 hover:text-blue-600 rounded transition"
                    title="แก้ไขห้อง"
                  >
                    <Settings className="w-4 h-4" />
                  </button>
                )}
                {onDelete && (
                  <button
                    onClick={() => onDelete(room)}
                    className="p-1 text-slate-400 hover:text-rose-600 rounded transition"
                    title="ลบห้อง"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            )}
          </div>

          <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
            {room.description || 'ไม่มีคำอธิบายเพิ่มเติมสำหรับห้องประชุมนี้'}
          </p>

          {/* Equipment Pills */}
          <div className="mt-4">
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
              สิ่งอำนวยความสะดวก
            </p>
            <div className="flex flex-wrap gap-1.5">
              {room.equipment && room.equipment.length > 0 ? (
                room.equipment.map((item) => (
                  <span
                    key={item.id}
                    className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 rounded-lg text-[11px] text-slate-700 font-medium"
                  >
                    {getEquipmentIcon(item.equipment.name)}
                    <span>{item.equipment.name}</span>
                  </span>
                ))
              ) : (
                <span className="text-[11px] text-slate-400">ไม่มีข้อมูลอุปกรณ์</span>
              )}
            </div>
          </div>
        </div>

        {/* Current Booking notice or Free banner */}
        <div className="mt-5 pt-4 border-t border-slate-100">
          {room.currentBooking ? (
            <div className="mb-3 p-2 bg-slate-50 rounded-xl text-xs text-slate-600 flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5 text-blue-600 shrink-0" />
              <div className="truncate">
                <span className="font-semibold text-slate-800">{room.currentBooking.title}</span>
                <span className="text-slate-400 ml-1">
                  ({new Date(room.currentBooking.startTime).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })} - {new Date(room.currentBooking.endTime).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })})
                </span>
              </div>
            </div>
          ) : (
            <div className="mb-3 p-2 bg-emerald-50/60 rounded-xl text-xs text-emerald-700 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span>ขณะนี้ห้องว่าง สามารถจองได้ทันที</span>
            </div>
          )}

          {/* Action Button */}
          <button
            onClick={() => onBook(room)}
            disabled={room.status === 'MAINTENANCE'}
            className={`w-full py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
              room.status === 'MAINTENANCE'
                ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white shadow-md shadow-blue-500/20'
            }`}
          >
            {room.status === 'MAINTENANCE' ? (
              <>
                <AlertCircle className="w-4 h-4" />
                <span>งดใช้งาน (ปิดปรับปรุง)</span>
              </>
            ) : (
              <>
                <Calendar className="w-4 h-4" />
                <span>จองห้องนี้</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
