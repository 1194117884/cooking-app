'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Skeleton from '@/components/Skeleton';
import Link from 'next/link';
import { api } from '@/lib/api-client';
import {
  BookOpen,
  Calendar,
  ShoppingCart,
  Users,
  Heart,
  ChefHat,
  Sparkles,
  ArrowRight,
  Search,
  Loader2,
  UtensilsCrossed,
  Settings,
} from 'lucide-react';

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

interface DashboardData {
  stats: DashboardStats;
  popularRecipes: Recipe[];
}

async function fetchDashboard(): Promise<DashboardData> {
  return api.get('/api/dashboard') as Promise<DashboardData>;
}

async function generateMealPlans() {
  const today = new Date();
  const dayOfWeek = today.getDay() || 7;
  const monday = new Date(today);
  monday.setDate(today.getDate() - dayOfWeek + 1);
  monday.setHours(0, 0, 0, 0);

  return api.post('/api/meal-plans/generate', {
    weekStartDate: monday.toISOString(),
  });
}

export default function Home() {
  const queryClient = useQueryClient();
  const [generating, setGenerating] = useState(false);
  const [generateError, setGenerateError] = useState('');

  const { data, isLoading, error } = useQuery<DashboardData>({
    queryKey: ['dashboard'],
    queryFn: fetchDashboard,
  });

  const generateMutation = useMutation({
    mutationFn: generateMealPlans,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      setGenerating(false);
      setGenerateError('');
      window.location.href = '/planner';
    },
    onError: (err: unknown) => {
      setGenerating(false);
      const message = err instanceof Error ? err.message : String(err);
      setGenerateError(message);
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
      <main className="min-h-screen bg-cream-gradient">
        <div className="max-w-6xl mx-auto px-6 py-8 space-y-8">
          <Skeleton className="h-48 rounded-3xl" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-28 rounded-2xl" />
            ))}
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-48 rounded-2xl" />
            ))}
          </div>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-cream-gradient flex items-center justify-center p-6">
        <div className="text-center animate-fade-in">
          <div className="w-20 h-20 bg-terracotta-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Search size={32} className="text-terracotta-600" />
          </div>
          <h2 className="font-display text-2xl font-bold text-gray-800 mb-2">加载失败</h2>
          <p className="text-gray-500 mb-6">请刷新页面重试</p>
          <button
            onClick={() => window.location.reload()}
            className="btn-primary"
          >
            刷新页面
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-cream-gradient pb-24">
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Hero Section */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-400 via-amber-500 to-orange-500 p-8 md:p-12 mb-10 shadow-float">
          {/* Decorative shapes */}
          <div className="absolute -top-20 -right-20 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-orange-600/20 rounded-full blur-2xl" />

          <div className="relative z-10">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="font-display text-3xl md:text-4xl font-bold text-white mb-3 text-shadow">
                  家庭美食规划系统
                </h1>
                <p className="text-white/90 text-lg max-w-md">
                  智能规划每周美食，根据家人口味定制，让做饭更轻松愉快
                </p>
              </div>
              <div className="hidden md:block text-white/30">
                <ChefHat size={80} />
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {[
            { value: stats?.recipeCount || 0, label: '菜谱库', Icon: BookOpen, color: 'amber' },
            { value: stats?.mealPlanCount || 0, label: '本周计划', Icon: Calendar, color: 'terracotta' },
            { value: stats?.memberCount || 0, label: '家庭成员', Icon: Users, color: 'sage' },
            { value: stats?.favoriteCount || 0, label: '收藏菜谱', Icon: Heart, color: 'amber' },
          ].map((stat, idx) => (
            <div
              key={idx}
              className="stat-card group cursor-pointer"
              style={{ animationDelay: `${idx * 0.1}s` }}
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <stat.Icon size={20} className={`text-${stat.color}-600`} />
                </div>
                <span className={`text-3xl font-display font-bold text-${stat.color}-600`}>
                  {stat.value}
                </span>
              </div>
              <p className="text-gray-500 text-sm">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-6 mb-10">
          {[
            { href: '/recipes', Icon: BookOpen, title: '菜谱库', desc: `浏览 ${stats?.recipeCount || 0} 道美味佳肴`, color: 'amber' },
            { href: '/planner', Icon: Calendar, title: '周计划', desc: '智能规划每周菜单', color: 'terracotta' },
            { href: '/shopping', Icon: ShoppingCart, title: '采购清单', desc: '自动生成，一键购物', color: 'sage' },
          ].map((action, idx) => (
            <a
              key={idx}
              href={action.href}
              className="food-card p-6 group cursor-pointer"
              style={{ animationDelay: `${idx * 0.1}s` }}
            >
              <div className={`w-14 h-14 rounded-2xl bg-${action.color}-100 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                <action.Icon size={28} className={`text-${action.color}-600`} />
              </div>
              <h3 className="font-display text-xl font-bold text-gray-800 mb-2">{action.title}</h3>
              <p className="text-gray-500 text-sm">{action.desc}</p>
            </a>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Popular Recipes */}
          <div className="lg:col-span-2">
            <div className="food-card overflow-hidden">
              <div className="p-5 border-b border-gray-100 flex items-center justify-between">
                <div>
                  <h2 className="font-display text-xl font-bold text-gray-800">热门菜谱</h2>
                  <p className="text-gray-500 text-sm mt-0.5">大家喜爱的美味</p>
                </div>
                <Link href="/recipes" className="text-amber-600 hover:text-amber-700 text-sm font-medium flex items-center gap-1">
                  查看全部 <ArrowRight size={16} />
                </Link>
              </div>
              <div className="p-5">
                {popularRecipes.length > 0 ? (
                  <div className="space-y-4">
                    {popularRecipes.slice(0, 4).map((recipe, idx) => (
                      <div
                        key={recipe.id}
                        className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl hover:bg-amber-50 transition-colors group cursor-pointer"
                      >
                        <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center flex-shrink-0 overflow-hidden">
                          {recipe.coverImageUrl ? (
                            <img src={recipe.coverImageUrl} alt={recipe.name} className="w-full h-full object-cover" />
                          ) : (
                            <UtensilsCrossed size={24} className="text-amber-400" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-800 truncate group-hover:text-amber-700 transition-colors">
                            {recipe.name}
                          </h3>
                          <p className="text-sm text-gray-500">
                            {recipe.cuisineType} · {recipe.cookTimeMin}分钟 · {recipe.difficulty === 'EASY' ? '简单' : recipe.difficulty === 'MEDIUM' ? '中等' : '困难'}
                          </p>
                        </div>
                        <Link
                          href={`/recipes/${recipe.id}`}
                          className="w-10 h-10 rounded-full bg-white shadow-soft flex items-center justify-center text-amber-600 hover:shadow-float hover:bg-amber-500 hover:text-white transition-all"
                        >
                          <ArrowRight size={18} />
                        </Link>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="empty-state py-8">
                    <Search size={48} className="empty-state-icon text-gray-300" />
                    <p className="empty-state-text">暂无热门菜谱</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Today's Meal */}
          <div className="lg:col-span-1">
            <div className="food-card overflow-hidden bg-gradient-to-br from-amber-50 to-orange-50 border-amber-100">
              <div className="p-5">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-amber-500 flex items-center justify-center">
                    <UtensilsCrossed size={24} className="text-white" />
                  </div>
                  <div>
                    <h2 className="font-display text-xl font-bold text-gray-800">今天吃什么？</h2>
                    <p className="text-gray-500 text-sm">智能推荐美味</p>
                  </div>
                </div>

                {stats?.mealPlanCount ? (
                  <div className="space-y-4">
                    <div className="bg-white/70 rounded-xl p-4 backdrop-blur-sm">
                      <p className="text-gray-600 mb-3">
                        本周已安排 <span className="font-bold text-amber-600">{stats.mealPlanCount}</span> 餐
                      </p>
                      <a href="/planner" className="btn-primary w-full text-center block">
                        查看本周菜单
                      </a>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <p className="text-gray-600 text-center py-6">
                      本周菜单还未安排，让 AI 帮你规划吧
                    </p>
                    {generateError && (
                      <p className="text-terracotta-600 text-sm text-center bg-terracotta-50 p-3 rounded-xl">
                        {generateError}
                      </p>
                    )}
                    <button
                      onClick={handleGenerate}
                      disabled={generating}
                      className="btn-primary w-full flex items-center justify-center gap-2"
                    >
                      {generating ? (
                        <>
                          <Loader2 className="animate-spin" size={20} />
                          正在生成...
                        </>
                      ) : (
                        <>
                          <Sparkles size={20} />
                          智能生成本周菜单
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Navigation (Mobile) */}
      <nav className="fixed bottom-0 left-0 right-0 glass border-t border-gray-200 md:hidden safe-area-pb z-50">
        <div className="grid grid-cols-5 py-2">
          {[
            { href: '/', Icon: ChefHat, label: '首页', active: true },
            { href: '/recipes', Icon: BookOpen, label: '菜谱', active: false },
            { href: '/planner', Icon: Calendar, label: '计划', active: false },
            { href: '/shopping', Icon: ShoppingCart, label: '采购', active: false },
            { href: '/settings', Icon: Settings, label: '设置', active: false },
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
