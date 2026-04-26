"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getAuthToken } from "@/lib/auth-client";
import {
  Heart,
  Plus,
  X,
  Trash2,
  Leaf,
  UtensilsCrossed,
  Smile,
  ChefHat,
  Star,
  BookOpen,
  Calendar,
  ShoppingCart,
  Settings,
  ChefHat as HomeIcon,
} from "lucide-react";

interface Preference {
  id: string;
  type: "LIKE" | "DISLIKE" | "NEUTRAL";
  category: "INGREDIENT" | "CUISINE" | "TASTE" | "COOKING_METHOD";
  value: string;
  intensity: number;
  createdAt: string;
}

interface FamilyMember {
  id: string;
  name: string;
  role: string;
  preferences: Preference[];
}

const CATEGORIES = [
  { value: "INGREDIENT", label: "食材", Icon: Leaf },
  { value: "CUISINE", label: "菜系", Icon: UtensilsCrossed },
  { value: "TASTE", label: "口味", Icon: Smile },
  { value: "COOKING_METHOD", label: "烹饪方式", Icon: ChefHat },
];

const TYPES = [
  { value: "LIKE", label: "喜欢", color: "green" },
  { value: "DISLIKE", label: "忌口", color: "red" },
  { value: "NEUTRAL", label: "一般", color: "gray" },
];

