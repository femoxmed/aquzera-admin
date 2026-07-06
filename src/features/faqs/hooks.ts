import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createFaq, deleteFaq, getFaqs, updateFaq } from './api';

export function useFaqs() {
	return useQuery({
		queryKey: ['faqs'],
		queryFn: getFaqs,
	});
}

export function useFaqActions() {
	const queryClient = useQueryClient();
	const refresh = () => queryClient.invalidateQueries({ queryKey: ['faqs'] });

	return {
		create: useMutation({ mutationFn: createFaq, onSuccess: refresh }),
		update: useMutation({
			mutationFn: ({ id, payload }: { id: string; payload: any }) =>
				updateFaq(id, payload),
			onSuccess: refresh,
		}),
		remove: useMutation({ mutationFn: deleteFaq, onSuccess: refresh }),
	};
}
