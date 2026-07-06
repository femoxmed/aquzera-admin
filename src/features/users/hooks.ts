import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
	createUser,
	deleteUser,
	getUsers,
	getUser,
	updateUser,
	updateUserStatus,
	CreateUserPayload,
} from '@/features/users/api';

export function useUsers(options?: { enabled?: boolean }) {
	return useQuery({
		queryKey: ['users'],
		queryFn: getUsers,
		enabled: options?.enabled ?? true,
	});
}

export function useCreateUser() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: createUser,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['users'] });
			queryClient.invalidateQueries({ queryKey: ['dashboard-metrics'] });
		},
	});
}

export function useUser(userId: string) {
	return useQuery({
		queryKey: ['users', userId],
		queryFn: () => getUser(userId),
	});
}

export function useUpdateUser() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({
			userId,
			payload,
		}: {
			userId: string;
			payload: Partial<CreateUserPayload>;
		}) => updateUser(userId, payload),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['users'] });
			queryClient.invalidateQueries({ queryKey: ['dashboard-metrics'] });
		},
	});
}

export function useUpdateUserStatus() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ userId, isActive }: { userId: string; isActive: boolean }) =>
			updateUserStatus(userId, isActive),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['users'] });
			queryClient.invalidateQueries({ queryKey: ['dashboard-metrics'] });
		},
	});
}

export function useDeleteUser() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: deleteUser,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['users'] });
			queryClient.invalidateQueries({ queryKey: ['dashboard-metrics'] });
		},
	});
}
