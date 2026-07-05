import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AppLayout } from '@/app/layout';
import { DashboardPage } from '@/pages/dashboard';
import { OrdersPage } from '@/pages/orders';
import { ProductsPage } from '@/pages/products';
import { ProductCreatePage } from '@/pages/products/create';
import { ProductDetailPage } from '@/pages/products/[id]';
import { ProductEditPage } from '@/pages/products/[id]/edit';
import { ServiceTypesPage } from '@/pages/service-types';
import { InvoicesPage } from '@/pages/invoices';
import { RevenuePage } from '@/pages/revenue';
import { SupportTicketsPage } from '@/pages/support-tickets';
import { SupportTicketDetailPage } from '@/pages/support-tickets/[id]';
import { AssignmentsPage } from '@/pages/assignments';
import { AnalyticsPage } from '@/pages/analytics';
import { NotificationsPage } from '@/pages/notifications';
import { UsersPage } from '@/pages/users';
import { QueuesPage } from '@/pages/queues';
import { JobsPage } from '@/pages/jobs';
import { CartsPage } from '@/pages/carts';
import { LoginPage } from '@/pages/auth/login';
import { ProtectedRoute } from '@/features/auth/protected-route';
import { RoleGuard } from '@/features/auth/role-guard';
import { Role } from '@/lib/roles';
import { BlogsPage } from '@/pages/blogs';

const adminRoles = [Role.SUPER_ADMIN, Role.ADMIN];
const superAdminRoles = [Role.SUPER_ADMIN];
const blogRoles = [Role.SUPER_ADMIN, Role.ADMIN, Role.WRITER];

export const router = createBrowserRouter([
	{ path: '/login', element: <LoginPage /> },
	{
		path: '/',
		element: (
			<ProtectedRoute>
				<AppLayout />
			</ProtectedRoute>
		),
		children: [
			{ index: true, element: <RoleGuard roles={[Role.SUPER_ADMIN, Role.ADMIN, Role.TECHNICIAN]}><DashboardPage /></RoleGuard> },
			{
				path: 'blogs',
				element: <RoleGuard roles={blogRoles}><BlogsPage /></RoleGuard>,
			},
			{
				path: 'products',
				element: (
					<RoleGuard roles={adminRoles}>
						<ProductsPage />
					</RoleGuard>
				),
			},
			{
				path: 'products/create',
				element: (
					<RoleGuard roles={superAdminRoles}>
						<ProductCreatePage />
					</RoleGuard>
				),
			},
			{
				path: 'products/:id',
				element: (
					<RoleGuard roles={adminRoles}>
						<ProductDetailPage />
					</RoleGuard>
				),
			},
			{
				path: 'products/:id/edit',
				element: (
					<RoleGuard roles={superAdminRoles}>
						<ProductEditPage />
					</RoleGuard>
				),
			},
			{
				path: 'service-types',
				element: (
					<RoleGuard roles={superAdminRoles}>
						<ServiceTypesPage />
					</RoleGuard>
				),
			},
			{
				path: 'orders',
				element: (
					<RoleGuard roles={adminRoles}>
						<OrdersPage />
					</RoleGuard>
				),
			},
			{
				path: 'invoices',
				element: (
					<RoleGuard roles={adminRoles}>
						<InvoicesPage />
					</RoleGuard>
				),
			},
			{
				path: 'revenue',
				element: (
					<RoleGuard roles={superAdminRoles}>
						<RevenuePage />
					</RoleGuard>
				),
			},
			{
				path: 'support-tickets',
				element: (
					<RoleGuard roles={adminRoles}>
						<SupportTicketsPage />
					</RoleGuard>
				),
			},
			{
				path: 'support-tickets/:id',
				element: (
					<RoleGuard roles={adminRoles}>
						<SupportTicketDetailPage />
					</RoleGuard>
				),
			},
			{
				path: 'assignments',
				element: (
					<RoleGuard roles={adminRoles}>
						<AssignmentsPage />
					</RoleGuard>
				),
			},
			{
				path: 'analytics',
				element: (
					<RoleGuard roles={adminRoles}>
						<AnalyticsPage />
					</RoleGuard>
				),
			},
			{
				path: 'notifications',
				element: (
					<RoleGuard roles={adminRoles}>
						<NotificationsPage />
					</RoleGuard>
				),
			},
			{
				path: 'users',
				element: (
					<RoleGuard roles={superAdminRoles}>
						<UsersPage />
					</RoleGuard>
				),
			},
			{
				path: 'queues',
				element: (
					<RoleGuard roles={superAdminRoles}>
						<QueuesPage />
					</RoleGuard>
				),
			},
			{
				path: 'carts',
				element: (
					<RoleGuard roles={adminRoles}>
						<CartsPage />
					</RoleGuard>
				),
			},
			{
				path: 'jobs',
				element: (
					<RoleGuard roles={[Role.TECHNICIAN, Role.ADMIN, Role.SUPER_ADMIN]}>
						<JobsPage />
					</RoleGuard>
				),
			},
			{ path: '*', element: <Navigate to='/' replace /> },
		],
	},
]);
