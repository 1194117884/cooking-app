'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import Skeleton from '@/components/Skeleton';
import { api } from '@/lib/api-client';
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
} from 'lucide-react';

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

const DAY_NAMES = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];
const MEAL_TYPES = [
  { key: 'BREAKFAST', label: '早餐', Icon: Sunrise, color: 'amber' },
  { key: 'LUNCH', label: '午餐', Icon: Sun, color: 'orange' },
  { key: 'DINNER', label: '晚餐', Icon: Moon, color: 'indigo' },
];

async function fetchRecipes(): Promise<Recipe[]> {
  const data = await api.get('/api/recipes') as { recipes: Recipe[] };
  return data.recipes;
}

async function fetchMealPlans(): Promise<MealPlan[]> {
  const data = await api.get('/api/meal-plans') as { mealPlans: MealPlan[] };
  return data.mealPlans || [];
}

async function fetchMembers(): Promise<Member[]> {
  const data = await api.get('/api/members') as { members: Member[] };
  return data.members;
}

async function submitRating(mealPlanId: string, memberId: string, rating: number, comment: string) {
  return api.post('/api/meal-ratings', {
    mealPlanId,
    memberId,
    rating,
    comment,
  });
}

async function addMealPlan(dayOfWeek: number, mealType: string, recipeId: string) {
  return api.post('/api/meal-plans', {
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
  return api.post('/api/meal-plans/generate', {
    weekStartDate: today.toISOString(),
  });
}

export default function PlannerPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [selectedMealType, setSelectedMealType] = useState<string | null>(null);
  const [showRecipePicker, setShowRecipePicker] = useState(false);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<MealPlan | null>(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [ratingMemberId, setRatingMemberId] = useState('');
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    const stored = sessionStorage.getItem('selectedRecipe');
    if (stored) {
      sessionStorage.removeItem('selectedRecipe');
    }
  }, []);

  const { data: recipes = [], isLoading: recipesLoading } = useQuery({
    queryKey: ['recipes'],
    queryFn: fetchRecipes,
  });

  const { data: mealPlans = [], isLoading: plansLoading } = useQuery({
    queryKey: ['mealPlans'],
    queryFn: fetchMealPlans,
  });

  const { data: members = [], isLoading: membersLoading } = useQuery({
    queryKey: ['members'],
    queryFn: fetchMembers,
  });

  const addMutation = useMutation({
    mutationFn: ({ day, mealType, recipeId }: { day: number; mealType: string; recipeId: string }) =>
      addMealPlan(day, mealType, recipeId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mealPlans'] });
      setShowRecipePicker(false);
      setSelectedDay(null);
      setSelectedMealType(null);
    },
  });

  const removeMutation = useMutation({
    mutationFn: removeMealPlan,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mealPlans'] });
    },
  });

  const ratingMutation = useMutation({
    mutationFn: () => submitRating(selectedPlan!.id, ratingMemberId, rating, comment),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mealPlans'] });
      queryClient.invalidateQueries({ queryKey: ['ratings'] });
      setShowRatingModal(false);
      setSelectedPlan(null);
      setComment('');
      setRating(5);
    },
  });

  const generateMutation = useMutation({
    mutationFn: generateMealPlans,
    onMutate: () => setGenerating(true),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mealPlans'] });
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
      addMutation.mutate({ day: selectedDay, mealType: selectedMealType, recipeId: recipe.id });
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
      <main className="min-h-screen bg-cream-gradient pb-24">
        <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">
          <Skeleton className="h-24 rounded-3xl" />
          <div className="grid grid-cols-7 gap-3">
            {[...Array(7)].map((_, i) => (
              <Skeleton key={i} className="h-28 rounded-2xl" />
            ))}
          </div>
          <Skeleton className="h-[500px] rounded-3xl" />
        </div>
      </main>
    );
  }

  const totalMeals = mealPlans.length;
  const completedDays = new Set(mealPlans.map(mp => mp.dayOfWeek)).size;

  return (
    <main className="min-h-screen bg-cream-gradient pb-24">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="font-display text-3xl md:text-4xl font-bold text-gray-900 mb-2">
              周计划
            </h1>
            <p className="text-gray-500">
              本周已安排 <span className="text-amber-600 font-semibold">{totalMeals}</span> 餐，
              覆盖 <span className="text-amber-600 font-semibold">{completedDays}</span> 天
            </p>
          </div>
          <a
            href="/ratings"
            className="btn-secondary inline-flex items-center gap-2"
          >
            <Star size={18} />
            查看评分
          </a>
        </div>

        {/* Week Overview Cards */}
        <div className="grid grid-cols-7 gap-3 mb-8">
          {DAY_NAMES.map((day, idx) => {
            const dayNum = idx + 1;
            const dayPlans = mealPlans.filter((mp) => mp.dayOfWeek === dayNum);
            const isToday = new Date().getDay() === (dayNum % 7);

            return (
              <div
                key={idx}
                className={`food-card p-4 text-center cursor-pointer transition-all ${
                  isToday ? 'ring-2 ring-amber-400 bg-amber-50/50' : ''
                }`}
              >
                <div className={`font-display font-bold text-lg mb-2 ${isToday ? 'text-amber-600' : 'text-gray-800'}`}>
                  {day}
                </div>
                <div className="flex justify-center gap-1 mb-3">
                  {dayPlans.length > 0 ? (
                    dayPlans.map((_, i) => (
                      <div key={i} className="w-2 h-2 rounded-full bg-amber-400" />
                    ))
                  ) : (
                    <div className="w-2 h-2 rounded-full bg-gray-200" />
                  )}
                </div>
                <button
                  onClick={() => handleAddMeal(dayNum, 'DINNER')}
                  className="w-full py-1.5 text-xs bg-amber-100 text-amber-700 rounded-lg hover:bg-amber-200 transition-colors font-medium flex items-center justify-center gap-1"
                >
                  <Plus size={12} /> 添加
                </button>
              </div>
            );
          })}
        </div>

        {/* Meal Schedule */}
        <div className="food-card overflow-hidden mb-8">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50/80">
                  <th className="px-4 py-4 text-left text-sm font-semibold text-gray-700 w-28">
                    餐次
                  </th>
                  {DAY_NAMES.map((day, idx) => (
                    <th
                      key={idx}
                      className="px-3 py-4 text-center text-sm font-semibold text-gray-700 min-w-[120px]"
                    >
                      {day}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {MEAL_TYPES.map((meal) => (
                  <tr key={meal.key} className="border-t border-gray-100">
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <meal.Icon size={20} className={`text-${meal.color}-500`} />
                        <span className="font-medium text-gray-700">{meal.label}</span>
                      </div>
                    </td>
                    {DAY_NAMES.map((_, idx) => {
                      const dayNum = idx + 1;
                      const plan = getMealPlan(dayNum, meal.key);
                      return (
                        <td key={idx} className="px-2 py-3">
                          {plan ? (
                            <div className="relative group">
                              <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-3 border border-amber-100">
                                <div className="font-medium text-gray-800 text-sm truncate mb-1">
                                  {plan.recipe.name}
                                </div>
                                <div className="text-xs text-gray-500 flex items-center gap-1">
                                  <TrendingUp size={10} />
                                  {plan.recipe.cookTimeMin}分钟
                                </div>
                                {plan.ratings && plan.ratings.length > 0 && (
                                  <div className="text-xs mt-2 text-amber-600 flex items-center gap-1">
                                    <Star size={10} className="fill-amber-500 text-amber-500" />
                                    {(plan.ratings.reduce((s, r) => s + r.rating, 0) / plan.ratings.length).toFixed(1)}
                                  </div>
                                )}
                              </div>
                              <div className="absolute -top-2 -right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                  onClick={() => handleRateMeal(plan)}
                                  className="w-7 h-7 rounded-full bg-yellow-400 text-white flex items-center justify-center shadow-soft hover:shadow-float"
                                  title="评分"
                                >
                                  <Star size={12} className="fill-white" />
                                </button>
                                <button
                                  onClick={() => handleRemoveMeal(plan.id)}
                                  className="w-7 h-7 rounded-full bg-terracotta-500 text-white flex items-center justify-center shadow-soft hover:shadow-float"
                                  title="删除"
                                >
                                  <Trash2 size={12} />
                                </button>
                              </div>
                            </div>
                          ) : (
                            <button
                              onClick={() => handleAddMeal(dayNum, meal.key)}
                              className="w-full py-6 text-gray-300 hover:text-amber-500 hover:bg-amber-50 rounded-xl transition-all border border-dashed border-gray-200 hover:border-amber-300 flex items-center justify-center"
                            >
                              <Plus size={20} />
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
        <div className="grid md:grid-cols-3 gap-4">
          <button
            onClick={() => {
              if (confirm('确定要智能生成一周菜单吗？这会替换现有计划。')) {
                generateMutation.mutate();
              }
            }}
            disabled={generating}
            className="btn-primary flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {generating ? (
              <>
                <Loader2 className="animate-spin" size={20} />
                生成中...
              </>
            ) : (
              <>
                <Sparkles size={20} />
                智能生成一周菜单
              </>
            )}
          </button>
          <a
            href="/shopping"
            className="btn-secondary text-center flex items-center justify-center gap-2"
          >
            <ShoppingCart size={20} />
            生成采购清单
          </a>
          <a
            href="/nutrition"
            className="btn-secondary text-center flex items-center justify-center gap-2"
          >
            <TrendingUp size={20} />
            查看营养分析
          </a>
        </div>
      </div>

      {/* Recipe Picker Modal */}
      {showRecipePicker && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-display text-xl font-bold">选择菜谱</h3>
              <button
                onClick={() => setShowRecipePicker(false)}
                className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-5 overflow-y-auto max-h-[60vh]">
              <div className="grid gap-3">
                {recipes.map((recipe) => (
                  <button
                    key={recipe.id}
                    onClick={() => handleSelectRecipe(recipe)}
                    disabled={addMutation.isPending}
                    className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-amber-50 hover:border-amber-200 border border-transparent transition-all text-left disabled:opacity-50"
                  >
                    <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center flex-shrink-0">
                      {recipe.coverImageUrl ? (
                        <img src={recipe.coverImageUrl} alt={recipe.name} className="w-full h-full object-cover rounded-xl" />
                      ) : (
                        <ChefHat size={24} className="text-amber-400" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-gray-800 truncate">{recipe.name}</div>
                      <div className="text-sm text-gray-500">
                        {recipe.cuisineType} · {recipe.cookTimeMin}分钟
                      </div>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-white shadow-soft flex items-center justify-center text-amber-600">
                      <ArrowRight size={16} />
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
            <h3 className="font-display text-xl font-bold mb-6">
              评价 <span className="text-amber-600">{selectedPlan.recipe.name}</span>
            </h3>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                评分成员
              </label>
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

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                评分
              </label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setRating(star)}
                    className={`p-2 rounded-xl transition-transform hover:scale-110 ${
                      star <= rating ? 'text-amber-400' : 'text-gray-200'
                    }`}
                  >
                    <Star size={32} className={star <= rating ? 'fill-amber-400' : ''} />
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-8">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                评论（可选）
              </label>
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
                className="flex-1 py-3 border border-gray-200 rounded-xl hover:bg-gray-50 font-medium transition-colors"
              >
                取消
              </button>
              <button
                onClick={() => ratingMutation.mutate()}
                disabled={ratingMutation.isPending || !ratingMemberId}
                className="flex-1 py-3 bg-amber-500 text-white rounded-xl hover:bg-amber-600 disabled:opacity-50 font-medium transition-colors"
              >
                {ratingMutation.isPending ? '提交中...' : '提交评分'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 glass border-t border-gray-200 md:hidden safe-area-pb z-50">
        <div className="grid grid-cols-5 py-2">
          {[
            { href: '/', Icon: ChefHat, label: '首页' },
            { href: '/recipes', Icon: BookOpen, label: '菜谱' },
            { href: '/planner', Icon: Calendar, label: '计划', active: true },
            { href: '/shopping', Icon: ShoppingIcon, label: '采购' },
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
