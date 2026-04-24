'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Skeleton from '@/components/Skeleton';
import RichContentViewer from '@/components/RichContentViewer';
import { getAuthToken } from '@/lib/auth-client';
import {
  ArrowLeft,
  ChefHat,
  Clock,
  Users,
  Flame,
  ThumbsUp,
  Heart,
  Leaf,
  ShoppingCart,
  Calendar,
  BookOpen,
  Settings,
  Loader2,
  AlertCircle,
} from 'lucide-react';

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
  steps: any;
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
  const token = await getAuthToken();

  const res = await fetch(`/api/recipes/${id}/favorite`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ isFavorite: !isFavorite }),
  });

  if (res.status === 401) {
    window.location.href = '/auth/login';
    throw new Error('未授权访问');
  }

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.error || '操作失败');
  }
  return res.json();
}

async function addToShoppingList(recipeId: string) {
  const token = await getAuthToken();

  const res = await fetch('/api/shopping-list/add-recipe', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ recipeId }),
  });

  if (res.status === 401) {
    window.location.href = '/auth/login';
    throw new Error('未授权访问');
  }

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.error || '添加失败');
  }
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

  const handleAddToPlan = () => {
    sessionStorage.setItem('selectedRecipe', JSON.stringify({
      id: recipe?.id,
      name: recipe?.name,
    }));
    router.push('/planner');
  };

  if (isLoading) {
    return (
      <main className="min-h-screen bg-cream-gradient pb-24">
        <div className="max-w-4xl mx-auto px-6 py-8 space-y-6">
          <Skeleton className="h-96 rounded-3xl" />
          <Skeleton className="h-64 rounded-3xl" />
          <Skeleton className="h-64 rounded-3xl" />
        </div>
      </main>
    );
  }

  if (error || !recipe) {
    return (
      <main className="min-h-screen bg-cream-gradient p-6">
        <div className="max-w-4xl mx-auto text-center py-16">
          <div className="w-24 h-24 bg-terracotta-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle size={48} className="text-terracotta-500" />
          </div>
          <p className="text-gray-600 mb-6 text-lg">菜谱不存在或加载失败</p>
          <button onClick={() => router.back()} className="btn-primary">
            返回
          </button>
        </div>
      </main>
    );
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'EASY': return 'text-sage-700 bg-sage-100';
      case 'MEDIUM': return 'text-amber-700 bg-amber-100';
      case 'HARD': return 'text-terracotta-700 bg-terracotta-100';
      default: return 'text-gray-700 bg-gray-100';
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

  return (
    <main className="min-h-screen bg-cream-gradient pb-24">
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="mb-6 text-gray-600 hover:text-gray-900 flex items-center gap-2 font-medium"
        >
          <ArrowLeft size={18} />
          返回菜谱库
        </button>

        {/* Header */}
        <div className="food-card overflow-hidden mb-6">
          <div className="h-64 bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center">
            <ChefHat size={120} className="text-amber-300" />
          </div>
          <div className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="font-display text-3xl font-bold text-gray-900 mb-2">{recipe.name}</h1>
                <div className="flex items-center gap-3">
                  <span className="text-gray-500">{recipe.cuisineType}</span>
                  <span className={`text-sm px-3 py-1 rounded-full font-medium ${getDifficultyColor(recipe.difficulty)}`}>
                    {getDifficultyLabel(recipe.difficulty)}
                  </span>
                </div>
              </div>
              <button
                onClick={() => favoriteMutation.mutate()}
                disabled={favoriteMutation.isPending}
                className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center hover:scale-110 transition-transform disabled:opacity-50"
              >
                <Heart
                  size={24}
                  className={recipe.isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-400'}
                />
              </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-4 gap-4 py-4 border-t border-b border-gray-100">
              <div className="text-center">
                <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-2">
                  <Clock size={18} className="text-amber-600" />
                </div>
                <div className="text-sm text-gray-600">{recipe.cookTimeMin}分钟</div>
              </div>
              <div className="text-center">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-2">
                  <Users size={18} className="text-blue-600" />
                </div>
                <div className="text-sm text-gray-600">{recipe.servings}人份</div>
              </div>
              <div className="text-center">
                <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center mx-auto mb-2">
                  <Flame size={18} className="text-orange-600" />
                </div>
                <div className="text-sm text-gray-600">{recipe.caloriesPerServing || '?'}卡</div>
              </div>
              <div className="text-center">
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-2">
                  <ThumbsUp size={18} className="text-green-600" />
                </div>
                <div className="text-sm text-gray-600">{recipe.popularity}</div>
              </div>
            </div>

            {/* Nutrition */}
            {(recipe.protein || recipe.carbs || recipe.fat) && (
              <div className="py-4">
                <h3 className="font-semibold mb-3 text-gray-800">营养成分 (每份)</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-blue-50 rounded-xl p-4 text-center">
                    <div className="text-lg font-bold text-blue-600">{recipe.protein || 0}g</div>
                    <div className="text-xs text-gray-500">蛋白质</div>
                  </div>
                  <div className="bg-amber-50 rounded-xl p-4 text-center">
                    <div className="text-lg font-bold text-amber-600">{recipe.carbs || 0}g</div>
                    <div className="text-xs text-gray-500">碳水</div>
                  </div>
                  <div className="bg-red-50 rounded-xl p-4 text-center">
                    <div className="text-lg font-bold text-red-600">{recipe.fat || 0}g</div>
                    <div className="text-xs text-gray-500">脂肪</div>
                  </div>
                </div>
              </div>
            )}

            {/* Tags */}
            <div className="flex flex-wrap gap-2 mt-4">
              {recipe.tags.map((tag, idx) => (
                <span key={idx} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Ingredients */}
        <div className="food-card p-6 mb-6">
          <h2 className="font-display text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Leaf size={24} className="text-green-500" />
            所需食材
          </h2>
          <ul className="space-y-3">
            {recipe.ingredients.map((ing, idx) => (
              <li key={idx} className="flex items-center justify-between py-3 border-b last:border-0">
                <span className="text-gray-800 font-medium">
                  {ing.name}
                  {ing.note && <span className="text-gray-500 text-sm ml-2">({ing.note})</span>}
                </span>
                <span className="text-gray-600 font-semibold">
                  {ing.quantity}{ing.unit}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* Steps */}
        <div className="food-card p-6 mb-6">
          <h2 className="font-display text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <ChefHat size={24} className="text-amber-500" />
            烹饪步骤
          </h2>
          <div className="prose prose-sm max-w-none">
            <RichContentViewer content={recipe.steps} />
          </div>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={handleAddToPlan}
            className="btn-primary flex items-center justify-center gap-2"
          >
            <Calendar size={18} />
            加入周计划
          </button>
          <button
            onClick={() => shoppingMutation.mutate()}
            disabled={shoppingMutation.isPending}
            className="btn-secondary flex items-center justify-center gap-2"
          >
            {shoppingMutation.isPending ? (
              <>
                <Loader2 className="animate-spin" size={18} />
                添加中...
              </>
            ) : (
              <>
                <ShoppingCart size={18} />
                加入采购清单
              </>
            )}
          </button>
        </div>
      </div>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 glass border-t border-gray-200 md:hidden safe-area-pb z-50">
        <div className="grid grid-cols-5 py-2">
          {[
            { href: '/', Icon: ChefHat, label: '首页' },
            { href: '/recipes', Icon: BookOpen, label: '菜谱', active: true },
            { href: '/planner', Icon: Calendar, label: '计划' },
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
