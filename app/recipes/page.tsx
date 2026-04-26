"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Skeleton from "@/components/Skeleton";
import Link from "next/link";
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
} from "lucide-react";

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
  const res = await fetch("/api/recipes");
  if (!res.ok) throw new Error("获取菜谱失败");
  const data = await res.json();
  return data.recipes;
}

export default function RecipesPage() {
  const {
    data: recipes = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["recipes"],
    queryFn: fetchRecipes,
  });

  const [selectedCuisine, setSelectedCuisine] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const cuisines = [
    "all",
    ...Array.from(new Set(recipes.map((r) => r.cuisineType))),
  ];

  const filteredRecipes = recipes.filter((recipe) => {
    const matchCuisine =
      selectedCuisine === "all" || recipe.cuisineType === selectedCuisine;
    const matchSearch = recipe.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    return matchCuisine && matchSearch;
  });

  const getDifficultyLabel = (difficulty: string) => {
    switch (difficulty) {
      case "EASY":
        return "简单";
      case "MEDIUM":
        return "中等";
      case "HARD":
        return "挑战";
      default:
        return difficulty;
    }
  };

  const getDifficultyStyle = (difficulty: string) => {
    switch (difficulty) {
      case "EASY":
        return "bg-green-50 text-green-700";
      case "MEDIUM":
        return "bg-accent-50 text-accent-700";
      case "HARD":
        return "bg-red-50 text-red-700";
      default:
        return "bg-black/5 text-ink";
    }
  };

  if (isLoading) {
    return (
      <main className="min-h-screen bg-pale-gray pb-24">
        <div className="max-w-7xl mx-auto px-5 py-8">
          <Skeleton className="h-[88px] rounded-spotlight mb-6" />
          <div className="flex gap-2 mb-6">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-9 w-20 rounded-pill" />
            ))}
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-[380px] rounded-module" />
            ))}
          </div>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-pale-gray flex items-center justify-center p-6">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-black/5 flex items-center justify-center mx-auto mb-5">
            <Search size={28} className="text-text-secondary" />
          </div>
          <h2 className="text-utility-heading text-ink mb-2">加载失败</h2>
          <p className="text-body-lg text-text-secondary mb-6">
            请刷新页面重试
          </p>
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
    <main className="min-h-screen bg-pale-gray pb-24">
      <div className="max-w-7xl mx-auto px-5 py-8">
        {/* Search & Filter Bar */}
        <div className="card p-3.5 mb-6">
          <div className="flex flex-col md:flex-row gap-3">
            {/* Search */}
            <div className="relative flex-1">
              <Search
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-secondary"
                size={18}
              />
              <input
                type="text"
                placeholder="搜索菜谱..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input-field pl-10"
              />
            </div>

            {/* View Mode Toggle — segmented control */}
            <div className="flex bg-black/3 rounded-control p-0.5">
              <button
                onClick={() => setViewMode("grid")}
                className={`px-4 py-2 rounded-field text-sm font-medium transition-all flex items-center gap-1.5 ${
                  viewMode === "grid"
                    ? "bg-white text-ink shadow-subtle"
                    : "text-text-secondary hover:text-ink"
                }`}
              >
                <LayoutGrid size={15} />
                网格
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`px-4 py-2 rounded-field text-sm font-medium transition-all flex items-center gap-1.5 ${
                  viewMode === "list"
                    ? "bg-white text-ink shadow-subtle"
                    : "text-text-secondary hover:text-ink"
                }`}
              >
                <List size={15} />
                列表
              </button>
            </div>

            <Link href="/recipes/add" className="btn-primary">
              <Plus size={18} />
              添加菜谱
            </Link>
          </div>

          {/* Cuisine Filter — pill chips */}
          <div className="flex gap-2 mt-3 overflow-x-auto pb-1 scrollbar-hide">
            {cuisines.map((cuisine) => (
              <button
                key={cuisine}
                onClick={() => setSelectedCuisine(cuisine)}
                className={`px-4 py-1.5 rounded-pill whitespace-nowrap text-sm font-medium transition-all ${
                  selectedCuisine === cuisine
                    ? "bg-accent-500 text-white"
                    : "bg-black/3 text-ink hover:bg-black/8"
                }`}
              >
                {cuisine === "all" ? "全部菜系" : cuisine}
              </button>
            ))}
          </div>
        </div>

        {/* Recipe Grid */}
        {viewMode === "grid" ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredRecipes.map((recipe, idx) => (
              <div
                key={recipe.id}
                className="card group overflow-hidden animate-in"
                style={{ animationDelay: `${idx * 0.04}s` }}
              >
                {/* Image */}
                <div className="h-48 bg-black/3 relative overflow-hidden">
                  {recipe.coverImageUrl ? (
                    <img
                      src={recipe.coverImageUrl}
                      alt={recipe.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ChefHat size={56} className="text-text-secondary/30" />
                    </div>
                  )}
                  {recipe.isFavorite && (
                    <div className="absolute top-3 right-3 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center">
                      <Heart
                        size={15}
                        className="text-red-500 fill-red-500"
                      />
                    </div>
                  )}
                  <div
                    className={`absolute top-3 left-3 px-2.5 py-1 rounded-pill text-xs font-semibold ${getDifficultyStyle(recipe.difficulty)}`}
                  >
                    {getDifficultyLabel(recipe.difficulty)}
                  </div>
                </div>

                {/* Content */}
                <div className="p-4">
                  <h3 className="font-display text-[19px] font-semibold text-ink mb-1 group-hover:text-accent-500 transition-colors">
                    {recipe.name}
                  </h3>
                  <p className="text-label text-text-secondary mb-3">
                    {recipe.cuisineType}
                  </p>

                  <div className="flex items-center gap-4 text-xs text-text-secondary mb-3">
                    <span className="flex items-center gap-1">
                      <Clock size={13} /> {recipe.cookTimeMin}分钟
                    </span>
                    <span className="flex items-center gap-1">
                      <Users size={13} /> {recipe.servings}人份
                    </span>
                    {recipe.caloriesPerServing && (
                      <span className="flex items-center gap-1">
                        <Flame size={13} /> {recipe.caloriesPerServing}卡
                      </span>
                    )}
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {recipe.tags.slice(0, 3).map((tag, i) => (
                      <span key={i} className="tag tag-default text-[11px]">
                        {tag}
                      </span>
                    ))}
                  </div>

                  <Link
                    href={`/recipes/${recipe.id}`}
                    className="block w-full bg-ink text-white py-2.5 rounded-pill hover:bg-accent-500 transition-colors text-center text-sm font-medium"
                  >
                    查看详情
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* List View */
          <div className="space-y-2">
            {filteredRecipes.map((recipe, idx) => (
              <div
                key={recipe.id}
                className="card flex items-center gap-4 p-4 group animate-in"
                style={{ animationDelay: `${idx * 0.04}s` }}
              >
                <div className="w-20 h-20 rounded-control bg-black/3 flex-shrink-0 overflow-hidden flex items-center justify-center">
                  {recipe.coverImageUrl ? (
                    <img
                      src={recipe.coverImageUrl}
                      alt={recipe.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <ChefHat size={28} className="text-text-secondary/30" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-display text-[19px] font-semibold text-ink mb-1 group-hover:text-accent-500 transition-colors">
                    {recipe.name}
                  </h3>
                  <p className="text-label text-text-secondary mb-2">
                    {recipe.cuisineType}
                  </p>
                  <div className="flex items-center gap-3 text-xs text-text-secondary">
                    <span
                      className={`px-2 py-0.5 rounded-pill font-medium ${getDifficultyStyle(recipe.difficulty)}`}
                    >
                      {getDifficultyLabel(recipe.difficulty)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock size={12} /> {recipe.cookTimeMin}分钟
                    </span>
                    <span className="flex items-center gap-1">
                      <Users size={12} /> {recipe.servings}人份
                    </span>
                  </div>
                </div>
                <Link
                  href={`/recipes/${recipe.id}`}
                  className="w-9 h-9 rounded-full bg-black/3 flex items-center justify-center text-text-secondary hover:bg-accent-500 hover:text-white transition-all"
                >
                  <ArrowRight size={16} />
                </Link>
              </div>
            ))}
          </div>
        )}

        {filteredRecipes.length === 0 && (
          <div className="empty-state">
            <div className="w-20 h-20 rounded-full bg-black/3 flex items-center justify-center mx-auto mb-5">
              <Search size={36} className="text-text-secondary" />
            </div>
            <h3 className="empty-state-title">没有找到匹配的菜谱</h3>
            <p className="empty-state-text">
              尝试调整搜索条件或添加新菜谱
            </p>
          </div>
        )}
      </div>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 glass-nav md:hidden safe-area-pb z-50">
        <div className="grid grid-cols-5 py-1.5">
          {[
            { href: "/", Icon: ChefHat, label: "首页" },
            { href: "/recipes", Icon: BookOpen, label: "菜谱", active: true },
            { href: "/planner", Icon: Calendar, label: "计划" },
            { href: "/shopping", Icon: ShoppingCart, label: "采购" },
            { href: "/settings", Icon: Settings, label: "设置" },
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
