import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merges CSS class names dynamically using clsx and tailwind-merge.
 * @param {...import('clsx').ClassValue} inputs - Array of class names or conditional values
 * @returns {string} Merged class list string
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}
