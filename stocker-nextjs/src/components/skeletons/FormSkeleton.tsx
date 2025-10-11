import React from 'react';

interface FormSkeletonProps {
  fields?: number;
}

export default function FormSkeleton({ fields = 4 }: FormSkeletonProps) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="animate-pulse space-y-6">
        {/* Form Title */}
        <div className="h-6 bg-gray-200 rounded w-48 mb-8"></div>

        {/* Form Fields */}
        {Array.from({ length: fields }).map((_, i) => (
          <div key={i} className="space-y-2">
            <div className="h-4 bg-gray-200 rounded w-24"></div>
            <div className="h-10 bg-gray-200 rounded w-full"></div>
          </div>
        ))}

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4">
          <div className="h-10 bg-gray-200 rounded w-24"></div>
          <div className="h-10 bg-gray-200 rounded w-24"></div>
        </div>
      </div>
    </div>
  );
}
