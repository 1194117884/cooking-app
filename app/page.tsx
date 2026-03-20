'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Skeleton from '@/components/Skeleton';
import Link from 'next/link';
import { getAuthToken } from '@/lib/auth-client';

interface DashboardStats {
  recipeCount: number;
  memberCount: number;
  favoriteCount: number;
  ingredientCount: number;
  mealPlanCount: number;
}

interface Recipe {
  id: string;
  name: string;
  cuisineType: string;
  difficulty: string;
  cookTimeMin: number;
  coverImageUrl?: string;
}

async function fetchDashboard() {
  const res = await fetch('/api/dashboard');
  if (!res.ok) throw new Error('获取数据失败');
  return res.json();
}

async function generateMealPlans() {
  // 获取认证token
  const token = await getAuthToken();

  // 获取本周一日期
  const today = new Date();
  const dayOfWeek = today.getDay() || 7;
  const monday = new Date(today);
  monday.setDate(today.getDate() - dayOfWeek + 1);
  monday.setHours(0, 0, 0, 0);

  const res = await fetch('/api/meal-plans/generate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ weekStartDate: monday.toISOString() }),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || '生成失败');
  }

  return res.json();
}

export default function Home() {
  const queryClient = useQueryClient();
  const [generating, setGenerating] = useState(false);
  const [generateError, setGenerateError] = useState('');

  const { data, isLoading, error } = useQuery({
    queryKey: ['dashboard'],
    queryFn: fetchDashboard,
  });

  const generateMutation = useMutation({
    mutationFn: generateMealPlans,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      setGenerating(false);
      setGenerateError('');
      // 跳转到计划页面
      window.location.href = '/planner';
    },
    onError: (err: Error) => {
      setGenerating(false);
      setGenerateError(err.message);
    },
  });

  const stats: DashboardStats | null = data?.stats || null;
  const popularRecipes: Recipe[] = data?.popularRecipes || [];

  const handleGenerate = () => {
    setGenerating(true);
    setGenerateError('');
    generateMutation.mutate();
  };

  if (isLoading) {
    return (
      <main className="min-h-screen p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          <Skeleton className="h-32 rounded-3xl" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-24 rounded-xl" />
            ))}
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-40 rounded-xl" />
            ))}
          </div>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">😕</div>
          <p className="text-gray-600">加载失败，请刷新重试</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-gradient-to-br from-primary-500 to-accent-500 rounded-3xl p-8 mb-6 text-white shadow-xl">
          <h1 className="text-3xl font-bold mb-2">🍳 家庭美食规划系统</h1>
          <p className="opacity-90">智能规划每周美食，让做饭更轻松</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="card p-4 bg-white rounded-xl shadow">
            <div className="text-2xl font-bold text-primary-600">{stats?.recipeCount || 0}</div>
            <div className="text-sm text-gray-600">菜谱库</div>
          </div>
          <div className="card p-4 bg-white rounded-xl shadow">
            <div className="text-2xl font-bold text-accent-600">{stats?.mealPlanCount || 0}</div>
            <div className="text-sm text-gray-600">本周计划</div>
          </div>
          <div className="card p-4 bg-white rounded-xl shadow">
            <div className="text-2xl font-bold text-green-600">{stats?.memberCount || 0}</div>
            <div className="text-sm text-gray-600">家庭成员</div>
          </div>
          <div className="card p-4 bg-white rounded-xl shadow">
            <div className="text-2xl font-bold text-blue-600">{stats?.favoriteCount || 0}</div>
            <div className="text-sm text-gray-600">收藏菜谱</div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-4 mb-6">
          <a href="/recipes" className="card p-6 bg-white rounded-xl shadow hover:shadow-lg transition-shadow cursor-pointer">
            <div className="text-3xl mb-3">📚</div>
            <h3 className="font-semibold text-lg mb-1">菜谱库</h3>
            <p className="text-sm text-gray-600">浏览{stats?.recipeCount || 0}道美味佳肴</p>
          </a>

          <a href="/planner" className="card p-6 bg-white rounded-xl shadow hover:shadow-lg transition-shadow cursor-pointer">
            <div className="text-3xl mb-3">📅</div>
            <h3 className="font-semibold text-lg mb-1">周计划</h3>
            <p className="text-sm text-gray-600">智能规划每周菜单</p>
          </a>

          <a href="/shopping" className="card p-6 bg-white rounded-xl shadow hover:shadow-lg transition-shadow cursor-pointer">
            <div className="text-3xl mb-3">🛒</div>
            <h3 className="font-semibold text-lg mb-1">采购清单</h3>
            <p className="text-sm text-gray-600">自动生成，一键购物</p>
          </a>
        </div>

        {/* Popular Recipes */}
        <div className="card bg-white rounded-xl shadow mb-6">
          <div className="p-4 border-b">
            <h2 className="font-semibold text-lg">🔥 热门菜谱</h2>
          </div>
          <div className="p-4">
            {popularRecipes.length > 0 ? (
              <div className="space-y-3">
                {popularRecipes.map((recipe) => (
                  <div key={recipe.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <h3 className="font-medium">{recipe.name}</h3>
                      <p className="text-sm text-gray-500">
                        {recipe.cuisineType} · {recipe.cookTimeMin}分钟 · {recipe.difficulty === 'EASY' ? '简单' : recipe.difficulty === 'MEDIUM' ? '中等' : '困难'}
                      </p>
                    </div>
                    <span className="text-sm text-primary-600">查看详情 →</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-600 text-center py-8">暂无菜谱数据</p>
            )}
          </div>
        </div>

        {/* Today's Meal */}
        <div className="card bg-white rounded-xl shadow">
          <div className="p-4 border-b">
            <h2 className="font-semibold text-lg">🍽️ 今天吃什么？</h2>
          </div>
          <div className="p-4">
            {stats?.mealPlanCount ? (
              <div className="space-y-3">
                <p className="text-gray-600">本周已安排 {stats.mealPlanCount} 餐</p>
                <a href="/planner" className="btn-primary inline-block">
                  查看本周菜单
                </a>
              </div>
            ) : (
              <>
                <p className="text-gray-600 text-center py-8">本周菜单还未安排</p>
                {generateError && (
                  <p className="text-red-500 text-center mb-4">{generateError}</p>
                )}
                <button
                  onClick={handleGenerate}
                  disabled={generating}
                  className="btn-primary w-full bg-primary-600 text-white py-2 px-4 rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {generating ? (
                    <>
                      <span className="animate-spin">⏳</span>
                      正在生成...
                    </>
                  ) : (
                    <>🤖 智能生成本周菜单</>
                  )}
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Navigation (Mobile) */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 md:hidden safe-area-pb">
        <div className="grid grid-cols-5">
          <a href="/" className="flex flex-col items-center py-3 text-primary-600">
            <span className="text-xl">🏠</span>
            <span className="text-xs mt-1">首页</span>
          </a>
          <a href="/recipes" className="flex flex-col items-center py-3 text-gray-600">
            <span className="text-xl">📚</span>
            <span className="text-xs mt-1">菜谱</span>
          </a>
          <a href="/planner" className="flex flex-col items-center py-3 text-gray-600">
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
