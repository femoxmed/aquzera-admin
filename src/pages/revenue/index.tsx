import { Wallet, Receipt, ShoppingCart, Activity } from 'lucide-react';
import { MetricCard } from '@/components/shared/metric-card';
import { PageHeader } from '@/components/shared/page-header';
import { useDashboardMetrics } from '@/features/dashboard/hooks';
import { currency } from '@/lib/utils';

export function RevenuePage() {
  const { data } = useDashboardMetrics();
  const metrics = data ?? { monthlyRevenue: 0, invoiceCount: 0, orderCount: 0, pendingServiceCount: 0 };

  return (
    <section>
      <PageHeader title='Revenue' description='Track paid revenue, paid order volume, and pending operational work.' />
      <div className='grid gap-5 md:grid-cols-2 xl:grid-cols-4'>
        <MetricCard title='Paid Revenue' value={currency(metrics.monthlyRevenue)} helper='Paid invoice-backed revenue' icon={<Wallet size={22} />} />
        <MetricCard title='Paid Invoices' value={String(metrics.invoiceCount)} helper='Invoices confirmed as paid' icon={<Receipt size={22} />} />
        <MetricCard title='Paid Orders' value={String(metrics.orderCount)} helper='Orders confirmed as paid' icon={<ShoppingCart size={22} />} />
        <MetricCard title='Service Due' value={String(metrics.pendingServiceCount)} helper='Pending service actions' icon={<Activity size={22} />} />
      </div>
    </section>
  );
}
