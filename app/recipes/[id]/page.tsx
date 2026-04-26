"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Skeleton from "@/components/Skeleton";
import RichContentViewer from "@/components/RichContentViewer";
import { getAuthToken } from "@/lib/auth-client";
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
} from "lucide-react";

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
  if (!res.ok) throw new Error("获取菜谱失败");
  const data = await res.json();
  return data.recipe;
}

async function toggleFavorite(id: string, isFavorite: boolean) {
  const token = await getAuthToken();

  const res = await fetch(`/api/recipes/${id}/favorite`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ isFavorite: !isFavorite }),
  });

  if (res.status === 401) {
    window.location.href = "/auth/login";
    throw new Error("未授权访问");
  }

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.error || "操作失败");
  }
  return res.json();
}

async function addToShoppingList(recipeId: string) {
  const token = await getAuthToken();

  const res = await fetch("/api/shopping-list/add-recipe", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ recipeId }),
  });

  if (res.status === 401) {
    window.location.href = "/auth/login";
    throw new Error("未授权访问");
  }

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.error || "添加失败");
  }
  return res.json();
}

export default function RecipeDetailPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const recipeId = params.id as string;

  const {
    data: recipe,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["recipe", recipeId],
    queryFn: () => fetchRecipe(recipeId),
  });

  const favoriteMutation = useMutation({
    mutationFn: () => toggleFavorite(recipeId, recipe?.isFavorite || false),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recipe", recipeId] });
    },
  });

  const shoppingMutation = useMutation({
    mutationFn: () => addToShoppingList(recipeId),
    onSuccess: () => {
      alert("已添加到采购清单！");
    },
    onError: (err: Error) => {
      alert(err.message);
    },
  });

  const handleAddToPlan = () => {
    sessionStorage.setItem(
      "selectedRecipe",
      JSON.stringify({
        id: recipe?.id,
        name: recipe?.name,
      })
    );
    router.push("/planner");
  };

  if (isLoading) {
    return (
      <main className="min-h-screen bg-pale-gray pb-24">
        <div className="max-w-4xl mx-auto px-5 py-8 space-y-5">
          <Skeleton className="h-[320px] rounded-spotlight" />
          <Skeleton className="h-[200px] rounded-module" />
          <Skeleton className="h-[240px] rounded-module" />
        </div>
      </main>
    );
  }

  if (error || !recipe) {
    return (
      <main className="min-h-screen bg-pale-gray p-6">
        <div className="max-w-4xl mx-auto text-center py-16">
          <div className="w-20 h-20 rounded-full bg-black/3 flex items-center justify-center mx-auto mb-5">
            <AlertCircle size={40} className="text-text-secondary" />
          </div>
          <p className="text-body-lg text-text-secondary mb-6">
            菜谱不存在或加载失败
          </p>
          <button onClick={() => router.back()} className="btn-primary">
            返回
          </button>
        </div>
      </main>
    );
  }

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

  return (
    <main className="min-h-screen bg-pale-gray pb-24">
      <div className="max-w-4xl mx-auto px-5 py-8">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="mb-5 text-text-secondary hover:text-ink flex items-center gap-1.5 text-sm font-medium transition-colors"
        >
          <ArrowLeft size={16} />
          返回菜谱库
        </button>

        {/* Header Card */}
        <div className="card overflow-hidden mb-5">
          <div className="h-64 bg-black/3 flex items-center justify-center">
            <ChefHat size={100} className="text-text-secondary/20" />
          </div>
          <div className="p-5">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="font-display text-[32px] font-semibold text-ink mb-2 tracking-[-0.01em]">
                  {recipe.name}
                </h1>
                <div className="flex items-center gap-2.5">
                  <span className="text-body-lg text-text-secondary">
                    {recipe.cuisineType}
                  </span>
                  <span className="text-xs px-2.5 py-1 rounded-pill font-medium bg-black/5 text-ink">
                    {getDifficultyLabel(recipe.difficulty)}
                  </span>
                </div>
              </div>
              <button
                onClick={() => favoriteMutation.mutate()}
                disabled={favoriteMutation.isPending}
                className="w-11 h-11 rounded-full bg-black/3 flex items-center justify-center hover:scale-105 transition-transform disabled:opacity-50"
              >
                <Heart
                  size={22}
                  className={
                    recipe.isFavorite
                      ? "fill-red-500 text-red-500"
                      : "text-text-secondary"
                  }
                />
              </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-4 gap-4 py-4 border-t border-b border-[#e5e5e5]">
              <div className="text-center">
                <div className="w-9 h-9 rounded-full bg-accent-50 flex items-center justify-center mx-auto mb-1.5">
                  <Clock size={16} className="text-accent-500" />
                </div>
                <div className="text-label text-ink">
                  {recipe.cookTimeMin}分钟
                </div>
              </div>
              <div className="text-center">
                <div className="w-9 h-9 rounded-full bg-blue-50 flex items-center justify-center mx-auto mb-1.5">
                  <Users size={16} className="text-blue-600" />
                </div>
                <div className="text-label text-ink">{recipe.servings}人份</div>
              </div>
              <div className="text-center">
                <div className="w-9 h-9 rounded-full bg-orange-50 flex items-center justify-center mx-auto mb-1.5">
                  <Flame size={16} className="text-orange-600" />
                </div>
                <div className="text-label text-ink">
                  {recipe.caloriesPerServing || "?"}卡
                </div>
              </div>
              <div className="text-center">
                <div className="w-9 h-9 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-1.5">
                  <ThumbsUp size={16} className="text-green-600" />
                </div>
                <div className="text-label text-ink">{recipe.popularity}</div>
              </div>
            </div>

            {/* Nutrition */}
            {(recipe.protein || recipe.carbs || recipe.fat) && (
              <div className="py-4">
                <h3 className="text-sm font-semibold mb-3 text-ink">
                  营养成分 (每份)
                </h3>
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-blue-50 rounded-field p-4 text-center">
                    <div className="text-lg font-semibold text-blue-600">
                      {recipe.protein || 0}g
                    </div>
                    <div className="text-xs text-text-secondary mt-0.5">
                      蛋白质
                    </div>
                  </div>
                  <div className="bg-accent-50 rounded-field p-4 text-center">
                    <div className="text-lg font-semibold text-accent-600">
                      {recipe.carbs || 0}g
                    </div>
                    <div className="text-xs text-text-secondary mt-0.5">
                      碳水
                    </div>
                  </div>
                  <div className="bg-red-50 rounded-field p-4 text-center">
                    <div className="text-lg font-semibold text-red-600">
                      {recipe.fat || 0}g
                    </div>
                    <div className="text-xs text-text-secondary mt-0.5">
                      脂肪
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Tags */}
            <div className="flex flex-wrap gap-1.5 mt-4">
              {recipe.tags.map((tag, idx) => (
                <span key={idx} className="tag tag-default">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Ingredients */}
        <div className="card p-5 mb-5">
          <h2 className="font-display text-utility-heading text-ink mb-4 flex items-center gap-2">
            <Leaf size={22} className="text-green-500" />
            所需食材
          </h2>
          <ul className="space-y-0">
            {recipe.ingredients.map((ing, idx) => (
              <li
                key={idx}
                className="flex items-center justify-between py-3 border-b border-[#e5e5e5] last:border-0"
              >
                <span className="text-ink font-medium">
                  {ing.name}
                  {ing.note && (
                    <span className="text-text-secondary text-sm ml-1.5">
                      ({ing.note})
                    </span>
                  )}
                </span>
                <span className="text-text-secondary font-medium text-sm">
                  {ing.quantity}
                  {ing.unit}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* Steps */}
        <div className="card p-5 mb-5">
          <h2 className="font-display text-utility-heading text-ink mb-4 flex items-center gap-2">
            <ChefHat size={22} className="text-accent-500" />
            烹饪步骤
          </h2>
          <div className="prose prose-sm max-w-none prose-headings:font-display prose-p:text-ink prose-p:leading-relaxed">
            <RichContentViewer content={recipe.steps} />
          </div>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={handleAddToPlan}
            className="btn-primary"
          >
            <Calendar size={16} />
            加入周计划
          </button>
          <button
            onClick={() => shoppingMutation.mutate()}
            disabled={shoppingMutation.isPending}
            className="btn-secondary"
          >
            {shoppingMutation.isPending ? (
              <>
                <Loader2 className="animate-spin" size={16} />
                添加中...
              </>
            ) : (
              <>
                <ShoppingCart size={16} />
                加入采购清单
              </>
            )}
          </button>
        </div>
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
