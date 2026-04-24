'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getAuthToken } from '@/lib/auth-client';
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
  Loader2,
  ChefHat as HomeIcon,
  BookOpen,
  Calendar,
  ShoppingCart,
  Settings,
} from 'lucide-react';

interface Preference {
  id: string;
  type: 'LIKE' | 'DISLIKE' | 'NEUTRAL';
  category: 'INGREDIENT' | 'CUISINE' | 'TASTE' | 'COOKING_METHOD';
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
  { value: 'INGREDIENT', label: '食材', Icon: Leaf },
  { value: 'CUISINE', label: '菜系', Icon: UtensilsCrossed },
  { value: 'TASTE', label: '口味', Icon: Smile },
  { value: 'COOKING_METHOD', label: '烹饪方式', Icon: ChefHat },
];

const TYPES = [
  { value: 'LIKE', label: '喜欢', color: 'green' },
  { value: 'DISLIKE', label: '忌口', color: 'red' },
  { value: 'NEUTRAL', label: '一般', color: 'gray' },
];

export default function PreferencesPage() {
  const router = useRouter();
  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMember, setSelectedMember] = useState<string>('');

  const [showAddModal, setShowAddModal] = useState(false);
  const [type, setType] = useState<'LIKE' | 'DISLIKE' | 'NEUTRAL'>('LIKE');
  const [category, setCategory] = useState<'INGREDIENT' | 'CUISINE' | 'TASTE' | 'COOKING_METHOD'>('INGREDIENT');
  const [value, setValue] = useState('');
  const [intensity, setIntensity] = useState(3);

  useEffect(() => {
    fetchPreferences();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchPreferences = async () => {
    try {
      const token = await getAuthToken();
      const res = await fetch('/api/preferences', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (res.status === 401) {
        router.push('/auth/login');
        return;
      }

      const data = await res.json();
      setMembers(data.members || []);
      if (data.members.length > 0 && !selectedMember) {
        setSelectedMember(data.members[0].id);
      }
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch preferences:', error);
      setLoading(false);
    }
  };

  const handleAddPreference = async () => {
    if (!value.trim()) {
      alert('请填写具体内容');
      return;
    }

    if (!selectedMember) {
      alert('请选择家庭成员');
      return;
    }

    try {
      const token = await getAuthToken();
      const res = await fetch('/api/preferences', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
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
        router.push('/auth/login');
        return;
      }

      if (!res.ok) {
        const data = await res.json();
        alert(data.error || '添加失败');
        return;
      }

      await fetchPreferences();
      setShowAddModal(false);
      setValue('');
      setIntensity(3);
    } catch (error) {
      console.error('Failed to add preference:', error);
      alert('添加失败');
    }
  };

  const handleDeletePreference = async (id: string) => {
    if (!confirm('确定要删除该偏好吗？')) return;

    try {
      const token = await getAuthToken();
      const res = await fetch(`/api/preferences/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (res.status === 401) {
        router.push('/auth/login');
        return;
      }

      if (!res.ok) {
        const data = await res.json();
        alert(data.error || '删除失败');
        return;
      }

      await fetchPreferences();
    } catch (error) {
      console.error('Failed to delete preference:', error);
      alert('删除失败');
    }
  };

  const getSelectedMember = () => {
    return members.find(m => m.id === selectedMember);
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'LIKE': return 'bg-green-100 text-green-700';
      case 'DISLIKE': return 'bg-red-100 text-red-700';
      case 'NEUTRAL': return 'bg-gray-100 text-gray-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getTypeLabel = (type: string) => {
    return TYPES.find(t => t.value === type)?.label || type;
  };

  const getCategoryIcon = (categoryValue: string) => {
    const cat = CATEGORIES.find(c => c.value === categoryValue);
    return cat ? cat.Icon : Leaf;
  };

  const getCategoryLabel = (categoryValue: string) => {
    return CATEGORIES.find(c => c.value === categoryValue)?.label || categoryValue;
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-cream-gradient flex items-center justify-center p-6">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-amber-200 border-t-amber-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500">加载中...</p>
        </div>
      </main>
    );
  }

  if (members.length === 0) {
    return (
      <main className="min-h-screen bg-cream-gradient p-6">
        <div className="max-w-2xl mx-auto text-center py-16">
          <div className="w-24 h-24 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Heart size={48} className="text-amber-500" />
          </div>
          <h2 className="font-display text-2xl font-bold text-gray-800 mb-2">暂无家庭成员</h2>
          <p className="text-gray-500 mb-8">请先添加家庭成员，再设置口味偏好</p>
          <button
            onClick={() => router.push('/members')}
            className="btn-primary"
          >
            添加家庭成员
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-cream-gradient pb-24">
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl font-bold text-gray-900 mb-2">口味偏好</h1>
            <p className="text-gray-500">管理家人的喜好和忌口</p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="btn-primary inline-flex items-center gap-2"
          >
            <Plus size={20} />
            添加偏好
          </button>
        </div>

        {/* Member Selector */}
        <div className="mb-6 flex gap-2 overflow-x-auto pb-2">
          {members.map((member) => (
            <button
              key={member.id}
              onClick={() => setSelectedMember(member.id)}
              className={`px-4 py-2 rounded-full whitespace-nowrap transition-colors font-medium ${
                selectedMember === member.id
                  ? 'bg-amber-500 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              {member.name}
              {member.preferences.length > 0 && (
                <span className="ml-2 text-xs opacity-80">
                  ({member.preferences.length})
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Preferences List */}
        {getSelectedMember()?.preferences.length === 0 ? (
          <div className="food-card p-12 text-center">
            <div className="w-24 h-24 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Heart size={48} className="text-amber-500" />
            </div>
            <h3 className="font-display text-xl font-bold text-gray-800 mb-2">还没有偏好设置</h3>
            <p className="text-gray-500 mb-8">
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
          <div className="space-y-4">
            {getSelectedMember()?.preferences.map((pref) => {
              const CategoryIcon = getCategoryIcon(pref.category);
              return (
                <div
                  key={pref.id}
                  className="food-card p-4 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3 flex-1">
                    <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center">
                      <CategoryIcon size={20} className="text-gray-500" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-gray-800">
                          {pref.value}
                        </span>
                        <span
                          className={`text-xs px-2 py-1 rounded-full ${getTypeColor(
                            pref.type
                          )}`}
                        >
                          {getTypeLabel(pref.type)}
                        </span>
                      </div>
                      <div className="text-sm text-gray-500 flex items-center gap-1">
                        {getCategoryLabel(pref.category)} · 强度：
                        <div className="flex items-center gap-0.5">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              size={12}
                              className={i < pref.intensity ? 'fill-amber-400 text-amber-400' : 'text-gray-200'}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeletePreference(pref.id)}
                    className="text-gray-400 hover:text-red-600 transition-colors p-2"
                  >
                    <Trash2 size={18} />
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
              <h3 className="font-display text-xl font-bold">添加偏好</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-5">
              {/* Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  类型
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {TYPES.map((t) => (
                    <button
                      key={t.value}
                      onClick={() => setType(t.value as any)}
                      className={`py-2 rounded-xl border-2 transition-colors font-medium ${
                        type === t.value
                          ? `border-${t.color}-500 bg-${t.color}-50 text-${t.color}-700`
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  分类
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {CATEGORIES.map((c) => (
                    <button
                      key={c.value}
                      onClick={() => setCategory(c.value as any)}
                      className={`p-3 rounded-xl border-2 transition-colors text-left flex items-center gap-2 ${
                        category === c.value
                          ? 'border-amber-500 bg-amber-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <c.Icon size={20} className={category === c.value ? 'text-amber-600' : 'text-gray-400'} />
                      <span className="font-medium">{c.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Value */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  具体内容 *
                </label>
                <input
                  type="text"
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  className="input-field"
                  placeholder={
                    category === 'INGREDIENT'
                      ? '例如：香菜、胡萝卜'
                      : category === 'CUISINE'
                      ? '例如：川菜、粤菜'
                      : category === 'TASTE'
                      ? '例如：辣、甜'
                      : '例如：炒、蒸'
                  }
                />
              </div>

              {/* Intensity */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  强度：{intensity}/5
                </label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((level) => (
                    <button
                      key={level}
                      onClick={() => setIntensity(level)}
                      className={`flex-1 py-2 rounded-xl transition-colors ${
                        intensity >= level
                          ? 'bg-amber-500 text-white'
                          : 'bg-gray-100 text-gray-400'
                      }`}
                    >
                      <Star size={16} className={`mx-auto ${intensity >= level ? 'fill-white' : ''}`} />
                    </button>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-medium"
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
      <nav className="fixed bottom-0 left-0 right-0 glass border-t border-gray-200 md:hidden safe-area-pb z-50">
        <div className="grid grid-cols-5 py-2">
          {[
            { href: '/', Icon: HomeIcon, label: '首页' },
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
