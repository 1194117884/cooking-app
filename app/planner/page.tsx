"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Skeleton from "@/components/Skeleton";
import { api } from "@/lib/api-client";
import {
  Calendar,
  Star,
  X,
  Plus,
  Loader2,
  ShoppingCart,
  TrendingUp,
  Sparkles,
  Trash2,
  ChefHat,
  Sun,
  Moon,
  Sunrise,
  Settings,
  BookOpen,
  ShoppingCart as ShoppingIcon,
  ArrowRight,
} from "lucide-react";

interface Recipe {
  id: string;
  name: string;
  cuisineType: string;
  cookTimeMin: number;
  coverImageUrl?: string;
}

interface Member {
  id: string;
  name: string;
  avatarColor: string;
}

interface MealPlan {
  id: string;
  dayOfWeek: number;
  mealType: string;
  recipe: Recipe;
  ratings?: { rating: number; memberId: string }[];
}

const DAY_NAMES = ["周一", "周二", "周三", "周四", "周五", "周六", "周日"];
const MEAL_TYPES = [
  { key: "BREAKFAST", label: "早餐", Icon: Sunrise },
  { key: "LUNCH", label: "午餐", Icon: Sun },
  { key: "DINNER", label: "晚餐", Icon: Moon },
];

async function fetchRecipes(): Promise<Recipe[]> {
  const data = (await api.get("/api/recipes")) as { recipes: Recipe[] };
  return data.recipes;
}

async function fetchMealPlans(): Promise<MealPlan[]> {
  const data = (await api.get("/api/meal-plans")) as {
    mealPlans: MealPlan[];
  };
  return data.mealPlans || [];
}

async function fetchMembers(): Promise<Member[]> {
  const data = (await api.get("/api/members")) as { members: Member[] };
  return data.members;
}

async function submitRating(
  mealPlanId: string,
  memberId: string,
  rating: number,
  comment: string
) {
  return api.post("/api/meal-ratings", {
    mealPlanId,
    memberId,
    rating,
    comment,
  });
}

async function addMealPlan(
  dayOfWeek: number,
  mealType: string,
  recipeId: string
) {
  return api.post("/api/meal-plans", {
    dayOfWeek,
    mealType,
    recipeId,
  });
}

async function removeMealPlan(mealPlanId: string) {
  return api.delete(`/api/meal-plans/${mealPlanId}`);
}

async function generateMealPlans() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return api.post("/api/meal-plans/generate", {
    weekStartDate: today.toISOString(),
  });
}

