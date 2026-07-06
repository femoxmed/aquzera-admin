import { useState } from 'react';
import { DataTable, type ColumnDef } from '@/components/shared/data-table';
import { Modal } from '@/components/shared/modal';
import { PageHeader } from '@/components/shared/page-header';
import { StatusBadge } from '@/components/shared/status-badge';
import { useToast } from '@/components/shared/toast-provider';
import {
	useCreateUser,
	useDeleteUser,
	useUsers,
	useUpdateUser,
	useUpdateUserStatus,
} from '@/features/users/hooks';
import type { UserRow, CreateUserPayload } from '@/features/users/api';

export function UsersPage() {
	const { data } = useUsers();
	const createUserMutation = useCreateUser();
	const updateUserMutation = useUpdateUser();
	const updateUserStatusMutation = useUpdateUserStatus();
	const deleteUserMutation = useDeleteUser();
	const { push } = useToast();
	const [roleFilter, setRoleFilter] = useState('all');
	const [open, setOpen] = useState(false);
	const [editOpen, setEditOpen] = useState(false);
	const [selectedUser, setSelectedUser] = useState<UserRow | null>(null);
	const [form, setForm] = useState({
		fullName: '',
		email: '',
		password: '',
		role: 'technician',
	});

	const rows = data ?? [];

	const filteredRows =
		roleFilter === 'all' ? rows : rows.filter((row) => row.role === roleFilter);

	const columnsWithHandlers: ColumnDef<UserRow>[] = [
		{
			key: 'fullName',
			header: 'Name',
			render: (row) => row.fullName ?? row.email.split('@')[0],
			searchValue: (row) => `${row.fullName ?? ''} ${row.email}`,
		},
		{
			key: 'email',
			header: 'Email',
			render: (row) => row.email,
			searchValue: (row) => row.email,
		},
		{
			key: 'role',
			header: 'Role',
			render: (row) => <StatusBadge value={row.role} />,
			searchValue: (row) => row.role,
		},
		{
			key: 'active',
			header: 'Status',
			render: (row) => (
				<StatusBadge
					value={
						row.active === false || row.isActive === false
							? 'inactive'
							: 'active'
					}
				/>
			),
			searchValue: (row) =>
				row.active === false || row.isActive === false ? 'inactive' : 'active',
		},
		{
			key: 'actions',
			header: 'Actions',
			render: (row: UserRow) => (
				<div className='flex items-center gap-2'>
					<button
						className='text-sm text-blue-600 hover:text-blue-800 font-medium px-2 py-1 rounded hover:bg-blue-50'
						onClick={(e) => {
							e.stopPropagation();
							setSelectedUser(row);
						}}>
						View
					</button>
					<button
						className='text-sm text-gray-600 hover:text-gray-800 font-medium px-2 py-1 rounded hover:bg-gray-50'
						onClick={(e) => {
							e.stopPropagation();
							setSelectedUser(row);
							setForm({
								fullName: row.fullName ?? '',
								email: row.email,
								password: '',
								role: row.role,
							});
							setEditOpen(true);
						}}>
						Edit
					</button>
					<button
						className='text-sm text-amber-700 hover:text-amber-900 font-medium px-2 py-1 rounded hover:bg-amber-50'
						disabled={updateUserStatusMutation.isPending}
						onClick={async (e) => {
							e.stopPropagation();
							const nextStatus = row.active === false || row.isActive === false;
							try {
								await updateUserStatusMutation.mutateAsync({
									userId: row.id,
									isActive: nextStatus,
								});
								push({
									title: nextStatus ? 'User enabled' : 'User disabled',
								});
							} catch (error) {
								push({
									title: 'Unable to update user status',
									description:
										error instanceof Error
											? error.message
											: 'An unexpected error occurred.',
									variant: 'error',
								});
							}
						}}>
						{row.active === false || row.isActive === false
							? 'Enable'
							: 'Disable'}
					</button>
					<button
						className='text-sm text-red-600 hover:text-red-800 font-medium px-2 py-1 rounded hover:bg-red-50'
						disabled={deleteUserMutation.isPending}
						onClick={async (e) => {
							e.stopPropagation();
							if (!window.confirm(`Delete ${row.email}? This cannot be undone.`)) {
								return;
							}
							try {
								await deleteUserMutation.mutateAsync(row.id);
								push({ title: 'User deleted' });
							} catch (error) {
								push({
									title: 'Unable to delete user',
									description:
										error instanceof Error
											? error.message
											: 'An unexpected error occurred.',
									variant: 'error',
								});
							}
						}}>
						Delete
					</button>
				</div>
			),
		},
	];

	return (
		<section className='space-y-6'>
			<PageHeader
				title='Users'
				description='Create and manage customer, super admin, admin, technician, and writer accounts.'
			/>
			<DataTable
				rows={filteredRows}
				columns={columnsWithHandlers}
				searchPlaceholder='Search by name, email, or role'
				filters={
					<select
						value={roleFilter}
						onChange={(e) => setRoleFilter(e.target.value)}
						className='rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-secondary'>
						<option value='all'>All Roles</option>
						<option value='customer'>Customers</option>
						<option value='super_admin'>Super Admins</option>
						<option value='admin'>Admins</option>
						<option value='technician'>Technicians</option>
						<option value='writer'>Writers</option>
					</select>
				}
				actions={
					<button
						className='rounded-xl bg-secondary px-4 py-2 text-sm font-medium text-white'
						onClick={() => setOpen(true)}>
						Create User
					</button>
				}
			/>
			<Modal
				open={open}
				onClose={() => setOpen(false)}
				title='Create user'
				description='Create a customer, super admin, admin, technician, or writer account. Onboarding credentials will be sent by email.'
				footer={
					<>
						<button
							className='rounded-xl border border-slate-200 px-4 py-2 text-sm'
							onClick={() => setOpen(false)}>
							Cancel
						</button>
						<button
							className='rounded-xl bg-secondary px-4 py-2 text-sm font-medium text-white'
							disabled={createUserMutation.isPending}
							onClick={async () => {
								try {
									await createUserMutation.mutateAsync({
										fullName: form.fullName,
										email: form.email,
										password: form.password,
										role: form.role as
											| 'customer'
											| 'super_admin'
											| 'admin'
											| 'technician'
											| 'writer',
										isActive: true,
									});
									push({
										title: 'User created',
										description:
											'Onboarding credentials have been queued by email.',
									});
									setForm({
										fullName: '',
										email: '',
										password: '',
										role: 'technician',
									});
									setOpen(false);
								} catch (error) {
									push({
										title: 'Unable to create user',
										description:
											error instanceof Error
												? error.message
												: 'An unexpected error occurred.',
										variant: 'error',
									});
								}
							}}>
							{createUserMutation.isPending ? 'Creating...' : 'Create user'}
						</button>
					</>
				}>
				<div className='grid gap-4 md:grid-cols-2'>
					<input
						className='w-full rounded-xl border border-slate-200 px-3 py-2 text-sm'
						placeholder='Full name'
						value={form.fullName}
						onChange={(event) =>
							setForm((current) => ({
								...current,
								fullName: event.target.value,
							}))
						}
					/>
					<input
						className='w-full rounded-xl border border-slate-200 px-3 py-2 text-sm'
						placeholder='Email'
						value={form.email}
						onChange={(event) =>
							setForm((current) => ({ ...current, email: event.target.value }))
						}
					/>
					<input
						className='w-full rounded-xl border border-slate-200 px-3 py-2 text-sm'
						placeholder='Temporary password'
						value={form.password}
						onChange={(event) =>
							setForm((current) => ({
								...current,
								password: event.target.value,
							}))
						}
					/>
					<select
						className='w-full rounded-xl border border-slate-200 px-3 py-2 text-sm'
						value={form.role}
						onChange={(event) =>
							setForm((current) => ({ ...current, role: event.target.value }))
						}>
						<option value='customer'>Customer</option>
						<option value='super_admin'>Super Admin</option>
						<option value='admin'>Admin</option>
						<option value='technician'>Technician</option>
						<option value='writer'>Writer</option>
					</select>
				</div>
			</Modal>

			<Modal
				open={editOpen}
				onClose={() => {
					setEditOpen(false);
					setSelectedUser(null);
					setForm({
						fullName: '',
						email: '',
						password: '',
						role: 'technician',
					});
				}}
				title='Edit user'
				description='Update user account details.'
				footer={
					<>
						<button
							className='rounded-xl border border-slate-200 px-4 py-2 text-sm'
							onClick={() => {
								setEditOpen(false);
								setSelectedUser(null);
								setForm({
									fullName: '',
									email: '',
									password: '',
									role: 'technician',
								});
							}}>
							Cancel
						</button>
						<button
							className='rounded-xl bg-secondary px-4 py-2 text-sm font-medium text-white'
							disabled={updateUserMutation.isPending}
							onClick={async () => {
								if (!selectedUser) return;

								try {
									const payload: Partial<CreateUserPayload> = {
										fullName: form.fullName,
										email: form.email,
										role: form.role as
											| 'customer'
											| 'super_admin'
											| 'admin'
											| 'technician'
											| 'writer',
									};

									if (form.password) {
										payload.password = form.password;
									}

									await updateUserMutation.mutateAsync({
										userId: selectedUser.id,
										payload,
									});

									push({
										title: 'User updated',
										description: 'User details have been updated successfully.',
									});
									setEditOpen(false);
									setSelectedUser(null);
									setForm({
										fullName: '',
										email: '',
										password: '',
										role: 'technician',
									});
								} catch (error) {
									push({
										title: 'Unable to update user',
										description:
											error instanceof Error
												? error.message
												: 'An unexpected error occurred.',
										variant: 'error',
									});
								}
							}}>
							{updateUserMutation.isPending ? 'Saving...' : 'Save changes'}
						</button>
					</>
				}>
				<div className='grid gap-4 md:grid-cols-2'>
					<input
						className='w-full rounded-xl border border-slate-200 px-3 py-2 text-sm'
						placeholder='Full name'
						value={form.fullName}
						onChange={(event) =>
							setForm((current) => ({
								...current,
								fullName: event.target.value,
							}))
						}
					/>
					<input
						className='w-full rounded-xl border border-slate-200 px-3 py-2 text-sm'
						placeholder='Email'
						value={form.email}
						onChange={(event) =>
							setForm((current) => ({ ...current, email: event.target.value }))
						}
					/>
					<input
						className='w-full rounded-xl border border-slate-200 px-3 py-2 text-sm'
						placeholder='New password (leave empty to keep current)'
						value={form.password}
						onChange={(event) =>
							setForm((current) => ({
								...current,
								password: event.target.value,
							}))
						}
					/>
					<select
						className='w-full rounded-xl border border-slate-200 px-3 py-2 text-sm'
						value={form.role}
						onChange={(event) =>
							setForm((current) => ({ ...current, role: event.target.value }))
						}>
						<option value='customer'>Customer</option>
						<option value='super_admin'>Super Admin</option>
						<option value='admin'>Admin</option>
						<option value='technician'>Technician</option>
						<option value='writer'>Writer</option>
					</select>
				</div>
			</Modal>
		</section>
	);
}
