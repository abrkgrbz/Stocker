'use client';

import { SignalRProvider } from '@/lib/signalr/signalr-context';
import GlobalChatPopup from '@/components/chat/GlobalChatPopup';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <SignalRProvider>
      {children}
      <GlobalChatPopup />
    </SignalRProvider>
  );
}
