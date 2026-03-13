'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import Skeleton from '@/components/Skeleton';

interface Recipe {
  id: string;
  name: string;
  cuisineType: string;
  cookTimeMin: number;
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
  { key: 'BREAKFAST', label: '早餐', icon: '🌅' },
  { key: 'LUNCH', label: '午餐', icon: '☀️' },
  { key: 'DINNER', label: '晚餐', icon: '🌙' },
];

async function fetchRecipes(): Promise<Recipe[]> {
  const res = await fetch('/api/recipes');
  if (!res.ok) throw new Error('获取菜谱失败');
  const data = await res.json();
  return data.recipes;
}

async function fetchMealPlans(): Promise<MealPlan[]> {
  const res = await fetch('/api/meal-plans', {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token') || ''}`,
    },
  });
  if (!res.ok) throw new Error('获取计划失败');
  const data = await res.json();
  return data.mealPlans || [];
}

async function fetchMembers(): Promise<Member[]> {
  const res = await fetch('/api/members', {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token') || ''}`,
    },
  });
  if (!res.ok) throw new Error('获取成员失败');
  const data = await res.json();
  return data.members;
}

async function submitRating(mealPlanId: string, memberId: string, rating: number, comment: string) {
  const res = await fetch('/api/meal-ratings', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token') || ''}`,
    },
    body: JSON.stringify({ mealPlanId, memberId, rating, comment }),
  });
  if (!res.ok) throw new Error('提交评分失败');
  return res.json();
}

async function addMealPlan(dayOfWeek: number, mealType: string, recipeId: string) {
  const res = await fetch('/api/meal-plans', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token') || ''}`,
    },
    body: JSON.stringify({ dayOfWeek, mealType, recipeId }),
  });
  if (!res.ok) throw new Error('添加失败');
  return res.json();
}

