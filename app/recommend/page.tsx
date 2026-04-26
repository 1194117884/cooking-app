"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getAuthToken } from "@/lib/auth-client";
import {
  Sparkles,
  ChefHat,
  Clock,
  ThumbsUp,
  Lightbulb,
  RotateCcw,
  Crown,
  Medal,
  Award,
  BookOpen,
  Calendar,
  ShoppingCart,
  Settings,
} from "lucide-react";

interface Recipe {
  id: string;
  name: string;
  cuisineType: string;
  difficulty: string;
  cookTimeMin: number;
  tags: string[];
  popularity: number;
  score: number;
  reason: string;
}

export default function RecommendPage() {
  const router = useRouter();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ likesCount: 0, dislikesCount: 0 });

  useEffect(() => {
    fetchRecommendations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchRecommendations = async () => {
    try {
      const token = await getAuthToken();
      const res = await fetch("/api/recommend?limit=12", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.status === 401) {
        router.push("/auth/login");
        return;
      }

      const data = await res.json();
      setRecipes(data.recommended || []);
      setFilters(data.filters || { likesCount: 0, dislikesCount: 0 });
      setLoading(false);
    } catch (error) {
      console.error("Failed to fetch recommendations:", error);
      setLoading(false);
    }
  };

  const getDifficultyLabel = (difficulty: string) => {
    switch (difficulty) {
      case "EASY":
        return "简单";
      case "MEDIUM":
        return "中等";
      case "HARD":
        return "困难";
      default:
        return difficulty;
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-pale-gray flex items-center justify-center p-6">
        <div className="text-center">
          <div className="w-12 h-12 border-[3px] border-black/5 border-t-accent-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-text-secondary text-sm">智能推荐中...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-pale-gray pb-24">
      <div className="max-w-6xl mx-auto px-5 py-8">

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-accent-500 text-white rounded-module p-5">
            <div className="text-[28px] font-semibold tracking-[-0.01em]">
              {recipes.length}
            </div>
            <div className="text-sm opacity-90 mt-1">推荐菜谱</div>
          </div>
          <div className="bg-green-600 text-white rounded-module p-5">
            <div className="text-[28px] font-semibold tracking-[-0.01em]">
              {filters.likesCount}
            </div>
            <div className="text-sm opacity-90 mt-1">您的喜好</div>
          </div>
          <div className="bg-red-600 text-white rounded-module p-5">
            <div className="text-[28px] font-semibold tracking-[-0.01em]">
              {filters.dislikesCount}
            </div>
            <div className="text-sm opacity-90 mt-1">忌口食材</div>
          </div>
        </div>

        {/* Recipe Grid */}
        {recipes.length === 0 ? (
          <div className="card p-12 text-center">
            <div className="w-20 h-20 rounded-full bg-black/3 flex items-center justify-center mx-auto mb-5">
              <Sparkles size={40} className="text-text-secondary" />
            </div>
            <h3 className="font-display text-utility-heading text-ink mb-2">
              暂无推荐
            </h3>
            <p className="text-body-lg text-text-secondary mb-8">
              先设置一些口味偏好，让 AI 更懂你的口味
            </p>
            <button
              onClick={() => router.push("/preferences")}
              className="btn-primary"
            >
              设置偏好
            </button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recipes.map((recipe, idx) => (
              <div key={recipe.id} className="card group overflow-hidden">
                {/* Rank Badge */}
                <div className="h-40 bg-black/3 flex items-center justify-center relative">
                  {idx < 3 && (
                    <div className="absolute top-3 left-3 z-10">
                      {idx === 0 && (
                        <span className="bg-yellow-400 text-yellow-900 text-[11px] font-bold px-2.5 py-1 rounded-pill flex items-center gap-1">
                          <Crown size={11} /> 最佳匹配
                        </span>
                      )}
                      {idx === 1 && (
                        <span className="bg-gray-300 text-gray-700 text-[11px] font-bold px-2.5 py-1 rounded-pill flex items-center gap-1">
                          <Medal size={11} /> 推荐
                        </span>
                      )}
                      {idx === 2 && (
                        <span className="bg-orange-300 text-orange-900 text-[11px] font-bold px-2.5 py-1 rounded-pill flex items-center gap-1">
                          <Award size={11} /> 精选
                        </span>
                      )}
                    </div>
                  )}
                  <ChefHat size={56} className="text-text-secondary/20" />
                </div>

                <div className="p-4">
                  <h3 className="font-display text-[19px] font-semibold text-ink mb-2.5">
                    {recipe.name}
                  </h3>

                  <div className="bg-accent-50 text-accent-700 text-xs px-3 py-2 rounded-field mb-3 flex items-center gap-1.5">
                    <Lightbulb size={11} />
                    {recipe.reason}
                  </div>

                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-label text-text-secondary">
                      {recipe.cuisineType}
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded-pill bg-black/5 font-medium text-ink">
                      {getDifficultyLabel(recipe.difficulty)}
                    </span>
                  </div>

                  <div className="flex items-center gap-4 text-xs text-text-secondary mb-4">
                    <span className="flex items-center gap-1">
                      <Clock size={13} /> {recipe.cookTimeMin}分钟
                    </span>
                    <span className="flex items-center gap-1">
                      <ThumbsUp size={13} /> {recipe.popularity}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-1 mb-4">
                    {recipe.tags.slice(0, 3).map((tag, i) => (
                      <span key={i} className="tag tag-default text-[11px]">
                        {tag}
                      </span>
                    ))}
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => router.push(`/recipes/${recipe.id}`)}
                      className="flex-1 btn-primary text-xs py-2"
                    >
                      查看详情
                    </button>
                    <button
                      onClick={() => router.push(`/planner`)}
                      className="flex-1 btn-secondary text-xs py-2"
                    >
                      加入计划
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Refresh */}
        <div className="mt-8 text-center">
          <button
            onClick={fetchRecommendations}
            className="btn-secondary"
          >
            <RotateCcw size={16} />
            刷新推荐
          </button>
        </div>
      </div>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 glass-nav md:hidden safe-area-pb z-50">
        <div className="grid grid-cols-5 py-1.5">
          {[
            { href: "/", Icon: ChefHat, label: "首页" },
            { href: "/recipes", Icon: BookOpen, label: "菜谱" },
            { href: "/planner", Icon: Calendar, label: "计划" },
            { href: "/shopping", Icon: ShoppingCart, label: "采购" },
            { href: "/settings", Icon: Settings, label: "设置" },
          ].map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="nav-link nav-link-inactive"
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