export default function PreferencesPage() {
  const router = useRouter();
  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMember, setSelectedMember] = useState("");

  const [showAddModal, setShowAddModal] = useState(false);
  const [type, setType] = useState<"LIKE" | "DISLIKE" | "NEUTRAL">("LIKE");
  const [category, setCategory] = useState<
    "INGREDIENT" | "CUISINE" | "TASTE" | "COOKING_METHOD"
  >("INGREDIENT");
  const [value, setValue] = useState("");
  const [intensity, setIntensity] = useState(3);

  useEffect(() => {
    fetchPreferences();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchPreferences = async () => {
    try {
      const token = await getAuthToken();
      const res = await fetch("/api/preferences", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.status === 401) {
        router.push("/auth/login");
        return;
      }

      const data = await res.json();
      setMembers(data.members || []);
      if (data.members.length > 0 && !selectedMember) {
        setSelectedMember(data.members[0].id);
      }
      setLoading(false);
    } catch (error) {
      console.error("Failed to fetch preferences:", error);
      setLoading(false);
    }
  };

  const handleAddPreference = async () => {
    if (!value.trim()) {
      alert("请填写具体内容");
      return;
    }

    if (!selectedMember) {
      alert("请选择家庭成员");
      return;
    }

    try {
      const token = await getAuthToken();
      const res = await fetch("/api/preferences", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          memberId: selectedMember,
          type,
          category,
          value,
          intensity,
        }),
      });

      if (res.status === 401) {
        router.push("/auth/login");
        return;
      }

      if (!res.ok) {
        const data = await res.json();
        alert(data.error || "添加失败");
        return;
      }

      await fetchPreferences();
      setShowAddModal(false);
      setValue("");
      setIntensity(3);
    } catch (error) {
      console.error("Failed to add preference:", error);
      alert("添加失败");
    }
  };

  const handleDeletePreference = async (id: string) => {
    if (!confirm("确定要删除该偏好吗？")) return;

    try {
      const token = await getAuthToken();
      const res = await fetch(`/api/preferences/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.status === 401) {
        router.push("/auth/login");
        return;
      }

      if (!res.ok) {
        const data = await res.json();
        alert(data.error || "删除失败");
        return;
      }

      await fetchPreferences();
    } catch (error) {
      console.error("Failed to delete preference:", error);
      alert("删除失败");
    }
  };

  const getSelectedMember = () => {
    return members.find((m) => m.id === selectedMember);
  };

  const getTypeStyle = (t: string) => {
    switch (t) {
      case "LIKE":
        return "bg-green-50 text-green-700";
      case "DISLIKE":
        return "bg-red-50 text-red-700";
      case "NEUTRAL":
        return "bg-black/3 text-ink";
      default:
        return "bg-black/3 text-ink";
    }
  };

  const getTypeLabel = (t: string) => {
    return TYPES.find((type) => type.value === t)?.label || t;
  };

  const getCategoryIcon = (categoryValue: string) => {
    const cat = CATEGORIES.find((c) => c.value === categoryValue);
    return cat ? cat.Icon : Leaf;
  };

  const getCategoryLabel = (categoryValue: string) => {
    return (
      CATEGORIES.find((c) => c.value === categoryValue)?.label || categoryValue
    );
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-pale-gray flex items-center justify-center p-6">
        <div className="text-center">
          <div className="w-12 h-12 border-[3px] border-black/5 border-t-accent-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-text-secondary text-sm">加载中...</p>
        </div>
      </main>
    );
  }

  if (members.length === 0) {
    return (
      <main className="min-h-screen bg-pale-gray p-6">
        <div className="max-w-2xl mx-auto text-center py-16">
          <div className="w-20 h-20 rounded-full bg-accent-50 flex items-center justify-center mx-auto mb-5">
            <Heart size={40} className="text-accent-500" />
          </div>
          <h2 className="font-display text-utility-heading text-ink mb-2">
            暂无家庭成员
          </h2>
          <p className="text-body-lg text-text-secondary mb-8">
            请先添加家庭成员，再设置口味偏好
          </p>
          <button
            onClick={() => router.push("/members")}
            className="btn-primary"
          >
            添加家庭成员
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-pale-gray pb-24">
      <div className="max-w-4xl mx-auto px-5 py-8">
        <div className="mb-6 flex items-center justify-end gap-4">
          <button
            onClick={() => setShowAddModal(true)}
            className="btn-primary"
          >
            <Plus size={18} />
            添加偏好
          </button>
        </div>

        {/* Member Selector */}
        <div className="mb-5 flex gap-2 overflow-x-auto pb-1">
          {members.map((member) => (
            <button
              key={member.id}
              onClick={() => setSelectedMember(member.id)}
              className={`px-4 py-2 rounded-pill whitespace-nowrap transition-all text-sm font-medium ${
                selectedMember === member.id
                  ? "bg-accent-500 text-white"
                  : "bg-white text-ink hover:bg-black/3 border border-[#e5e5e5]"
              }`}
            >
              {member.name}
              {member.preferences.length > 0 && (
                <span className="ml-1.5 text-xs opacity-70">
                  ({member.preferences.length})
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Preferences List */}
        {getSelectedMember()?.preferences.length === 0 ? (
          <div className="card p-12 text-center">
            <div className="w-20 h-20 rounded-full bg-accent-50 flex items-center justify-center mx-auto mb-5">
              <Heart size={40} className="text-accent-500" />
            </div>
            <h3 className="font-display text-utility-heading text-ink mb-2">
              还没有偏好设置
            </h3>
            <p className="text-body-lg text-text-secondary mb-8">
              为 {getSelectedMember()?.name} 添加喜欢或忌口的食物
            </p>
            <button
              onClick={() => setShowAddModal(true)}
              className="btn-primary"
            >
              添加第一个偏好
            </button>
          </div>
        ) : (
          <div className="space-y-2.5">
            {getSelectedMember()?.preferences.map((pref) => {
              const CategoryIcon = getCategoryIcon(pref.category);
              return (
                <div
                  key={pref.id}
                  className="card p-4 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-10 h-10 rounded-control bg-black/3 flex items-center justify-center flex-shrink-0">
                      <CategoryIcon size={20} className="text-text-secondary" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-ink truncate">
                          {pref.value}
                        </span>
                        <span
                          className={`text-[11px] px-2 py-0.5 rounded-pill font-medium flex-shrink-0 ${getTypeStyle(pref.type)}`}
                        >
                          {getTypeLabel(pref.type)}
                        </span>
                      </div>
                      <div className="text-xs text-text-secondary flex items-center gap-1">
                        {getCategoryLabel(pref.category)} · 强度：
                        <div className="flex items-center gap-0.5">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              size={11}
                              className={
                                i < pref.intensity
                                  ? "fill-yellow-400 text-yellow-400"
                                  : "text-black/8"
                              }
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeletePreference(pref.id)}
                    className="text-text-secondary hover:text-red-600 transition-colors p-1.5 flex-shrink-0"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal-content p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-display text-utility-heading text-ink">
                添加偏好
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="w-9 h-9 rounded-full bg-black/3 flex items-center justify-center text-text-secondary hover:bg-black/8 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4">
              {/* Type */}
              <div>
                <label className="field-label">类型</label>
                <div className="grid grid-cols-3 gap-2">
                  {TYPES.map((t) => (
                    <button
                      key={t.value}
                      type="button"
                      onClick={() => setType(t.value as any)}
                      className={`py-2.5 rounded-control border transition-all text-sm font-medium ${
                        type === t.value
                          ? `border-${t.color === "green" ? "green" : t.color === "red" ? "red" : "gray"}-400 bg-${t.color === "green" ? "green" : t.color === "red" ? "red" : "gray"}-50 text-${t.color}-700`
                          : "border-border-soft hover:border-border-mid text-ink"
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Category */}
              <div>
                <label className="field-label">分类</label>
                <div className="grid grid-cols-2 gap-2">
                  {CATEGORIES.map((c) => (
                    <button
                      key={c.value}
                      type="button"
                      onClick={() => setCategory(c.value as any)}
                      className={`p-3 rounded-control border transition-all text-left flex items-center gap-2 ${
                        category === c.value
                          ? "border-accent-400 bg-accent-50"
                          : "border-border-soft hover:border-border-mid"
                      }`}
                    >
                      <c.Icon
                        size={18}
                        className={
                          category === c.value
                            ? "text-accent-500"
                            : "text-text-secondary"
                        }
                      />
                      <span className="text-sm font-medium">{c.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Value */}
              <div>
                <label className="field-label">
                  具体内容 <span className="text-accent-500">*</span>
                </label>
                <input
                  type="text"
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  className="input-field"
                  placeholder={
                    category === "INGREDIENT"
                      ? "例如：香菜、胡萝卜"
                      : category === "CUISINE"
                        ? "例如：川菜、粤菜"
                        : category === "TASTE"
                          ? "例如：辣、甜"
                          : "例如：炒、蒸"
                  }
                />
              </div>

              {/* Intensity */}
              <div>
                <label className="field-label">强度：{intensity}/5</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((level) => (
                    <button
                      key={level}
                      type="button"
                      onClick={() => setIntensity(level)}
                      className={`flex-1 py-2 rounded-control transition-all ${
                        intensity >= level
                          ? "bg-accent-500 text-white"
                          : "bg-black/3 text-text-secondary"
                      }`}
                    >
                      <Star
                        size={16}
                        className={`mx-auto ${intensity >= level ? "fill-white" : ""}`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 btn-secondary"
                >
                  取消
                </button>
                <button
                  onClick={handleAddPreference}
                  className="flex-1 btn-primary"
                >
                  添加
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 glass-nav md:hidden safe-area-pb z-50">
        <div className="grid grid-cols-5 py-1.5">
          {[
            { href: "/", Icon: HomeIcon, label: "首页" },
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
