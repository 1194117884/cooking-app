"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api-client";
import {
  ShoppingCart,
  Plus,
  Loader2,
  Check,
  Carrot,
  Beef,
  Fish,
  Wheat,
  Flame,
  Apple,
  Milk,
  Package,
  ChefHat,
  Settings,
  Calendar,
  BookOpen,
  X,
} from "lucide-react";

interface ShoppingListItem {
  id: string;
  ingredient: {
    name: string;
    category: string;
  };
  quantityNeeded: number;
  unit: string;
  quantityHave: number;
  quantityToBuy: number;
  isPurchased: boolean;
  aisle?: string;
}

const CategoryIcons: Record<
  string,
  React.ComponentType<{ className?: string; size?: number | string }>
> = {
  VEGETABLE: Carrot,
  MEAT: Beef,
  SEAFOOD: Fish,
  GRAIN: Wheat,
  SEASONING: Flame,
  FRUIT: Apple,
  DAIRY: Milk,
  OTHER: Package,
};

const CATEGORIES = [
  { value: "VEGETABLE", label: "蔬菜" },
  { value: "MEAT", label: "肉类" },
  { value: "SEAFOOD", label: "海鲜" },
  { value: "GRAIN", label: "主食" },
  { value: "SEASONING", label: "调料" },
  { value: "FRUIT", label: "水果" },
  { value: "DAIRY", label: "乳制品" },
  { value: "OTHER", label: "其他" },
];

