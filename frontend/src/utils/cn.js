import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Utility to merge class names with Tailwind support (if Tailwind is used)
 * or just clean class merging.
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}
