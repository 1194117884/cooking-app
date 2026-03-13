'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Skeleton from '@/components/Skeleton';
import Link from 'next/link';

interface Recipe {
  id: string;
  name: string;
  cuisineType: string;
  difficulty: string;
  cookTimeMin: number;
  servings: number;
  tags: string[];
  caloriesPerServing?: number;
  coverImageUrl?: string;
  isFavorite?: boolean;
}

async function fetchRecipes(): Promise<Recipe[]> {
  const res = await fetch('/api/recipes');
  if (!res.ok) throw new Error('获取菜谱失败');
  const data = await res.json();
  return data.recipes;
}

export default function RecipesPage() {
  const { data: recipes = [], isLoading, error } = useQuery({
    queryKey: ['recipes'],
    queryFn: fetchRecipes,
  });

  const [selectedCuisine, setSelectedCuisine] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // 获取所有菜系
  const cuisines = ['all', ...Array.from(new Set(recipes.map((r) => r.cuisineType)))];

  // 过滤菜谱
  const filteredRecipes = recipes.filter((recipe) => {
    const matchCuisine = selectedCuisine === 'all' || recipe.cuisineType === selectedCuisine;
    const matchSearch = recipe.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCuisine && matchSearch;
  });

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

  if (isLoading) {
    return (
      <main className="min-h-screen p-6 pb-24">
        <div className="max-w-6xl mx-auto space-y-6">
          <Skeleton className="h-20 rounded-xl" />
          <Skeleton className="h-12 rounded-xl" />
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-80 rounded-xl" />
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
          <div className="text-6xl mb-4">😕</div>
          <p className="text-gray-600 mb-4">加载失败</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-primary-600 text-white px-6 py-2 rounded-lg"
          >
            刷新重试
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen p-6 pb-24">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">📚 菜谱库</h1>
            <p className="text-gray-600">共 {recipes.length} 道美味佳肴</p>
          </div>
          <a
            href="/recipes/add"
            className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700"
          >
            ➕ 添加菜谱
          </a>
        </div>

        {/* Search & Filter */}
        <div className="mb-6 space-y-4">
          <input
            type="text"
            placeholder="搜索菜谱..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
          />

          <div className="flex gap-2 overflow-x-auto pb-2">
            {cuisines.map((cuisine) => (
              <button
                key={cuisine}
                onClick={() => setSelectedCuisine(cuisine)}
                className={`px-4 py-2 rounded-full whitespace-nowrap transition-colors ${
                  selectedCuisine === cuisine
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {cuisine === 'all' ? '全部' : cuisine}
              </button>
            ))}
          </div>
        </div>

        {/* Recipe Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredRecipes.map((recipe) => (
            <div key={recipe.id} className="bg-white rounded-xl shadow hover:shadow-lg transition-shadow overflow-hidden">
              <div className="h-40 bg-gradient-to-br from-orange-100 to-yellow-100 flex items-center justify-center relative">
                {recipe.coverImageUrl ? (
                  <img
                    src={recipe.coverImageUrl}
                    alt={recipe.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-6xl">🍳</span>
                )}
                {recipe.isFavorite && (
                  <span className="absolute top-2 right-2 text-2xl">❤️</span>
                )}
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-lg mb-2">{recipe.name}</h3>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm text-gray-500">{recipe.cuisineType}</span>
                  <span className={`text-xs px-2 py-1 rounded-full ${getDifficultyColor(recipe.difficulty)}`}>
                    {getDifficultyLabel(recipe.difficulty)}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                  <span>⏱️ {recipe.cookTimeMin}分钟</span>
                  <span>👥 {recipe.servings}人份</span>
                  {recipe.caloriesPerServing && (
                    <span>🔥 {recipe.caloriesPerServing}卡</span>
                  )}
                </div>
                <div className="flex flex-wrap gap-1 mb-3">
                  {recipe.tags.slice(0, 3).map((tag, idx) => (
                    <span key={idx} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                      {tag}
                    </span>
                  ))}
                </div>
                <Link
                  href={`/recipes/${recipe.id}`}
                  className="block w-full bg-primary-600 text-white py-2 rounded-lg hover:bg-primary-700 transition-colors text-center"
                >
                  查看详情
                </Link>
              </div>
            </div>
          ))}
        </div>

        {filteredRecipes.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔍</div>
            <p className="text-gray-600">没有找到匹配的菜谱</p>
          </div>
        )}
      </div>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 md:hidden safe-area-pb">
        <div className="grid grid-cols-5">
          <a href="/" className="flex flex-col items-center py-3 text-gray-600">
            <span className="text-xl">🏠</span>
            <span className="text-xs mt-1">首页</span>
          </a>
          <a href="/recipes" className="flex flex-col items-center py-3 text-primary-600">
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