export default function ShoppingPage() {
  const [items, setItems] = useState<ShoppingListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "pending" | "purchased">("all");

  const [showAddModal, setShowAddModal] = useState(false);
  const [newItemName, setNewItemName] = useState("");
  const [newItemCategory, setNewItemCategory] = useState("VEGETABLE");
  const [newItemQuantity, setNewItemQuantity] = useState("1");
  const [newItemUnit, setNewItemUnit] = useState("个");
  const [addingItem, setAddingItem] = useState(false);

  useEffect(() => {
    fetchShoppingList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchShoppingList = async () => {
    try {
      const data = (await api.get("/api/shopping-list")) as {
        items: ShoppingListItem[];
      };
      setItems(data.items || []);
      setLoading(false);
    } catch (error) {
      console.error("Failed to fetch shopping list:", error);
      setLoading(false);
    }
  };

  const togglePurchased = async (id: string) => {
    const item = items.find((i) => i.id === id);
    if (item) {
      try {
        await api.patch(`/api/shopping-list/items/${id}`, {
          isPurchased: !item.isPurchased,
        });
        setItems(
          items.map((i) =>
            i.id === id ? { ...i, isPurchased: !i.isPurchased } : i
          )
        );
      } catch (error) {
        console.error("Failed to update item:", error);
      }
    }
  };

  const generateFromMealPlan = async () => {
    try {
      const data = (await api.post("/api/shopping-list/generate")) as {
        items: ShoppingListItem[];
      };
      setItems(data.items || []);
    } catch (error) {
      console.error("Failed to generate shopping list:", error);
    }
  };

  const handleAddItem = async () => {
    if (!newItemName.trim()) {
      alert("请输入食材名称");
      return;
    }

    setAddingItem(true);
    try {
      const response = (await api.post("/api/shopping-list/items", {
        name: newItemName.trim(),
        category: newItemCategory,
        quantity: parseFloat(newItemQuantity) || 1,
        unit: newItemUnit.trim() || "个",
      })) as { item: ShoppingListItem };

      setItems((prev) => [...prev, response.item]);

      setNewItemName("");
      setNewItemCategory("VEGETABLE");
      setNewItemQuantity("1");
      setNewItemUnit("个");
      setShowAddModal(false);
    } catch (error) {
      console.error("Failed to add item:", error);
      alert("添加失败，请重试");
    } finally {
      setAddingItem(false);
    }
  };

  const groupedItems = items.reduce(
    (acc, item) => {
      const category = item.ingredient.category;
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(item);
      return acc;
    },
    {} as Record<string, ShoppingListItem[]>
  );

  const filteredCategories = Object.entries(groupedItems).filter(
    ([_, categoryItems]) => {
      if (filter === "all") return true;
      if (filter === "pending")
        return categoryItems.some((i) => !i.isPurchased);
      if (filter === "purchased")
        return categoryItems.some((i) => i.isPurchased);
      return true;
    }
  );

  const getCategoryName = (category: string) => {
    const names: Record<string, string> = {
      VEGETABLE: "蔬菜",
      MEAT: "肉类",
      SEAFOOD: "海鲜",
      GRAIN: "主食",
      SEASONING: "调料",
      FRUIT: "水果",
      DAIRY: "乳制品",
      OTHER: "其他",
    };
    return names[category] || category;
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      VEGETABLE: "bg-green-50 text-green-700",
      MEAT: "bg-red-50 text-red-700",
      SEAFOOD: "bg-blue-50 text-blue-700",
      GRAIN: "bg-amber-50 text-amber-700",
      SEASONING: "bg-gray-100 text-gray-700",
      FRUIT: "bg-orange-50 text-orange-700",
      DAIRY: "bg-sky-50 text-sky-700",
      OTHER: "bg-purple-50 text-purple-700",
    };
    return colors[category] || "bg-gray-100 text-gray-700";
  };

  const pendingCount = items.filter((i) => !i.isPurchased).length;
  const purchasedCount = items.filter((i) => i.isPurchased).length;
  const progress =
    items.length > 0
      ? Math.round((purchasedCount / items.length) * 100)
      : 0;

  if (loading) {
    return (
      <main className="min-h-screen bg-pale-gray pb-24">
        <div className="max-w-4xl mx-auto px-5 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="w-12 h-12 border-[3px] border-black/5 border-t-accent-500 rounded-full animate-spin mx-auto mb-4" />
              <p className="text-text-secondary text-sm">加载中...</p>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-pale-gray pb-24">
      <div className="max-w-4xl mx-auto px-5 py-8">

        {/* Progress Card */}
        {items.length > 0 && (
          <div className="card p-5 mb-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-ink">完成进度</span>
              <span className="font-display text-2xl font-semibold text-accent-500">
                {progress}%
              </span>
            </div>
            <div className="progress-bar">
              <div
                className="progress-bar-fill"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="flex justify-between mt-2 text-xs text-text-secondary">
              <span>开始采购</span>
              <span>全部完成</span>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          <button
            onClick={generateFromMealPlan}
            className="btn-primary"
          >
            从周计划生成
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="btn-secondary"
          >
            <Plus size={18} />
            手动添加
          </button>
        </div>

        {/* Filter pills */}
        <div className="flex gap-2 mb-5 overflow-x-auto pb-1">
          {(["all", "pending", "purchased"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-5 py-2 rounded-pill whitespace-nowrap text-sm font-medium transition-all ${
                filter === f
                  ? "bg-accent-500 text-white"
                  : "bg-white text-ink hover:bg-black/3 border border-[#e5e5e5]"
              }`}
            >
              {f === "all" ? "全部" : f === "pending" ? "待采购" : "已完成"}
            </button>
          ))}
        </div>

        {/* Shopping List */}
        {items.length === 0 ? (
          <div className="card p-12 text-center">
            <div className="w-20 h-20 rounded-full bg-accent-50 flex items-center justify-center mx-auto mb-5">
              <ShoppingCart size={40} className="text-accent-500" />
            </div>
            <h3 className="font-display text-utility-heading text-ink mb-2">
              采购清单是空的
            </h3>
            <p className="text-body-lg text-text-secondary mb-8 max-w-sm mx-auto">
              从周计划自动生成，或手动添加需要的食材
            </p>
            <button onClick={generateFromMealPlan} className="btn-primary">
              从周计划生成
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredCategories.map(([category, categoryItems]) => {
              const pendingInCategory = categoryItems.filter(
                (i) => !i.isPurchased
              );
              if (pendingInCategory.length === 0 && filter !== "purchased")
                return null;

              const CategoryIcon = CategoryIcons[category] || Package;

              return (
                <div key={category} className="card overflow-hidden">
                  <div
                    className={`px-5 py-3.5 border-b border-[#e5e5e5] flex items-center justify-between ${getCategoryColor(category)} bg-opacity-30`}
                  >
                    <h3 className="font-semibold flex items-center gap-2 text-sm">
                      <CategoryIcon size={22} />
                      <span>{getCategoryName(category)}</span>
                    </h3>
                    <span className="text-xs font-medium opacity-70">
                      {pendingInCategory.length}/{categoryItems.length}
                    </span>
                  </div>
                  <div className="divide-y divide-[#e5e5e5]">
                    {categoryItems
                      .filter((item) => {
                        if (filter === "all") return true;
                        if (filter === "pending") return !item.isPurchased;
                        if (filter === "purchased") return item.isPurchased;
                        return true;
                      })
                      .map((item) => (
                        <label
                          key={item.id}
                          className={`flex items-center justify-between p-4 cursor-pointer hover:bg-black/[0.02] transition-colors ${
                            item.isPurchased ? "bg-black/[0.01]" : ""
                          }`}
                        >
                          <div className="flex items-center gap-3.5 flex-1">
                            <div
                              className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                                item.isPurchased
                                  ? "bg-accent-500 border-accent-500"
                                  : "border-[#d2d2d7] hover:border-accent-300"
                              }`}
                            >
                              {item.isPurchased && (
                                <Check size={12} className="text-white" />
                              )}
                            </div>
                            <input
                              type="checkbox"
                              checked={item.isPurchased}
                              onChange={() => togglePurchased(item.id)}
                              className="hidden"
                            />
                            <div>
                              <div
                                className={`font-medium text-[17px] ${
                                  item.isPurchased
                                    ? "text-text-secondary line-through"
                                    : "text-ink"
                                }`}
                              >
                                {item.ingredient.name}
                              </div>
                              {item.aisle && (
                                <div className="text-xs text-text-secondary mt-0.5">
                                  {item.aisle}
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <div
                              className={`font-semibold text-[17px] ${
                                item.isPurchased
                                  ? "text-text-secondary"
                                  : "text-ink"
                              }`}
                            >
                              {item.quantityToBuy}
                              <span className="text-sm ml-0.5 font-normal">
                                {item.unit}
                              </span>
                            </div>
                            {item.quantityHave > 0 && (
                              <div className="text-xs text-text-secondary mt-0.5">
                                已有 {item.quantityHave}
                                {item.unit}
                              </div>
                            )}
                          </div>
                        </label>
                      ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {filteredCategories.length === 0 && items.length > 0 && (
          <div className="text-center py-16">
            <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-5">
              <Check size={28} className="text-green-600" />
            </div>
            <h3 className="font-display text-utility-heading text-ink mb-2">
              {filter === "pending"
                ? "太棒了！所有物品已采购完成"
                : "还没有已采购的物品"}
            </h3>
            <p className="text-body-lg text-text-secondary">
              {filter === "pending"
                ? "继续保持，享受烹饪的乐趣"
                : "开始采购，完成后会显示在这里"}
            </p>
          </div>
        )}
      </div>

      {/* Add Item Modal */}
      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal-content p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-display text-utility-heading text-ink">
                手动添加食材
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="w-9 h-9 rounded-full bg-black/3 flex items-center justify-center text-text-secondary hover:bg-black/8 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="field-label">
                  食材名称 <span className="text-accent-500">*</span>
                </label>
                <input
                  type="text"
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  placeholder="例如：西红柿"
                  className="input-field"
                />
              </div>

              <div>
                <label className="field-label">
                  分类 <span className="text-accent-500">*</span>
                </label>
                <select
                  value={newItemCategory}
                  onChange={(e) => setNewItemCategory(e.target.value)}
                  className="input-field"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="field-label">数量</label>
                  <input
                    type="number"
                    value={newItemQuantity}
                    onChange={(e) => setNewItemQuantity(e.target.value)}
                    min="0.1"
                    step="0.1"
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="field-label">单位</label>
                  <input
                    type="text"
                    value={newItemUnit}
                    onChange={(e) => setNewItemUnit(e.target.value)}
                    placeholder="个、克、斤"
                    className="input-field"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 btn-secondary"
              >
                取消
              </button>
              <button
                onClick={handleAddItem}
                disabled={addingItem || !newItemName.trim()}
                className="flex-1 btn-primary"
              >
                {addingItem ? (
                  <>
                    <Loader2 className="animate-spin" size={18} />
                    添加中...
                  </>
                ) : (
                  "添加"
                )}
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
            { href: "/planner", Icon: Calendar, label: "计划" },
            {
              href: "/shopping",
              Icon: ShoppingCart,
              label: "采购",
              active: true,
            },
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
