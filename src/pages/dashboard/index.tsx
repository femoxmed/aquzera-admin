import {
	Users,
	ShoppingCart,
	Wallet,
	Wrench,
	Receipt,
	Shield,
	RefreshCcw,
	AlertTriangle,
	TrendingUp,
} from 'lucide-react';
import {
	AreaChart,
	Area,
	BarChart,
	Bar,
	PieChart,
	Pie,
	Cell,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip,
	ResponsiveContainer,
	Legend,
} from 'recharts';
import { MetricCard } from '@/components/shared/metric-card';
import { PageHeader } from '@/components/shared/page-header';
import { useDashboardMetrics } from '@/features/dashboard/hooks';
import { currency } from '@/lib/utils';

export function DashboardPage() {
	const { data } = useDashboardMetrics();
	const metrics = data ?? {
		customerCount: 0,
		orderCount: 0,
		pendingServiceCount: 0,
		monthlyRevenue: 0,
		openSupportTickets: 0,
		invoiceCount: 0,
		technicianCount: 0,
		activeCustomerCount: 0,
		upcomingFilterChanges: 0,
		upcomingFilterChanges30Days: 0,
		overdueServices: 0,
		recurringRevenueForecast: 0,
	};

	const monthlyRevenueData = metrics.monthlyRevenueData ?? [];
	const orderServiceData = metrics.orderServiceData ?? [];
	const invoiceStatusData = metrics.invoiceStatusData ?? [];
	const serviceTypeData = metrics.serviceTypeData ?? [];
	const topSellingProducts = metrics.topSellingProducts ?? [];
	const technicianPerformance = metrics.technicianPerformance ?? [];

	return (
		<section>
			<PageHeader
				title='Dashboard'
				description='Track platform health, customer growth, invoices, technician capacity, and service demand at a glance.'
			/>

			<div className='grid gap-5 md:grid-cols-2 xl:grid-cols-3'>
				<MetricCard
					title='Customers'
					value={String(metrics.customerCount)}
					helper='Total managed customer accounts'
					icon={<Users size={22} />}
				/>
				<MetricCard
					title='Active Customers'
					value={String(metrics.activeCustomerCount ?? 0)}
					helper='Active customer accounts'
					icon={<Users size={22} />}
				/>
				<MetricCard
					title='Orders'
					value={String(metrics.orderCount)}
					helper='Orders created for customers'
					icon={<ShoppingCart size={22} />}
				/>
				<MetricCard
					title='Service Due'
					value={String(metrics.pendingServiceCount)}
					helper='Assigned or pending field service visits'
					icon={<Wrench size={22} />}
				/>
				<MetricCard
					title='Upcoming Filters'
					value={String(metrics.upcomingFilterChanges30Days ?? 0)}
					helper='Filter changes due in the next 30 days'
					icon={<RefreshCcw size={22} />}
				/>
				<MetricCard
					title='Overdue Services'
					value={String(metrics.overdueServices ?? 0)}
					helper='Maintenance dates already past due'
					icon={<AlertTriangle size={22} />}
				/>
				<MetricCard
					title='Monthly Revenue'
					value={currency(metrics.monthlyRevenue)}
					helper='Invoice-linked revenue snapshot'
					icon={<Wallet size={22} />}
				/>
				<MetricCard
					title='Invoices'
					value={String(metrics.invoiceCount ?? 0)}
					helper='Invoices generated where billing applies'
					icon={<Receipt size={22} />}
				/>
				<MetricCard
					title='Technicians'
					value={String(metrics.technicianCount ?? 0)}
					helper='Technician accounts available for assignments'
					icon={<Shield size={22} />}
				/>
				<MetricCard
					title='Recurring Forecast'
					value={currency(metrics.recurringRevenueForecast ?? 0)}
					helper='Estimated revenue from upcoming filter changes'
					icon={<TrendingUp size={22} />}
				/>
			</div>

			{/* Revenue Trend Chart */}
			<div className='mt-6 card p-6'>
				<h3 className='text-lg font-semibold text-slate-900 mb-4'>
					Monthly Revenue Trend
				</h3>
				<ResponsiveContainer width='100%' height={300}>
					<AreaChart data={monthlyRevenueData}>
						<defs>
							<linearGradient id='revenueGradient' x1='0' y1='0' x2='0' y2='1'>
								<stop offset='5%' stopColor='#3b82f6' stopOpacity={0.3} />
								<stop offset='95%' stopColor='#3b82f6' stopOpacity={0} />
							</linearGradient>
						</defs>
						<CartesianGrid strokeDasharray='3 3' stroke='#f1f5f9' />
						<XAxis dataKey='month' stroke='#94a3b8' fontSize={12} />
						<YAxis
							stroke='#94a3b8'
							fontSize={12}
							tickFormatter={(value) => `₦${(value / 1000000).toFixed(1)}M`}
						/>
						<Tooltip formatter={(value) => currency(Number(value))} />
						<Area
							type='monotone'
							dataKey='revenue'
							stroke='#3b82f6'
							strokeWidth={2}
							fill='url(#revenueGradient)'
						/>
					</AreaChart>
				</ResponsiveContainer>
			</div>

			<div className='mt-6 grid gap-6 xl:grid-cols-2'>
				<div className='card p-6'>
					<h3 className='text-lg font-semibold text-slate-900 mb-4'>
						Top-Selling Products
					</h3>
					<div className='space-y-3'>
						{topSellingProducts.length ? (
							topSellingProducts.map((product) => (
								<div
									key={product.productId}
									className='flex items-center justify-between rounded-xl border border-slate-100 px-4 py-3'>
									<div>
										<p className='font-medium text-slate-900'>{product.name}</p>
										<p className='text-sm text-slate-500'>
											{product.unitsSold} units sold
										</p>
									</div>
									<p className='font-semibold text-slate-900'>
										{currency(product.revenue)}
									</p>
								</div>
							))
						) : (
							<p className='text-sm text-slate-500'>No product sales yet.</p>
						)}
					</div>
				</div>

				<div className='card p-6'>
					<h3 className='text-lg font-semibold text-slate-900 mb-4'>
						Technician Performance
					</h3>
					<div className='space-y-3'>
						{technicianPerformance.length ? (
							technicianPerformance.map((technician) => (
								<div
									key={technician.technicianId}
									className='rounded-xl border border-slate-100 px-4 py-3'>
									<div className='flex items-center justify-between gap-4'>
										<p className='font-medium text-slate-900'>
											{technician.technicianName}
										</p>
										<p className='text-sm font-semibold text-secondary'>
											{technician.completionRate}% complete
										</p>
									</div>
									<p className='mt-1 text-sm text-slate-500'>
										{technician.completedJobs}/{technician.assignedJobs} jobs
										completed, {technician.overdueJobs} overdue
									</p>
								</div>
							))
						) : (
							<p className='text-sm text-slate-500'>
								No technician assignments yet.
							</p>
						)}
					</div>
				</div>
			</div>

			<div className='mt-6 grid gap-6 xl:grid-cols-2'>
				{/* Orders vs Services Bar Chart */}
				<div className='card p-6'>
					<h3 className='text-lg font-semibold text-slate-900 mb-4'>
						Orders vs Completed Services
					</h3>
					<ResponsiveContainer width='100%' height={250}>
						<BarChart data={orderServiceData}>
							<CartesianGrid strokeDasharray='3 3' stroke='#f1f5f9' />
							<XAxis dataKey='month' stroke='#94a3b8' fontSize={12} />
							<YAxis stroke='#94a3b8' fontSize={12} />
							<Tooltip />
							<Legend />
							<Bar dataKey='orders' fill='#3b82f6' radius={[4, 4, 0, 0]} />
							<Bar dataKey='services' fill='#10b981' radius={[4, 4, 0, 0]} />
						</BarChart>
					</ResponsiveContainer>
				</div>

				{/* Invoice Status Pie Chart */}
				<div className='card p-6'>
					<h3 className='text-lg font-semibold text-slate-900 mb-4'>
						Invoice Status Breakdown
					</h3>
					<ResponsiveContainer width='100%' height={250}>
						<PieChart>
							<Pie
								data={invoiceStatusData}
								cx='50%'
								cy='50%'
								innerRadius={60}
								outerRadius={90}
								paddingAngle={2}
								dataKey='value'>
								{invoiceStatusData.map((entry, index) => (
									<Cell key={`cell-${index}`} fill={entry.color} />
								))}
							</Pie>
							<Tooltip />
							<Legend />
						</PieChart>
					</ResponsiveContainer>
				</div>
			</div>

			{/* Service Types Bar Chart */}
			<div className='mt-6 card p-6'>
				<h3 className='text-lg font-semibold text-slate-900 mb-4'>
					Service Type Volume
				</h3>
				<ResponsiveContainer width='100%' height={200}>
					<BarChart data={serviceTypeData} layout='vertical'>
						<CartesianGrid
							strokeDasharray='3 3'
							stroke='#f1f5f9'
							horizontal={false}
						/>
						<XAxis type='number' stroke='#94a3b8' fontSize={12} />
						<YAxis
							dataKey='name'
							type='category'
							stroke='#94a3b8'
							fontSize={12}
							width={100}
						/>
						<Tooltip />
						<Bar dataKey='count' fill='#6366f1' radius={[0, 4, 4, 0]} />
					</BarChart>
				</ResponsiveContainer>
			</div>

			<div className='mt-6 grid gap-6 xl:grid-cols-[1.7fr,1fr]'>
				<div className='card p-6'>
					<h3 className='text-lg font-semibold text-slate-900'>
						Super admin workflow
					</h3>
					<p className='mt-2 text-sm leading-6 text-slate-500'>
						Super admins can create customers, products, technicians, orders,
						and technician assignments. Customer emails are queued on customer
						creation, technician onboarding is emailed on account creation, and
						customer invoices are automatically created and emailed whenever an
						order is created.
					</p>
				</div>

				<div className='card p-6'>
					<h3 className='text-lg font-semibold text-slate-900'>
						Operational note
					</h3>
					<p className='mt-2 text-sm leading-6 text-slate-500'>
						Technician work is handled through service bookings and assignments
						rather than customer orders. This keeps customer billing separate
						from internal field operations.
					</p>
				</div>
			</div>
		</section>
	);
}
