import React from 'react';

interface SkeletonItemProps {
  level: number;
  hasChildren?: boolean;
  isExpanded?: boolean;
  width?: string;
}

const SkeletonItem: React.FC<SkeletonItemProps> = ({ 
  level, 
  hasChildren = false, 
  isExpanded = true,
  width = "w-32"
}) => {
  const indentWidth = level * 20; // 20px per level

  return (
    <div className="flex items-center py-1">
      <div style={{ width: `${indentWidth}px` }} />
      
      {/* Toggle icon placeholder */}
      {hasChildren && (
        <div className="w-4 h-4 mr-1">
          <div className="w-3 h-3 bg-gray-200 animate-pulse rounded-sm" />
        </div>
      )}
      
      {/* Node icon placeholder */}
      <div className="w-4 h-4 mr-2">
        <div className="w-4 h-4 bg-gray-200 animate-pulse rounded-sm" />
      </div>
      
      {/* Text placeholder */}
      <div className={`h-4 bg-gray-200 animate-pulse rounded ${width}`} />
    </div>
  );
};

interface SkeletonForTreeMenuForCounselorProps {
  type?: 'full' | 'partial';
}

export const SkeletonForTreeMenuForCounselor: React.FC<SkeletonForTreeMenuForCounselorProps> = ({ 
  type = 'full' 
}) => {
  if (type === 'partial') {
    // 부분 스켈레톤 - 간단한 버전
    return (
      <div className="flex flex-col h-full">
        {/* Search bar skeleton */}
        <div className="flex items-center border-b p-2">
          <div className="flex-grow">
            <div className="h-8 bg-gray-200 animate-pulse rounded" />
          </div>
          <div className="w-10 h-8 ml-2 bg-gray-200 animate-pulse rounded" />
        </div>

        {/* Tree content skeleton */}
        <div className="flex-grow overflow-y-auto p-2">
          {/* Organization level */}
          <SkeletonItem level={0} hasChildren={true} width="w-24" />
          
          {/* Tenant level */}
          <SkeletonItem level={1} hasChildren={true} width="w-28" />
          
          {/* Group level */}
          <SkeletonItem level={2} hasChildren={true} width="w-36" />
          
          {/* Team level */}
          <SkeletonItem level={3} hasChildren={true} width="w-32" />
          
          {/* Counselor levels */}
          {[1, 2, 3, 4, 5].map((i) => (
            <SkeletonItem key={i} level={4} hasChildren={false} width="w-28" />
          ))}
        </div>
      </div>
    );
  }

  // 전체 스켈레톤 - 상세한 버전 (3분의 2로 축소)
  return (
    <div className="flex flex-col h-full">
      {/* Search bar skeleton */}
      <div className="flex items-center border-b p-2">
        <div className="flex-grow">
          <div className="h-8 bg-gray-200 animate-pulse rounded" />
        </div>
        <div className="w-10 h-8 ml-2 bg-gray-200 animate-pulse rounded" />
      </div>

      {/* Tree content skeleton */}
      <div className="flex-grow overflow-y-auto p-2">
        {/* First Organization */}
        <SkeletonItem level={0} hasChildren={true} width="w-24" />
        
        {/* First Tenant */}
        <SkeletonItem level={1} hasChildren={true} width="w-28" />
        
        {/* Group */}
        <SkeletonItem level={2} hasChildren={true} width="w-36" />
        
        {/* Team */}
        <SkeletonItem level={3} hasChildren={true} width="w-32" />
        
        {/* Counselors (4명으로 증가) */}
        {[1, 2, 3].map((i) => (
          <div key={`counselor-${i}`}>
            <SkeletonItem level={4} hasChildren={true} width="w-28" />
            {/* Skills under counselor (1-2개) */}
            <SkeletonItem level={5} hasChildren={false} width="w-20" />
            {i <= 2 && <SkeletonItem level={5} hasChildren={false} width="w-24" />}
          </div>
        ))}
        
        {/* Second Team */}
        <SkeletonItem level={3} hasChildren={true} width="w-32" />
        {[1, 2, 3].map((i) => (
          <SkeletonItem key={`team2-counselor-${i}`} level={4} hasChildren={false} width="w-28" />
        ))}
        
        {/* Second Group */}
        <SkeletonItem level={2} hasChildren={true} width="w-36" />
        <SkeletonItem level={3} hasChildren={true} width="w-32" />
        {[1, 2].map((i) => (
          <SkeletonItem key={`group2-counselor-${i}`} level={4} hasChildren={false} width="w-28" />
        ))}
        
        {/* Second Organization (collapsed) */}
        <SkeletonItem level={0} hasChildren={true} width="w-24" />
      </div>
      
      {/* Debug info skeleton */}
      <div className="text-xs text-gray-400 p-2 border-t">
        <div className="flex space-x-2">
          <div className="h-3 w-16 bg-gray-200 animate-pulse rounded" />
          <div className="h-3 w-20 bg-gray-200 animate-pulse rounded" />
          <div className="h-3 w-24 bg-gray-200 animate-pulse rounded" />
        </div>
      </div>
    </div>
  );
};