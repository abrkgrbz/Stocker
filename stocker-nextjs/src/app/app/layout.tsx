'use client';

import { SignalRProvider } from '@/lib/signalr/signalr-context';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return <SignalRProvider>{children}</SignalRProvider>;
}
