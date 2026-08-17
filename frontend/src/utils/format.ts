/**
 * CampusMate Formatting & DateTime Utilities (India / IST / ₹)
 */

/**
 * Formats monetary amounts in Indian Rupees (₹)
 * Example: 40 -> "₹40", 4.5 -> "₹4.50", "40.00" -> "₹40"
 */
export function formatCurrency(amount: number | string | undefined | null): string {
  if (amount === undefined || amount === null || amount === "") return "₹0";
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  if (isNaN(num)) return "₹0";
  
  if (Number.isInteger(num)) {
    return `₹${num}`;
  }
  return `₹${num.toFixed(2)}`;
}

/**
 * Extracts a wall-clock Date or parts from an ISO/LocalDateTime string without timezone shifting.
 * Supports "2026-08-16T08:30:00", "2026-08-16T08:30:00.000Z", or "08:30".
 */
export function parseLocalTimeParts(input?: string | Date | null): {
  year: number;
  month: number; // 0-indexed
  day: number;
  hours: number; // 0-23
  minutes: number;
} | null {
  if (!input) return null;

  if (input instanceof Date) {
    return {
      year: input.getFullYear(),
      month: input.getMonth(),
      day: input.getDate(),
      hours: input.getHours(),
      minutes: input.getMinutes(),
    };
  }

  if (typeof input === "string") {
    // Check if it's just "HH:mm" or "HH:mm:ss"
    if (/^\d{1,2}:\d{2}(:\d{2})?$/.test(input.trim())) {
      const [h, m] = input.trim().split(":").map(Number);
      const now = new Date();
      return {
        year: now.getFullYear(),
        month: now.getMonth(),
        day: now.getDate(),
        hours: h,
        minutes: m,
      };
    }

    // Match "YYYY-MM-DDTHH:mm(:ss)?"
    const match = input.match(/^(\d{4})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2})/);
    if (match) {
      return {
        year: parseInt(match[1], 10),
        month: parseInt(match[2], 10) - 1,
        day: parseInt(match[3], 10),
        hours: parseInt(match[4], 10),
        minutes: parseInt(match[5], 10),
      };
    }

    // Fallback standard Date parsing
    const d = new Date(input);
    if (!isNaN(d.getTime())) {
      return {
        year: d.getFullYear(),
        month: d.getMonth(),
        day: d.getDate(),
        hours: d.getHours(),
        minutes: d.getMinutes(),
      };
    }
  }

  return null;
}

/**
 * Formats time in clear 12-hour format with AM/PM (e.g. "8:30 AM", "4:00 PM")
 */
export function formatTime(input?: string | Date | null): string {
  const parts = parseLocalTimeParts(input);
  if (!parts) return "--:--";

  const { hours, minutes } = parts;
  const period = hours >= 12 ? "PM" : "AM";
  const displayHours = hours % 12 === 0 ? 12 : hours % 12;
  const displayMinutes = minutes < 10 ? `0${minutes}` : `${minutes}`;

  return `${displayHours}:${displayMinutes} ${period}`;
}

/**
 * Formats date as "Today", "Tomorrow", or "Sat, Aug 15"
 */
export function formatDate(input?: string | Date | null): string {
  const parts = parseLocalTimeParts(input);
  if (!parts) return "";

  const target = new Date(parts.year, parts.month, parts.day);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);

  if (target.getTime() === today.getTime()) {
    return "Today";
  }
  if (target.getTime() === tomorrow.getTime()) {
    return "Tomorrow";
  }

  return target.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

/**
 * Formats combined date and time: "Sat, Aug 15 · 8:30 AM" or "Tomorrow · 8:30 AM"
 */
export function formatDateTime(input?: string | Date | null): string {
  if (!input) return "";
  const d = formatDate(input);
  const t = formatTime(input);
  return `${d} · ${t}`;
}

/**
 * Combines local date "YYYY-MM-DD" and time "HH:mm" into a local ISO string "YYYY-MM-DDTHH:mm:ss"
 * Prevents UTC conversion skew during API requests.
 */
export function toLocalDateTimeString(dateStr: string, timeStr: string): string {
  const cleanDate = dateStr.trim();
  let cleanTime = timeStr.trim();
  if (cleanTime.length === 5) {
    cleanTime = `${cleanTime}:00`;
  }
  return `${cleanDate}T${cleanTime}`;
}

/**
 * Adds minutes to a "YYYY-MM-DDTHH:mm:ss" string without timezone conversions.
 */
export function addMinutesToLocalDateTime(isoString: string, minutesToAdd: number): string {
  const parts = parseLocalTimeParts(isoString);
  if (!parts) return isoString;

  const d = new Date(parts.year, parts.month, parts.day, parts.hours, parts.minutes + minutesToAdd);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const h = String(d.getHours()).padStart(2, "0");
  const min = String(d.getMinutes()).padStart(2, "0");
  const s = "00";

  return `${y}-${m}-${day}T${h}:${min}:${s}`;
}
