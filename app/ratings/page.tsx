"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import Skeleton from "@/components/Skeleton";
import { getAuthToken } from "@/lib/auth-client";
import {
  Star,
  ArrowLeft,
  ChefHat,
  BookOpen,
  Calendar,
  ShoppingCart,
  Settings,
  FileText,
} from "lucide-react";

interface Member {
  id: string;
  name: string;
  avatarColor: string;
}

interface Recipe {
  id: string;
  name: string;
}

interface MealPlan {
  id: string;
  dayOfWeek: number;
  mealType: string;
  recipe: Recipe;
}

interface Rating {
  id: string;
  rating: number;
  comment: string;
  member: Member;
  mealPlan: MealPlan;
  createdAt: string;
}

const DAY_NAMES = ["周一", "周二", "周三", "周四", "周五", "周六", "周日"];
const MEAL_NAMES: Record<string, string> = {
  BREAKFAST: "早餐",
  LUNCH: "午餐",
  DINNER: "晚餐",
};

async function fetchRatings(): Promise<Rating[]> {
  const token = await getAuthToken();

  const res = await fetch("/api/meal-ratings", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (res.status === 401) {
    window.location.href = "/auth/login";
    throw new Error("未授权访问");
  }

  if (!res.ok) throw new Error("获取评分失败");
  const data = await res.json();
  return data.ratings;
}

export default function RatingsPage() {
  const router = useRouter();
  const {
    data: ratings = [],
    isLoading: ratingsLoading,
  } = useQuery({
    queryKey: ["ratings"],
    queryFn: fetchRatings,
  });

  const averageRating =
    ratings.length > 0
      ? (ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length).toFixed(1)
      : "-";

  if (ratingsLoading) {
    return (
      <main className="min-h-screen bg-pale-gray pb-24">
        <div className="max-w-4xl mx-auto px-5 py-8 space-y-4">
          <Skeleton className="h-[80px] rounded-spotlight" />
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-[120px] rounded-card" />
          ))}
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-pale-gray pb-24">
      <div className="max-w-4xl mx-auto px-5 py-8">
        <div className="flex items-center justify-end mb-6">
          <button
            onClick={() => router.push("/planner")}
            className="btn-secondary"
          >
            <ArrowLeft size={16} />
            返回计划
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="card p-5 text-center">
            <div className="text-[28px] font-semibold text-accent-500 tracking-[-0.01em]">
              {ratings.length}
            </div>
            <div className="text-label text-text-secondary mt-1">已评分</div>
          </div>
          <div className="card p-5 text-center">
            <div className="flex items-center justify-center gap-1 text-[28px] font-semibold text-accent-500 tracking-[-0.01em]">
              {averageRating}
              {averageRating !== "-" && (
                <Star size={18} className="fill-accent-500 text-accent-500" />
              )}
            </div>
            <div className="text-label text-text-secondary mt-1">平均分</div>
          </div>
          <div className="card p-5 text-center">
            <div className="text-[28px] font-semibold text-green-600 tracking-[-0.01em]">
              {ratings.filter((r) => r.rating >= 4).length}
            </div>
            <div className="text-label text-text-secondary mt-1">好评</div>
          </div>
        </div>

        {/* Rating List */}
        <div className="space-y-3">
          {ratings.length === 0 ? (
            <div className="text-center py-16 card">
              <div className="w-20 h-20 rounded-full bg-black/3 flex items-center justify-center mx-auto mb-5">
                <FileText size={40} className="text-text-secondary" />
              </div>
              <p className="text-ink text-lg mb-2">还没有评分记录</p>
              <p className="text-label text-text-secondary">
                在周计划页面点击&ldquo;评分&rdquo;按钮来记录您的用餐体验
              </p>
            </div>
          ) : (
            ratings.map((rating) => (
              <div key={rating.id} className="card p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold text-sm"
                      style={{ backgroundColor: rating.member.avatarColor }}
                    >
                      {rating.member.name[0]}
                    </div>
                    <div>
                      <div className="font-semibold text-ink">
                        {rating.member.name}
                      </div>
                      <div className="text-label text-text-secondary">
                        {DAY_NAMES[rating.mealPlan.dayOfWeek - 1]} ·{" "}
                        {MEAL_NAMES[rating.mealPlan.mealType]}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        size={16}
                        className={
                          i < rating.rating
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-black/8"
                        }
                      />
                    ))}
                  </div>
                </div>
                <div className="ml-[52px]">
                  <div className="font-medium text-ink mb-1">
                    {rating.mealPlan.recipe.name}
                  </div>
                  {rating.comment && (
                    <p className="text-body-lg text-text-secondary">
                      {rating.comment}
                    </p>
                  )}
                  <div className="text-xs text-text-secondary mt-2">
                    {new Date(rating.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 glass-nav md:hidden safe-area-pb z-50">
        <div className="grid grid-cols-5 py-1.5">
          {[
            { href: "/", Icon: ChefHat, label: "首页" },
            { href: "/recipes", Icon: BookOpen, label: "菜谱" },
            { href: "/planner", Icon: Calendar, label: "计划", active: true },
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
