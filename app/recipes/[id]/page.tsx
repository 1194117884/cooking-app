'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Skeleton from '@/components/Skeleton';

interface Ingredient {
  name: string;
  quantity: number;
  unit: string;
  note?: string;
}

interface Recipe {
  id: string;
  name: string;
  cuisineType: string;
  difficulty: string;
  cookTimeMin: number;
  servings: number;
  caloriesPerServing?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  tags: string[];
  steps: string;
  ingredients: Ingredient[];
  popularity: number;
  isFavorite: boolean;
}

async function fetchRecipe(id: string): Promise<Recipe> {
  const res = await fetch(`/api/recipes/${id}`);
  if (!res.ok) throw new Error('获取菜谱失败');
  const data = await res.json();
  return data.recipe;
}

async function toggleFavorite(id: string, isFavorite: boolean) {
  const res = await fetch(`/api/recipes/${id}/favorite`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token') || ''}`,
    },
    body: JSON.stringify({ isFavorite: !isFavorite }),
  });
  if (!res.ok) throw new Error('操作失败');
  return res.json();
}

async function addToShoppingList(recipeId: string) {
  const res = await fetch('/api/shopping-list/add-recipe', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token') || ''}`,
    },
    body: JSON.stringify({ recipeId }),
  });
  if (!res.ok) throw new Error('添加失败');
  return res.json();
}

