import { Bell, Mail, Server } from 'lucide-react';
import { MetricCard } from '@/components/shared/metric-card';
import { PageHeader } from '@/components/shared/page-header';

export function NotificationsPage() {
  const queue = { waiting: 0, active: 0, status: 'unknown' };

  return (
    <section>
      <PageHeader title='Notifications' description='Manage email and queue-backed outreach for maintenance, password reset, and support.' />
      <div className='grid gap-5 md:grid-cols-2 xl:grid-cols-3'>
        <MetricCard title='Queued Notifications' value={String(queue.waiting)} helper='Messages currently waiting in Redis queues' icon={<Bell size={22} />} />
        <MetricCard title='Active Processing' value={String(queue.active)} helper='Workers processing outgoing notifications' icon={<Mail size={22} />} />
        <MetricCard title='Queue Health' value={String(queue.status)} helper='Redis worker health snapshot' icon={<Server size={22} />} />
      </div>
    </section>
  );
}
