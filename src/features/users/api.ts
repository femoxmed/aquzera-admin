import { apiClient } from '@/lib/api-client';

export type UserRow = {
	id: string;
	fullName?: string;
	email: string;
	role: string;
	active?: boolean;
	isActive?: boolean;
};

export type CreateUserPayload = {
	fullName: string;
	email: string;
	password: string;
	role: 'customer' | 'super_admin' | 'admin' | 'technician' | 'writer';
	isActive?: boolean;
};

export function getUsers() {
	return apiClient<UserRow[]>('/auth/users');
}

export function createUser(payload: CreateUserPayload) {
	return apiClient<UserRow>('/auth/users', {
		method: 'POST',
		body: JSON.stringify(payload),
	});
}

export function getUser(userId: string) {
	return apiClient<UserRow>(`/auth/users/${userId}`);
}

export function updateUser(
	userId: string,
	payload: Partial<CreateUserPayload>,
) {
	return apiClient<UserRow>(`/auth/users/${userId}`, {
		method: 'PATCH',
		body: JSON.stringify(payload),
	});
}

export function updateUserStatus(userId: string, isActive: boolean) {
	return apiClient<UserRow>(`/auth/users/${userId}/status`, {
		method: 'PATCH',
		body: JSON.stringify({ isActive }),
	});
}

export function deleteUser(userId: string) {
	return apiClient<{ deleted: boolean; id: string }>(`/auth/users/${userId}`, {
		method: 'DELETE',
	});
}
