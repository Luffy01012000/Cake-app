"use client";

import React, { useState } from "react";
import { X, ChevronLeft, ChevronRight, Calendar as CalendarIcon, Check } from "lucide-react";

interface DatePickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate: string; // "YYYY-MM-DD"
  onSelectDate: (date: string) => void;
  title?: string;
}

export default function DatePickerModal({
  isOpen,
  onClose,
  selectedDate,
  onSelectDate,
  title = "Select Event Date",
}: DatePickerModalProps) {
  const initialDate = selectedDate ? new Date(selectedDate + "T00:00:00") : new Date();

  const [currentYear, setCurrentYear] = useState(initialDate.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(initialDate.getMonth()); // 0-indexed
  const [tempDate, setTempDate] = useState(selectedDate);

  // Sync internal state whenever modal opens or selectedDate changes
  React.useEffect(() => {
    if (isOpen) {
      const d = selectedDate ? new Date(selectedDate + "T00:00:00") : new Date();
      setCurrentYear(d.getFullYear());
      setCurrentMonth(d.getMonth());
      setTempDate(selectedDate);
    }
  }, [isOpen, selectedDate]);

  // Handle Escape key to close modal
  React.useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  const prevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const firstDayOfWeek = new Date(currentYear, currentMonth, 1).getDay();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

  const monthName = new Date(currentYear, currentMonth, 1).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  const handleDayClick = (day: number) => {
    const y = currentYear;
    const m = String(currentMonth + 1).padStart(2, "0");
    const d = String(day).padStart(2, "0");
    setTempDate(`${y}-${m}-${d}`);
  };

  const handleConfirm = () => {
    if (tempDate) {
      onSelectDate(tempDate);
    }
    onClose();
  };

  const handlePreset = (daysFromNow: number) => {
    const target = new Date();
    target.setDate(target.getDate() + daysFromNow);
    const y = target.getFullYear();
    const m = String(target.getMonth() + 1).padStart(2, "0");
    const d = String(target.getDate()).padStart(2, "0");
    const dateStr = `${y}-${m}-${d}`;
    setTempDate(dateStr);
    setCurrentYear(y);
    setCurrentMonth(target.getMonth());
  };

  const handleNextWeekend = () => {
    const target = new Date();
    const dayOfWeek = target.getDay();
    const daysUntilSaturday = (6 - dayOfWeek + 7) % 7 || 7;
    target.setDate(target.getDate() + daysUntilSaturday);
    const y = target.getFullYear();
    const m = String(target.getMonth() + 1).padStart(2, "0");
    const d = String(target.getDate()).padStart(2, "0");
    const dateStr = `${y}-${m}-${d}`;
    setTempDate(dateStr);
    setCurrentYear(y);
    setCurrentMonth(target.getMonth());
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/45 backdrop-blur-xs animate-fade-in cursor-pointer"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-[360px] bg-white rounded-[26px] p-6 shadow-2xl border border-black/5 cursor-default relative transition-all"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#f5f5f7]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#0071e3]/10 flex items-center justify-center text-[#0071e3]">
              <CalendarIcon className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-[16px] font-bold text-[#1d1d1f] tracking-tight leading-none">
                {title}
              </h3>
              <span className="text-[11px] text-[#707070] mt-0.5 block">
                {tempDate
                  ? new Date(tempDate + "T00:00:00").toLocaleDateString("en-US", {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })
                  : "Choose date"}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#f5f5f7] hover:bg-[#e8e8ed] flex items-center justify-center text-[#1d1d1f] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Month Navigation */}
        <div className="flex items-center justify-between py-1.5 mb-2">
          <button
            type="button"
            onClick={prevMonth}
            className="w-8 h-8 rounded-full hover:bg-[#f5f5f7] flex items-center justify-center text-[#707070] hover:text-[#1d1d1f] transition-colors cursor-pointer"
            aria-label="Previous month"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-[14px] font-bold text-[#1d1d1f]">
            {monthName}
          </span>
          <button
            type="button"
            onClick={nextMonth}
            className="w-8 h-8 rounded-full hover:bg-[#f5f5f7] flex items-center justify-center text-[#707070] hover:text-[#1d1d1f] transition-colors cursor-pointer"
            aria-label="Next month"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Days of week header */}
        <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-semibold text-[#707070] mb-1">
          <span>Su</span>
          <span>Mo</span>
          <span>Tu</span>
          <span>We</span>
          <span>Th</span>
          <span>Fr</span>
          <span>Sa</span>
        </div>

        {/* Days Grid */}
        <div className="grid grid-cols-7 gap-1 text-center mb-4">
          {Array.from({ length: firstDayOfWeek }).map((_, idx) => (
            <div key={`empty-${idx}`} className="w-9 h-9" />
          ))}

          {Array.from({ length: daysInMonth }).map((_, idx) => {
            const day = idx + 1;
            const y = currentYear;
            const m = String(currentMonth + 1).padStart(2, "0");
            const d = String(day).padStart(2, "0");
            const thisDateStr = `${y}-${m}-${d}`;
            const isSelected = tempDate === thisDateStr;

            return (
              <button
                key={day}
                type="button"
                onClick={() => handleDayClick(day)}
                className={`w-9 h-9 mx-auto rounded-full text-[13px] font-semibold flex items-center justify-center transition-all cursor-pointer ${
                  isSelected
                    ? "bg-[#0071e3] text-white shadow-sm"
                    : "text-[#1d1d1f] hover:bg-[#f5f5f7]"
                }`}
              >
                {day}
              </button>
            );
          })}
        </div>

        {/* Quick Presets */}
        <div className="flex items-center gap-2 pt-3 pb-4 border-t border-[#f5f5f7]">
          <button
            type="button"
            onClick={() => handlePreset(2)}
            className="flex-1 py-1.5 px-2 rounded-xl bg-[#f5f5f7] hover:bg-[#e8e8ed] text-[11px] font-semibold text-[#1d1d1f] transition-colors cursor-pointer text-center"
          >
            In 2 Days
          </button>
          <button
            type="button"
            onClick={() => handlePreset(4)}
            className="flex-1 py-1.5 px-2 rounded-xl bg-[#f5f5f7] hover:bg-[#e8e8ed] text-[11px] font-semibold text-[#1d1d1f] transition-colors cursor-pointer text-center"
          >
            In 4 Days
          </button>
          <button
            type="button"
            onClick={handleNextWeekend}
            className="flex-1 py-1.5 px-2 rounded-xl bg-[#f5f5f7] hover:bg-[#e8e8ed] text-[11px] font-semibold text-[#1d1d1f] transition-colors cursor-pointer text-center"
          >
            Saturday
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 rounded-full text-[13px] font-semibold text-[#707070] hover:bg-[#f5f5f7] transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className="flex-1 py-2.5 rounded-full text-[13px] font-semibold bg-[#0071e3] hover:bg-[#0077ed] text-white transition-colors cursor-pointer flex items-center justify-center gap-1 shadow-sm"
          >
            <Check className="w-4 h-4" />
            Apply Date
          </button>
        </div>
      </div>
    </div>
  );
}
