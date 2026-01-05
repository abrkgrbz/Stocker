'use client';

/**
 * =====================================
 * AVATAR COMPONENT
 * =====================================
 *
 * User avatar with fallback initials.
 * Linear/Raycast/Vercel aesthetic.
 */

import React, { forwardRef, useState } from 'react';
import { UserIcon } from '@heroicons/react/24/outline';
import { cn } from '@/lib/cn';
import Image from 'next/image';

// =====================================
// AVATAR PROPS
// =====================================

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Image source */
  src?: string | null;
  /** Alt text for image */
  alt?: string;
  /** Name for initials fallback */
  name?: string;
  /** Size variant */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  /** Shape variant */
  shape?: 'circle' | 'square';
  /** Status indicator */
  status?: 'online' | 'offline' | 'busy' | 'away';
  /** Show border */
  bordered?: boolean;
}

const sizeClasses = {
  xs: 'h-6 w-6 text-xs',
  sm: 'h-8 w-8 text-sm',
  md: 'h-10 w-10 text-sm',
  lg: 'h-12 w-12 text-base',
  xl: 'h-16 w-16 text-lg',
  '2xl': 'h-20 w-20 text-xl',
};

const statusSizeClasses = {
  xs: 'h-1.5 w-1.5',
  sm: 'h-2 w-2',
  md: 'h-2.5 w-2.5',
  lg: 'h-3 w-3',
  xl: 'h-3.5 w-3.5',
  '2xl': 'h-4 w-4',
};

const statusColorClasses = {
  online: 'bg-green-500',
  offline: 'bg-slate-400',
  busy: 'bg-red-500',
  away: 'bg-yellow-500',
};

// =====================================
// UTILITY FUNCTIONS
// =====================================

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) {
    return parts[0].substring(0, 2).toUpperCase();
  }
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function getColorFromName(name: string): string {
  const colors = [
    'bg-red-100 text-red-700',
    'bg-orange-100 text-orange-700',
    'bg-amber-100 text-amber-700',
    'bg-yellow-100 text-yellow-700',
    'bg-lime-100 text-lime-700',
    'bg-green-100 text-green-700',
    'bg-emerald-100 text-emerald-700',
    'bg-teal-100 text-teal-700',
    'bg-cyan-100 text-cyan-700',
    'bg-sky-100 text-sky-700',
    'bg-blue-100 text-blue-700',
    'bg-indigo-100 text-indigo-700',
    'bg-violet-100 text-violet-700',
    'bg-purple-100 text-purple-700',
    'bg-fuchsia-100 text-fuchsia-700',
    'bg-pink-100 text-pink-700',
  ];

  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }

  return colors[Math.abs(hash) % colors.length];
}

// =====================================
// AVATAR COMPONENT
// =====================================

export const Avatar = forwardRef<HTMLDivElement, AvatarProps>(
  (
    {
      src,
      alt,
      name,
      size = 'md',
      shape = 'circle',
      status,
      bordered = false,
      className,
      ...props
    },
    ref
  ) => {
    const [imageError, setImageError] = useState(false);

    const showImage = src && !imageError;
    const showInitials = !showImage && name;
    const showIcon = !showImage && !name;

    return (
      <div
        ref={ref}
        className={cn(
          'relative inline-flex items-center justify-center flex-shrink-0',
          sizeClasses[size],
          shape === 'circle' ? 'rounded-full' : 'rounded-lg',
          bordered && 'ring-2 ring-white',
          !showImage && (name ? getColorFromName(name) : 'bg-slate-100 text-slate-500'),
          className
        )}
        {...props}
      >


        {showImage && src && (
          <Image
            src={src}
            alt={alt || name || 'Avatar'}
            onError={() => setImageError(true)}
            fill
            sizes="80px"
            className={cn(
              'object-cover',
              shape === 'circle' ? 'rounded-full' : 'rounded-lg'
            )}
            unoptimized={src.startsWith('data:') || src.startsWith('blob:')} // Handle blob/data URIs gracefully if needed
          />
        )}

        {showInitials && (
          <span className="font-medium select-none">{getInitials(name)}</span>
        )}

        {showIcon && (
          <UserIcon className="h-1/2 w-1/2" />
        )}

        {status && (
          <span
            className={cn(
              'absolute bottom-0 right-0 block rounded-full ring-2 ring-white',
              statusSizeClasses[size],
              statusColorClasses[status]
            )}
          />
        )}
      </div>
    );
  }
);

Avatar.displayName = 'Avatar';

// =====================================
// AVATAR GROUP
// =====================================

export interface AvatarGroupProps {
  /** Maximum avatars to show */
  max?: number;
  /** Size variant for all avatars */
  size?: AvatarProps['size'];
  /** Avatars data */
  avatars: Array<{
    src?: string | null;
    name?: string;
    alt?: string;
  }>;
  /** Additional class names */
  className?: string;
}

export function AvatarGroup({
  max = 4,
  size = 'md',
  avatars,
  className,
}: AvatarGroupProps) {
  const visibleAvatars = avatars.slice(0, max);
  const remainingCount = avatars.length - max;

  return (
    <div className={cn('flex -space-x-2', className)}>
      {visibleAvatars.map((avatar, index) => (
        <Avatar
          key={index}
          src={avatar.src}
          name={avatar.name}
          alt={avatar.alt}
          size={size}
          bordered
        />
      ))}

      {remainingCount > 0 && (
        <div
          className={cn(
            'relative inline-flex items-center justify-center flex-shrink-0 rounded-full',
            'bg-slate-200 text-slate-600 font-medium ring-2 ring-white',
            sizeClasses[size]
          )}
        >
          +{remainingCount}
        </div>
      )}
    </div>
  );
}

export default Avatar;
