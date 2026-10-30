'use client';

import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, Users, AlertTriangle, CheckCircle2, Building, Sparkles, Plus, Trash2, ArrowRight } from 'lucide-react';
import { Room, Equipment } from '@/types';
import { useToast } from '../ui/Toast';

interface BookingModalProps {
  room: Room | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  allRooms?: Room[];
}

export function BookingModal({
  room: initialRoom,
  isOpen,
  onClose,
  onSuccess,
  allRooms = [],
}: BookingModalProps) {
  const { showToast } = useToast();

  const [selectedRoom, setSelectedRoom] = useState<Room | null>(initialRoom);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(() => {
    const d = new Date();
    return d.toISOString().slice(0, 10);
  });
  const [startTime, setStartTime] = useState('10:00');
  const [endTime, setEndTime] = useState('11:00');
  const [participantsCount, setParticipantsCount] = useState<number>(4);
  const [organizerName, setOrganizerName] = useState('');
  const [participants, setParticipants] = useState<string[]>(['']);
  const [selectedEquipmentIds, setSelectedEquipmentIds] = useState<string[]>([]);

  // Collision and validation state
  const [isCheckingConflict, setIsCheckingConflict] = useState(false);
  const [conflictData, setConflictData] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialRoom) {
      setSelectedRoom(initialRoom);
    }
  }, [initialRoom]);

  // Check collision automatically when room, date, or time changes
  useEffect(() => {
    if (!isOpen || !selectedRoom || !date || !startTime || !endTime) return;

    const startDateTime = `${date}T${startTime}:00`;
    const endDateTime = `${date}T${endTime}:00`;

    if (new Date(startDateTime) >= new Date(endDateTime)) {
      setConflictData({
        hasConflict: true,
        reason: 'เวลาสิ้นสุดต้องมากกว่าเวลาเริ่มต้น',
      });
      return;
    }

    const timer = setTimeout(async () => {
      setIsCheckingConflict(true);
      try {
        const res = await fetch('/api/bookings/check-availability', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            roomId: selectedRoom.id,
            startTime: startDateTime,
            endTime: endDateTime,
            participantsCount,
          }),
        });
        const data = await res.json();
        setConflictData(data);
      } catch (err) {
        console.error('Failed to check conflict', err);
      } finally {
        setIsCheckingConflict(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [isOpen, selectedRoom, date, startTime, endTime, participantsCount]);

  if (!isOpen || !selectedRoom) return null;

  const handleAddParticipant = () => {
    setParticipants([...participants, '']);
  };

  const handleUpdateParticipant = (index: number, val: string) => {
    const next = [...participants];
    next[index] = val;
    setParticipants(next);
  };

  const handleRemoveParticipant = (index: number) => {
    setParticipants(participants.filter((_, i) => i !== index));
  };

  const handleSelectSuggestedRoom = (roomItem: any) => {
    const matched = allRooms.find((r) => r.id === roomItem.id);
    if (matched) {
      setSelectedRoom(matched);
      showToast('info', `เปลี่ยนเป็นห้อง ${matched.name} เรียบร้อยแล้ว`);
    }
  };

  const handleSelectSuggestedSlot = (slot: { startTime: string; endTime: string }) => {
    const s = new Date(slot.startTime);
    const e = new Date(slot.endTime);
    setStartTime(s.toTimeString().slice(0, 5));
    setEndTime(e.toTimeString().slice(0, 5));
    showToast('info', 'เลือกช่วงเวลาว่างแนะนำแล้ว');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (conflictData?.hasConflict) {
      showToast('error', conflictData.reason || 'ช่วงเวลานี้ไม่สามารถจองได้');
      return;
    }

    setIsSubmitting(true);
    try {
      const startDateTime = `${date}T${startTime}:00`;
      const endDateTime = `${date}T${endTime}:00`;

      const validParticipants = participants.filter((p) => p.trim() !== '');

      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomId: selectedRoom.id,
          title,
          description,
          startTime: startDateTime,
          endTime: endDateTime,
          participantsCount,
          organizerName,
          participants: validParticipants,
          equipmentIds: selectedEquipmentIds,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.conflictDetails) {
          setConflictData(data.conflictDetails);
        }
        showToast('error', data.error || 'ไม่สามารถทำการจองได้');
        return;
      }

      showToast(
        'success',
        `จองห้อง ${selectedRoom.name} สำเร็จ (รหัส: ${data.booking.bookingCode})`,
        'บันทึกสำเร็จ'
      );
      onSuccess();
      onClose();
    } catch {
      showToast('error', 'เกิดข้อผิดพลาดในการส่งข้อมูล');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">จองห้องประชุม</h2>
              <p className="text-xs text-slate-500 flex items-center gap-2">
                <span>{selectedRoom.name}</span>
                <span className="text-slate-300">•</span>
                <span>{selectedRoom.building} ชั้น {selectedRoom.floor}</span>
                <span className="text-slate-300">•</span>
                <span className="text-blue-600 font-medium">รองรับ {selectedRoom.capacity} ที่นั่ง</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Room Selector if user wants to change */}
          {allRooms.length > 0 && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                เลือกห้องประชุม
              </label>
              <select
                value={selectedRoom.id}
                onChange={(e) => {
                  const target = allRooms.find((r) => r.id === e.target.value);
                  if (target) setSelectedRoom(target);
                }}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                {allRooms.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.code} - {r.name} (ความจุ {r.capacity} คน) {r.status === 'MAINTENANCE' ? '[ปิดปรับปรุง]' : ''}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Meeting Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              หัวข้อการประชุม <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="เช่น ประชุมวางแผนกลยุทธ์ไตรมาส 4"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
            />
          </div>

          {/* Date and Time Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                วันที่ <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                เวลาเริ่ม <span className="text-rose-500">*</span>
              </label>
              <input
                type="time"
                required
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                เวลาสิ้นสุด <span className="text-rose-500">*</span>
              </label>
              <input
                type="time"
                required
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>

          {/* REAL-TIME COLLISION ALERT & SUGGESTION BOX */}
          {conflictData && conflictData.hasConflict && (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-900 space-y-3 animate-in fade-in">
              <div className="flex items-start gap-2.5">
                <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs sm:text-sm font-bold text-rose-700">
                    ไม่สามารถจองห้องนี้ได้ เนื่องจากมีการจองในช่วงเวลาดังกล่าว
                  </p>
                  <p className="text-xs text-rose-600 mt-0.5">{conflictData.reason}</p>
                  {conflictData.conflictingBooking && (
                    <p className="text-[11px] text-rose-500 mt-1">
                      การจองเดิม: {conflictData.conflictingBooking.title} ({conflictData.conflictingBooking.organizerName})
                    </p>
                  )}
                </div>
              </div>

              {/* Alternative Available Rooms */}
              {conflictData.suggestedRooms && conflictData.suggestedRooms.length > 0 && (
                <div className="pt-2 border-t border-rose-200/80">
                  <p className="text-xs font-semibold text-rose-800 mb-2 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                    ห้องประชุมอื่นที่ว่างในช่วงเวลานี้ (แนะนำ):
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {conflictData.suggestedRooms.map((sRoom: any) => (
                      <button
                        key={sRoom.id}
                        type="button"
                        onClick={() => handleSelectSuggestedRoom(sRoom)}
                        className="p-2.5 bg-white border border-rose-200 hover:border-blue-400 rounded-xl text-left transition flex items-center justify-between group shadow-sm"
                      >
                        <div>
                          <p className="text-xs font-bold text-slate-800 group-hover:text-blue-600">
                            {sRoom.name}
                          </p>
                          <p className="text-[10px] text-slate-500">
                            ความจุ {sRoom.capacity} คน • {sRoom.building}
                          </p>
                        </div>
                        <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-blue-600" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Alternative Available Slots on Same Day */}
              {conflictData.suggestedSlots && conflictData.suggestedSlots.length > 0 && (
                <div className="pt-2 border-t border-rose-200/80">
                  <p className="text-xs font-semibold text-rose-800 mb-1.5 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-blue-600" />
                    ช่วงเวลาอื่นที่ห้องเดิมว่างในวันเดียวกัน:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {conflictData.suggestedSlots.map((slot: any, idx: number) => {
                      const s = new Date(slot.startTime).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' });
                      const e = new Date(slot.endTime).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' });
                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handleSelectSuggestedSlot(slot)}
                          className="px-2.5 py-1 bg-white border border-rose-200 hover:border-blue-500 rounded-lg text-xs font-semibold text-slate-700 hover:text-blue-600 shadow-sm"
                        >
                          {s} - {e}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {conflictData && !conflictData.hasConflict && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>ห้องประชุมว่างและพร้อมใช้งานสำหรับช่วงเวลานี้</span>
            </div>
          )}

          {/* Participants Count and Organizer */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                จำนวนผู้เข้าร่วม (คน) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                min={1}
                max={selectedRoom.capacity}
                required
                value={participantsCount}
                onChange={(e) => setParticipantsCount(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
              {participantsCount > selectedRoom.capacity && (
                <p className="text-[11px] text-rose-500 mt-1">
                  จำนวนคนเกินความจุห้องที่รองรับได้ ({selectedRoom.capacity} คน)
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                ผู้จัดประชุม / ผู้ติดต่อ
              </label>
              <input
                type="text"
                placeholder="ชื่อ-นามสกุล หรือเบอร์โทรติดต่อ"
                value={organizerName}
                onChange={(e) => setOrganizerName(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              รายละเอียดเพิ่มเติม / วาระการประชุม
            </label>
            <textarea
              rows={2}
              placeholder="ระบุวัตถุประสงค์หรือข้อมูลที่ต้องการแจ้งให้ผู้เข้าร่วมทราบ..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          {/* Equipment Requested */}
          {selectedRoom.equipment && selectedRoom.equipment.length > 0 && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-2">
                อุปกรณ์ที่ต้องการใช้งานในห้อง
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {selectedRoom.equipment.map((item) => {
                  const isChecked = selectedEquipmentIds.includes(item.equipmentId);
                  return (
                    <label
                      key={item.id}
                      className={`flex items-center gap-2.5 p-2.5 rounded-xl border text-xs cursor-pointer transition ${
                        isChecked
                          ? 'bg-blue-50/70 border-blue-300 text-blue-900'
                          : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedEquipmentIds([...selectedEquipmentIds, item.equipmentId]);
                          } else {
                            setSelectedEquipmentIds(
                              selectedEquipmentIds.filter((id) => id !== item.equipmentId)
                            );
                          }
                        }}
                        className="rounded text-blue-600 focus:ring-blue-500"
                      />
                      <span>{item.equipment.name}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          )}

          {/* Participants List */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-slate-700">
                รายชื่อผู้เข้าร่วมประชุม (ทางเลือก)
              </label>
              <button
                type="button"
                onClick={handleAddParticipant}
                className="text-xs text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                เพิ่มผู้เข้าร่วม
              </button>
            </div>
            <div className="space-y-2">
              {participants.map((p, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder={`ผู้เข้าร่วมคนที่ ${idx + 1} (ชื่อ หรือ อีเมล)`}
                    value={p}
                    onChange={(e) => handleUpdateParticipant(idx, e.target.value)}
                    className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                  {participants.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveParticipant(idx)}
                      className="p-2 text-slate-400 hover:text-rose-500 transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </form>

        {/* Modal Footer */}
        <div className="p-4 sm:p-6 border-t border-slate-100 bg-slate-50/70 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 text-xs sm:text-sm font-semibold text-slate-600 hover:bg-slate-200 rounded-xl transition"
          >
            ยกเลิก
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || conflictData?.hasConflict || isCheckingConflict}
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white text-xs sm:text-sm font-semibold rounded-xl shadow-lg shadow-blue-600/20 transition disabled:opacity-50 flex items-center gap-2"
          >
            {isSubmitting ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              'ยืนยันการจองห้อง'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
