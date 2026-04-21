import React from 'react';

interface SkeletonLoaderProps {
  className?: string;
}

export const SkeletonBox: React.FC<SkeletonLoaderProps> = ({ className = '' }) => (
  <div className={`animate-pulse bg-gray-200 rounded ${className}`} />
);

export const SkeletonText: React.FC<{ lines?: number; className?: string }> = ({ 
  lines = 3, 
  className = '' 
}) => (
  <div className={`space-y-2 ${className}`}>
    {Array.from({ length: lines }).map((_, index) => (
      <SkeletonBox 
        key={index} 
        className={`h-4 ${index === lines - 1 ? 'w-3/4' : 'w-full'}`} 
      />
    ))}
  </div>
);

export const SkeletonCard: React.FC<SkeletonLoaderProps> = ({ className = '' }) => (
  <div className={`bg-white rounded-xl shadow-md p-6 ${className}`}>
    <div className="flex items-start gap-4">
      <SkeletonBox className="w-16 h-16 rounded-full flex-shrink-0" />
      <div className="flex-1 space-y-3">
        <SkeletonBox className="h-5 w-1/2" />
        <SkeletonBox className="h-4 w-3/4" />
        <SkeletonBox className="h-4 w-full" />
      </div>
    </div>
  </div>
);

export const SkeletonTable: React.FC<{ rows?: number; columns?: number }> = ({ 
  rows = 5, 
  columns = 4 
}) => (
  <div className="bg-white rounded-xl shadow-md overflow-hidden">
    <div className="p-4 border-b border-gray-200">
      <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
        {Array.from({ length: columns }).map((_, index) => (
          <SkeletonBox key={index} className="h-5" />
        ))}
      </div>
    </div>
    <div className="divide-y divide-gray-200">
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="p-4">
          <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
            {Array.from({ length: columns }).map((_, colIndex) => (
              <SkeletonBox key={colIndex} className="h-4" />
            ))}
          </div>
        </div>
      ))}
    </div>
  </div>
);

export const SkeletonServiceCard: React.FC = () => (
  <div className="bg-white rounded-xl shadow-md overflow-hidden">
    <SkeletonBox className="h-48 w-full" />
    <div className="p-4 space-y-3">
      <SkeletonBox className="h-6 w-3/4" />
      <SkeletonBox className="h-4 w-1/2" />
      <div className="flex items-center gap-2">
        <SkeletonBox className="h-4 w-20" />
        <SkeletonBox className="h-4 w-16" />
      </div>
      <SkeletonBox className="h-10 w-full" />
    </div>
  </div>
);

export const SkeletonAppointmentCard: React.FC = () => (
  <div className="bg-white rounded-xl shadow-md p-6">
    <div className="flex items-start justify-between mb-4">
      <div className="flex items-center gap-3 flex-1">
        <SkeletonBox className="w-12 h-12 rounded-full" />
        <div className="space-y-2 flex-1">
          <SkeletonBox className="h-5 w-1/3" />
          <SkeletonBox className="h-4 w-1/4" />
        </div>
      </div>
      <SkeletonBox className="h-6 w-20 rounded-full" />
    </div>
    <div className="space-y-2 mb-4">
      <SkeletonBox className="h-4 w-1/2" />
      <SkeletonBox className="h-4 w-2/3" />
    </div>
    <div className="flex gap-2">
      <SkeletonBox className="h-10 flex-1" />
      <SkeletonBox className="h-10 flex-1" />
    </div>
  </div>
);

export const SkeletonDashboardHome: React.FC = () => (
  <div className="space-y-6">
    <SkeletonBox className="h-10 w-1/3" />
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <SkeletonCard />
      <SkeletonCard />
      <SkeletonCard />
    </div>
    <div className="space-y-4">
      <SkeletonBox className="h-8 w-1/4" />
      <SkeletonAppointmentCard />
      <SkeletonAppointmentCard />
    </div>
  </div>
);

export const SkeletonBrowseServices: React.FC = () => (
  <div className="space-y-6">
    <SkeletonBox className="h-12 w-full" />
    <div className="flex gap-6">
      <div className="w-64 space-y-4">
        <SkeletonBox className="h-8 w-full" />
        <SkeletonBox className="h-32 w-full" />
        <SkeletonBox className="h-32 w-full" />
      </div>
      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <SkeletonServiceCard />
        <SkeletonServiceCard />
        <SkeletonServiceCard />
        <SkeletonServiceCard />
        <SkeletonServiceCard />
        <SkeletonServiceCard />
      </div>
    </div>
  </div>
);

export const SkeletonPayments: React.FC = () => (
  <div className="space-y-6">
    <div className="flex justify-between items-center">
      <SkeletonBox className="h-10 w-1/4" />
      <SkeletonBox className="h-10 w-32" />
    </div>
    <SkeletonTable rows={8} columns={5} />
  </div>
);

export default {
  Box: SkeletonBox,
  Text: SkeletonText,
  Card: SkeletonCard,
  Table: SkeletonTable,
  ServiceCard: SkeletonServiceCard,
  AppointmentCard: SkeletonAppointmentCard,
  DashboardHome: SkeletonDashboardHome,
  BrowseServices: SkeletonBrowseServices,
  Payments: SkeletonPayments,
};
