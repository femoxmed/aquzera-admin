import { useMemo, useState, type ReactNode } from 'react';

export type ColumnDef<T> = {
	key: string;
	header: string;
	render: (row: T) => React.ReactNode;
	searchValue?: (row: T) => string;
};

type DataTableProps<T> = {
	title?: string;
	searchPlaceholder?: string;
	rows: T[];
	columns: ColumnDef<T>[];
	pageSize?: number;
	actions?: ReactNode;
	filters?: ReactNode;
};

export function DataTable<T>({
	rows,
	columns,
	pageSize = 8,
	searchPlaceholder = 'Search...',
	actions,
	filters,
}: DataTableProps<T>) {
	const [search, setSearch] = useState('');
	const [page, setPage] = useState(1);

	const filtered = useMemo(() => {
		const term = search.trim().toLowerCase();
		if (!term) return rows;
		return rows.filter((row) =>
			columns.some((column) =>
				(column.searchValue?.(row) ?? '').toLowerCase().includes(term),
			),
		);
	}, [columns, rows, search]);

	const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
	const currentPage = Math.min(page, totalPages);
	const sliced = filtered.slice(
		(currentPage - 1) * pageSize,
		currentPage * pageSize,
	);

	return (
		<div className='table-shell'>
			<div className='flex flex-col gap-3 border-b border-slate-200 px-4 py-4 sm:flex-row sm:items-center sm:justify-between'>
				<div className='flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3'>
					<input
						value={search}
						onChange={(event) => {
							setSearch(event.target.value);
							setPage(1);
						}}
						placeholder={searchPlaceholder}
						className='w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-secondary sm:max-w-sm'
					/>
					{filters}
				</div>
				<div className='flex items-center gap-3'>
					<div className='text-sm text-slate-500'>
						Showing {sliced.length} of {filtered.length} records
					</div>
					{actions}
				</div>
			</div>

			<div className='table-base overflow-x-auto'>
				<table>
					<thead>
						<tr>
							{columns.map((column) => (
								<th key={column.key}>{column.header}</th>
							))}
						</tr>
					</thead>
					<tbody>
						{sliced.map((row, rowIndex) => (
							<tr key={rowIndex}>
								{columns.map((column) => (
									<td key={column.key}>{column.render(row)}</td>
								))}
							</tr>
						))}
					</tbody>
				</table>
			</div>

			<div className='flex items-center justify-between border-t border-slate-200 px-4 py-4'>
				<p className='text-sm text-slate-500'>
					Page {currentPage} of {totalPages}
				</p>
				<div className='flex gap-2'>
					<button
						disabled={currentPage <= 1}
						onClick={() => setPage((value) => Math.max(1, value - 1))}
						className='rounded-xl border border-slate-200 px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-50'>
						Previous
					</button>
					<button
						disabled={currentPage >= totalPages}
						onClick={() => setPage((value) => Math.min(totalPages, value + 1))}
						className='rounded-xl border border-slate-200 px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-50'>
						Next
					</button>
				</div>
			</div>
		</div>
	);
}
