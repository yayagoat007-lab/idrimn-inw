import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formats a number into Moroccan Dirham currency representation.
 * Format: "1 250,00 DH"
 */
export function formatCurrency(amount: number, _language?: string): string {
  const formatter = new Intl.NumberFormat("fr-MA", {
    style: "decimal",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  
  // Format the number and clean up whitespaces to ensure clean spacing
  const formatted = formatter.format(amount).replace(/\u202f/g, " ").replace(/\s/g, " ");
  return `${formatted} DH`;
}

/**
 * Formats a date string into readable format.
 * Format: "12 juil. 2026" or "12 Juillet 2026"
 */
export function formatDate(dateString: string | Date, language: 'fr' | 'darija' = 'fr'): string {
  const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
  if (isNaN(date.getTime())) return "";

  if (language === 'darija') {
    // Standard Darija latin formatting
    return date.toLocaleDateString('fr-MA', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  }

  return date.toLocaleDateString("fr-MA", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

/**
 * Generates a clean random unique identifier.
 */
export function generateId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}
