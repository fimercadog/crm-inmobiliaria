// new Date("2026-10-05") parses date-only strings as UTC midnight (per spec),
// which shifts to the previous day when formatted in a UTC-negative timezone.
// Parsing the parts directly into the local Date constructor avoids that.
export function parseDateOnly(value: string): Date {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
}