export default function PlannerPage() {
  const queryClient = useQueryClient();
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [selectedMealType, setSelectedMealType] = useState<string | null>(null);
  const [showRecipePicker, setShowRecipePicker] = useState(false);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<MealPlan | null>(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [ratingMemberId, setRatingMemberId] = useState("");
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    const stored = sessionStorage.getItem("selectedRecipe");
    if (stored) {
      sessionStorage.removeItem("selectedRecipe");
    }
  }, []);

  const { data: recipes = [], isLoading: recipesLoading } = useQuery({
    queryKey: ["recipes"],
    queryFn: fetchRecipes,
  });

  const { data: mealPlans = [], isLoading: plansLoading } = useQuery({
    queryKey: ["mealPlans"],
    queryFn: fetchMealPlans,
  });

  const { data: members = [], isLoading: membersLoading } = useQuery({
    queryKey: ["members"],
    queryFn: fetchMembers,
  });

  const addMutation = useMutation({
    mutationFn: ({
      day,
      mealType,
      recipeId,
    }: {
      day: number;
      mealType: string;
      recipeId: string;
    }) => addMealPlan(day, mealType, recipeId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mealPlans"] });
      setShowRecipePicker(false);
      setSelectedDay(null);
      setSelectedMealType(null);
    },
  });

  const removeMutation = useMutation({
    mutationFn: removeMealPlan,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mealPlans"] });
    },
  });

  const ratingMutation = useMutation({
    mutationFn: () =>
      submitRating(selectedPlan!.id, ratingMemberId, rating, comment),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mealPlans"] });
      queryClient.invalidateQueries({ queryKey: ["ratings"] });
      setShowRatingModal(false);
      setSelectedPlan(null);
      setComment("");
      setRating(5);
    },
  });

  const generateMutation = useMutation({
    mutationFn: generateMealPlans,
    onMutate: () => setGenerating(true),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mealPlans"] });
      setGenerating(false);
    },
    onError: () => {
      setGenerating(false);
    },
  });

  const getMealPlan = (day: number, mealType: string) => {
    return mealPlans.find(
      (mp) => mp.dayOfWeek === day && mp.mealType === mealType
    );
  };

  const handleAddMeal = (day: number, mealType: string) => {
    setSelectedDay(day);
    setSelectedMealType(mealType);
    setShowRecipePicker(true);
  };

  const handleSelectRecipe = (recipe: Recipe) => {
    if (selectedDay !== null && selectedMealType) {
      addMutation.mutate({
        day: selectedDay,
        mealType: selectedMealType,
        recipeId: recipe.id,
      });
    }
  };

  const handleRemoveMeal = (mealPlanId: string) => {
    removeMutation.mutate(mealPlanId);
  };

  const handleRateMeal = (plan: MealPlan) => {
    setSelectedPlan(plan);
    if (members.length > 0) {
      setRatingMemberId(members[0].id);
    }
    setShowRatingModal(true);
  };

  const isLoading = recipesLoading || plansLoading || membersLoading;

  if (isLoading) {
    return (
      <main className="min-h-screen bg-pale-gray pb-24">
        <div className="max-w-7xl mx-auto px-5 py-8 space-y-5">
          <Skeleton className="h-[88px] rounded-spotlight" />
          <div className="grid grid-cols-7 gap-2">
            {[...Array(7)].map((_, i) => (
              <Skeleton key={i} className="h-[100px] rounded-card" />
            ))}
          </div>
          <Skeleton className="h-[500px] rounded-module" />
        </div>
      </main>
    );
  }

  const totalMeals = mealPlans.length;
  const completedDays = new Set(mealPlans.map((mp) => mp.dayOfWeek)).size;

  return (
    <main className="min-h-screen bg-pale-gray pb-24">
      <div className="max-w-7xl mx-auto px-5 py-8">
        <div className="flex items-center justify-end gap-4 mb-6">
          <a href="/ratings" className="btn-secondary">
            <Star size={16} />
            查看评分
          </a>
        </div>

        {/* Week Overview Cards */}
        <div className="grid grid-cols-7 gap-2 mb-6">
          {DAY_NAMES.map((day, idx) => {
            const dayNum = idx + 1;
            const dayPlans = mealPlans.filter(
              (mp) => mp.dayOfWeek === dayNum
            );
            const isToday = new Date().getDay() === dayNum % 7;

            return (
              <div
                key={idx}
                className={`card p-3 text-center transition-all ${
                  isToday ? "ring-2 ring-accent-300 bg-accent-50/30" : ""
                }`}
              >
                <div
                  className={`font-display font-semibold text-[17px] mb-1.5 ${
                    isToday ? "text-accent-500" : "text-ink"
                  }`}
                >
                  {day}
                </div>
                <div className="flex justify-center gap-1 mb-2.5">
                  {dayPlans.length > 0 ? (
                    dayPlans.map((_, i) => (
                      <div
                        key={i}
                        className="w-1.5 h-1.5 rounded-full bg-accent-500"
                      />
                    ))
                  ) : (
                    <div className="w-1.5 h-1.5 rounded-full bg-black/10" />
                  )}
                </div>
                <button
                  onClick={() => handleAddMeal(dayNum, "DINNER")}
                  className="w-full py-1.5 text-xs bg-black/3 text-ink rounded-pill hover:bg-black/8 transition-colors font-medium flex items-center justify-center gap-1"
                >
                  <Plus size={11} /> 添加
                </button>
              </div>
            );
          })}
        </div>

        {/* Meal Schedule Table */}
        <div className="card overflow-hidden mb-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-black/[0.02]">
                  <th className="px-4 py-3.5 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider w-24">
                    餐次
                  </th>
                  {DAY_NAMES.map((day, idx) => (
                    <th
                      key={idx}
                      className="px-3 py-3.5 text-center text-xs font-semibold text-text-secondary uppercase tracking-wider min-w-[120px]"
                    >
                      {day}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {MEAL_TYPES.map((meal) => (
                  <tr key={meal.key} className="border-t border-[#e5e5e5]">
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2">
                        <meal.Icon size={18} className="text-text-secondary" />
                        <span className="text-sm font-medium text-ink">
                          {meal.label}
                        </span>
                      </div>
                    </td>
                    {DAY_NAMES.map((_, idx) => {
                      const dayNum = idx + 1;
                      const plan = getMealPlan(dayNum, meal.key);
                      return (
                        <td key={idx} className="px-2 py-3">
                          {plan ? (
                            <div className="relative group">
                              <div className="bg-accent-50/50 rounded-control p-3 border border-accent-100">
                                <div className="font-medium text-ink text-sm truncate mb-1">
                                  {plan.recipe.name}
                                </div>
                                <div className="text-xs text-text-secondary flex items-center gap-1">
                                  <TrendingUp size={10} />
                                  {plan.recipe.cookTimeMin}分钟
                                </div>
                                {plan.ratings &&
                                  plan.ratings.length > 0 && (
                                    <div className="text-xs mt-1.5 text-accent-500 flex items-center gap-1">
                                      <Star
                                        size={10}
                                        className="fill-accent-500"
                                      />
                                      {(
                                        plan.ratings.reduce(
                                          (s, r) => s + r.rating,
                                          0
                                        ) / plan.ratings.length
                                      ).toFixed(1)}
                                    </div>
                                  )}
                              </div>
                              <div className="absolute -top-1.5 -right-1.5 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                  onClick={() => handleRateMeal(plan)}
                                  className="w-6 h-6 rounded-full bg-yellow-400 text-white flex items-center justify-center shadow-subtle hover:shadow-elevated"
                                  title="评分"
                                >
                                  <Star size={11} className="fill-white" />
                                </button>
                                <button
                                  onClick={() => handleRemoveMeal(plan.id)}
                                  className="w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center shadow-subtle hover:shadow-elevated"
                                  title="删除"
                                >
                                  <Trash2 size={11} />
                                </button>
                              </div>
                            </div>
                          ) : (
                            <button
                              onClick={() => handleAddMeal(dayNum, meal.key)}
                              className="w-full py-6 text-text-secondary hover:text-accent-500 hover:bg-accent-50 rounded-control transition-all border border-dashed border-[#e5e5e5] hover:border-accent-200 flex items-center justify-center"
                            >
                              <Plus size={18} />
                            </button>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-3">
          <button
            onClick={() => {
              if (confirm("确定要智能生成一周菜单吗？这会替换现有计划。")) {
                generateMutation.mutate();
              }
            }}
            disabled={generating}
            className="btn-primary"
          >
            {generating ? (
              <>
                <Loader2 className="animate-spin" size={18} />
                生成中...
              </>
            ) : (
              <>
                <Sparkles size={18} />
                智能生成一周菜单
              </>
            )}
          </button>
          <a href="/shopping" className="btn-secondary text-center">
            <ShoppingCart size={18} />
            生成采购清单
          </a>
          <a href="/nutrition" className="btn-secondary text-center">
            <TrendingUp size={18} />
            查看营养分析
          </a>
        </div>
      </div>

      {/* Recipe Picker Modal */}
      {showRecipePicker && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="px-5 py-4 border-b border-[#e5e5e5] flex items-center justify-between">
              <h3 className="font-display text-utility-heading text-ink">
                选择菜谱
              </h3>
              <button
                onClick={() => setShowRecipePicker(false)}
                className="w-9 h-9 rounded-full bg-black/3 flex items-center justify-center text-text-secondary hover:bg-black/8 transition-colors"
              >
                <X size={18} />
              </button>
            </div>
            <div className="p-4 overflow-y-auto max-h-[60vh]">
              <div className="space-y-2">
                {recipes.map((recipe) => (
                  <button
                    key={recipe.id}
                    onClick={() => handleSelectRecipe(recipe)}
                    disabled={addMutation.isPending}
                    className="flex items-center gap-4 p-3.5 bg-black/[0.02] rounded-module hover:bg-accent-50 hover:border-accent-200 border border-transparent transition-all text-left w-full disabled:opacity-50"
                  >
                    <div className="w-14 h-14 rounded-control bg-black/3 flex items-center justify-center flex-shrink-0 overflow-hidden">
                      {recipe.coverImageUrl ? (
                        <img
                          src={recipe.coverImageUrl}
                          alt={recipe.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <ChefHat size={22} className="text-text-secondary" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-ink truncate">
                        {recipe.name}
                      </div>
                      <div className="text-xs text-text-secondary mt-0.5">
                        {recipe.cuisineType} · {recipe.cookTimeMin}分钟
                      </div>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-black/3 flex items-center justify-center text-accent-500">
                      <ArrowRight size={15} />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Rating Modal */}
      {showRatingModal && selectedPlan && (
        <div className="modal-overlay">
          <div className="modal-content p-6">
            <h3 className="font-display text-utility-heading text-ink mb-6">
              评价{" "}
              <span className="text-accent-500">
                {selectedPlan.recipe.name}
              </span>
            </h3>

            <div className="mb-5">
              <label className="field-label">评分成员</label>
              <select
                value={ratingMemberId}
                onChange={(e) => setRatingMemberId(e.target.value)}
                className="input-field"
              >
                {members.map((member) => (
                  <option key={member.id} value={member.id}>
                    {member.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-5">
              <label className="field-label">评分</label>
              <div className="flex gap-1.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className={`p-1.5 rounded-control transition-transform hover:scale-110 ${
                      star <= rating ? "text-yellow-400" : "text-black/10"
                    }`}
                  >
                    <Star
                      size={30}
                      className={star <= rating ? "fill-yellow-400" : ""}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-8">
              <label className="field-label">评论（可选）</label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="说说这道菜怎么样..."
                className="input-field h-24 resize-none"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowRatingModal(false)}
                className="flex-1 btn-secondary"
              >
                取消
              </button>
              <button
                onClick={() => ratingMutation.mutate()}
                disabled={ratingMutation.isPending || !ratingMemberId}
                className="flex-1 btn-primary"
              >
                {ratingMutation.isPending ? "提交中..." : "提交评分"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 glass-nav md:hidden safe-area-pb z-50">
        <div className="grid grid-cols-5 py-1.5">
          {[
            { href: "/", Icon: ChefHat, label: "首页" },
            { href: "/recipes", Icon: BookOpen, label: "菜谱" },
            { href: "/planner", Icon: Calendar, label: "计划", active: true },
            { href: "/shopping", Icon: ShoppingIcon, label: "采购" },
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
