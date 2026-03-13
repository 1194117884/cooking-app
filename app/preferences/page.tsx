'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

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
  { value: 'INGREDIENT', label: '食材', icon: '🥬' },
  { value: 'CUISINE', label: '菜系', icon: '🍜' },
  { value: 'TASTE', label: '口味', icon: '👅' },
  { value: 'COOKING_METHOD', label: '烹饪方式', icon: '🍳' },
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
  
  // 添加偏好表单
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
      const token = localStorage.getItem('token');
      const res = await fetch('/api/preferences', {
        headers: {
          'Authorization': `Bearer ${token || ''}`,
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
      const token = localStorage.getItem('token');
      const res = await fetch('/api/preferences', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token || ''}`,
        },
        body: JSON.stringify({
          memberId: selectedMember,
          type,
          category,
          value,
          intensity,
        }),
      });

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
      const token = localStorage.getItem('token');
      await fetch(`/api/preferences/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token || ''}`,
        },
      });

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

  const getCategoryIcon = (category: string) => {
    return CATEGORIES.find(c => c.value === category)?.icon || '📌';
  };

  const getCategoryLabel = (category: string) => {
    return CATEGORIES.find(c => c.value === category)?.label || category;
  };

  if (loading) {
    return (
      <main className="min-h-screen p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">❤️</div>
          <p className="text-gray-600">加载中...</p>
        </div>
      </main>
    );
  }

  if (members.length === 0) {
    return (
      <main className="min-h-screen p-6">
        <div className="max-w-2xl mx-auto text-center py-12">
          <div className="text-6xl mb-4">❤️</div>
          <h2 className="text-xl font-bold mb-2">暂无家庭成员</h2>
          <p className="text-gray-600 mb-6">请先添加家庭成员，再设置口味偏好</p>
          <button
            onClick={() => router.push('/members')}
            className="bg-primary-600 text-white px-6 py-3 rounded-xl hover:bg-primary-700 transition-colors font-semibold"
          >
            添加家庭成员
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen p-6 pb-24">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">❤️ 口味偏好</h1>
            <p className="text-gray-600">管理家人的喜好和忌口</p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-primary-600 text-white px-6 py-3 rounded-xl hover:bg-primary-700 transition-colors font-semibold"
          >
            ➕ 添加偏好
          </button>
        </div>

        {/* Member Selector */}
        <div className="mb-6 flex gap-2 overflow-x-auto pb-2">
          {members.map((member) => (
            <button
              key={member.id}
              onClick={() => setSelectedMember(member.id)}
              className={`px-4 py-2 rounded-full whitespace-nowrap transition-colors ${
                selectedMember === member.id
                  ? 'bg-primary-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
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
          <div className="bg-white rounded-2xl shadow p-12 text-center">
            <div className="text-6xl mb-4">❤️</div>
            <h3 className="text-xl font-semibold mb-2">还没有偏好设置</h3>
            <p className="text-gray-600 mb-6">
              为 {getSelectedMember()?.name} 添加喜欢或忌口的食物
            </p>
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-primary-600 text-white px-6 py-3 rounded-xl hover:bg-primary-700 transition-colors font-semibold"
            >
              添加第一个偏好
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {getSelectedMember()?.preferences.map((pref) => (
              <div
                key={pref.id}
                className="bg-white rounded-xl shadow p-4 flex items-center justify-between"
              >
                <div className="flex items-center gap-3 flex-1">
                  <div className="text-2xl">
                    {getCategoryIcon(pref.category)}
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
                    <div className="text-sm text-gray-500">
                      {getCategoryLabel(pref.category)} · 强度：
                      {'❤️'.repeat(pref.intensity)}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => handleDeletePreference(pref.id)}
                  className="text-gray-400 hover:text-red-600 transition-colors p-2"
                >
                  🗑️
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold">添加偏好</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>

            <div className="space-y-4">
              {/* Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  类型
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {TYPES.map((t) => (
                    <button
                      key={t.value}
                      onClick={() => setType(t.value as any)}
                      className={`py-2 rounded-xl border-2 transition-colors ${
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
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  分类
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {CATEGORIES.map((c) => (
                    <button
                      key={c.value}
                      onClick={() => setCategory(c.value as any)}
                      className={`p-3 rounded-xl border-2 transition-colors text-left ${
                        category === c.value
                          ? 'border-primary-500 bg-primary-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <span className="text-xl mr-2">{c.icon}</span>
                      <span>{c.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Value */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  具体内容 *
                </label>
                <input
                  type="text"
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
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
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  强度：{intensity}/5
                </label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((level) => (
                    <button
                      key={level}
                      onClick={() => setIntensity(level)}
                      className={`flex-1 py-2 rounded-xl transition-colors ${
                        intensity >= level
                          ? 'bg-primary-600 text-white'
                          : 'bg-gray-100 text-gray-400'
                      }`}
                    >
                      ❤️
                    </button>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-xl hover:bg-gray-200 transition-colors font-semibold"
                >
                  取消
                </button>
                <button
                  onClick={handleAddPreference}
                  className="flex-1 bg-primary-600 text-white py-3 rounded-xl hover:bg-primary-700 transition-colors font-semibold"
                >
                  添加
                </button>
              </div>
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
          <a href="/planner" className="flex flex-col items-center py-3 text-gray-600">
            <span className="text-xl">📅</span>
            <span className="text-xs mt-1">计划</span>
          </a>
          <a href="/shopping" className="flex flex-col items-center py-3 text-gray-600">
            <span className="text-xl">🛒</span>
            <span className="text-xs mt-1">采购</span>
          </a>
          <a href="/preferences" className="flex flex-col items-center py-3 text-primary-600">
            <span className="text-xl">❤️</span>
            <span className="text-xs mt-1">偏好</span>
          </a>
        </div>
      </nav>
    </main>
  );
}
