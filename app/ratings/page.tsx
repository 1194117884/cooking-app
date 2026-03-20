'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import Skeleton from '@/components/Skeleton';
import { getAuthToken } from '@/lib/auth-client';
import { getAuthToken } from '@/lib/auth-client';

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

async function fetchMembers(): Promise<Member[]> {
  const token = await getAuthToken();

  const res = await fetch('/api/members', {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (res.status === 401) {
    window.location.href = '/auth/login';
    throw new Error('未授权访问');
  }

  if (!res.ok) throw new Error('获取成员失败');
  const data = await res.json();
  return data.members;
}

export default function RatingsPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<MealPlan | null>(null);

  const { data: ratings = [], isLoading: ratingsLoading } = useQuery({
    queryKey: ['ratings'],
    queryFn: fetchRatings,
  });

  const { data: members = [], isLoading: membersLoading } = useQuery({
    queryKey: ['members'],
    queryFn: fetchMembers,
  });

  const getRatingStars = (rating: number) => {
    return '⭐'.repeat(rating);
  };

  if (ratingsLoading || membersLoading) {
    return (
      <main className="min-h-screen p-6 pb-24">
        <div className="max-w-4xl mx-auto space-y-6">
          <Skeleton className="h-20 rounded-xl" />
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-xl" />
          ))}
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen p-6 pb-24">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">⭐ 餐食评分</h1>
            <p className="text-gray-600">记录和评价每一餐</p>
          </div>
          <button
            onClick={() => router.push('/planner')}
            className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700"
          >
            返回计划
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow p-4 text-center">
            <div className="text-3xl font-bold text-primary-600">{ratings.length}</div>
            <div className="text-sm text-gray-600">已评分</div>
          </div>
          <div className="bg-white rounded-xl shadow p-4 text-center">
            <div className="text-3xl font-bold text-accent-600">
              {ratings.length > 0
                ? (ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length).toFixed(1)
                : '-'}
            </div>
            <div className="text-sm text-gray-600">平均分</div>
          </div>
          <div className="bg-white rounded-xl shadow p-4 text-center">
            <div className="text-3xl font-bold text-green-600">
              {ratings.filter((r) => r.rating >= 4).length}
            </div>
            <div className="text-sm text-gray-600">好评</div>
          </div>
        </div>

        {/* Rating List */}
        <div className="space-y-4">
          {ratings.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl shadow">
              <div className="text-6xl mb-4">📝</div>
              <p className="text-gray-600 mb-4">还没有评分记录</p>
              <p className="text-sm text-gray-500">
                在周计划页面点击"评分"按钮来记录您的用餐体验
              </p>
            </div>
          ) : (
            ratings.map((rating) => (
              <div
                key={rating.id}
                className="bg-white rounded-xl shadow p-4"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
                      style={{ backgroundColor: rating.member.avatarColor }}
                    >
                      {rating.member.name[0]}
                    </div>
                    <div>
                      <div className="font-semibold">{rating.member.name}</div>
                      <div className="text-sm text-gray-500">
                        {DAY_NAMES[rating.mealPlan.dayOfWeek - 1]} · {MEAL_NAMES[rating.mealPlan.mealType]}
                      </div>
                    </div>
                  </div>
                  <div className="text-2xl">{getRatingStars(rating.rating)}</div>
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
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 md:hidden safe-area-pb">
        <div className="grid grid-cols-5">
          <a href="/" className="flex flex-col items-center py-3 text-gray-600">
            <span className="text-xl">🏠</span>
            <span className="text-xs mt-1">首页</span>
          </a>
          <a href="/recipes" className="flex flex-col items-center py-3 text-gray-600">
            <span className="text-xl">📚</span>
            <span className="text-xs mt-1">菜谱</span>
          </a>
          <a href="/planner" className="flex flex-col items-center py-3 text-primary-600">
            <span className="text-xl">📅</span>
            <span className="text-xs mt-1">计划</span>
          </a>
          <a href="/shopping" className="flex flex-col items-center py-3 text-gray-600">
            <span className="text-xl">🛒</span>
            <span className="text-xs mt-1">采购</span>
          </a>
          <a href="/settings" className="flex flex-col items-center py-3 text-gray-600">
            <span className="text-xl">⚙️</span>
            <span className="text-xs mt-1">设置</span>
          </a>
        </div>
      </nav>
    </main>
  );
}
