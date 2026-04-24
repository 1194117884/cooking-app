'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api-client';
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
  Search,
  AlertCircle,
  X,
} from 'lucide-react';

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

const CategoryIcons: Record<string, React.ComponentType<{ className?: string; size?: number | string }>> = {
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
  { value: 'VEGETABLE', label: '蔬菜' },
  { value: 'MEAT', label: '肉类' },
  { value: 'SEAFOOD', label: '海鲜' },
  { value: 'GRAIN', label: '主食' },
  { value: 'SEASONING', label: '调料' },
  { value: 'FRUIT', label: '水果' },
  { value: 'DAIRY', label: '乳制品' },
  { value: 'OTHER', label: '其他' },
];

export default function ShoppingPage() {
  const [items, setItems] = useState<ShoppingListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'purchased'>('all');

  // 手动添加 modal 状态
  const [showAddModal, setShowAddModal] = useState(false);
  const [newItemName, setNewItemName] = useState('');
  const [newItemCategory, setNewItemCategory] = useState('VEGETABLE');
  const [newItemQuantity, setNewItemQuantity] = useState('1');
  const [newItemUnit, setNewItemUnit] = useState('个');
  const [addingItem, setAddingItem] = useState(false);

  useEffect(() => {
    fetchShoppingList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchShoppingList = async () => {
    try {
      const data = await api.get('/api/shopping-list') as { items: ShoppingListItem[] };
      setItems(data.items || []);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch shopping list:', error);
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
        console.error('Failed to update item:', error);
      }
    }
  };

  const generateFromMealPlan = async () => {
    try {
      const data = await api.post('/api/shopping-list/generate') as { items: ShoppingListItem[] };
      setItems(data.items || []);
    } catch (error) {
      console.error('Failed to generate shopping list:', error);
    }
  };

  const handleAddItem = async () => {
    if (!newItemName.trim()) {
      alert('请输入食材名称');
      return;
    }

    setAddingItem(true);
    try {
      const response = await api.post('/api/shopping-list/items', {
        name: newItemName.trim(),
        category: newItemCategory,
        quantity: parseFloat(newItemQuantity) || 1,
        unit: newItemUnit.trim() || '个',
      }) as { item: ShoppingListItem };

      // 添加新 item 到列表
      setItems((prev) => [...prev, response.item]);

      // 重置表单并关闭 modal
      setNewItemName('');
      setNewItemCategory('VEGETABLE');
      setNewItemQuantity('1');
      setNewItemUnit('个');
      setShowAddModal(false);
    } catch (error) {
      console.error('Failed to add item:', error);
      alert('添加失败，请重试');
    } finally {
      setAddingItem(false);
    }
  };

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

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      VEGETABLE: 'bg-green-100 text-green-700',
      MEAT: 'bg-red-100 text-red-700',
      SEAFOOD: 'bg-blue-100 text-blue-700',
      GRAIN: 'bg-amber-100 text-amber-700',
      SEASONING: 'bg-gray-100 text-gray-700',
      FRUIT: 'bg-orange-100 text-orange-700',
      DAIRY: 'bg-sky-100 text-sky-700',
      OTHER: 'bg-purple-100 text-purple-700',
    };
    return colors[category] || 'bg-gray-100 text-gray-700';
  };

  const pendingCount = items.filter((i) => !i.isPurchased).length;
  const purchasedCount = items.filter((i) => i.isPurchased).length;
  const progress = items.length > 0 ? Math.round((purchasedCount / items.length) * 100) : 0;

  if (loading) {
    return (
      <main className="min-h-screen bg-cream-gradient pb-24">
        <div className="max-w-4xl mx-auto px-6 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-amber-200 border-t-amber-500 rounded-full animate-spin mx-auto mb-4" />
              <p className="text-gray-500">加载中...</p>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-cream-gradient pb-24">
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="font-display text-3xl md:text-4xl font-bold text-gray-900 mb-2">
              采购清单
            </h1>
            <p className="text-gray-500">
              待采购 <span className="text-amber-600 font-semibold">{pendingCount}</span> 项 ·
              已完成 <span className="text-sage-600 font-semibold">{purchasedCount}</span> 项
            </p>
          </div>
        </div>

        {/* Progress Card */}
        {items.length > 0 && (
          <div className="food-card p-6 mb-8">
            <div className="flex items-center justify-between mb-4">
              <span className="font-medium text-gray-700">完成进度</span>
              <span className="font-display text-2xl font-bold text-amber-600">{progress}%</span>
            </div>
            <div className="h-4 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-amber-400 to-amber-500 rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="flex justify-between mt-3 text-sm text-gray-500">
              <span>开始采购</span>
              <span>全部完成</span>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <button
            onClick={generateFromMealPlan}
            className="btn-primary flex items-center justify-center gap-2"
          >
            <Loader2 size={20} className="animate-spin hidden" />
            从周计划生成
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="btn-secondary flex items-center justify-center gap-2"
          >
            <Plus size={20} />
            手动添加
          </button>
        </div>

        {/* Filter */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {(['all', 'pending', 'purchased'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-5 py-2.5 rounded-full whitespace-nowrap font-medium transition-all ${
                filter === f
                  ? 'bg-amber-500 text-white shadow-glow'
                  : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
              }`}
            >
              {f === 'all' ? '全部' : f === 'pending' ? '待采购' : '已完成'}
            </button>
          ))}
        </div>

        {/* Shopping List */}
        {items.length === 0 ? (
          <div className="food-card p-12 text-center">
            <div className="w-24 h-24 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <ShoppingCart size={48} className="text-amber-500" />
            </div>
            <h3 className="font-display text-xl font-bold text-gray-800 mb-2">
              采购清单是空的
            </h3>
            <p className="text-gray-500 mb-8 max-w-sm mx-auto">
              从周计划自动生成，或手动添加需要的食材
            </p>
            <button
              onClick={generateFromMealPlan}
              className="btn-primary"
            >
              从周计划生成
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredCategories.map(([category, categoryItems]) => {
              const pendingInCategory = categoryItems.filter((i) => !i.isPurchased);
              if (pendingInCategory.length === 0 && filter !== 'purchased') return null;

              const CategoryIcon = CategoryIcons[category] || Package;

              return (
                <div key={category} className="food-card overflow-hidden">
                  <div className={`px-5 py-4 border-b border-gray-100 flex items-center justify-between ${getCategoryColor(category)} bg-opacity-30`}>
                    <h3 className="font-semibold flex items-center gap-2 text-lg">
                      <CategoryIcon size={24} />
                      <span>{getCategoryName(category)}</span>
                    </h3>
                    <span className="text-sm font-medium opacity-70">
                      {pendingInCategory.length}/{categoryItems.length}
                    </span>
                  </div>
                  <div className="divide-y divide-gray-50">
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
                          className={`flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                            item.isPurchased ? 'bg-gray-50/50' : ''
                          }`}
                        >
                          <div className="flex items-center gap-4 flex-1">
                            <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${
                              item.isPurchased
                                ? 'bg-amber-500 border-amber-500'
                                : 'border-gray-300 hover:border-amber-400'
                            }`}>
                              {item.isPurchased && (
                                <Check size={14} className="text-white" />
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
                                className={`font-medium text-lg ${
                                  item.isPurchased
                                    ? 'text-gray-400 line-through'
                                    : 'text-gray-800'
                                }`}
                              >
                                {item.ingredient.name}
                              </div>
                              {item.aisle && (
                                <div className="text-sm text-gray-400 flex items-center gap-1">
                                  <AlertCircle size={12} /> {item.aisle}
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className={`font-semibold text-lg ${
                              item.isPurchased ? 'text-gray-400' : 'text-gray-800'
                            }`}>
                              {item.quantityToBuy}
                              <span className="text-sm ml-0.5">{item.unit}</span>
                            </div>
                            {item.quantityHave > 0 && (
                              <div className="text-xs text-gray-400">
                                已有 {item.quantityHave}{item.unit}
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
            <div className="w-20 h-20 bg-sage-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Check size={32} className="text-sage-600" />
            </div>
            <h3 className="font-display text-xl font-bold text-gray-800 mb-2">
              {filter === 'pending' ? '太棒了！所有物品已采购完成' : '还没有已采购的物品'}
            </h3>
            <p className="text-gray-500">
              {filter === 'pending' ? '继续保持，享受烹饪的乐趣' : '开始采购，完成后会显示在这里'}
            </p>
          </div>
        )}
      </div>

      {/* Add Item Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-display text-xl font-bold text-gray-900">手动添加食材</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              {/* 食材名称 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  食材名称 *
                </label>
                <input
                  type="text"
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  placeholder="例如：西红柿"
                  className="input-field"
                />
              </div>

              {/* 分类 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  分类 *
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

              {/* 数量和单位 */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    数量
                  </label>
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    单位
                  </label>
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

            {/* Actions */}
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 py-3 border border-gray-200 rounded-xl hover:bg-gray-50 font-medium transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleAddItem}
                disabled={addingItem || !newItemName.trim()}
                className="flex-1 btn-primary disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {addingItem ? (
                  <>
                    <Loader2 className="animate-spin" size={18} />
                    添加中...
                  </>
                ) : (
                  '添加'
                )}
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
            { href: '/planner', Icon: Calendar, label: '计划' },
            { href: '/shopping', Icon: ShoppingCart, label: '采购', active: true },
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
