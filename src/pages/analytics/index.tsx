import { BarChart3, Users, Wallet, LifeBuoy } from 'lucide-react';
import { MetricCard } from '@/components/shared/metric-card';
import { PageHeader } from '@/components/shared/page-header';
import { useDashboardMetrics } from '@/features/dashboard/hooks';
import { currency } from '@/lib/utils';

export function AnalyticsPage() {
  const { data } = useDashboardMetrics();
  const metrics = data ?? { customerCount: 0, monthlyRevenue: 0, openSupportTickets: 0, orderCount: 0 };

  return (
    <section>
      <PageHeader title='Business Analytics' description='Monitor growth, revenue, support demand, and overall operating efficiency.' />
      <div className='grid gap-5 md:grid-cols-2 xl:grid-cols-4'>
        <MetricCard title='Customer Base' value={String(metrics.customerCount)} helper='Total customers in CRM' icon={<Users size={22} />} />
        <MetricCard title='Revenue' value={currency(metrics.monthlyRevenue)} helper='Paid invoice earnings' icon={<Wallet size={22} />} />
        <MetricCard title='Open Tickets' value={String(metrics.openSupportTickets)} helper='Support tickets requiring action' icon={<LifeBuoy size={22} />} />
        <MetricCard title='Order Volume' value={String(metrics.orderCount)} helper='Paid order records in platform' icon={<BarChart3 size={22} />} />
      </div>
    </section>
  );
}
