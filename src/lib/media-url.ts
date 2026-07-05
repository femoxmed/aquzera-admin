const DEFAULT_API_BASE_URL = 'https://aquzera-api.eu-west-2.elasticbeanstalk.com/api';

export const API_BASE_URL =
	(import.meta as ImportMeta & { env?: { VITE_API_BASE_URL?: string } }).env
		?.VITE_API_BASE_URL ?? DEFAULT_API_BASE_URL;

export const API_ORIGIN = API_BASE_URL.replace(/\/api\/?$/, '');

export function resolveMediaUrl(value?: string | null) {
	if (!value) return value;

	if (value.startsWith('blob:') || value.startsWith('data:')) return value;

	if (value.startsWith('/uploads/')) {
		return `${API_ORIGIN}${value}`;
	}

	if (value.startsWith('uploads/')) {
		return `${API_ORIGIN}/${value}`;
	}

	if (value.startsWith('aquzera-api.eu-west-2.elasticbeanstalk.com/uploads/')) {
		return `https://${value}`;
	}

	try {
		const url = new URL(value);

		if (
			(url.hostname === 'localhost' || url.hostname === '127.0.0.1') &&
			url.pathname.startsWith('/uploads/')
		) {
			return `${API_ORIGIN}${url.pathname}${url.search}${url.hash}`;
		}
	} catch {
		return value;
	}

	return value;
}

export function normalizeMediaUrls<T>(payload: T): T {
	if (Array.isArray(payload)) {
		return payload.map((item) => normalizeMediaUrls(item)) as T;
	}

	if (!payload || typeof payload !== 'object') {
		return payload;
	}

	const next: Record<string, unknown> = {};

	for (const [key, value] of Object.entries(payload)) {
		if (
			typeof value === 'string' &&
			(key === 'url' || key === 'imageUrl' || key.endsWith('ImageUrl'))
		) {
			next[key] = resolveMediaUrl(value);
		} else {
			next[key] = normalizeMediaUrls(value);
		}
	}

	return next as T;
}

export function uploadKeyFromUrl(value: string) {
	const url = resolveMediaUrl(value) ?? value;
	const marker = '/uploads/';
	const markerIndex = url.indexOf(marker);

	if (markerIndex >= 0) {
		return decodeURIComponent(url.slice(markerIndex + marker.length).split(/[?#]/)[0]);
	}

	return url.split('/').slice(3).join('/');
}