async function removeMealPlan(mealPlanId: string) {
  const res = await fetch(`/api/meal-plans/${mealPlanId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token') || ''}`,
    },
  });
  if (!res.ok) throw new Error('删除失败');
  return res.json();
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

  // 检查是否有 sessionStorage 中的选中菜谱
  useEffect(() => {
    const stored = sessionStorage.getItem('selectedRecipe');
    if (stored) {
      // 可以在这里自动打开选择器或处理
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

  const getRatingStars = (rating: number) => {
    return '⭐'.repeat(rating);
  };

  const isLoading = recipesLoading || plansLoading || membersLoading;

  if (isLoading) {
    return (
      <main className="min-h-screen p-6 pb-24">
        <div className="max-w-6xl mx-auto space-y-6">
          <Skeleton className="h-20 rounded-xl" />
          <div className="grid md:grid-cols-7 gap-3">
            {[...Array(7)].map((_, i) => (
              <Skeleton key={i} className="h-24 rounded-xl" />
            ))}
          </div>
          <Skeleton className="h-96 rounded-xl" />
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
            <h1 className="text-3xl font-bold mb-2">📅 周计划</h1>
            <p className="text-gray-600">本周已安排 {mealPlans.length} 餐</p>
          </div>
          <a
            href="/ratings"
            className="bg-accent-600 text-white px-4 py-2 rounded-lg hover:bg-accent-700"
          >
            ⭐ 查看评分
          </a>
        </div>

        {/* Week Overview */}
        <div className="grid md:grid-cols-7 gap-3 mb-6">
          {DAY_NAMES.map((day, idx) => {
            const dayNum = idx + 1;
            const dayPlans = mealPlans.filter((mp) => mp.dayOfWeek === dayNum);
            return (
              <div
                key={idx}
                className="bg-white rounded-xl shadow p-3 text-center"
              >
                <div className="font-semibold text-sm mb-2">{day}</div>
                <div className="text-xs text-gray-600 mb-2">
                  {dayPlans.length} 餐
                </div>
                <button
                  onClick={() => handleAddMeal(dayNum, 'DINNER')}
                  className="text-xs bg-primary-100 text-primary-700 px-2 py-1 rounded hover:bg-primary-200"
                >
                  + 添加
                </button>
              </div>
            );
          })}
        </div>

        {/* Meal Schedule */}
        <div className="bg-white rounded-2xl shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                    餐次
                  </th>
                  {DAY_NAMES.map((day, idx) => (
                    <th
                      key={idx}
                      className="px-4 py-3 text-center text-sm font-semibold text-gray-700"
                    >
                      {day}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {MEAL_TYPES.map((meal) => (
                  <tr key={meal.key} className="border-t">
                    <td className="px-4 py-4 text-sm font-medium text-gray-700">
                      <div className="flex items-center gap-2">
                        <span>{meal.icon}</span>
                        <span>{meal.label}</span>
                      </div>
                    </td>
                    {DAY_NAMES.map((_, idx) => {
                      const dayNum = idx + 1;
                      const plan = getMealPlan(dayNum, meal.key);
                      return (
                        <td key={idx} className="px-2 py-2 text-center">
                          {plan ? (
                            <div className="relative group">
                              <div className="bg-gradient-to-br from-orange-50 to-yellow-50 rounded-lg p-2 text-sm">
                                <div className="font-medium text-gray-800 truncate">
                                  {plan.recipe.name}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {plan.recipe.cuisineType}
                                </div>
                                {/* Rating */}
                                {plan.ratings && plan.ratings.length > 0 && (
                                  <div className="text-xs mt-1">
                                    {getRatingStars(Math.round(plan.ratings.reduce((s, r) => s + r.rating, 0) / plan.ratings.length))}
                                  </div>
                                )}
                              </div>
                              <div className="absolute -top-2 -right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                  onClick={() => handleRateMeal(plan)}
                                  className="bg-yellow-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs"
                                  title="评分"
                                >
                                  ⭐
                                </button>
                                <button
                                  onClick={() => handleRemoveMeal(plan.id)}
                                  className="bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs"
                                  title="删除"
                                >
                                  ×
                                </button>
                              </div>
                            </div>
                          ) : (
                            <button
                              onClick={() => handleAddMeal(dayNum, meal.key)}
                              className="text-gray-400 hover:text-primary-600 transition-colors text-sm"
                            >
                              + 添加
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
        <div className="grid md:grid-cols-3 gap-4 mt-6">
          <button
            onClick={() => {
              // 触发智能生成
              if (confirm('确定要智能生成一周菜单吗？这会替换现有计划。')) {
                fetch('/api/meal-plans/generate', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token') || ''}`,
                  },
                  body: JSON.stringify({ weekStartDate: new Date().toISOString() }),
                }).then(() => {
                  queryClient.invalidateQueries({ queryKey: ['mealPlans'] });
                });
              }
            }}
            className="bg-primary-600 text-white py-3 rounded-xl hover:bg-primary-700 transition-colors font-semibold"
          >
            🤖 智能生成一周菜单
          </button>
          <a
            href="/shopping"
            className="bg-accent-600 text-white py-3 rounded-xl hover:bg-accent-700 transition-colors font-semibold text-center"
          >
            🛒 生成采购清单
          </a>
          <a
            href="/nutrition"
            className="bg-green-600 text-white py-3 rounded-xl hover:bg-green-700 transition-colors font-semibold text-center"
          >
            📊 查看营养分析
          </a>
        </div>
      </div>

      {/* Recipe Picker Modal */}
      {showRecipePicker && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
            <div className="p-4 border-b flex items-center justify-between">
              <h3 className="text-lg font-bold">选择菜谱</h3>
              <button
                onClick={() => setShowRecipePicker(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>
            <div className="p-4 overflow-y-auto max-h-96">
              <div className="grid md:grid-cols-2 gap-3">
                {recipes.map((recipe) => (
                  <button
                    key={recipe.id}
                    onClick={() => handleSelectRecipe(recipe)}
                    disabled={addMutation.isPending}
                    className="text-left p-3 border rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-colors disabled:opacity-50"
                  >
                    <div className="font-medium">{recipe.name}</div>
                    <div className="text-sm text-gray-500">
                      {recipe.cuisineType} · {recipe.cookTimeMin}分钟
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <h3 className="text-lg font-bold mb-4">
              ⭐ 评价 {selectedPlan.recipe.name}
            </h3>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                评分成员
              </label>
              <select
                value={ratingMemberId}
                onChange={(e) => setRatingMemberId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              >
                {members.map((member) => (
                  <option key={member.id} value={member.id}>
                    {member.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                评分
              </label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setRating(star)}
                    className={`text-2xl transition-transform ${
                      star <= rating ? 'scale-110' : 'opacity-30'
                    }`}
                  >
                    ⭐
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                评论（可选）
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="说说这道菜怎么样..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg h-24 resize-none"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowRatingModal(false)}
                className="flex-1 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                取消
              </button>
              <button
                onClick={() => ratingMutation.mutate()}
                disabled={ratingMutation.isPending || !ratingMemberId}
                className="flex-1 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
              >
                {ratingMutation.isPending ? '提交中...' : '提交评分'}
              </button>
            </div>
          </div>
        </div>
      )}

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
          <a href="/planner" className="flex flex-col items-center py-3 text-primary-600">
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
