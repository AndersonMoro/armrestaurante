import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
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
