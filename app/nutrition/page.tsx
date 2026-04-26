"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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
} from "recharts";
import { getAuthToken } from "@/lib/auth-client";
import {
  TrendingUp,
  Flame,
  Beef,
  Wheat,
  Lightbulb,
  BarChart3,
  PieChart as PieChartIcon,
  Activity,
  ChefHat,
  BookOpen,
  Calendar,
  ShoppingCart,
  Settings,
  ArrowRight,
} from "lucide-react";

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

const COLORS = ["#3b82f6", "#10b981", "#f97316"];

export default function NutritionPage() {
  const router = useRouter();
  const [data, setData] = useState<NutritionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState<"week" | "month">("week");

  useEffect(() => {
    fetchNutrition();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [range]);

  const fetchNutrition = async () => {
    try {
      const token = await getAuthToken();
      const res = await fetch(`/api/nutrition?range=${range}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.status === 401) {
        router.push("/auth/login");
        return;
      }

      const result = await res.json();
      setData(result);
      setLoading(false);
    } catch (error) {
      console.error("Failed to fetch nutrition:", error);
      setLoading(false);
    }
  };

  const pieData = data
    ? [
        { name: "蛋白质", value: data.macroRatio.protein, color: COLORS[0] },
        { name: "碳水", value: data.macroRatio.carbs, color: COLORS[1] },
        { name: "脂肪", value: data.macroRatio.fat, color: COLORS[2] },
      ]
    : [];

  if (loading) {
    return (
      <main className="min-h-screen bg-pale-gray flex items-center justify-center p-6">
        <div className="text-center">
          <div className="w-12 h-12 border-[3px] border-black/5 border-t-accent-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-text-secondary text-sm">分析中...</p>
        </div>
      </main>
    );
  }

  if (!data || data.summary.totalMeals === 0) {
    return (
      <main className="min-h-screen bg-pale-gray p-6">
        <div className="max-w-4xl mx-auto text-center py-16">
          <div className="w-20 h-20 rounded-full bg-accent-50 flex items-center justify-center mx-auto mb-5">
            <BarChart3 size={40} className="text-accent-500" />
          </div>
          <h2 className="font-display text-utility-heading text-ink mb-2">
            暂无营养数据
          </h2>
          <p className="text-body-lg text-text-secondary mb-8">
            先安排一些餐食计划，并标记为已完成
          </p>
          <button
            onClick={() => router.push("/planner")}
            className="btn-primary"
          >
            去安排餐食
            <ArrowRight size={18} />
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-pale-gray pb-24">
      <div className="max-w-6xl mx-auto px-5 py-8">
        <div className="mb-6 flex items-center justify-end">
          <div className="flex bg-black/3 rounded-control p-0.5">
            <button
              onClick={() => setRange("week")}
              className={`px-4 py-2 rounded-field text-sm font-medium transition-all ${
                range === "week"
                  ? "bg-white text-ink shadow-subtle"
                  : "text-text-secondary hover:text-ink"
              }`}
            >
              本周
            </button>
            <button
              onClick={() => setRange("month")}
              className={`px-4 py-2 rounded-field text-sm font-medium transition-all ${
                range === "month"
                  ? "bg-white text-ink shadow-subtle"
                  : "text-text-secondary hover:text-ink"
              }`}
            >
              本月
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <div className="card p-5 text-center">
            <div className="w-9 h-9 rounded-full bg-accent-50 flex items-center justify-center mx-auto mb-3">
              <TrendingUp size={18} className="text-accent-500" />
            </div>
            <div className="text-[24px] font-semibold text-accent-500 tracking-[-0.01em]">
              {data.summary.totalMeals}
            </div>
            <div className="text-label text-text-secondary mt-0.5">
              已完成餐食
            </div>
          </div>
          <div className="card p-5 text-center">
            <div className="w-9 h-9 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-3">
              <Flame size={18} className="text-red-600" />
            </div>
            <div className="text-[24px] font-semibold text-red-600 tracking-[-0.01em]">
              {data.dailyAvg.calories}
            </div>
            <div className="text-label text-text-secondary mt-0.5">
              日均热量 (卡)
            </div>
          </div>
          <div className="card p-5 text-center">
            <div className="w-9 h-9 rounded-full bg-blue-50 flex items-center justify-center mx-auto mb-3">
              <Beef size={18} className="text-blue-600" />
            </div>
            <div className="text-[24px] font-semibold text-blue-600 tracking-[-0.01em]">
              {data.dailyAvg.protein}g
            </div>
            <div className="text-label text-text-secondary mt-0.5">
              日均蛋白质
            </div>
          </div>
          <div className="card p-5 text-center">
            <div className="w-9 h-9 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-3">
              <Wheat size={18} className="text-green-600" />
            </div>
            <div className="text-[24px] font-semibold text-green-600 tracking-[-0.01em]">
              {data.dailyAvg.carbs}g
            </div>
            <div className="text-label text-text-secondary mt-0.5">
              日均碳水
            </div>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid md:grid-cols-2 gap-4 mb-6">
          <div className="card p-6">
            <h3 className="font-display text-utility-heading text-ink mb-4 flex items-center gap-2">
              <TrendingUp size={18} className="text-accent-500" />
              每日热量摄入
            </h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={data.chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar
                  dataKey="calories"
                  fill="#f97316"
                  name="热量 (卡)"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="card p-6">
            <h3 className="font-display text-utility-heading text-ink mb-4 flex items-center gap-2">
              <PieChartIcon size={18} className="text-accent-500" />
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
            <div className="flex justify-center gap-4 mt-4 text-xs">
              <div className="flex items-center gap-1.5">
                <div
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: COLORS[0] }}
                />
                <span className="text-text-secondary">
                  蛋白质 {data.macroRatio.protein}%
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <div
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: COLORS[1] }}
                />
                <span className="text-text-secondary">
                  碳水 {data.macroRatio.carbs}%
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <div
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: COLORS[2] }}
                />
                <span className="text-text-secondary">
                  脂肪 {data.macroRatio.fat}%
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Nutrition Trend */}
        <div className="card p-6 mb-6">
          <h3 className="font-display text-utility-heading text-ink mb-4 flex items-center gap-2">
            <Activity size={18} className="text-accent-500" />
            营养摄入趋势
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={data.chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="protein"
                stroke="#3b82f6"
                name="蛋白质 (g)"
                strokeWidth={2}
                dot={{ r: 4 }}
              />
              <Line
                type="monotone"
                dataKey="carbs"
                stroke="#10b981"
                name="碳水 (g)"
                strokeWidth={2}
                dot={{ r: 4 }}
              />
              <Line
                type="monotone"
                dataKey="fat"
                stroke="#f97316"
                name="脂肪 (g)"
                strokeWidth={2}
                dot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Suggestions */}
        <div className="card bg-accent-50/30 border-accent-100 p-6">
          <h3 className="font-display text-utility-heading text-ink mb-4 flex items-center gap-2">
            <Lightbulb size={18} className="text-accent-500" />
            营养建议
          </h3>
          <div className="space-y-2.5">
            {data.suggestions.map((suggestion, idx) => (
              <div
                key={idx}
                className="flex items-start gap-3 p-3 bg-white/80 rounded-field"
              >
                <div className="w-6 h-6 rounded-full bg-accent-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-semibold text-accent-600">
                    {idx + 1}
                  </span>
                </div>
                <span className="text-ink text-sm">{suggestion}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 glass-nav md:hidden safe-area-pb z-50">
        <div className="grid grid-cols-5 py-1.5">
          {[
            { href: "/", Icon: ChefHat, label: "首页" },
            { href: "/recipes", Icon: BookOpen, label: "菜谱" },
            { href: "/planner", Icon: Calendar, label: "计划" },
            { href: "/shopping", Icon: ShoppingCart, label: "采购" },
            { href: "/settings", Icon: Settings, label: "设置" },
          ].map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="nav-link nav-link-inactive"
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
