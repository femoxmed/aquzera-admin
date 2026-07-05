import { apiClient } from '@/lib/api-client';

export type OrderRow = {
	id: string;
	customerName?: string;
	amount?: number;
	totalAmount?: number;
	status: string;
	createdAt?: string;
	user?: { id?: string; fullName?: string; email?: string };
	total?: number;
	items?: Array<{
		id: string;
		orderId?: string;
		productId?: string;
		qty: number;
		unitPrice: number | string;
		product?: { id?: string; name?: string };
		deliveredAt?: string | null;
		activatedAt?: string | null;
		installedAt?: string | null;
		installerName?: string | null;
		warrantyMonths?: number;
		warrantyExpiresAt?: string | null;
		maintenanceRequired?: boolean;
		maintenanceStatus?: string;
		nextMaintenanceDate?: string | null;
		deviceSerial?: string | null;
	}>;
};

export type OrderItemRow = NonNullable<OrderRow['items']>[number];

export type CreateOrderPayload = {
	userId: string;
	status: string;
	idempotencyKey?: string;
	items: Array<{ productId: string; qty: number }>;
};

export function getOrders() {
	return apiClient<OrderRow[]>('/orders');
}

export function createOrder(payload: CreateOrderPayload) {
	return apiClient<OrderRow>('/orders', {
		method: 'POST',
		body: JSON.stringify(payload),
	});
}

export function getOrderItems(orderId: string) {
	return apiClient<OrderItemRow[]>(`/orders/${orderId}/items`);
}

export function updateOrderItemDetails({
	itemId,
	payload,
}: {
	itemId: string;
	payload: Record<string, unknown>;
}) {
	return apiClient(`/orders/items/${itemId}`, {
		method: 'PATCH',
		body: JSON.stringify(payload),
	});
}
