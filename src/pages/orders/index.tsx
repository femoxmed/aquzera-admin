import { useState } from 'react';
import { DataTable, type ColumnDef } from '@/components/shared/data-table';
import { Modal } from '@/components/shared/modal';
import { PageHeader } from '@/components/shared/page-header';
import { StatusBadge } from '@/components/shared/status-badge';
import { useToast } from '@/components/shared/toast-provider';
import { useOrders, useCreateOrder, useOrderItems, useUpdateOrderItemDetails } from '@/features/orders/hooks';
import type { OrderItemRow, OrderRow } from '@/features/orders/api';
import { useVerifyPaymentIntent } from '@/features/payments/hooks';
import { useUsers } from '@/features/users/hooks';
import { useProducts } from '@/features/products/hooks';
import { authStore } from '@/lib/auth-store';
import { currency } from '@/lib/utils';

function isPaymentConfirmed(row: OrderRow) {
	return (
		row.status === 'paid' ||
		row.invoice?.status === 'paid' ||
		row.paymentIntent?.status === 'succeeded' ||
		Boolean(row.paymentIntent?.paidAt)
	);
}

function createColumns({
	onConfirmPayment,
	verifyingPaymentIntentId,
}: {
	onConfirmPayment: (row: OrderRow) => void;
	verifyingPaymentIntentId: string | null;
}): ColumnDef<OrderRow>[] {
	return [
	{
		key: 'id',
		header: 'Order ID',
		render: (row) => (
			<span className='font-medium text-slate-900'>{row.id}</span>
		),
		searchValue: (row) => row.id,
	},
	{
		key: 'customerName',
		header: 'Customer',
		render: (row) =>
			row.user?.fullName ?? row.customerName ?? 'Unknown customer',
		searchValue: (row) => row.user?.fullName ?? row.customerName ?? '',
	},
		{
			key: 'units',
			header: 'Units',
			render: (row) => String(row.items?.length ?? 0),
			searchValue: (row) => String(row.items?.length ?? 0),
		},
		{
			key: 'amount',
			header: 'Amount',
		render: (row) =>
			currency(Number(row.amount ?? row.totalAmount ?? row.total ?? 0)),
		searchValue: (row) =>
			String(row.amount ?? row.totalAmount ?? row.total ?? 0),
	},
	{
		key: 'status',
		header: 'Status',
		render: (row) => <StatusBadge value={row.status} />,
		searchValue: (row) => row.status,
	},
	{
		key: 'payment',
		header: 'Payment',
		render: (row) => {
			const confirmed = isPaymentConfirmed(row);
			const canRetry = !confirmed && row.paymentIntent?.id;

			return (
				<div className='space-y-2'>
					<StatusBadge
						value={
							confirmed
								? 'confirmed'
								: row.paymentIntent?.status || row.invoice?.status || 'pending'
						}
					/>
					{canRetry ? (
						<button
							type='button'
							disabled={verifyingPaymentIntentId === row.paymentIntent?.id}
							onClick={() => onConfirmPayment(row)}
							className='block rounded-lg border border-amber-300 bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-800 transition hover:bg-amber-100 disabled:cursor-not-allowed disabled:opacity-60'>
							{verifyingPaymentIntentId === row.paymentIntent?.id
								? 'Checking...'
								: 'Confirm payment'}
						</button>
					) : null}
				</div>
			);
		},
		searchValue: (row) =>
			[
				row.invoice?.status,
				row.paymentIntent?.status,
				row.paymentIntent?.providerReference,
			]
				.filter(Boolean)
				.join(' '),
	},
	{
		key: 'createdAt',
		header: 'Date',
		render: (row) => row.createdAt ?? '—',
		searchValue: (row) => row.createdAt ?? '',
	},
	];
}

