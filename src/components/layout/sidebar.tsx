import { NavLink } from 'react-router-dom';
import {
	LayoutDashboard,
	Users,
	ShoppingCart,
	Shield,
	Server,
	Wrench,
	Boxes,
	Receipt,
	Wallet,
	LifeBuoy,
	ClipboardList,
	BarChart3,
	Bell,
	Tags,
	NotebookPen,
} from 'lucide-react';
import { authStore } from '@/lib/auth-store';
import { Role } from '@/lib/roles';
import { cn } from '@/lib/utils';
import aquzeraLogo from '@/assets/aquzera_logo.png';

const items = [
	{
		to: '/blogs',
		label: 'Blog CMS',
		icon: NotebookPen,
		roles: [Role.SUPER_ADMIN, Role.ADMIN, Role.WRITER],
	},
	{
		to: '/',
		label: 'Dashboard',
		icon: LayoutDashboard,
		roles: [Role.SUPER_ADMIN, Role.ADMIN, Role.TECHNICIAN],
	},
	{
		to: '/users',
		label: 'Users',
		icon: Users,
		roles: [Role.SUPER_ADMIN],
	},
	{
		to: '/products',
		label: 'Products',
		icon: Boxes,
		roles: [Role.SUPER_ADMIN, Role.ADMIN],
	},
	{
		to: '/service-types',
		label: 'Service Types',
		icon: Tags,
		roles: [Role.SUPER_ADMIN],
	},
	{
		to: '/orders',
		label: 'Orders',
		icon: ShoppingCart,
		roles: [Role.SUPER_ADMIN, Role.ADMIN],
	},
	{
		to: '/invoices',
		label: 'Invoices',
		icon: Receipt,
		roles: [Role.SUPER_ADMIN, Role.ADMIN],
	},
	{
		to: '/carts',
		label: 'Carts',
		icon: ShoppingCart,
		roles: [Role.SUPER_ADMIN, Role.ADMIN],
	},
	{
		to: '/revenue',
		label: 'Revenue',
		icon: Wallet,
		roles: [Role.SUPER_ADMIN],
	},
	{
		to: '/support-tickets',
		label: 'Support Tickets',
		icon: LifeBuoy,
		roles: [Role.SUPER_ADMIN, Role.ADMIN],
	},
	{
		to: '/assignments',
		label: 'Technician Assignments',
		icon: ClipboardList,
		roles: [Role.SUPER_ADMIN, Role.ADMIN],
	},
	{
		to: '/analytics',
		label: 'Analytics',
		icon: BarChart3,
		roles: [Role.SUPER_ADMIN, Role.ADMIN],
	},
	{
		to: '/notifications',
		label: 'Notifications',
		icon: Bell,
		roles: [Role.SUPER_ADMIN, Role.ADMIN],
	},
	{
		to: '/queues',
		label: 'Queues',
		icon: Server,
		roles: [Role.SUPER_ADMIN],
	},
	{
		to: '/jobs',
		label: 'My Jobs',
		icon: Wrench,
		roles: [Role.TECHNICIAN, Role.ADMIN, Role.SUPER_ADMIN],
	},
];

export function Sidebar() {
	const role = authStore.getRole();

	return (
		<aside className='hidden w-72 shrink-0 border-r border-slate-200 bg-white lg:block'>
			<div className='flex h-20 items-center px-6'>
				<div className='flex flex-col gap-1 mt-30'>
					<img
						src={aquzeraLogo}
						alt='Aquzera Logo'
						className='h-12.4 w-[70%] object-contain mt-20'
					/>
					{/* <p className='text-sm text-slate-500'>
						{role === Role.SUPER_ADMIN
							? 'Super Admin Console'
							: 'Operations Console'}
					</p> */}
				</div>
			</div>

			<nav className='space-y-1 px-4 py-4 mt-20'>
				{items
					.filter((item) => role && item.roles.includes(role as Role))
					.map((item) => {
						const Icon = item.icon;
						return (
							<NavLink
								key={item.to}
								to={item.to}
								end={item.to === '/'}
								className={({ isActive }) =>
									cn(
										'flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition',
										isActive
											? 'bg-secondary text-white'
											: 'text-slate-600 hover:bg-slate-100',
									)
								}>
								<Icon size={18} />
								{item.label}
							</NavLink>
						);
					})}
			</nav>
		</aside>
	);
}
