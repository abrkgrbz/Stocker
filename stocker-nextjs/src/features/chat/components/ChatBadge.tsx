'use client';

import React from 'react';
import { Badge, Tooltip } from 'antd';
import { ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';
import { useChatHub } from '@/lib/signalr/chat-hub';

export default function ChatBadge() {
  const router = useRouter();
  const { unreadCount, isConnected } = useChatHub();

  return (
    <Tooltip title="Mesajlar">
      <button
        type="button"
        onClick={() => router.push('/app/messaging')}
        className="
          relative w-9 h-9 flex items-center justify-center rounded-lg transition-all duration-150
          text-slate-500 hover:bg-slate-100 hover:text-slate-700
        "
      >
        <Badge count={unreadCount} size="small" offset={[-2, 2]}>
          <ChatBubbleLeftRightIcon className="w-[18px] h-[18px]" strokeWidth={1.75} />
        </Badge>
        {/* Connection status indicator */}
        <span
          className={`absolute bottom-1 right-1 w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-gray-400'
            }`}
        />
      </button>
    </Tooltip>
  );
}