function OrderUnitList({
	order,
	onEdit,
}: {
	order: OrderRow;
	onEdit: (order: OrderRow, items: OrderItemRow[]) => void;
}) {
	const { data: fetchedItems } = useOrderItems(order.id);
	const items = fetchedItems ?? order.items ?? [];

	return (
		<div className='rounded-xl border border-slate-200 bg-white p-4'>
			<div className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
				<div>
					<p className='font-semibold text-slate-900'>Order {order.id}</p>
					<p className='text-sm text-slate-500'>
						{order.user?.fullName ?? order.customerName ?? 'Unknown customer'} · {items.length} units
					</p>
					<div className='mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3'>
						{items.map((item, index) => (
							<div key={item.id} className='rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600'>
								<p>
									<span className='font-semibold text-slate-900'>Unit {index + 1}</span>
									{' · '}
									{item.product?.name ?? item.id}
									{item.deviceSerial ? ` · ${item.deviceSerial}` : ''}
								</p>
								<p className='mt-1 text-[11px] text-slate-500'>
									Order #{(item.orderId ?? order.id).slice(0, 8)} · Product #{(item.productId ?? item.product?.id ?? '').slice(0, 8) || '—'}
								</p>
							</div>
						))}
					</div>
				</div>
				<button
					className='rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium'
					onClick={() => onEdit({ ...order, items }, items)}>
					Warranty & Maintenance
				</button>
			</div>
		</div>
	);
}

