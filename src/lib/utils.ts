import { clsx, type ClassValue } from 'clsx';

export function cn(...inputs: ClassValue[]) {
	return clsx(inputs);
}

export function currency(value: number) {
	return new Intl.NumberFormat('en-US', {
		style: 'currency',
		currency: 'USD',
		minimumFractionDigits: 0,
		maximumFractionDigits: 4,
	}).format(value);
}

export function formatDate(dateString: string) {
	return new Intl.DateTimeFormat('en-NG', {
		dateStyle: 'medium',
		timeStyle: 'short',
	}).format(new Date(dateString));
}
