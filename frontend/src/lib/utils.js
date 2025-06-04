import { clsx } from "clsx";
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

/**
 * Format a number as currency
 * @param {number} value - The value to format (in cents)
 * @param {string} [currencyCode='USD'] - The currency code
 * @returns {string} The formatted currency string
 */
export function formatCurrency(value, currencyCode = 'USD') {
  // Convert cents to dollars (if the value is in cents)
  const isLargeNumber = value > 1000;
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currencyCode,
    maximumFractionDigits: isLargeNumber ? 0 : 2,
    notation: isLargeNumber ? 'compact' : 'standard',
  }).format(value / 100);
}
