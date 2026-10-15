/**
 * Date utilities for SmartFit Workout Tracker.
 * Ensures local timezone dates are preserved and avoids UTC-shift bugs where 
 * new Date().toISOString().split('T')[0] jumps to the next day in evening hours (e.g. UTC-6).
 */

export const getLocalDateString = (d: Date | string | number = new Date()): string => {
  const dateObj = typeof d === 'string' || typeof d === 'number' ? new Date(d) : d;
  if (isNaN(dateObj.getTime())) return '';
  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const day = String(dateObj.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const formatLocalDisplayDate = (d: Date | string | number): string => {
  try {
    const dateObj = typeof d === 'string' || typeof d === 'number' ? new Date(d) : d;
    if (isNaN(dateObj.getTime())) return String(d);
    return dateObj.toLocaleDateString('es-MX', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch {
    return String(d);
  }
};
