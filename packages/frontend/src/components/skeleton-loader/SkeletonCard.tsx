import React from 'react';
import { motion } from 'framer-motion';
import { borderRadius, shadows } from '@/utils/design-tokens';
import { shimmer } from '@/utils/animations';

interface SkeletonCardProps {
  count?: number;
  className?: string;
}

const SkeletonCard: React.FC<SkeletonCardProps> = ({ count = 1, className = '' }) => {
  return (
    <>
      {[...Array(count)].map((_, index) => (
        <div
          key={index}
          className={`bg-white rounded-lg overflow-hidden ${className}`}
          style={{
            borderRadius: borderRadius.lg,
            boxShadow: shadows.md,
          }}
        >
          {/* Image skeleton */}
          <motion.div
            className="w-full h-48 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200"
            style={{
              backgroundSize: '200% 100%',
            }}
            animate={{
              backgroundPosition: ['200% 0', '-200% 0'],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'linear',
            }}
          />

          {/* Content skeleton */}
          <div className="p-4 space-y-3">
            <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse" />
            <div className="h-3 bg-gray-200 rounded w-1/2 animate-pulse" style={{ animationDelay: '100ms' }} />
            <div className="h-6 bg-gray-200 rounded w-1/3 animate-pulse" style={{ animationDelay: '200ms' }} />
            <div className="space-y-2 pt-2">
              <div className="h-3 bg-gray-200 rounded w-full animate-pulse" style={{ animationDelay: '300ms' }} />
              <div className="h-3 bg-gray-200 rounded w-5/6 animate-pulse" style={{ animationDelay: '400ms' }} />
            </div>
          </div>
        </div>
      ))}
    </>
  );
};

export default SkeletonCard;


















