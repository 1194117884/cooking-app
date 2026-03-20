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
      <main className="min-h-screen p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">📊</div>
          <p className="text-gray-600">分析中...</p>
        </div>
      </main>
    );
  }

  if (!data || data.summary.totalMeals === 0) {
    return (
      <main className="min-h-screen p-6">
        <div className="max-w-4xl mx-auto text-center py-12">
          <div className="text-6xl mb-4">📊</div>
          <h2 className="text-xl font-bold mb-2">暂无营养数据</h2>
          <p className="text-gray-600 mb-6">
            先安排一些餐食计划，并标记为已完成
          </p>
          <button
            onClick={() => router.push('/planner')}
            className="bg-primary-600 text-white px-6 py-3 rounded-xl hover:bg-primary-700 transition-colors font-semibold"
          >
            去安排餐食
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen p-6 pb-24">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">📊 营养分析</h1>
            <p className="text-gray-600">
              {range === 'week' ? '本周' : '本月'}营养摄入分析
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setRange('week')}
              className={`px-4 py-2 rounded-xl transition-colors ${
                range === 'week'
                  ? 'bg-primary-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              本周
            </button>
            <button
              onClick={() => setRange('month')}
              className={`px-4 py-2 rounded-xl transition-colors ${
                range === 'month'
                  ? 'bg-primary-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              本月
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-2xl shadow p-4">
            <div className="text-2xl font-bold text-orange-600">
              {data.summary.totalMeals}
            </div>
            <div className="text-sm text-gray-600">已完成餐食</div>
          </div>
          <div className="bg-white rounded-2xl shadow p-4">
            <div className="text-2xl font-bold text-red-600">
              {data.dailyAvg.calories}
            </div>
            <div className="text-sm text-gray-600">日均热量 (卡)</div>
          </div>
          <div className="bg-white rounded-2xl shadow p-4">
            <div className="text-2xl font-bold text-blue-600">
              {data.dailyAvg.protein}g
            </div>
            <div className="text-sm text-gray-600">日均蛋白质</div>
          </div>
          <div className="bg-white rounded-2xl shadow p-4">
            <div className="text-2xl font-bold text-green-600">
              {data.dailyAvg.carbs}g
            </div>
            <div className="text-sm text-gray-600">日均碳水</div>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          {/* Daily Calories Chart */}
          <div className="bg-white rounded-2xl shadow p-6">
            <h3 className="text-lg font-bold mb-4">📈 每日热量摄入</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={data.chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="calories" fill="#ef4444" name="热量 (卡)" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Macro Ratio Chart */}
          <div className="bg-white rounded-2xl shadow p-6">
            <h3 className="text-lg font-bold mb-4">🥗 营养素比例</h3>
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
        <div className="bg-white rounded-2xl shadow p-6 mb-6">
          <h3 className="text-lg font-bold mb-4">📊 营养摄入趋势</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={data.chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="protein" stroke="#3b82f6" name="蛋白质 (g)" strokeWidth={2} />
              <Line type="monotone" dataKey="carbs" stroke="#10b981" name="碳水 (g)" strokeWidth={2} />
              <Line type="monotone" dataKey="fat" stroke="#f59e0b" name="脂肪 (g)" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Suggestions */}
        <div className="bg-gradient-to-br from-primary-50 to-accent-50 rounded-2xl shadow p-6">
          <h3 className="text-lg font-bold mb-4">💡 营养建议</h3>
          <div className="space-y-2">
            {data.suggestions.map((suggestion, idx) => (
              <div key={idx} className="flex items-start gap-3">
                <span className="text-lg">{suggestion.split(' ')[0]}</span>
                <span className="text-gray-700">{suggestion.split(' ').slice(1).join(' ')}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

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
          <a href="/planner" className="flex flex-col items-center py-3 text-gray-600">
            <span className="text-xl">📅</span>
            <span className="text-xs mt-1">计划</span>
          </a>
          <a href="/shopping" className="flex flex-col items-center py-3 text-gray-600">
            <span className="text-xl">🛒</span>
            <span className="text-xs mt-1">采购</span>
          </a>
          <a href="/nutrition" className="flex flex-col items-center py-3 text-primary-600">
            <span className="text-xl">📊</span>
            <span className="text-xs mt-1">营养</span>
          </a>
        </div>
      </nav>
    </main>
  );
}
