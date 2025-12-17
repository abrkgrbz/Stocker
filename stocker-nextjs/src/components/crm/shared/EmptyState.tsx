'use client';

import React from 'react';

interface EmptyStateProps {
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  title: string;
  description: string;
  action?: React.ReactNode;
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      <div className="w-12 h-12 rounded-lg bg-slate-50 flex items-center justify-center mb-4">
        <Icon className="text-slate-300" style={{ fontSize: 20 }} />
      </div>
      <h3 className="text-sm font-medium text-slate-600 mb-1">{title}</h3>
      <p className="text-xs text-slate-400 mb-4 text-center max-w-xs">
        {description}
      </p>
      {action}
    </div>
  );
}
