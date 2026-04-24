'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from 'recharts';
import { getAuthToken } from '@/lib/auth-client';
import {
  TrendingUp,
  Flame,
  Beef,
  Wheat,
  Droplets,
  Lightbulb,
  BarChart3,
  PieChart as PieChartIcon,
  Activity,
  ChefHat,
  BookOpen,
  Calendar,
  ShoppingCart,
  Settings,
  Loader2,
  ArrowRight,
} from 'lucide-react';

interface NutritionData {
  summary: {
    totalMeals: number;
    totalCalories: number;
    totalProtein: number;
    totalCarbs: number;
    totalFat: number;
  };
  dailyAvg: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
  macroRatio: {
    protein: number;
    carbs: number;
    fat: number;
  };
  chartData: Array<{
    date: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    mealCount: number;
  }>;
  suggestions: string[];
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b'];

export default function NutritionPage() {
  const router = useRouter();
  const [data, setData] = useState<NutritionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState<'week' | 'month'>('week');

  useEffect(() => {
    fetchNutrition();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [range]);

  const fetchNutrition = async () => {
    try {
      const token = await getAuthToken();
      const res = await fetch(`/api/nutrition?range=${range}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (res.status === 401) {
        router.push('/auth/login');
        return;
      }

      const result = await res.json();
      setData(result);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch nutrition:', error);
      setLoading(false);
    }
  };

  const pieData = data ? [
    { name: '蛋白质', value: data.macroRatio.protein, color: COLORS[0] },
    { name: '碳水', value: data.macroRatio.carbs, color: COLORS[1] },
    { name: '脂肪', value: data.macroRatio.fat, color: COLORS[2] },
  ] : [];

  if (loading) {
    return (
      <main className="min-h-screen bg-cream-gradient flex items-center justify-center p-6">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-amber-200 border-t-amber-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500">分析中...</p>
        </div>
      </main>
    );
  }

  if (!data || data.summary.totalMeals === 0) {
    return (
      <main className="min-h-screen bg-cream-gradient p-6">
        <div className="max-w-4xl mx-auto text-center py-16">
          <div className="w-24 h-24 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <BarChart3 size={48} className="text-amber-500" />
          </div>
          <h2 className="font-display text-2xl font-bold text-gray-900 mb-2">暂无营养数据</h2>
          <p className="text-gray-500 mb-8">
            先安排一些餐食计划，并标记为已完成
          </p>
          <button
            onClick={() => router.push('/planner')}
            className="btn-primary inline-flex items-center gap-2"
          >
            去安排餐食
            <ArrowRight size={18} />
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-cream-gradient pb-24">
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
              <BarChart3 className="text-amber-500" />
              营养分析
            </h1>
            <p className="text-gray-500">
              {range === 'week' ? '本周' : '本月'}营养摄入分析
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setRange('week')}
              className={`px-4 py-2 rounded-xl transition-colors font-medium ${
                range === 'week'
                  ? 'bg-amber-500 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              本周
            </button>
            <button
              onClick={() => setRange('month')}
              className={`px-4 py-2 rounded-xl transition-colors font-medium ${
                range === 'month'
                  ? 'bg-amber-500 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              本月
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="food-card p-5 text-center">
            <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-3">
              <TrendingUp size={20} className="text-amber-600" />
            </div>
            <div className="text-2xl font-display font-bold text-amber-600">
              {data.summary.totalMeals}
            </div>
            <div className="text-sm text-gray-500">已完成餐食</div>
          </div>
          <div className="food-card p-5 text-center">
            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-3">
              <Flame size={20} className="text-red-600" />
            </div>
            <div className="text-2xl font-display font-bold text-red-600">
              {data.dailyAvg.calories}
            </div>
            <div className="text-sm text-gray-500">日均热量 (卡)</div>
          </div>
          <div className="food-card p-5 text-center">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-3">
              <Beef size={20} className="text-blue-600" />
            </div>
            <div className="text-2xl font-display font-bold text-blue-600">
              {data.dailyAvg.protein}g
            </div>
            <div className="text-sm text-gray-500">日均蛋白质</div>
          </div>
          <div className="food-card p-5 text-center">
            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-3">
              <Wheat size={20} className="text-green-600" />
            </div>
            <div className="text-2xl font-display font-bold text-green-600">
              {data.dailyAvg.carbs}g
            </div>
            <div className="text-sm text-gray-500">日均碳水</div>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Daily Calories Chart */}
          <div className="food-card p-6">
            <h3 className="font-display text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <TrendingUp size={20} className="text-amber-500" />
              每日热量摄入
            </h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={data.chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="calories" fill="#ef4444" name="热量 (卡)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Macro Ratio Chart */}
          <div className="food-card p-6">
            <h3 className="font-display text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <PieChartIcon size={20} className="text-amber-500" />
              营养素比例
            </h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex justify-center gap-4 mt-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[0] }} />
                <span>蛋白质 {data.macroRatio.protein}%</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[1] }} />
                <span>碳水 {data.macroRatio.carbs}%</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[2] }} />
                <span>脂肪 {data.macroRatio.fat}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Nutrition Trend */}
        <div className="food-card p-6 mb-8">
          <h3 className="font-display text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Activity size={20} className="text-amber-500" />
            营养摄入趋势
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={data.chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="protein" stroke="#3b82f6" name="蛋白质 (g)" strokeWidth={2} dot={{ r: 4 }} />
              <Line type="monotone" dataKey="carbs" stroke="#10b981" name="碳水 (g)" strokeWidth={2} dot={{ r: 4 }} />
              <Line type="monotone" dataKey="fat" stroke="#f59e0b" name="脂肪 (g)" strokeWidth={2} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Suggestions */}
        <div className="food-card bg-gradient-to-br from-amber-50 to-orange-50 border-amber-100 p-6">
          <h3 className="font-display text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Lightbulb size={20} className="text-amber-500" />
            营养建议
          </h3>
          <div className="space-y-3">
            {data.suggestions.map((suggestion, idx) => (
              <div key={idx} className="flex items-start gap-3 p-3 bg-white/70 rounded-xl">
                <div className="w-6 h-6 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-bold text-amber-600">{idx + 1}</span>
                </div>
                <span className="text-gray-700">{suggestion}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 glass border-t border-gray-200 md:hidden safe-area-pb z-50">
        <div className="grid grid-cols-5 py-2">
          {[
            { href: '/', Icon: ChefHat, label: '首页' },
            { href: '/recipes', Icon: BookOpen, label: '菜谱' },
            { href: '/planner', Icon: Calendar, label: '计划' },
            { href: '/shopping', Icon: ShoppingCart, label: '采购' },
            { href: '/settings', Icon: Settings, label: '设置' },
          ].map((item, idx) => (
            <a
              key={idx}
              href={item.href}
              className="nav-link nav-link-inactive"
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