export function OrdersPage() {
	const { data } = useOrders();
	const role = authStore.getRole();
	const canCreateOrders = role === 'super_admin' || role === 'admin';
	const { data: users } = useUsers({ enabled: canCreateOrders });
	const { data: products } = useProducts({ enabled: canCreateOrders });
	const createOrderMutation = useCreateOrder();
	const updateOrderItemMutation = useUpdateOrderItemDetails();
	const verifyPaymentMutation = useVerifyPaymentIntent();
	const { push } = useToast();
	const rows: OrderRow[] = data ?? [];
	const [verifyingPaymentIntentId, setVerifyingPaymentIntentId] = useState<string | null>(null);
	const [open, setOpen] = useState(false);
	const [selectedOrder, setSelectedOrder] = useState<OrderRow | null>(null);
	const [selectedItemId, setSelectedItemId] = useState('');
	const [itemForm, setItemForm] = useState({
		deliveredAt: '',
		activatedAt: '',
		installedAt: '',
		installerName: '',
		warrantyMonths: '12',
		warrantyExpiresAt: '',
		maintenanceRequired: false,
		maintenanceStatus: 'not_required',
		nextMaintenanceDate: '',
		deviceSerial: '',
	});
	const [form, setForm] = useState({
		userId: '',
		status: 'pending',
		productId: '',
		qty: '1',
		idempotencyKey:
			typeof crypto !== 'undefined' && 'randomUUID' in crypto
				? crypto.randomUUID()
				: String(Date.now()),
	});
	const columns = createColumns({
		verifyingPaymentIntentId,
		onConfirmPayment: async (order) => {
			if (!order.paymentIntent?.id) return;

			setVerifyingPaymentIntentId(order.paymentIntent.id);
			try {
				const result = await verifyPaymentMutation.mutateAsync(
					order.paymentIntent.id,
				);
				push({
					title:
						result.status === 'succeeded'
							? 'Payment confirmed'
							: 'Payment checked',
					description:
						result.status === 'succeeded'
							? 'The order and invoice have been reconciled.'
							: `Paystack returned status: ${result.status}.`,
				});
			} catch (error) {
				push({
					title: 'Unable to confirm payment',
					description:
						error instanceof Error
							? error.message
							: 'Paystack verification failed.',
					variant: 'error',
				});
			} finally {
				setVerifyingPaymentIntentId(null);
			}
		},
	});

	return (
		<section className='space-y-6'>
			<PageHeader
				title='Orders'
				description='Track e-commerce purchases and create customer orders on behalf of customers.'
			/>
			<DataTable
				rows={rows}
				columns={columns}
				searchPlaceholder='Search orders by ID, customer, or status'
				actions={
					canCreateOrders ? (
						<button
							className='rounded-xl bg-secondary px-4 py-2 text-sm font-medium text-white'
							onClick={() => setOpen(true)}>
							Create Order
						</button>
					) : null
				}
			/>
			<div className='grid gap-4'>
				{rows.map((order) => (
					<OrderUnitList
						key={order.id}
						order={order}
						onEdit={(nextOrder, items) => {
							const firstItem = items[0];
							setSelectedOrder(nextOrder);
							setSelectedItemId(firstItem?.id || '');
							setItemForm({
								deliveredAt: firstItem?.deliveredAt || '',
								activatedAt: firstItem?.activatedAt || '',
								installedAt: firstItem?.installedAt || '',
								installerName: firstItem?.installerName || '',
								warrantyMonths: String(firstItem?.warrantyMonths || 12),
								warrantyExpiresAt: firstItem?.warrantyExpiresAt || '',
								maintenanceRequired: firstItem?.maintenanceRequired || false,
								maintenanceStatus: firstItem?.maintenanceStatus || 'not_required',
								nextMaintenanceDate: firstItem?.nextMaintenanceDate || '',
								deviceSerial: firstItem?.deviceSerial || '',
							});
						}}
					/>
				))}
			</div>
			<Modal
				open={open}
				onClose={() => setOpen(false)}
					title='Create order'
					description='Creating an order automatically generates separate purchased units for the quantity entered, plus one invoice and customer email.'
				footer={
					<>
						<button
							className='rounded-xl border border-slate-200 px-4 py-2 text-sm'
							onClick={() => setOpen(false)}>
							Cancel
						</button>
						<button
							className='rounded-xl bg-secondary px-4 py-2 text-sm font-medium text-white'
							disabled={createOrderMutation.isPending}
							onClick={async () => {
								try {
									await createOrderMutation.mutateAsync({
										userId: form.userId,
										status: form.status,
										idempotencyKey: form.idempotencyKey,
										items: [
											{ productId: form.productId, qty: Number(form.qty) || 1 },
										],
									});
									push({
										title: 'Order created',
										description:
											'Invoice generation and customer email have been queued automatically.',
									});
									setForm({
										userId: '',
										status: 'pending',
										productId: '',
										qty: '1',
										idempotencyKey:
											typeof crypto !== 'undefined' && 'randomUUID' in crypto
												? crypto.randomUUID()
												: String(Date.now()),
									});
									setOpen(false);
								} catch (error) {
									push({
										title: 'Unable to create order',
										description:
											error instanceof Error
												? error.message
												: 'An unexpected error occurred.',
										variant: 'error',
									});
								}
							}}>
							{createOrderMutation.isPending ? 'Creating...' : 'Create order'}
						</button>
					</>
				}>
				<div className='grid gap-4 md:grid-cols-2'>
					<select
						className='w-full rounded-xl border border-slate-200 px-3 py-2 text-sm'
						value={form.userId}
						onChange={(event) =>
							setForm((current) => ({ ...current, userId: event.target.value }))
						}>
						<option value=''>Select User</option>
						{(users ?? []).map((user) => (
							<option key={user.id} value={user.id}>
								{user.fullName ?? user.email}
							</option>
						))}
					</select>
					<select
						className='w-full rounded-xl border border-slate-200 px-3 py-2 text-sm'
						value={form.productId}
						onChange={(event) =>
							setForm((current) => ({
								...current,
								productId: event.target.value,
							}))
						}>
						<option value=''>Select product</option>
						{(products ?? []).map((product) => (
							<option key={product.id} value={product.id}>
								{product.name} — {currency(Number(product.price))}
							</option>
						))}
					</select>
					<input
							className='w-full rounded-xl border border-slate-200 px-3 py-2 text-sm'
							placeholder='Number of units'
						value={form.qty}
						onChange={(event) =>
							setForm((current) => ({ ...current, qty: event.target.value }))
						}
					/>
					<select
						className='w-full rounded-xl border border-slate-200 px-3 py-2 text-sm'
						value={form.status}
						onChange={(event) =>
							setForm((current) => ({ ...current, status: event.target.value }))
						}>
						<option value='pending'>Pending</option>
						<option value='processing'>Processing</option>
						<option value='paid'>Paid</option>
					</select>
				</div>
			</Modal>
			<Modal
				open={Boolean(selectedOrder)}
				onClose={() => setSelectedOrder(null)}
					title='Warranty & maintenance'
					description='Update each purchased unit individually as shown in the customer dashboard.'
				footer={
					<>
						<button
							className='rounded-xl border border-slate-200 px-4 py-2 text-sm'
							onClick={() => setSelectedOrder(null)}>
							Cancel
						</button>
						<button
							className='rounded-xl bg-secondary px-4 py-2 text-sm font-medium text-white'
							disabled={!selectedItemId || updateOrderItemMutation.isPending}
							onClick={async () => {
								try {
									await updateOrderItemMutation.mutateAsync({
										itemId: selectedItemId,
										payload: {
											...itemForm,
											warrantyMonths: Number(itemForm.warrantyMonths) || 12,
										},
									});
									push({
										title: 'Purchase details updated',
										description: 'Customer dashboard warranty and maintenance data has been updated.',
									});
									setSelectedOrder(null);
								} catch (error) {
									push({
										title: 'Unable to update details',
										description: error instanceof Error ? error.message : 'An unexpected error occurred.',
										variant: 'error',
									});
								}
							}}>
							{updateOrderItemMutation.isPending ? 'Saving...' : 'Save details'}
						</button>
					</>
				}>
				<div className='grid gap-4 md:grid-cols-2'>
					<select
						className='w-full rounded-xl border border-slate-200 px-3 py-2 text-sm md:col-span-2'
						value={selectedItemId}
						onChange={(event) => {
							const item = selectedOrder?.items?.find((row) => row.id === event.target.value);
							setSelectedItemId(event.target.value);
							if (item) {
								setItemForm({
									deliveredAt: item.deliveredAt || '',
									activatedAt: item.activatedAt || '',
									installedAt: item.installedAt || '',
									installerName: item.installerName || '',
									warrantyMonths: String(item.warrantyMonths || 12),
									warrantyExpiresAt: item.warrantyExpiresAt || '',
									maintenanceRequired: item.maintenanceRequired || false,
									maintenanceStatus: item.maintenanceStatus || 'not_required',
									nextMaintenanceDate: item.nextMaintenanceDate || '',
									deviceSerial: item.deviceSerial || '',
								});
							}
						}}>
							{(selectedOrder?.items ?? []).map((item) => (
								<option key={item.id} value={item.id}>
									{item.product?.name ?? item.id}{item.deviceSerial ? ` · ${item.deviceSerial}` : ''}
								</option>
							))}
					</select>
					<input type='date' className='rounded-xl border border-slate-200 px-3 py-2 text-sm' value={itemForm.deliveredAt} onChange={(event) => setItemForm((current) => ({ ...current, deliveredAt: event.target.value }))} />
					<input type='date' className='rounded-xl border border-slate-200 px-3 py-2 text-sm' value={itemForm.activatedAt} onChange={(event) => setItemForm((current) => ({ ...current, activatedAt: event.target.value }))} />
					<input type='date' className='rounded-xl border border-slate-200 px-3 py-2 text-sm' value={itemForm.installedAt} onChange={(event) => setItemForm((current) => ({ ...current, installedAt: event.target.value }))} />
					<input className='rounded-xl border border-slate-200 px-3 py-2 text-sm' placeholder='Installer name' value={itemForm.installerName} onChange={(event) => setItemForm((current) => ({ ...current, installerName: event.target.value }))} />
					<input className='rounded-xl border border-slate-200 px-3 py-2 text-sm' placeholder='Warranty months' value={itemForm.warrantyMonths} onChange={(event) => setItemForm((current) => ({ ...current, warrantyMonths: event.target.value }))} />
					<input type='date' className='rounded-xl border border-slate-200 px-3 py-2 text-sm' value={itemForm.warrantyExpiresAt} onChange={(event) => setItemForm((current) => ({ ...current, warrantyExpiresAt: event.target.value }))} />
					<label className='flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm'>
						<input type='checkbox' checked={itemForm.maintenanceRequired} onChange={(event) => setItemForm((current) => ({ ...current, maintenanceRequired: event.target.checked }))} />
						Maintenance required
					</label>
					<select className='rounded-xl border border-slate-200 px-3 py-2 text-sm' value={itemForm.maintenanceStatus} onChange={(event) => setItemForm((current) => ({ ...current, maintenanceStatus: event.target.value }))}>
						<option value='not_required'>Not required</option>
						<option value='required'>Required</option>
						<option value='scheduled'>Scheduled</option>
						<option value='completed'>Completed</option>
					</select>
					<input type='date' className='rounded-xl border border-slate-200 px-3 py-2 text-sm' value={itemForm.nextMaintenanceDate} onChange={(event) => setItemForm((current) => ({ ...current, nextMaintenanceDate: event.target.value }))} />
					<input className='rounded-xl border border-slate-200 px-3 py-2 text-sm' placeholder='Device serial' value={itemForm.deviceSerial} onChange={(event) => setItemForm((current) => ({ ...current, deviceSerial: event.target.value }))} />
				</div>
			</Modal>
		</section>
	);
}
