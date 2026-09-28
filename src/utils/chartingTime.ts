/**
 * Indian Railways (CRIS / IRCTC) Reservation Charting Time Heuristic
 * 
 * Official CRIS PRS Business Logic:
 * 1. Trains departing between 00:01 and 14:00 (Morning & Mid-Day trains):
 *    - 1st Chart is prepared the PREVIOUS EVENING at 20:00 (8:00 PM).
 * 2. Trains departing from 14:00 to 23:59 (Afternoon, Evening & Night trains):
 *    - 1st Chart is prepared approximately 4 HOURS prior to scheduled departure.
 * 3. 2nd and Final Chart is prepared ~30 minutes before train departure.
 * 4. Current Booking window opens immediately after the 1st Chart is finalized and
 *    remains open until 2nd Charting / train departure.
 */

export interface ChartingCountdownResult {
  chartingDate: Date;
  departureDate: Date;
  status: 'PENDING_CHART' | 'CURRENT_BOOKING_LIVE' | 'DEPARTED';
  timeRemainingMs: number;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  formattedCountdown: string;
  heuristicExplanation: string;
  chartTimeFormatted: string;
  departureFormatted: string;
  isToday: boolean;
  progressPercent: number;
}

/**
 * Calculates the estimated 1st charting date and time based on train departure time and journey date.
 */
export function calculateEstimatedChartingTime(journeyDateStr: string, departureTimeStr?: string): {
  chartingDate: Date;
  departureDate: Date;
  heuristic: string;
} {
  // Normalize departure time (default to 18:00 if unknown)
  const timeClean = (departureTimeStr || '18:00').trim();
  const [hourStr, minStr] = timeClean.split(':');
  const depHour = parseInt(hourStr || '18', 10);
  const depMin = parseInt(minStr || '00', 10);

  // Normalize journey date (YYYY-MM-DD)
  const [yearStr, monthStr, dayStr] = journeyDateStr.split('-');
  const year = parseInt(yearStr, 10);
  const month = parseInt(monthStr, 10) - 1; // 0-indexed
  const day = parseInt(dayStr, 10);

  // Scheduled departure timestamp
  const departureDate = new Date(year, month, day, depHour, depMin, 0, 0);

  let chartingDate: Date;
  let heuristic: string;

  if (depHour < 14) {
    // Departure is before 14:00 -> 1st chart prepared at 20:00 (8 PM) the previous evening
    chartingDate = new Date(year, month, day - 1, 20, 0, 0, 0);
    heuristic = `Morning train (Dep ${timeClean} < 14:00): 1st Chart prepared at 20:00 (prev evening)`;
  } else {
    // Departure is 14:00 or later -> 1st chart prepared 4 hours prior to departure
    chartingDate = new Date(departureDate.getTime() - 4 * 60 * 60 * 1000);
    heuristic = `Afternoon/Evening train (Dep ${timeClean} ≥ 14:00): 1st Chart prepared 4 hrs prior to departure`;
  }

  return { chartingDate, departureDate, heuristic };
}

/**
 * Calculates live countdown, remaining duration, and active current booking status.
 */
export function getChartingCountdown(
  journeyDateStr: string,
  departureTimeStr?: string,
  nowDate: Date = new Date()
): ChartingCountdownResult {
  const { chartingDate, departureDate, heuristic } = calculateEstimatedChartingTime(
    journeyDateStr,
    departureTimeStr
  );

  const nowMs = nowDate.getTime();
  const chartMs = chartingDate.getTime();
  const depMs = departureDate.getTime();

  const isToday =
    nowDate.getFullYear() === departureDate.getFullYear() &&
    nowDate.getMonth() === departureDate.getMonth() &&
    nowDate.getDate() === departureDate.getDate();

  // Date formatting helpers
  const formatDateTime = (d: Date): string => {
    const isSameDate =
      d.getFullYear() === nowDate.getFullYear() &&
      d.getMonth() === nowDate.getMonth() &&
      d.getDate() === nowDate.getDate();

    const timeStr = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    if (isSameDate) {
      return `Today at ${timeStr}`;
    }
    const dayStr = d.toLocaleDateString([], { day: 'numeric', month: 'short' });
    return `${dayStr} at ${timeStr}`;
  };

  const chartTimeFormatted = formatDateTime(chartingDate);
  const departureFormatted = formatDateTime(departureDate);

  if (nowMs >= depMs) {
    return {
      chartingDate,
      departureDate,
      status: 'DEPARTED',
      timeRemainingMs: 0,
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      formattedCountdown: 'Train Departed',
      heuristicExplanation: heuristic,
      chartTimeFormatted,
      departureFormatted,
      isToday,
      progressPercent: 100
    };
  }

  if (nowMs >= chartMs) {
    // Chart has been prepared! Current booking window is live until departure
    const msUntilDep = depMs - nowMs;
    const depSec = Math.floor(msUntilDep / 1000);
    const depH = Math.floor(depSec / 3600);
    const depM = Math.floor((depSec % 3600) / 60);
    const depS = depSec % 60;

    const totalWindowMs = depMs - chartMs;
    const elapsedSinceChart = nowMs - chartMs;
    const progressPercent = Math.min(100, Math.max(0, Math.round((elapsedSinceChart / totalWindowMs) * 100)));

    return {
      chartingDate,
      departureDate,
      status: 'CURRENT_BOOKING_LIVE',
      timeRemainingMs: msUntilDep,
      days: 0,
      hours: depH,
      minutes: depM,
      seconds: depS,
      formattedCountdown: `${String(depH).padStart(2, '0')}h ${String(depM).padStart(2, '0')}m ${String(depS).padStart(2, '0')}s to departure`,
      heuristicExplanation: heuristic,
      chartTimeFormatted,
      departureFormatted,
      isToday,
      progressPercent
    };
  }

  // Pending chart preparation: Count down to charting time
  const diffMs = chartMs - nowMs;
  const totalSeconds = Math.floor(diffMs / 1000);

  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  let formattedCountdown = '';
  if (days > 0) {
    formattedCountdown = `${days}d ${String(hours).padStart(2, '0')}h ${String(minutes).padStart(2, '0')}m ${String(seconds).padStart(2, '0')}s`;
  } else {
    formattedCountdown = `${String(hours).padStart(2, '0')}h ${String(minutes).padStart(2, '0')}m ${String(seconds).padStart(2, '0')}s`;
  }

  // Progress relative to last 24 hours
  const window24hMs = 24 * 60 * 60 * 1000;
  const elapsedIn24h = Math.max(0, window24hMs - diffMs);
  const progressPercent = Math.min(95, Math.max(5, Math.round((elapsedIn24h / window24hMs) * 100)));

  return {
    chartingDate,
    departureDate,
    status: 'PENDING_CHART',
    timeRemainingMs: diffMs,
    days,
    hours,
    minutes,
    seconds,
    formattedCountdown,
    heuristicExplanation: heuristic,
    chartTimeFormatted,
    departureFormatted,
    isToday,
    progressPercent
  };
}
