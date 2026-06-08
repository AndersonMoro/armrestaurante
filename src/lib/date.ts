import { format, parse } from "date-fns";
import { ptBR } from "date-fns/locale";

export function formatDateDisplay(dateString: string): string {
  try {
    const date = parse(dateString, "yyyy-MM-dd", new Date());
    return format(date, "dd/MM/yyyy", { locale: ptBR });
  } catch {
    return dateString;
  }
}

export function formatDateStorage(date: Date): string {
  return format(date, "yyyy-MM-dd");
}

export function getBrazilTodayStorage(): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Sao_Paulo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());

  const year = parts.find((part) => part.type === "year")?.value;
  const month = parts.find((part) => part.type === "month")?.value;
  const day = parts.find((part) => part.type === "day")?.value;

  return `${year}-${month}-${day}`;
}

export function getBrazilTodayDate(): Date {
  const [year, month, day] = getBrazilTodayStorage().split("-").map(Number);
  return new Date(year, month - 1, day);
}

export function getBrazilTimeStorage(): string {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "America/Sao_Paulo",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(new Date());

  const hour = parts.find((part) => part.type === "hour")?.value;
  const minute = parts.find((part) => part.type === "minute")?.value;

  return `${hour}:${minute}`;
}