export default function RecipeDetailPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const recipeId = params.id as string;

  const { data: recipe, isLoading, error } = useQuery({
    queryKey: ['recipe', recipeId],
    queryFn: () => fetchRecipe(recipeId),
  });

  const favoriteMutation = useMutation({
    mutationFn: () => toggleFavorite(recipeId, recipe?.isFavorite || false),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recipe', recipeId] });
    },
  });

  const shoppingMutation = useMutation({
    mutationFn: () => addToShoppingList(recipeId),
    onSuccess: () => {
      alert('已添加到采购清单！');
    },
    onError: (err: Error) => {
      alert(err.message);
    },
  });

  const steps = recipe?.steps ? JSON.parse(recipe.steps) : [];

  const handleAddToPlan = () => {
    // 存储选中的菜谱到 sessionStorage，在计划页面读取
    sessionStorage.setItem('selectedRecipe', JSON.stringify({
      id: recipe?.id,
      name: recipe?.name,
    }));
    router.push('/planner');
  };

  if (isLoading) {
    return (
      <main className="min-h-screen p-6 pb-24">
        <div className="max-w-4xl mx-auto space-y-6">
          <Skeleton className="h-96 rounded-2xl" />
          <Skeleton className="h-64 rounded-2xl" />
          <Skeleton className="h-64 rounded-2xl" />
        </div>
      </main>
    );
  }

  if (error || !recipe) {
    return (
      <main className="min-h-screen p-6">
        <div className="max-w-4xl mx-auto text-center py-12">
          <div className="text-6xl mb-4">😢</div>
          <p className="text-gray-600 mb-4">菜谱不存在或加载失败</p>
          <button onClick={() => router.back()} className="btn-primary">
            返回
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen p-6 pb-24">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="mb-4 text-gray-600 hover:text-gray-900 flex items-center gap-2"
        >
          ← 返回菜谱库
        </button>

        {/* Header */}
        <div className="bg-white rounded-2xl shadow overflow-hidden mb-6">
          <div className="h-64 bg-gradient-to-br from-orange-100 to-yellow-100 flex items-center justify-center relative">
            <span className="text-9xl">🍳</span>
          </div>
          <div className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold mb-2">{recipe.name}</h1>
                <div className="flex items-center gap-3">
                  <span className="text-gray-600">{recipe.cuisineType}</span>
                  <span className={`text-sm px-3 py-1 rounded-full ${
                    recipe.difficulty === 'EASY' ? 'text-green-600 bg-green-100' :
                    recipe.difficulty === 'MEDIUM' ? 'text-yellow-600 bg-yellow-100' :
                    'text-red-600 bg-red-100'
                  }`}>
                    {recipe.difficulty === 'EASY' ? '简单' :
                     recipe.difficulty === 'MEDIUM' ? '中等' : '困难'}
                  </span>
                </div>
              </div>
              <button
                onClick={() => favoriteMutation.mutate()}
                disabled={favoriteMutation.isPending}
                className="text-3xl hover:scale-110 transition-transform disabled:opacity-50"
              >
                {recipe.isFavorite ? '❤️' : '🤍'}
              </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-4 gap-4 py-4 border-t border-b">
              <div className="text-center">
                <div className="text-2xl">⏱️</div>
                <div className="text-sm text-gray-600">{recipe.cookTimeMin}分钟</div>
              </div>
              <div className="text-center">
                <div className="text-2xl">👥</div>
                <div className="text-sm text-gray-600">{recipe.servings}人份</div>
              </div>
              <div className="text-center">
                <div className="text-2xl">🔥</div>
                <div className="text-sm text-gray-600">{recipe.caloriesPerServing || '?'}卡</div>
              </div>
              <div className="text-center">
                <div className="text-2xl">👍</div>
                <div className="text-sm text-gray-600">{recipe.popularity}</div>
              </div>
            </div>

            {/* Nutrition */}
            {(recipe.protein || recipe.carbs || recipe.fat) && (
              <div className="py-4">
                <h3 className="font-semibold mb-2">营养成分 (每份)</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-blue-50 rounded-lg p-3 text-center">
                    <div className="text-lg font-bold text-blue-600">{recipe.protein || 0}g</div>
                    <div className="text-xs text-gray-600">蛋白质</div>
                  </div>
                  <div className="bg-yellow-50 rounded-lg p-3 text-center">
                    <div className="text-lg font-bold text-yellow-600">{recipe.carbs || 0}g</div>
                    <div className="text-xs text-gray-600">碳水</div>
                  </div>
                  <div className="bg-red-50 rounded-lg p-3 text-center">
                    <div className="text-lg font-bold text-red-600">{recipe.fat || 0}g</div>
                    <div className="text-xs text-gray-600">脂肪</div>
                  </div>
                </div>
              </div>
            )}

            {/* Tags */}
            <div className="flex flex-wrap gap-2 mt-4">
              {recipe.tags.map((tag, idx) => (
                <span key={idx} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Ingredients */}
        <div className="bg-white rounded-2xl shadow p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">🥬 所需食材</h2>
          <ul className="space-y-2">
            {recipe.ingredients.map((ing, idx) => (
              <li key={idx} className="flex items-center justify-between py-2 border-b last:border-0">
                <span className="text-gray-800">
                  {ing.name}
                  {ing.note && <span className="text-gray-500 text-sm ml-2">({ing.note})</span>}
                </span>
                <span className="text-gray-600 font-medium">
                  {ing.quantity}{ing.unit}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* Steps */}
        <div className="bg-white rounded-2xl shadow p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">👨‍🍳 烹饪步骤</h2>
          <div className="space-y-4">
            {steps.map((step: string, idx: number) => (
              <div key={idx} className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center font-bold">
                  {idx + 1}
                </div>
                <div className="flex-1 py-1">
                  <p className="text-gray-800 leading-relaxed">{step}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={handleAddToPlan}
            className="bg-primary-600 text-white py-3 rounded-xl hover:bg-primary-700 transition-colors font-semibold"
          >
            📅 加入周计划
          </button>
          <button
            onClick={() => shoppingMutation.mutate()}
            disabled={shoppingMutation.isPending}
            className="bg-accent-600 text-white py-3 rounded-xl hover:bg-accent-700 transition-colors font-semibold disabled:opacity-50"
          >
            {shoppingMutation.isPending ? '添加中...' : '🛒 加入采购清单'}
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
