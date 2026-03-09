'use client';

import React, { useState } from 'react';

interface CalendarEvent {
  id: string;
  date: string; // YYYY-MM-DD
  title: string;
  color: string;
}

const COLORS = ['#0078d4', '#e91e63', '#4caf50', '#ff9800', '#9c27b0', '#00bcd4'];

function loadCalendarEvents(): CalendarEvent[] {
  if (typeof window === 'undefined') return [];
  const saved = localStorage.getItem('sko-calendar-events');
  return saved ? JSON.parse(saved) : [];
}

export default function CalendarApp() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>(loadCalendarEvents);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [newEventTitle, setNewEventTitle] = useState('');

  const saveEvents = (evts: CalendarEvent[]) => {
    setEvents(evts);
    localStorage.setItem('sko-calendar-events', JSON.stringify(evts));
  };

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  const days: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) days.push(null);
  for (let i = 1; i <= daysInMonth; i++) days.push(i);

  const formatDateKey = (day: number) =>
    `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

  const getEventsForDate = (dateStr: string) =>
    events.filter((e) => e.date === dateStr);

  const addEvent = () => {
    if (!selectedDate || !newEventTitle.trim()) return;
    const newEvent: CalendarEvent = {
      id: Date.now().toString(),
      date: selectedDate,
      title: newEventTitle.trim(),
      color: COLORS[events.length % COLORS.length],
    };
    saveEvents([...events, newEvent]);
    setNewEventTitle('');
  };

  const deleteEvent = (id: string) => {
    saveEvents(events.filter((e) => e.id !== id));
  };

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const monthName = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/8">
        <button onClick={prevMonth} className="text-white/50 hover:text-white transition-colors px-2">
          ‹
        </button>
        <h2 className="text-sm font-medium text-white/80">{monthName}</h2>
        <button onClick={nextMonth} className="text-white/50 hover:text-white transition-colors px-2">
          ›
        </button>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Calendar grid */}
        <div className="flex-1 p-3">
          {/* Day headers */}
          <div className="grid grid-cols-7 gap-px mb-1">
            {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((d) => (
              <div key={d} className="text-center text-[10px] text-white/30 py-1">
                {d}
              </div>
            ))}
          </div>

          {/* Days */}
          <div className="grid grid-cols-7 gap-px">
            {days.map((day, i) => {
              if (day === null)
                return <div key={`empty-${i}`} className="aspect-square" />;

              const dateStr = formatDateKey(day);
              const dayEvents = getEventsForDate(dateStr);
              const isToday = dateStr === todayStr;
              const isSelected = dateStr === selectedDate;

              return (
                <button
                  key={dateStr}
                  onClick={() => setSelectedDate(dateStr)}
                  className={`aspect-square flex flex-col items-center justify-start p-0.5 rounded-md text-xs transition-colors relative ${
                    isSelected
                      ? 'bg-[#0078d4] text-white'
                      : isToday
                      ? 'bg-white/10 text-white'
                      : 'hover:bg-white/5 text-white/60'
                  }`}
                >
                  <span className={`text-[11px] ${isToday && !isSelected ? 'font-bold text-[#0078d4]' : ''}`}>
                    {day}
                  </span>
                  {dayEvents.length > 0 && (
                    <div className="flex gap-0.5 mt-0.5">
                      {dayEvents.slice(0, 3).map((e) => (
                        <span
                          key={e.id}
                          className="w-1 h-1 rounded-full"
                          style={{ backgroundColor: e.color }}
                        />
                      ))}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Event panel */}
        {selectedDate && (
          <div className="w-48 border-l border-white/8 p-3 flex flex-col gap-2 overflow-y-auto">
            <h3 className="text-xs text-white/50 font-medium">
              {new Date(selectedDate + 'T00:00').toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
              })}
            </h3>

            {/* Events list */}
            {getEventsForDate(selectedDate).map((evt) => (
              <div
                key={evt.id}
                className="flex items-center gap-2 px-2 py-1 rounded bg-white/5 group"
              >
                <span
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ backgroundColor: evt.color }}
                />
                <span className="text-xs text-white/70 flex-1 truncate">
                  {evt.title}
                </span>
                <button
                  onClick={() => deleteEvent(evt.id)}
                  className="text-white/0 group-hover:text-white/30 hover:!text-red-400 transition-colors text-sm"
                >
                  ×
                </button>
              </div>
            ))}

            {/* Add event */}
            <div className="flex gap-1 mt-1">
              <input
                type="text"
                value={newEventTitle}
                onChange={(e) => setNewEventTitle(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addEvent()}
                placeholder="Add event"
                className="flex-1 text-xs !py-1 !px-2"
                maxLength={100}
              />
              <button
                onClick={addEvent}
                className="px-2 py-1 bg-[#0078d4] hover:bg-[#1a86d9] rounded text-xs text-white transition-colors"
              >
                +
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
