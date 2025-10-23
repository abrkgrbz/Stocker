import { SystemMonitoring } from '@/features/system/components/SystemMonitoring';

export const metadata = {
  title: 'System Monitoring',
  description: 'Real-time system metrics and service status',
};

export default function SystemPage() {
  return <SystemMonitoring />;
}
