'use client';

import { useSignalR } from '@/lib/signalr/signalr-context';
import ChatPopup from './ChatPopup';

/**
 * Global chat popup that renders based on SignalR context state.
 * This component should be placed inside SignalRProvider.
 */
export default function GlobalChatPopup() {
  const { chatPopupState, closeChatPopup } = useSignalR();

  if (!chatPopupState) return null;

  return (
    <ChatPopup
      isOpen={chatPopupState.isOpen}
      onClose={closeChatPopup}
      userId={chatPopupState.userId}
      userName={chatPopupState.userName}
    />
  );
}
