"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Skeleton from "@/components/Skeleton";
import Link from "next/link";
import { api } from "@/lib/api-client";
import {
  BookOpen,
  Calendar,
  ShoppingCart,
  Users,
  Heart,
  ChefHat,
  Sparkles,
  ArrowRight,
  Loader2,
  UtensilsCrossed,
} from "lucide-react";

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
  return api.get("/api/dashboard") as Promise<DashboardData>;
}

async function generateMealPlans() {
  const today = new Date();
  const dayOfWeek = today.getDay() || 7;
  const monday = new Date(today);
  monday.setDate(today.getDate() - dayOfWeek + 1);
  monday.setHours(0, 0, 0, 0);

  return api.post("/api/meal-plans/generate", {
    weekStartDate: monday.toISOString(),
  });
}

export default function Home() {
  const queryClient = useQueryClient();
  const [generating, setGenerating] = useState(false);
  const [generateError, setGenerateError] = useState("");

  const { data, isLoading, error } = useQuery<DashboardData>({
    queryKey: ["dashboard"],
    queryFn: fetchDashboard,
  });

  const generateMutation = useMutation({
    mutationFn: generateMealPlans,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      setGenerating(false);
      setGenerateError("");
      window.location.href = "/planner";
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
    setGenerateError("");
    generateMutation.mutate();
  };

  if (isLoading) {
    return (
      <main className="min-h-screen bg-pale-gray">
        <div className="max-w-6xl mx-auto px-5 py-8 space-y-6">
          <Skeleton className="h-[320px] rounded-spotlight" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-[100px] rounded-card" />
            ))}
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-[180px] rounded-module" />
            ))}
          </div>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-pale-gray flex items-center justify-center p-6">
        <div className="text-center animate-fade-in">
          <div className="w-16 h-16 rounded-full bg-black/5 flex items-center justify-center mx-auto mb-5">
            <UtensilsCrossed size={28} className="text-text-secondary" />
          </div>
          <h2 className="text-utility-heading text-ink mb-2">加载失败</h2>
          <p className="text-body-lg text-text-secondary mb-6">请刷新页面重试</p>
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
    <main className="min-h-screen bg-pale-gray pb-24">
      <div className="max-w-6xl mx-auto px-5 py-8">
        {/* Hero Section — dark canvas */}
        <div className="hero-dark rounded-spotlight px-8 md:px-12 py-12 md:py-16 mb-10 relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(249,115,22,0.25),transparent_50%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(249,115,22,0.08),transparent_40%)]" />

          <div className="relative z-10 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-pill bg-white/10 text-white/80 text-xs font-medium mb-6">
              <ChefHat size={14} />
              家庭美食规划
            </div>
            <h1 className="font-display text-[40px] md:text-[56px] font-semibold text-white mb-4 leading-[1.07] tracking-[-0.02em]">
              让每一餐
              <br />
              都充满期待
            </h1>
            <p className="text-[17px] text-white/70 leading-relaxed max-w-md mb-8">
              智能规划每周美食，根据家人口味定制菜谱，自动生成采购清单
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleGenerate}
                disabled={generating}
                className="inline-flex items-center gap-2 bg-accent-500 text-white font-semibold rounded-pill px-6 py-3 text-sm leading-none transition-all duration-150 hover:bg-accent-600 active:scale-[0.97] disabled:opacity-40"
              >
                {generating ? (
                  <>
                    <Loader2 className="animate-spin" size={18} />
                    生成中...
                  </>
                ) : (
                  <>
                    <Sparkles size={18} />
                    智能生成本周菜单
                  </>
                )}
              </button>
              <Link
                href="/recipes"
                className="inline-flex items-center gap-2 bg-white/15 text-white font-medium rounded-pill px-6 py-3 text-sm leading-none transition-all duration-150 hover:bg-white/25 active:scale-[0.97]"
              >
                浏览菜谱
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>

          {generateError && (
            <div className="relative z-10 mt-6 bg-red-500/20 text-red-200 text-sm p-4 rounded-field">
              {generateError}
            </div>
          )}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-10">
          {[
            {
              value: stats?.recipeCount || 0,
              label: "菜谱库",
              Icon: BookOpen,
            },
            {
              value: stats?.mealPlanCount || 0,
              label: "本周计划",
              Icon: Calendar,
            },
            {
              value: stats?.memberCount || 0,
              label: "家庭成员",
              Icon: Users,
            },
            {
              value: stats?.favoriteCount || 0,
              label: "收藏菜谱",
              Icon: Heart,
            },
          ].map((stat, idx) => (
            <div
              key={idx}
              className="card p-4 md:p-5 animate-in"
              style={{ animationDelay: `${idx * 0.08}s` }}
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 rounded-control bg-black/4 flex items-center justify-center">
                  <stat.Icon size={18} className="text-accent-500" />
                </div>
              </div>
              <div className="text-[28px] font-semibold text-ink tracking-[-0.01em] leading-none mb-1">
                {stat.value}
              </div>
              <p className="text-label text-text-secondary">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-4 mb-10">
          {[
            {
              href: "/recipes",
              Icon: BookOpen,
              title: "菜谱库",
              desc: `浏览 ${stats?.recipeCount || 0} 道美味佳肴`,
            },
            {
              href: "/planner",
              Icon: Calendar,
              title: "周计划",
              desc: "智能规划每周菜单",
            },
            {
              href: "/shopping",
              Icon: ShoppingCart,
              title: "采购清单",
              desc: "自动生成，一键购物",
            },
          ].map((action, idx) => (
            <Link
              key={idx}
              href={action.href}
              className="card-elevated p-5 group animate-in"
              style={{ animationDelay: `${idx * 0.08}s` }}
            >
              <div className="w-12 h-12 rounded-control bg-accent-50 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform duration-200">
                <action.Icon size={24} className="text-accent-500" />
              </div>
              <h3 className="font-display text-[19px] font-semibold text-ink mb-1.5">
                {action.title}
              </h3>
              <p className="text-label text-text-secondary">{action.desc}</p>
            </Link>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Popular Recipes */}
          <div className="lg:col-span-2">
            <div className="card overflow-hidden">
              <div className="px-5 py-4 border-b border-[#e5e5e5] flex items-center justify-between">
                <div>
                  <h2 className="font-display text-[19px] font-semibold text-ink">
                    热门菜谱
                  </h2>
                  <p className="text-label text-text-secondary mt-0.5">
                    大家喜爱的美味
                  </p>
                </div>
                <Link
                  href="/recipes"
                  className="text-accent-500 hover:text-accent-600 text-sm font-medium flex items-center gap-1 transition-colors"
                >
                  查看全部 <ArrowRight size={14} />
                </Link>
              </div>
              <div className="p-4">
                {popularRecipes.length > 0 ? (
                  <div className="space-y-2">
                    {popularRecipes.slice(0, 4).map((recipe, idx) => (
                      <Link
                        key={recipe.id}
                        href={`/recipes/${recipe.id}`}
                        className="flex items-center gap-4 p-3 rounded-module hover:bg-black/[0.03] transition-colors group"
                      >
                        <div className="w-14 h-14 rounded-control bg-black/3 flex items-center justify-center flex-shrink-0 overflow-hidden">
                          {recipe.coverImageUrl ? (
                            <img
                              src={recipe.coverImageUrl}
                              alt={recipe.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <UtensilsCrossed size={22} className="text-text-secondary" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-ink truncate group-hover:text-accent-600 transition-colors">
                            {recipe.name}
                          </h3>
                          <p className="text-label text-text-secondary">
                            {recipe.cuisineType} · {recipe.cookTimeMin}分钟
                            {recipe.difficulty === "EASY"
                              ? " · 简单"
                              : recipe.difficulty === "MEDIUM"
                                ? " · 中等"
                                : " · 困难"}
                          </p>
                        </div>
                        <div className="w-8 h-8 rounded-full bg-black/3 flex items-center justify-center text-text-secondary group-hover:bg-accent-500 group-hover:text-white transition-all">
                          <ArrowRight size={16} />
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="empty-state py-8">
                    <UtensilsCrossed
                      size={40}
                      className="empty-state-icon text-text-secondary"
                    />
                    <p className="empty-state-text">暂无热门菜谱</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Today's Meal */}
          <div className="lg:col-span-1">
            <div className="card overflow-hidden !border-accent-200 !bg-accent-50/50">
              <div className="p-5">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-11 h-11 rounded-control bg-accent-500 flex items-center justify-center">
                    <UtensilsCrossed size={22} className="text-white" />
                  </div>
                  <div>
                    <h2 className="font-display text-[19px] font-semibold text-ink">
                      今天吃什么？
                    </h2>
                    <p className="text-label text-text-secondary">
                      智能推荐美味
                    </p>
                  </div>
                </div>

                {stats?.mealPlanCount ? (
                  <div className="space-y-4">
                    <div className="bg-white/70 rounded-module p-4">
                      <p className="text-body-lg text-ink mb-3">
                        本周已安排{" "}
                        <span className="font-semibold text-accent-500">
                          {stats.mealPlanCount}
                        </span>{" "}
                        餐
                      </p>
                      <Link href="/planner" className="btn-primary w-full">
                        查看本周菜单
                      </Link>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <p className="text-body-lg text-text-secondary text-center py-6">
                      本周菜单还未安排
                      <br />
                      让 AI 帮你规划吧
                    </p>
                    {generateError && (
                      <p className="text-red-600 text-sm text-center bg-red-50 p-3 rounded-field">
                        {generateError}
                      </p>
                    )}
                    <button
                      onClick={handleGenerate}
                      disabled={generating}
                      className="btn-primary w-full"
                    >
                      {generating ? (
                        <>
                          <Loader2 className="animate-spin" size={18} />
                          正在生成...
                        </>
                      ) : (
                        <>
                          <Sparkles size={18} />
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
      <nav className="fixed bottom-0 left-0 right-0 glass-nav md:hidden safe-area-pb z-50">
        <div className="grid grid-cols-5 py-1.5">
          {[
            { href: "/", Icon: ChefHat, label: "首页", active: true },
            { href: "/recipes", Icon: BookOpen, label: "菜谱" },
            { href: "/planner", Icon: Calendar, label: "计划" },
            { href: "/shopping", Icon: ShoppingCart, label: "采购" },
            { href: "/settings", Icon: Users, label: "设置" },
          ].map((item) => (
            <a
              key={item.href}
              href={item.href}
              className={`nav-link ${item.active ? "nav-link-active" : "nav-link-inactive"}`}
            >
              <item.Icon size={20} />
              <span className="text-[11px] font-medium mt-0.5">
                {item.label}
              </span>
            </a>
          ))}
        </div>
      </nav>
    </main>
  );
}
