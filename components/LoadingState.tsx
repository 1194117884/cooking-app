'use client';

import { ReactNode } from 'react';

interface LoadingProps {
  children?: ReactNode;
  loading?: boolean;
  skeleton?: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'full';
}

/**
 * 通用加载状态组件
 * 根据加载状态显示骨架屏、旋转器或其他占位符
 */
export default function LoadingState({
  children,
  loading = false,
  skeleton,
  size = 'md'
}: LoadingProps) {
  if (loading) {
    return (
      <div className={`flex items-center justify-center ${getSizeClasses(size)}`}>
        {skeleton || <DefaultSpinner />}
      </div>
    );
  }

  return <>{children}</>;
}

/**
 * 默认的加载旋转器
 */
function DefaultSpinner() {
  return (
    <div className="relative w-12 h-12">
      <div className="absolute inset-0 border-4 border-t-primary-500 border-r-primary-500 border-b-transparent border-l-transparent rounded-full animate-spin"></div>
      <div className="absolute inset-2 border-4 border-t-accent-500 border-r-accent-500 border-b-transparent border-l-transparent rounded-full animate-spin animate-reverse"></div>
    </div>
  );
}

/**
 * 根据大小获取对应的类
 */
function getSizeClasses(size: 'sm' | 'md' | 'lg' | 'full'): string {
  switch (size) {
    case 'sm':
      return 'h-8';
    case 'md':
      return 'h-16';
    case 'lg':
      return 'h-32';
    case 'full':
      return 'h-full w-full';
    default:
      return 'h-16';
  }
}

/**
 * 为特定类型内容的加载状态提供骨架屏
 */
export function ContentSkeleton({ type }: { type: 'card' | 'list-item' | 'avatar' | 'image' }) {
  switch (type) {
    case 'card':
      return (
        <div className="card bg-gray-200 animate-pulse rounded-xl shadow h-40">
          <div className="p-4 space-y-3">
            <div className="h-5 bg-gray-300 rounded w-3/4"></div>
            <div className="h-4 bg-gray-300 rounded w-full"></div>
            <div className="h-4 bg-gray-300 rounded w-2/3"></div>
          </div>
        </div>
      );

    case 'list-item':
      return (
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg animate-pulse">
          <div className="space-y-2">
            <div className="h-4 bg-gray-300 rounded w-3/4"></div>
            <div className="h-3 bg-gray-300 rounded w-1/2"></div>
          </div>
          <div className="h-8 w-8 bg-gray-300 rounded-full"></div>
        </div>
      );

    case 'avatar':
      return (
        <div className="h-10 w-10 rounded-full bg-gray-300 animate-pulse"></div>
      );

    case 'image':
      return (
        <div className="bg-gray-300 rounded-lg animate-pulse aspect-video w-full"></div>
      );

    default:
      return (
        <div className="bg-gray-200 animate-pulse rounded w-full h-24"></div>
      );
  }
}