// formatDuration.js
// Convert minutes to "Hh Mm", e.g. 65 -> "1h 5m", 120 -> "2h 0m"
export function formatDuration(totalMinutes) {
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  return `${h}h ${m}m`;
}
