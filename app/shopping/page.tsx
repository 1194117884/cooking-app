'use client';

import { useEffect, useState } from 'react';

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

interface GroupedItem extends ShoppingListItem {
  totalQuantity: number;
}

export default function ShoppingPage() {
  const [items, setItems] = useState<ShoppingListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'purchased'>('all');

  useEffect(() => {
    fetch('/api/shopping-list')
      .then((res) => res.json())
      .then((data) => {
        setItems(data.items || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to fetch shopping list:', err);
        setLoading(false);
      });
  }, []);

  const togglePurchased = (id: string) => {
    const item = items.find((i) => i.id === id);
    if (item) {
      fetch(`/api/shopping-list/items/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isPurchased: !item.isPurchased }),
      })
        .then(() => {
          setItems(
            items.map((i) =>
              i.id === id ? { ...i, isPurchased: !i.isPurchased } : i
            )
          );
        })
        .catch(console.error);
    }
  };

  const generateFromMealPlan = () => {
    fetch('/api/shopping-list/generate', {
      method: 'POST',
    })
      .then((res) => res.json())
      .then((data) => {
        setItems(data.items || []);
      })
      .catch(console.error);
  };

  // 按类别分组
  const groupedItems = items.reduce((acc, item) => {
    const category = item.ingredient.category;
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(item);
    return acc;
  }, {} as Record<string, ShoppingListItem[]>);

  const filteredCategories = Object.entries(groupedItems).filter(([_, categoryItems]) => {
    if (filter === 'all') return true;
    if (filter === 'pending') return categoryItems.some((i) => !i.isPurchased);
    if (filter === 'purchased') return categoryItems.some((i) => i.isPurchased);
    return true;
  });

  const getCategoryIcon = (category: string) => {
    const icons: Record<string, string> = {
      VEGETABLE: '🥬',
      MEAT: '🥩',
      SEAFOOD: '🐟',
      GRAIN: '🍚',
      SEASONING: '🧂',
      FRUIT: '🍎',
      DAIRY: '🥛',
      OTHER: '📦',
    };
    return icons[category] || '📦';
  };

  const getCategoryName = (category: string) => {
    const names: Record<string, string> = {
      VEGETABLE: '蔬菜',
      MEAT: '肉类',
      SEAFOOD: '海鲜',
      GRAIN: '主食',
      SEASONING: '调料',
      FRUIT: '水果',
      DAIRY: '乳制品',
      OTHER: '其他',
    };
    return names[category] || category;
  };

  const pendingCount = items.filter((i) => !i.isPurchased).length;
  const purchasedCount = items.filter((i) => i.isPurchased).length;

  if (loading) {
    return (
      <main className="min-h-screen p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">🛒</div>
          <p className="text-gray-600">加载中...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen p-6 pb-24">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">🛒 采购清单</h1>
          <p className="text-gray-600">
            待采购 {pendingCount} 项 · 已完成 {purchasedCount} 项
          </p>
        </div>

        {/* Progress */}
        {items.length > 0 && (
          <div className="bg-white rounded-xl shadow p-4 mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">完成进度</span>
              <span className="text-sm font-semibold">
                {Math.round((purchasedCount / items.length) * 100)}%
              </span>
            </div>
            <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-green-500 transition-all"
                style={{ width: `${(purchasedCount / items.length) * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <button
            onClick={generateFromMealPlan}
            className="bg-primary-600 text-white py-3 rounded-xl hover:bg-primary-700 transition-colors font-semibold"
          >
            🤖 从周计划生成
          </button>
          <button className="bg-accent-600 text-white py-3 rounded-xl hover:bg-accent-700 transition-colors font-semibold">
            ➕ 手动添加
          </button>
        </div>

        {/* Filter */}
        <div className="flex gap-2 mb-4">
          {(['all', 'pending', 'purchased'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-full transition-colors ${
                filter === f
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {f === 'all' ? '全部' : f === 'pending' ? '待采购' : '已完成'}
            </button>
          ))}
        </div>

        {/* Shopping List */}
        {items.length === 0 ? (
          <div className="bg-white rounded-2xl shadow p-12 text-center">
            <div className="text-6xl mb-4">🛒</div>
            <h3 className="text-xl font-semibold mb-2">采购清单是空的</h3>
            <p className="text-gray-600 mb-6">
              从周计划自动生成，或手动添加需要的食材
            </p>
            <button
              onClick={generateFromMealPlan}
              className="bg-primary-600 text-white px-6 py-3 rounded-xl hover:bg-primary-700 transition-colors font-semibold"
            >
              从周计划生成
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredCategories.map(([category, categoryItems]) => {
              const pendingInCategory = categoryItems.filter((i) => !i.isPurchased);
              if (pendingInCategory.length === 0 && filter !== 'purchased') return null;

              return (
                <div key={category} className="bg-white rounded-2xl shadow overflow-hidden">
                  <div className="bg-gray-50 px-4 py-3 border-b">
                    <h3 className="font-semibold flex items-center gap-2">
                      <span>{getCategoryIcon(category)}</span>
                      <span>{getCategoryName(category)}</span>
                      <span className="text-sm text-gray-500 font-normal">
                        ({pendingInCategory.length}/{categoryItems.length})
                      </span>
                    </h3>
                  </div>
                  <div>
                    {categoryItems
                      .filter((item) => {
                        if (filter === 'all') return true;
                        if (filter === 'pending') return !item.isPurchased;
                        if (filter === 'purchased') return item.isPurchased;
                        return true;
                      })
                      .map((item) => (
                        <label
                          key={item.id}
                          className={`flex items-center justify-between p-4 border-b last:border-0 cursor-pointer hover:bg-gray-50 ${
                            item.isPurchased ? 'bg-gray-50' : ''
                          }`}
                        >
                          <div className="flex items-center gap-3 flex-1">
                            <input
                              type="checkbox"
                              checked={item.isPurchased}
                              onChange={() => togglePurchased(item.id)}
                              className="w-5 h-5 rounded border-gray-300 text-green-600 focus:ring-green-500"
                            />
                            <div>
                              <div
                                className={`font-medium ${
                                  item.isPurchased
                                    ? 'text-gray-400 line-through'
                                    : 'text-gray-800'
                                }`}
                              >
                                {item.ingredient.name}
                              </div>
                              {item.aisle && (
                                <div className="text-xs text-gray-500">
                                  📍 {item.aisle}
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-semibold text-gray-800">
                              {item.quantityToBuy}
                              {item.unit}
                            </div>
                            {item.quantityHave > 0 && (
                              <div className="text-xs text-gray-500">
                                已有：{item.quantityHave}
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
          <div className="text-center py-12 text-gray-600">
            {filter === 'pending'
              ? '🎉 所有物品已采购完成！'
              : '还没有已采购的物品'}
          </div>
        )}
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
          <a href="/shopping" className="flex flex-col items-center py-3 text-primary-600">
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
