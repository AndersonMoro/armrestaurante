import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function normalizeBrazilianWhatsAppNumber(value: string | null | undefined): string {
  const digits = (value || "").replace(/\D/g, "");

  if (!digits) return "";
  if (digits.startsWith("55")) return digits;
  if (digits.length === 10 || digits.length === 11) return `55${digits}`;

  return digits;
}

export function buildWhatsAppUrl(phone: string | null | undefined, message: string): string {
  const normalizedPhone = normalizeBrazilianWhatsAppNumber(phone);
  const encodedMessage = encodeURIComponent(message);

  return `https://wa.me/${normalizedPhone}?text=${encodedMessage}`;
}

/**
 * Converte URLs do Google Drive para URLs de visualização direta
 */
export function convertGoogleDriveUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  
  // Já é uma URL de visualização direta
  if (url.includes('drive.google.com/uc?')) {
    return url;
  }
  
  // Formato: /file/d/{ID}/view
  const fileMatch = url.match(/drive\.google\.com\/file\/d\/([^/]+)/);
  if (fileMatch) {
    return `https://drive.google.com/uc?export=view&id=${fileMatch[1]}`;
  }
  
  // Formato: open?id={ID}
  const openMatch = url.match(/drive\.google\.com\/open\?id=([^&]+)/);
  if (openMatch) {
    return `https://drive.google.com/uc?export=view&id=${openMatch[1]}`;
  }
  
  // Não é URL do Google Drive, retorna original
  return url;
}
