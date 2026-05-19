import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";

dayjs.extend(utc);

type formatDateProps = {
  date: Date | string | null;
  timeOnly?: boolean; // return only time
  utcTime?: boolean; // Back-end send time that already in UTC+7
  format?:
    | "DD/MM/YY"
    | "DD/MM/YYYY"
    | "HH:mm:ss"
    | "HH:mm"
    | "DD/MM/YY HH:mm"
    | "DD/MM/YY HH:mm:ss"
    | "DD/MM/YYYY HH:mm"
    | "DD/MM/YYYY HH:mm:ss"
    | "DD/MMM/YYYY HH:mm:ss";
};

// Example:
// formatDate({ date, format:'DD/MMM/YYYY HH:mm:ss' })
export const formatDate = ({
  date,
  timeOnly = false,
  utcTime = false,
  format = "DD/MM/YY",
}: formatDateProps): string => {
  const timeFormat =
    format === "HH:mm" || format === "HH:mm:ss" ? format : "HH:mm:ss";
  const formatter = utcTime ? dayjs(date).utc() : dayjs(date);

  if (timeOnly) {
    return formatter.format(timeFormat);
  }

  return formatter.format(format);
};

// >> Date Payload <<
type formatDatePayloadProps = {
  date: Date | string | null;
  format?: "ISO" | null;
  hasSeconds?: boolean;
  hasMilliseconds?: boolean;
};

// Example:
// formatDatePayload({date, format:'ISO'})

// By default, it will return the date in ISO format with seconds but no milliseconds such as 2025-12-31T03:00:00Z
// you can use props hasSeconds to turn on-off seconds
// you can use props hasMilliseconds to turn on-off milliseconds
export function formatDatePayload({
  date,
  format = "ISO",
  hasSeconds = true,
  hasMilliseconds = false,
}: formatDatePayloadProps): string {
  if (!date) return "";
  const originalDate = typeof date === "string" ? new Date(date) : date;

  originalDate.setSeconds(0, 0);
  originalDate.setMilliseconds(0);

  if (format === "ISO") {
    const iso = originalDate.toISOString();

    if (!hasSeconds) {
      return iso.replace(/:\d{2}(?:\.\d{3})?Z$/, "Z");
    }

    return hasMilliseconds ? iso : iso.replace(/\.\d{3}Z$/, "Z");
  }
  return originalDate.toUTCString();
}
