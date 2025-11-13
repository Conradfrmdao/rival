import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, currency = 'UGX'): string {
  return new Intl.NumberFormat('en-UG', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatPhoneNumber(phone: string): string {
  // Clean the phone number
  const cleaned = phone.replace(/\D/g, '');

  // If it doesn't start with country code, add Uganda's country code
  if (cleaned.length === 10 && cleaned.startsWith('0')) {
    return `+256${cleaned.slice(1)}`;
  }

  // If it starts with 256 but no +, add +
  if (cleaned.length === 12 && cleaned.startsWith('256')) {
    return `+${cleaned}`;
  }

  // Return as-is if it already has +
  if (phone.startsWith('+')) {
    return phone;
  }

  return `+256${cleaned}`;
}

export function validatePhoneNumber(phone: string): boolean {
  const formatted = formatPhoneNumber(phone);
  const phoneRegex = /^\+256[7]\d{8}$/;
  return phoneRegex.test(formatted);
}

export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}