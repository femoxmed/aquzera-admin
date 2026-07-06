import { apiClient } from '@/lib/api-client';

export type FaqRow = {
	id: string;
	question: string;
	answer: string;
	category: string;
	sortOrder: number;
	isPublished: boolean;
	createdAt: string;
	updatedAt: string;
};

export type FaqPayload = {
	question: string;
	answer: string;
	category?: string;
	sortOrder?: number;
	isPublished?: boolean;
};

export function getFaqs() {
	return apiClient<FaqRow[]>('/faqs');
}

export function createFaq(payload: FaqPayload) {
	return apiClient<FaqRow>('/faqs', {
		method: 'POST',
		body: JSON.stringify(payload),
	});
}

export function updateFaq(id: string, payload: Partial<FaqPayload>) {
	return apiClient<FaqRow>(`/faqs/${id}`, {
		method: 'PATCH',
		body: JSON.stringify(payload),
	});
}

export function deleteFaq(id: string) {
	return apiClient<{ deleted: boolean; id: string }>(`/faqs/${id}`, {
		method: 'DELETE',
	});
}
