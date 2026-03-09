/**
 * Compute clock hand angles from a Date object.
 */
export function getHandAngles(date: Date) {
  const hours = date.getHours() % 12;
  const minutes = date.getMinutes();
  const seconds = date.getSeconds();
  const ms = date.getMilliseconds();

  // Hour hand: 360° / 12 = 30° per hour, +0.5° per minute
  const hourAngle = hours * 30 + minutes * 0.5;
  // Minute hand: 360° / 60 = 6° per minute, +0.1° per second
  const minuteAngle = minutes * 6 + seconds * 0.1;
  // Second hand continuous: 6° per second + fraction from ms
  const secondAngleContinuous = (seconds + ms / 1000) * 6;
  // Second hand ticking: snap to second
  const secondAngleTicking = seconds * 6;

  return {
    hourAngle,
    minuteAngle,
    secondAngleContinuous,
    secondAngleTicking,
  };
}

/**
 * Format time for digital display
 */
export function formatTime(date: Date, format: '12' | '24'): { time: string; period?: string } {
  const h = date.getHours();
  const m = date.getMinutes();
  const s = date.getSeconds();
  const pad = (n: number) => n.toString().padStart(2, '0');

  if (format === '12') {
    const hour12 = h % 12 || 12;
    const period = h >= 12 ? 'PM' : 'AM';
    return {
      time: `${hour12}:${pad(m)}:${pad(s)}`,
      period,
    };
  }
  return {
    time: `${pad(h)}:${pad(m)}:${pad(s)}`,
  };
}

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

export function formatDateParts(date: Date) {
  return {
    day: DAYS[date.getDay()],
    date: date.getDate(),
    month: MONTHS[date.getMonth()],
    year: date.getFullYear(),
  };
}

/**
 * Build a date string from visibility flags
 */
export function buildDateString(
  date: Date,
  show: { showDay: boolean; showDate: boolean; showMonth: boolean; showYear: boolean }
) {
  const parts = formatDateParts(date);
  const segments: string[] = [];
  if (show.showDay) segments.push(parts.day);
  if (show.showDate) segments.push(String(parts.date));
  if (show.showMonth) segments.push(parts.month);
  if (show.showYear) segments.push(String(parts.year));
  return segments.join(', ');
}
