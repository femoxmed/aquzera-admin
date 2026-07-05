import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createOrder, getOrderItems, getOrders, updateOrderItemDetails } from '@/features/orders/api';

export function useOrders() {
  return useQuery({
    queryKey: ['orders'],
    queryFn: getOrders,
  });
}

export function useOrderItems(orderId?: string) {
  return useQuery({
    queryKey: ['orders', orderId, 'items'],
    queryFn: () => getOrderItems(orderId!),
    enabled: Boolean(orderId),
  });
}

export function useCreateOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createOrder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['orders', 'items'] });
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-metrics'] });
    },
  });
}

export function useUpdateOrderItemDetails() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateOrderItemDetails,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['orders', 'items'] });
    },
  });
}
