'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Skeleton from '@/components/Skeleton';
import Link from 'next/link';
import {
  Plus,
  Search,
  LayoutGrid,
  List,
  Clock,
  Users,
  Flame,
  ArrowRight,
  Heart,
  ChefHat,
  BookOpen,
  Calendar,
  ShoppingCart,
  Settings,
} from 'lucide-react';

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
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const cuisines = ['all', ...Array.from(new Set(recipes.map((r) => r.cuisineType)))];

  const filteredRecipes = recipes.filter((recipe) => {
    const matchCuisine = selectedCuisine === 'all' || recipe.cuisineType === selectedCuisine;
    const matchSearch = recipe.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCuisine && matchSearch;
  });

  const getDifficultyLabel = (difficulty: string) => {
    switch (difficulty) {
      case 'EASY': return '简单';
      case 'MEDIUM': return '中等';
      case 'HARD': return '挑战';
      default: return difficulty;
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'EASY': return 'bg-sage-100 text-sage-700';
      case 'MEDIUM': return 'bg-amber-100 text-amber-700';
      case 'HARD': return 'bg-terracotta-100 text-terracotta-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  if (isLoading) {
    return (
      <main className="min-h-screen bg-cream-gradient pb-24">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <Skeleton className="h-24 rounded-3xl mb-8" />
          <div className="flex gap-3 mb-8">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-12 w-24 rounded-full" />
            ))}
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-96 rounded-3xl" />
            ))}
          </div>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-cream-gradient flex items-center justify-center p-6">
        <div className="text-center">
          <div className="w-20 h-20 bg-terracotta-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Search size={32} className="text-terracotta-600" />
          </div>
          <h2 className="font-display text-2xl font-bold text-gray-800 mb-2">加载失败</h2>
          <p className="text-gray-500 mb-6">请刷新页面重试</p>
          <button
            onClick={() => window.location.reload()}
            className="btn-primary"
          >
            刷新重试
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-cream-gradient pb-24">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
          <div>
            <h1 className="font-display text-3xl md:text-4xl font-bold text-gray-900 mb-2">
              菜谱库
            </h1>
            <p className="text-gray-500">
              共收录 <span className="text-amber-600 font-semibold">{recipes.length}</span> 道美味佳肴
            </p>
          </div>
          <Link
            href="/recipes/add"
            className="btn-primary inline-flex items-center gap-2"
          >
            <Plus size={20} />
            添加菜谱
          </Link>
        </div>

        {/* Search & Filter Bar */}
        <div className="food-card p-4 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="搜索菜谱..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input-field pl-12"
              />
            </div>

            {/* View Mode Toggle */}
            <div className="flex bg-gray-100 rounded-xl p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                  viewMode === 'grid'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <LayoutGrid size={16} />
                网格
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                  viewMode === 'list'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <List size={16} />
                列表
              </button>
            </div>
          </div>

          {/* Cuisine Filter */}
          <div className="flex gap-2 mt-4 overflow-x-auto pb-2 scrollbar-hide">
            {cuisines.map((cuisine) => (
              <button
                key={cuisine}
                onClick={() => setSelectedCuisine(cuisine)}
                className={`px-4 py-2 rounded-full whitespace-nowrap text-sm font-medium transition-all ${
                  selectedCuisine === cuisine
                    ? 'bg-amber-500 text-white shadow-glow'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {cuisine === 'all' ? '全部菜系' : cuisine}
              </button>
            ))}
          </div>
        </div>

        {/* Recipe Grid */}
        {viewMode === 'grid' ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRecipes.map((recipe, idx) => (
              <div
                key={recipe.id}
                className="food-card group overflow-hidden"
                style={{ animationDelay: `${idx * 0.05}s` }}
              >
                {/* Image */}
                <div className="h-48 bg-gradient-to-br from-amber-100 to-orange-100 relative overflow-hidden">
                  {recipe.coverImageUrl ? (
                    <img
                      src={recipe.coverImageUrl}
                      alt={recipe.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ChefHat size={64} className="text-amber-300" />
                    </div>
                  )}
                  {recipe.isFavorite && (
                    <div className="absolute top-3 right-3 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-soft">
                      <Heart size={16} className="text-red-500 fill-red-500" />
                    </div>
                  )}
                  <div className={`absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-semibold ${getDifficultyColor(recipe.difficulty)}`}>
                    {getDifficultyLabel(recipe.difficulty)}
                  </div>
                </div>

                {/* Content */}
                <div className="p-5">
                  <h3 className="font-display text-xl font-bold text-gray-800 mb-2 group-hover:text-amber-600 transition-colors">
                    {recipe.name}
                  </h3>
                  <p className="text-sm text-gray-500 mb-4">{recipe.cuisineType}</p>

                  <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                    <span className="flex items-center gap-1">
                      <Clock size={14} /> {recipe.cookTimeMin}分钟
                    </span>
                    <span className="flex items-center gap-1">
                      <Users size={14} /> {recipe.servings}人份
                    </span>
                    {recipe.caloriesPerServing && (
                      <span className="flex items-center gap-1">
                        <Flame size={14} /> {recipe.caloriesPerServing}卡
                      </span>
                    )}
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {recipe.tags.slice(0, 3).map((tag, idx) => (
                      <span key={idx} className="tag tag-amber text-xs">
                        {tag}
                      </span>
                    ))}
                  </div>

                  <Link
                    href={`/recipes/${recipe.id}`}
                    className="block w-full bg-gray-900 text-white py-3 rounded-xl hover:bg-amber-500 transition-colors text-center font-medium"
                  >
                    查看详情
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* List View */
          <div className="space-y-4">
            {filteredRecipes.map((recipe, idx) => (
              <div
                key={recipe.id}
                className="food-card flex items-center gap-4 p-4 group cursor-pointer"
                style={{ animationDelay: `${idx * 0.05}s` }}
              >
                <div className="w-24 h-24 rounded-xl bg-gradient-to-br from-amber-100 to-orange-100 flex-shrink-0 overflow-hidden flex items-center justify-center">
                  {recipe.coverImageUrl ? (
                    <img
                      src={recipe.coverImageUrl}
                      alt={recipe.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <ChefHat size={32} className="text-amber-300" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-display text-lg font-bold text-gray-800 mb-1 group-hover:text-amber-600 transition-colors">
                    {recipe.name}
                  </h3>
                  <p className="text-sm text-gray-500 mb-2">{recipe.cuisineType}</p>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(recipe.difficulty)}`}>
                      {getDifficultyLabel(recipe.difficulty)}
                    </span>
                    <span className="flex items-center gap-1"><Clock size={14} /> {recipe.cookTimeMin}分钟</span>
                    <span className="flex items-center gap-1"><Users size={14} /> {recipe.servings}人份</span>
                  </div>
                </div>
                <Link
                  href={`/recipes/${recipe.id}`}
                  className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-amber-500 hover:text-white transition-all"
                >
                  <ArrowRight size={18} />
                </Link>
              </div>
            ))}
          </div>
        )}

        {filteredRecipes.length === 0 && (
          <div className="empty-state">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Search size={40} className="text-gray-300" />
            </div>
            <h3 className="empty-state-title">没有找到匹配的菜谱</h3>
            <p className="empty-state-text">尝试调整搜索条件或添加新菜谱</p>
          </div>
        )}
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
