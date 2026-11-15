import { TComplaintCategory } from "@/modules/complaints/types";

export { cn } from "cn";

export const formatComplaintCategory = (
  complaintCategory: TComplaintCategory,
) => {
  return complaintCategory.toUpperCase().split("_").join(" ");
};

/**
 * Formats a 24-hour time string (e.g. "14:00", "09:30", "10:30")
 * into a friendly 12-hour format with AM or PM (e.g. "2:00 PM", "9:30 AM", "10:30 AM").
 */
export function formatTime(timeStr: string): string {
  if (!timeStr) return "";

  // Return unchanged if already has AM or PM
  if (timeStr.includes("AM") || timeStr.includes("PM")) {
    return timeStr.trim();
  }

  const [hoursStr, minutesStr] = timeStr.split(":");
  let hours = parseInt(hoursStr, 10);
  const minutes = minutesStr ? minutesStr.padStart(2, "0") : "00";

  if (isNaN(hours)) return timeStr;

  const period = hours >= 12 ? "PM" : "AM";
  hours = hours % 12;
  if (hours === 0) hours = 12; // 00:00 -> 12:00 AM, 12:00 -> 12:00 PM

  return `${hours}:${minutes} ${period}`;
}

export type MeetingTabStatus = "upcoming" | "live" | "past";

/**
 * Helper to parse date string (YYYY-MM-DD) and time string (HH:mm) into a JavaScript Date object.
 */
export function parseMeetingDateTime(dateStr: string, timeStr: string): Date | null {
  if (!dateStr || !timeStr) return null;

  let hours = 0;
  let minutes = 0;

  if (timeStr.includes("AM") || timeStr.includes("PM")) {
    const isPM = timeStr.includes("PM");
    const clean = timeStr.replace(/AM|PM/gi, "").trim();
    const parts = clean.split(":");
    hours = parseInt(parts[0], 10);
    minutes = parseInt(parts[1], 10) || 0;
    if (isPM && hours < 12) hours += 12;
    if (!isPM && hours === 12) hours = 0;
  } else {
    const parts = timeStr.split(":");
    hours = parseInt(parts[0], 10);
    minutes = parseInt(parts[1], 10) || 0;
  }

  const dateParts = dateStr.split("-").map(Number);
  if (dateParts.length < 3) return null;

  return new Date(dateParts[0], dateParts[1] - 1, dateParts[2], hours, minutes, 0);
}

/**
 * Determines whether a meeting is "upcoming", "live", or "past".
 * - Live: current time is between start and end time.
 * - Upcoming: meeting has not started yet.
 * - Past: meeting end time has passed, or status is completed/cancelled.
 */
export function getMeetingStatus(
  dateStr: string,
  startTimeStr: string,
  endTimeStr: string,
  status?: string,
  now: Date = new Date()
): MeetingTabStatus {
  if (status === "completed" || status === "cancelled") {
    return "past";
  }

  const startDateTime = parseMeetingDateTime(dateStr, startTimeStr);
  const endDateTime = parseMeetingDateTime(dateStr, endTimeStr);

  if (!startDateTime || !endDateTime) {
    return "past";
  }

  if (now < startDateTime) {
    return "upcoming";
  }

  if (now >= startDateTime && now <= endDateTime) {
    return "live";
  }

  return "past";
}

/**
 * Returns a human-friendly timing label:
 * - For upcoming: "Starts in 2 hr 10 min", "Starts tomorrow", "Starts in 3 days"
 * - For live: "32 min remaining", "1 hr 10 min remaining", "1 min remaining"
 * - For past: "Meeting ended"
 */
export function getMeetingTimeLabel(
  dateStr: string,
  startTimeStr: string,
  endTimeStr: string,
  status?: string,
  now: Date = new Date()
): string {
  const currentStatus = getMeetingStatus(dateStr, startTimeStr, endTimeStr, status, now);

  if (currentStatus === "past") {
    return "Meeting ended";
  }

  const startDateTime = parseMeetingDateTime(dateStr, startTimeStr);
  const endDateTime = parseMeetingDateTime(dateStr, endTimeStr);

  if (!startDateTime || !endDateTime) {
    return "Meeting ended";
  }

  if (currentStatus === "live") {
    const diffMs = endDateTime.getTime() - now.getTime();
    const diffMins = Math.ceil(diffMs / (1000 * 60));

    if (diffMins <= 1) {
      return "1 min remaining";
    }
    if (diffMins < 60) {
      return `${diffMins} min remaining`;
    }
    const hrs = Math.floor(diffMins / 60);
    const remMins = diffMins % 60;
    return remMins > 0 ? `${hrs} hr ${remMins} min remaining` : `${hrs} hr remaining`;
  }

  // Upcoming timing
  const nowDateOnly = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startDateOnly = new Date(startDateTime.getFullYear(), startDateTime.getMonth(), startDateTime.getDate());
  const dayDiff = Math.round((startDateOnly.getTime() - nowDateOnly.getTime()) / (1000 * 60 * 60 * 24));

  if (dayDiff === 1) {
    return "Starts tomorrow";
  }
  if (dayDiff > 1) {
    return `Starts in ${dayDiff} days`;
  }

  // Same day upcoming meeting
  const diffMs = startDateTime.getTime() - now.getTime();
  const diffMins = Math.max(1, Math.round(diffMs / (1000 * 60)));

  if (diffMins < 60) {
    return `Starts in ${diffMins} min`;
  }
  const hrs = Math.floor(diffMins / 60);
  const remMins = diffMins % 60;
  return remMins > 0 ? `Starts in ${hrs} hr ${remMins} min` : `Starts in ${hrs} hr`;
}

/**
 * Backward compatible helper: checks if a meeting is upcoming or live (not past).
 */
export function isMeetingUpcoming(dateStr: string, endTimeStr: string, status?: string): boolean {
  if (status === "completed" || status === "cancelled") {
    return false;
  }
  const endDateTime = parseMeetingDateTime(dateStr, endTimeStr);
  if (!endDateTime) return false;
  return endDateTime > new Date();
}
