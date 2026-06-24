"use client";

import { useState, useCallback } from "react";
import dayjs from "dayjs";
import { MiniMonthCalendar } from "./MiniMonthCalendar";
import { DayEntries } from "./DayEntries";
import { JournalEditor } from "./JournalEditor";
import { getEntriesForDateAction } from "@/app/actions/journal";
import { Button } from "@/components/Button";

interface Entry {
  id: string;
  title: string | null;
  body: string;
  created_at: string;
}

interface JournalPageProps {
  datesWithEntries: string[];
  todayEntries: Entry[];
}

export const JournalPage = ({
  datesWithEntries: initialDates,
  todayEntries,
}: JournalPageProps) => {
  const today = dayjs().format("YYYY-MM-DD");
  const [selectedDate, setSelectedDate] = useState(today);
  const [entries, setEntries] = useState<Entry[]>(todayEntries);
  const [datesWithEntries, setDatesWithEntries] = useState(initialDates);
  const [showEditor, setShowEditor] = useState(false);
  const [loading, setLoading] = useState(false);

  const fetchEntries = useCallback(async (date: string) => {
    setLoading(true);
    const result = await getEntriesForDateAction(date);
    setEntries(result);
    setLoading(false);
  }, []);

  const handleSelectDate = async (date: string) => {
    setSelectedDate(date);
    setShowEditor(false);
    if (date !== today) {
      await fetchEntries(date);
    } else {
      setEntries(todayEntries);
    }
  };

  const handleDone = () => {
    setShowEditor(false);
    fetchEntries(selectedDate);
    setDatesWithEntries((prev) =>
      prev.includes(selectedDate) ? prev : [...prev, selectedDate],
    );
  };

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Journal</h2>
          <p className="text-sm text-gray-500 mt-1">
            Write and browse your daily entries
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <MiniMonthCalendar
            datesWithEntries={datesWithEntries}
            selectedDate={selectedDate}
            onSelectDate={handleSelectDate}
          />
        </div>

        <div className="lg:col-span-2">
          {showEditor ? (
            <JournalEditor
              date={selectedDate}
              onDone={handleDone}
            />
          ) : (
            <>
              <DayEntries
                date={selectedDate}
                entries={entries}
                onRefetch={() => fetchEntries(selectedDate)}
              />

              <div className="mt-4">
                <Button
                  type="button"
                  onClick={() => setShowEditor(true)}
                  disabled={loading}
                  className="w-full py-3 text-sm font-medium text-white bg-amber-600 rounded-xl hover:bg-amber-700 transition-colors shadow-sm disabled:opacity-60"
                >
                  {loading ? "Loading…" : "✍ New Entry"}
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
