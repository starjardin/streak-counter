"use client";

import dayjs from "dayjs";
import { useState } from "react";

interface MiniMonthCalendarProps {
  datesWithEntries: string[];
  selectedDate: string;
  onSelectDate: (date: string) => void;
}

const DAY_LABELS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

export const MiniMonthCalendar = ({
  datesWithEntries,
  selectedDate,
  onSelectDate,
}: MiniMonthCalendarProps) => {
  const today = dayjs();
  const [viewMonth, setViewMonth] = useState(dayjs().date(1));

  const entriesSet = new Set(datesWithEntries);

  const firstDay = viewMonth.day();
  const daysInMonth = viewMonth.daysInMonth();

  const prevMonth = () => setViewMonth((m) => m.subtract(1, "month"));
  const nextMonth = () => setViewMonth((m) => m.add(1, "month"));

  const canGoNext = viewMonth.isBefore(today.startOf("month"));

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-3">
        <button
          onClick={prevMonth}
          className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <span className="text-sm font-semibold text-gray-700">
          {viewMonth.format("MMMM YYYY")}
        </span>
        <button
          onClick={nextMonth}
          disabled={!canGoNext}
          className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      <div className="grid grid-cols-7 gap-0 mb-1">
        {DAY_LABELS.map((d) => (
          <div
            key={d}
            className="text-center text-[10px] font-medium text-gray-400 py-1"
          >
            {d}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-0">
        {Array.from({ length: firstDay }, (_, i) => (
          <div key={`pad-${i}`} />
        ))}
        {Array.from({ length: daysInMonth }, (_, i) => {
          const date = viewMonth.date(i + 1);
          const dateStr = date.format("YYYY-MM-DD");
          const hasEntries = entriesSet.has(dateStr);
          const isSelected = dateStr === selectedDate;
          const isToday = dateStr === today.format("YYYY-MM-DD");
          const isFuture = date.isAfter(today, "day");

          return (
            <button
              key={dateStr}
              onClick={() => !isFuture && onSelectDate(dateStr)}
              disabled={isFuture}
              className={[
                "relative text-center text-xs py-1 rounded-md transition-colors",
                isSelected
                  ? "bg-blue-600 text-white font-semibold"
                  : isToday && !isSelected
                    ? "text-blue-600 font-semibold"
                    : "text-gray-700 hover:bg-gray-100",
                isFuture ? "text-gray-300 cursor-not-allowed" : "cursor-pointer",
              ].join(" ")}
            >
              {i + 1}
              {hasEntries && !isSelected && (
                <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-blue-400" />
              )}
              {hasEntries && isSelected && (
                <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-white" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
