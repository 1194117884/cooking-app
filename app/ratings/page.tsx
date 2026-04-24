'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import Skeleton from '@/components/Skeleton';
import { getAuthToken } from '@/lib/auth-client';
import {
  Star,
  ArrowLeft,
  ChefHat,
  BookOpen,
  Calendar,
  ShoppingCart,
  Settings,
  FileText,
} from 'lucide-react';

interface Member {
  id: string;
  name: string;
  avatarColor: string;
}

interface Recipe {
  id: string;
  name: string;
}

interface MealPlan {
  id: string;
  dayOfWeek: number;
  mealType: string;
  recipe: Recipe;
}

interface Rating {
  id: string;
  rating: number;
  comment: string;
  member: Member;
  mealPlan: MealPlan;
  createdAt: string;
}

const DAY_NAMES = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];
const MEAL_NAMES: Record<string, string> = {
  BREAKFAST: '早餐',
  LUNCH: '午餐',
  DINNER: '晚餐',
};

async function fetchRatings(): Promise<Rating[]> {
  const token = await getAuthToken();

  const res = await fetch('/api/meal-ratings', {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (res.status === 401) {
    window.location.href = '/auth/login';
    throw new Error('未授权访问');
  }

  if (!res.ok) throw new Error('获取评分失败');
  const data = await res.json();
  return data.ratings;
}

export default function RatingsPage() {
  const router = useRouter();
  const { data: ratings = [], isLoading: ratingsLoading } = useQuery({
    queryKey: ['ratings'],
    queryFn: fetchRatings,
  });

  const averageRating = ratings.length > 0
    ? (ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length).toFixed(1)
    : '-';

  if (ratingsLoading) {
    return (
      <main className="min-h-screen bg-cream-gradient pb-24">
        <div className="max-w-4xl mx-auto px-6 py-8 space-y-6">
          <Skeleton className="h-20 rounded-3xl" />
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-2xl" />
          ))}
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-cream-gradient pb-24">
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display text-3xl font-bold text-gray-900 mb-2">餐食评分</h1>
            <p className="text-gray-500">记录和评价每一餐</p>
          </div>
          <button
            onClick={() => router.push('/planner')}
            className="btn-secondary flex items-center gap-2"
          >
            <ArrowLeft size={18} />
            返回计划
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="food-card p-5 text-center">
            <div className="text-3xl font-display font-bold text-amber-600">{ratings.length}</div>
            <div className="text-sm text-gray-500 mt-1">已评分</div>
          </div>
          <div className="food-card p-5 text-center">
            <div className="flex items-center justify-center gap-1 text-3xl font-display font-bold text-amber-600">
              {averageRating}
              {averageRating !== '-' && <Star size={20} className="fill-amber-500 text-amber-500" />}
            </div>
            <div className="text-sm text-gray-500 mt-1">平均分</div>
          </div>
          <div className="food-card p-5 text-center">
            <div className="text-3xl font-display font-bold text-sage-600">
              {ratings.filter((r) => r.rating >= 4).length}
            </div>
            <div className="text-sm text-gray-500 mt-1">好评</div>
          </div>
        </div>

        {/* Rating List */}
        <div className="space-y-4">
          {ratings.length === 0 ? (
            <div className="text-center py-16 food-card">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <FileText size={48} className="text-gray-400" />
              </div>
              <p className="text-gray-600 mb-2 text-lg">还没有评分记录</p>
              <p className="text-sm text-gray-500">
                在周计划页面点击&quot;评分&quot;按钮来记录您的用餐体验
              </p>
            </div>
          ) : (
            ratings.map((rating) => (
              <div
                key={rating.id}
                className="food-card p-5"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
                      style={{ backgroundColor: rating.member.avatarColor }}
                    >
                      {rating.member.name[0]}
                    </div>
                    <div>
                      <div className="font-semibold text-gray-800">{rating.member.name}</div>
                      <div className="text-sm text-gray-500">
                        {DAY_NAMES[rating.mealPlan.dayOfWeek - 1]} · {MEAL_NAMES[rating.mealPlan.mealType]}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        size={18}
                        className={i < rating.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-200'}
                      />
                    ))}
                  </div>
                </div>
                <div className="ml-13">
                  <div className="font-medium text-gray-800 mb-1">
                    {rating.mealPlan.recipe.name}
                  </div>
                  {rating.comment && (
                    <p className="text-gray-600 text-sm">{rating.comment}</p>
                  )}
                  <div className="text-xs text-gray-400 mt-2">
                    {new Date(rating.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 glass border-t border-gray-200 md:hidden safe-area-pb z-50">
        <div className="grid grid-cols-5 py-2">
          {[
            { href: '/', Icon: ChefHat, label: '首页' },
            { href: '/recipes', Icon: BookOpen, label: '菜谱' },
            { href: '/planner', Icon: Calendar, label: '计划', active: true },
            { href: '/shopping', Icon: ShoppingCart, label: '采购' },
            { href: '/settings', Icon: Settings, label: '设置' },
          ].map((item, idx) => (
            <a
              key={idx}
              href={item.href}
              className={`nav-link ${item.active ? 'nav-link-active' : 'nav-link-inactive'}`}
            >
              <item.Icon size={20} className="mb-0.5" />
              <span className="text-xs font-medium">{item.label}</span>
            </a>
          ))}
        </div>
      </nav>
    </main>
  );
}
