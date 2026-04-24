'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getAuthToken } from '@/lib/auth-client';
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
  Home,
} from 'lucide-react';

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
      const res = await fetch('/api/recommend?limit=12', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (res.status === 401) {
        router.push('/auth/login');
        return;
      }

      const data = await res.json();
      setRecipes(data.recommended || []);
      setFilters(data.filters || { likesCount: 0, dislikesCount: 0 });
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch recommendations:', error);
      setLoading(false);
    }
  };

  const getDifficultyLabel = (difficulty: string) => {
    switch (difficulty) {
      case 'EASY': return '简单';
      case 'MEDIUM': return '中等';
      case 'HARD': return '困难';
      default: return difficulty;
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'EASY': return 'text-sage-600 bg-sage-100';
      case 'MEDIUM': return 'text-amber-600 bg-amber-100';
      case 'HARD': return 'text-terracotta-600 bg-terracotta-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 0: return <Crown size={16} className="text-yellow-700" />;
      case 1: return <Medal size={16} className="text-gray-700" />;
      case 2: return <Award size={16} className="text-orange-700" />;
      default: return null;
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-cream-gradient flex items-center justify-center p-6">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-amber-200 border-t-amber-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500">智能推荐中...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-cream-gradient pb-24">
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-display text-3xl md:text-4xl font-bold text-gray-900 mb-2 flex items-center gap-3">
            <Sparkles className="text-amber-500" />
            智能推荐
          </h1>
          <p className="text-gray-500">
            基于您的口味偏好，为您精选 <span className="text-amber-600 font-semibold">{recipes.length}</span> 道菜谱
            {filters.likesCount > 0 && ` (参考 ${filters.likesCount} 个喜好)`}
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="food-card bg-gradient-to-br from-amber-500 to-amber-600 text-white p-5">
            <div className="text-2xl font-display font-bold">{recipes.length}</div>
            <div className="text-sm opacity-90">推荐菜谱</div>
          </div>
          <div className="food-card bg-gradient-to-br from-green-500 to-green-600 text-white p-5">
            <div className="text-2xl font-display font-bold">{filters.likesCount}</div>
            <div className="text-sm opacity-90">您的喜好</div>
          </div>
          <div className="food-card bg-gradient-to-br from-terracotta-500 to-terracotta-600 text-white p-5">
            <div className="text-2xl font-display font-bold">{filters.dislikesCount}</div>
            <div className="text-sm opacity-90">忌口食材</div>
          </div>
        </div>

        {/* Recipe Grid */}
        {recipes.length === 0 ? (
          <div className="food-card p-12 text-center">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Sparkles size={48} className="text-gray-400" />
            </div>
            <h3 className="font-display text-xl font-bold text-gray-800 mb-2">暂无推荐</h3>
            <p className="text-gray-500 mb-8">
              先设置一些口味偏好，让 AI 更懂你的口味
            </p>
            <button
              onClick={() => router.push('/preferences')}
              className="btn-primary"
            >
              设置偏好
            </button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recipes.map((recipe, idx) => (
              <div
                key={recipe.id}
                className="food-card overflow-hidden group"
              >
                {/* Rank Badge */}
                {idx < 3 && (
                  <div className="relative">
                    <div className="absolute top-3 left-3 z-10">
                      {idx === 0 && (
                        <span className="bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1">
                          <Crown size={12} /> 最佳匹配
                        </span>
                      )}
                      {idx === 1 && (
                        <span className="bg-gray-300 text-gray-700 text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1">
                          <Medal size={12} /> 推荐
                        </span>
                      )}
                      {idx === 2 && (
                        <span className="bg-orange-400 text-orange-900 text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1">
                          <Award size={12} /> 精选
                        </span>
                      )}
                    </div>
                    <div className="h-40 bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center">
                      <ChefHat size={64} className="text-amber-300" />
                    </div>
                  </div>
                )}
                {idx >= 3 && (
                  <div className="h-40 bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center">
                    <ChefHat size={64} className="text-amber-300" />
                  </div>
                )}

                <div className="p-5">
                  <h3 className="font-display font-semibold text-lg mb-3">{recipe.name}</h3>

                  {/* Reason */}
                  <div className="bg-amber-50 text-amber-800 text-xs px-3 py-2 rounded-xl mb-3 flex items-center gap-1">
                    <Lightbulb size={12} />
                    {recipe.reason}
                  </div>

                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-sm text-gray-500">{recipe.cuisineType}</span>
                    <span className={`text-xs px-2 py-1 rounded-full ${getDifficultyColor(recipe.difficulty)}`}>
                      {getDifficultyLabel(recipe.difficulty)}
                    </span>
                  </div>

                  <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                    <span className="flex items-center gap-1">
                      <Clock size={14} /> {recipe.cookTimeMin}分钟
                    </span>
                    <span className="flex items-center gap-1">
                      <ThumbsUp size={14} /> {recipe.popularity}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-1 mb-4">
                    {recipe.tags.slice(0, 3).map((tag, i) => (
                      <span key={i} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-lg">
                        {tag}
                      </span>
                    ))}
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => router.push(`/recipes/${recipe.id}`)}
                      className="flex-1 btn-primary py-2 text-sm"
                    >
                      查看详情
                    </button>
                    <button
                      onClick={() => router.push(`/planner`)}
                      className="flex-1 btn-secondary py-2 text-sm"
                    >
                      加入计划
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Refresh Button */}
        <div className="mt-8 text-center">
          <button
            onClick={fetchRecommendations}
            className="btn-secondary inline-flex items-center gap-2"
          >
            <RotateCcw size={18} />
            刷新推荐
          </button>
        </div>
      </div>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 glass border-t border-gray-200 md:hidden safe-area-pb z-50">
        <div className="grid grid-cols-5 py-2">
          {[
            { href: '/', Icon: Home, label: '首页' },
            { href: '/recipes', Icon: BookOpen, label: '菜谱' },
            { href: '/planner', Icon: Calendar, label: '计划' },
            { href: '/shopping', Icon: ShoppingCart, label: '采购' },
            { href: '/settings', Icon: Settings, label: '设置' },
          ].map((item, idx) => (
            <a
              key={idx}
              href={item.href}
              className="nav-link nav-link-inactive"
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
