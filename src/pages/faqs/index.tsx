import { useState } from 'react';
import { DataTable, type ColumnDef } from '@/components/shared/data-table';
import { Modal } from '@/components/shared/modal';
import { PageHeader } from '@/components/shared/page-header';
import { StatusBadge } from '@/components/shared/status-badge';
import { useToast } from '@/components/shared/toast-provider';
import { useFaqActions, useFaqs } from '@/features/faqs/hooks';
import type { FaqRow } from '@/features/faqs/api';

const emptyForm = {
	question: '',
	answer: '',
	category: 'General',
	sortOrder: '0',
	isPublished: true,
};

export function FaqsPage() {
	const { data } = useFaqs();
	const actions = useFaqActions();
	const { push } = useToast();
	const [open, setOpen] = useState(false);
	const [editingId, setEditingId] = useState<string | null>(null);
	const [form, setForm] = useState(emptyForm);
	const rows = data ?? [];

	const edit = (row: FaqRow) => {
		setEditingId(row.id);
		setForm({
			question: row.question,
			answer: row.answer,
			category: row.category || 'General',
			sortOrder: String(row.sortOrder ?? 0),
			isPublished: row.isPublished,
		});
		setOpen(true);
	};

	const columns: ColumnDef<FaqRow>[] = [
		{
			key: 'question',
			header: 'Question',
			render: (row) => (
				<div>
					<p className='font-medium text-slate-900'>{row.question}</p>
					<p className='line-clamp-1 text-xs text-slate-500'>{row.answer}</p>
				</div>
			),
			searchValue: (row) => `${row.question} ${row.answer}`,
		},
		{
			key: 'category',
			header: 'Category',
			render: (row) => row.category,
			searchValue: (row) => row.category,
		},
		{
			key: 'sortOrder',
			header: 'Order',
			render: (row) => row.sortOrder,
			searchValue: (row) => String(row.sortOrder),
		},
		{
			key: 'status',
			header: 'Status',
			render: (row) => (
				<StatusBadge value={row.isPublished ? 'published' : 'draft'} />
			),
			searchValue: (row) => (row.isPublished ? 'published' : 'draft'),
		},
		{
			key: 'actions',
			header: '',
			render: (row) => (
				<div className='flex justify-end gap-3'>
					<button
						className='text-sm text-secondary hover:underline'
						onClick={(event) => {
							event.stopPropagation();
							edit(row);
						}}>
						Edit
					</button>
					<button
						className='text-sm text-red-600 hover:underline'
						onClick={async (event) => {
							event.stopPropagation();
							if (!window.confirm(`Delete "${row.question}"?`)) return;
							await actions.remove.mutateAsync(row.id);
							push({ title: 'FAQ deleted' });
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
				title='FAQ CMS'
				description='Manage the help centre questions shown on the public website.'
			/>

			<DataTable
				rows={rows}
				columns={columns}
				searchPlaceholder='Search FAQs'
				actions={
					<button
						className='rounded-xl bg-secondary px-4 py-2 text-sm font-medium text-white'
						onClick={() => {
							setEditingId(null);
							setForm(emptyForm);
							setOpen(true);
						}}>
						Create FAQ
					</button>
				}
			/>

			<Modal
				open={open}
				onClose={() => setOpen(false)}
				title={editingId ? 'Edit FAQ' : 'Create FAQ'}
				description='Published FAQs appear on the public help centre page.'
				footer={
					<>
						<button
							className='rounded-xl border border-slate-200 px-4 py-2 text-sm'
							onClick={() => setOpen(false)}>
							Cancel
						</button>
						<button
							className='rounded-xl bg-secondary px-4 py-2 text-sm font-medium text-white'
							disabled={actions.create.isPending || actions.update.isPending}
							onClick={async () => {
								try {
									const payload = {
										question: form.question,
										answer: form.answer,
										category: form.category || 'General',
										sortOrder: Number(form.sortOrder || 0),
										isPublished: form.isPublished,
									};

									if (editingId) {
										await actions.update.mutateAsync({ id: editingId, payload });
										push({ title: 'FAQ updated' });
									} else {
										await actions.create.mutateAsync(payload);
										push({ title: 'FAQ created' });
									}

									setOpen(false);
									setEditingId(null);
									setForm(emptyForm);
								} catch (error) {
									push({
										title: 'Unable to save FAQ',
										description:
											error instanceof Error
												? error.message
												: 'An unexpected error occurred.',
										variant: 'error',
									});
								}
							}}>
							{actions.create.isPending || actions.update.isPending
								? 'Saving...'
								: 'Save FAQ'}
						</button>
					</>
				}>
				<div className='space-y-4'>
					<input
						className='w-full rounded-xl border border-slate-200 px-3 py-2 text-sm'
						placeholder='Question'
						value={form.question}
						onChange={(event) =>
							setForm((current) => ({ ...current, question: event.target.value }))
						}
					/>
					<textarea
						className='min-h-32 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm'
						placeholder='Answer'
						value={form.answer}
						onChange={(event) =>
							setForm((current) => ({ ...current, answer: event.target.value }))
						}
					/>
					<div className='grid gap-4 md:grid-cols-2'>
						<input
							className='w-full rounded-xl border border-slate-200 px-3 py-2 text-sm'
							placeholder='Category'
							value={form.category}
							onChange={(event) =>
								setForm((current) => ({
									...current,
									category: event.target.value,
								}))
							}
						/>
						<input
							className='w-full rounded-xl border border-slate-200 px-3 py-2 text-sm'
							placeholder='Sort order'
							value={form.sortOrder}
							onChange={(event) =>
								setForm((current) => ({
									...current,
									sortOrder: event.target.value,
								}))
							}
						/>
					</div>
					<label className='flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-600'>
						<input
							type='checkbox'
							checked={form.isPublished}
							onChange={(event) =>
								setForm((current) => ({
									...current,
									isPublished: event.target.checked,
								}))
							}
						/>
						Published
					</label>
				</div>
			</Modal>
		</section>
	);
}
