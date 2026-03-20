'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getAuthToken } from '@/lib/auth-client';

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
      case 'EASY': return 'text-green-600 bg-green-100';
      case 'MEDIUM': return 'text-yellow-600 bg-yellow-100';
      case 'HARD': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">🤖</div>
          <p className="text-gray-600">智能推荐中...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen p-6 pb-24">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">🤖 智能推荐</h1>
          <p className="text-gray-600">
            基于您的口味偏好，为您精选 {recipes.length} 道菜谱
            {filters.likesCount > 0 && ` (参考 ${filters.likesCount} 个喜好)`}
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-gradient-to-br from-primary-500 to-primary-600 text-white rounded-xl p-4">
            <div className="text-2xl font-bold">{recipes.length}</div>
            <div className="text-sm opacity-90">推荐菜谱</div>
          </div>
          <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-xl p-4">
            <div className="text-2xl font-bold">{filters.likesCount}</div>
            <div className="text-sm opacity-90">您的喜好</div>
          </div>
          <div className="bg-gradient-to-br from-red-500 to-red-600 text-white rounded-xl p-4">
            <div className="text-2xl font-bold">{filters.dislikesCount}</div>
            <div className="text-sm opacity-90">忌口食材</div>
          </div>
        </div>

        {/* Recipe Grid */}
        {recipes.length === 0 ? (
          <div className="bg-white rounded-2xl shadow p-12 text-center">
            <div className="text-6xl mb-4">🤖</div>
            <h3 className="text-xl font-semibold mb-2">暂无推荐</h3>
            <p className="text-gray-600 mb-6">
              先设置一些口味偏好，让 AI 更懂你的口味
            </p>
            <button
              onClick={() => router.push('/preferences')}
              className="bg-primary-600 text-white px-6 py-3 rounded-xl hover:bg-primary-700 transition-colors font-semibold"
            >
              设置偏好
            </button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recipes.map((recipe, idx) => (
              <div
                key={recipe.id}
                className="bg-white rounded-2xl shadow overflow-hidden hover:shadow-lg transition-shadow"
              >
                {/* Rank Badge */}
                {idx < 3 && (
                  <div className="relative">
                    <div className="absolute top-3 left-3 z-10">
                      {idx === 0 && (
                        <span className="bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-1 rounded-full">
                          🥇 最佳匹配
                        </span>
                      )}
                      {idx === 1 && (
                        <span className="bg-gray-300 text-gray-700 text-xs font-bold px-2 py-1 rounded-full">
                          🥈 推荐
                        </span>
                      )}
                      {idx === 2 && (
                        <span className="bg-orange-400 text-orange-900 text-xs font-bold px-2 py-1 rounded-full">
                          🥉 精选
                        </span>
                      )}
                    </div>
                    <div className="h-40 bg-gradient-to-br from-orange-100 to-yellow-100 flex items-center justify-center">
                      <span className="text-6xl">🍳</span>
                    </div>
                  </div>
                )}
                {idx >= 3 && (
                  <div className="h-40 bg-gradient-to-br from-orange-100 to-yellow-100 flex items-center justify-center">
                    <span className="text-6xl">🍳</span>
                  </div>
                )}

                <div className="p-4">
                  <h3 className="font-semibold text-lg mb-2">{recipe.name}</h3>
                  
                  {/* Reason */}
                  <div className="bg-primary-50 text-primary-700 text-xs px-2 py-1 rounded mb-3">
                    💡 {recipe.reason}
                  </div>

                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm text-gray-500">{recipe.cuisineType}</span>
                    <span className={`text-xs px-2 py-1 rounded-full ${getDifficultyColor(recipe.difficulty)}`}>
                      {getDifficultyLabel(recipe.difficulty)}
                    </span>
                  </div>

                  <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                    <span>⏱️ {recipe.cookTimeMin}分钟</span>
                    <span>👍 {recipe.popularity}</span>
                  </div>

                  <div className="flex flex-wrap gap-1 mb-3">
                    {recipe.tags.slice(0, 3).map((tag, i) => (
                      <span key={i} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                        {tag}
                      </span>
                    ))}
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => router.push(`/recipes/${recipe.id}`)}
                      className="flex-1 bg-primary-600 text-white py-2 rounded-lg hover:bg-primary-700 transition-colors text-sm"
                    >
                      查看详情
                    </button>
                    <button
                      onClick={() => router.push(`/planner`)}
                      className="flex-1 bg-accent-600 text-white py-2 rounded-lg hover:bg-accent-700 transition-colors text-sm"
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
        <div className="mt-6 text-center">
          <button
            onClick={fetchRecommendations}
            className="bg-gray-100 text-gray-700 px-6 py-3 rounded-xl hover:bg-gray-200 transition-colors font-semibold"
          >
            🔄 刷新推荐
          </button>
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
          <a href="/planner" className="flex flex-col items-center py-3 text-gray-600">
            <span className="text-xl">📅</span>
            <span className="text-xs mt-1">计划</span>
          </a>
          <a href="/shopping" className="flex flex-col items-center py-3 text-gray-600">
            <span className="text-xl">🛒</span>
            <span className="text-xs mt-1">采购</span>
          </a>
          <a href="/recommend" className="flex flex-col items-center py-3 text-primary-600">
            <span className="text-xl">🤖</span>
            <span className="text-xs mt-1">推荐</span>
          </a>
        </div>
      </nav>
    </main>
  );
}
