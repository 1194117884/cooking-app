'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getAuthToken } from '@/lib/auth-client';

interface FamilyMember {
  id: string;
  name: string;
  role: 'ADULT' | 'CHILD' | 'ELDER';
  avatarColor: string;
  dietaryGoal?: string;
  isActive: boolean;
}

const ROLES = [
  { value: 'ADULT', label: '成人', icon: '👨' },
  { value: 'CHILD', label: '儿童', icon: '👶' },
  { value: 'ELDER', label: '老人', icon: '👴' },
];

const COLORS = [
  '#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899',
];

export default function MembersPage() {
  const router = useRouter();
  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingMember, setEditingMember] = useState<FamilyMember | null>(null);

  // 表单状态
  const [name, setName] = useState('');
  const [role, setRole] = useState<'ADULT' | 'CHILD' | 'ELDER'>('ADULT');
  const [avatarColor, setAvatarColor] = useState('#3b82f6');
  const [dietaryGoal, setDietaryGoal] = useState('');

  useEffect(() => {
    fetchMembers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchMembers = async () => {
    try {
      const token = await getAuthToken();
      const res = await fetch('/api/members', {
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
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch members:', error);
      setLoading(false);
    }
  };

  const handleAddMember = async () => {
    try {
      const token = await getAuthToken();
      const res = await fetch('/api/members', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ name, role, avatarColor, dietaryGoal }),
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

      await fetchMembers();
      setShowAddModal(false);
      resetForm();
    } catch (error) {
      console.error('Failed to add member:', error);
      alert('添加失败');
    }
  };

  const handleEditMember = async () => {
    if (!editingMember) return;

    try {
      const token = await getAuthToken();
      const res = await fetch(`/api/members/${editingMember.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ name, role, avatarColor, dietaryGoal }),
      });

      if (res.status === 401) {
        router.push('/auth/login');
        return;
      }

      if (!res.ok) {
        const data = await res.json();
        alert(data.error || '更新失败');
        return;
      }

      await fetchMembers();
      setEditingMember(null);
      resetForm();
    } catch (error) {
      console.error('Failed to edit member:', error);
      alert('更新失败');
    }
  };

  const handleDeleteMember = async (id: string) => {
    if (!confirm('确定要删除该家庭成员吗？')) return;

    try {
      const token = await getAuthToken();
      const res = await fetch(`/api/members/${id}`, {
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

      await fetchMembers();
    } catch (error) {
      console.error('Failed to delete member:', error);
      alert('删除失败');
    }
  };

  const resetForm = () => {
    setName('');
    setRole('ADULT');
    setAvatarColor('#3b82f6');
    setDietaryGoal('');
  };

  const openEditModal = (member: FamilyMember) => {
    setEditingMember(member);
    setName(member.name);
    setRole(member.role);
    setAvatarColor(member.avatarColor);
    setDietaryGoal(member.dietaryGoal || '');
    setShowAddModal(false);
  };

  if (loading) {
    return (
      <main className="min-h-screen p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">👨‍👩‍👧</div>
          <p className="text-gray-600">加载中...</p>
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
            <h1 className="text-3xl font-bold mb-2">👨‍👩‍👧 家庭成员</h1>
            <p className="text-gray-600">共 {members.length} 位成员</p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-primary-600 text-white px-6 py-3 rounded-xl hover:bg-primary-700 transition-colors font-semibold"
          >
            ➕ 添加成员
          </button>
        </div>

        {/* Members Grid */}
        {members.length === 0 ? (
          <div className="bg-white rounded-2xl shadow p-12 text-center">
            <div className="text-6xl mb-4">👨‍👩‍👧</div>
            <h3 className="text-xl font-semibold mb-2">还没有家庭成员</h3>
            <p className="text-gray-600 mb-6">
              添加第一位家庭成员，开始定制专属菜谱
            </p>
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-primary-600 text-white px-6 py-3 rounded-xl hover:bg-primary-700 transition-colors font-semibold"
            >
              添加第一位成员
            </button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {members.map((member) => (
              <div
                key={member.id}
                className="bg-white rounded-2xl shadow p-6 relative"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-16 h-16 rounded-full flex items-center justify-center text-3xl"
                      style={{ backgroundColor: member.avatarColor + '20' }}
                    >
                      {ROLES.find((r) => r.value === member.role)?.icon || '👤'}
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">{member.name}</h3>
                      <p className="text-sm text-gray-500">
                        {ROLES.find((r) => r.value === member.role)?.label}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${
                      member.isActive
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-500'
                    }`}
                  >
                    {member.isActive ? '活跃' : '不活跃'}
                  </span>
                </div>

                {member.dietaryGoal && (
                  <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600">
                      🎯 饮食目标：{member.dietaryGoal}
                    </p>
                  </div>
                )}

                <div className="flex gap-2">
                  <button
                    onClick={() => openEditModal(member)}
                    className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-lg hover:bg-gray-200 transition-colors text-sm"
                  >
                    编辑
                  </button>
                  <button
                    onClick={() => handleDeleteMember(member.id)}
                    className="flex-1 bg-red-50 text-red-600 py-2 rounded-lg hover:bg-red-100 transition-colors text-sm"
                  >
                    删除
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {(showAddModal || editingMember) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold">
                {editingMember ? '编辑成员' : '添加成员'}
              </h3>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setEditingMember(null);
                  resetForm();
                }}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  姓名 *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="例如：爸爸"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  角色
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {ROLES.map((r) => (
                    <button
                      key={r.value}
                      onClick={() => setRole(r.value as any)}
                      className={`p-3 rounded-xl border-2 transition-colors ${
                        role === r.value
                          ? 'border-primary-500 bg-primary-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="text-2xl mb-1">{r.icon}</div>
                      <div className="text-sm">{r.label}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  头像颜色
                </label>
                <div className="flex gap-2">
                  {COLORS.map((color) => (
                    <button
                      key={color}
                      onClick={() => setAvatarColor(color)}
                      className={`w-10 h-10 rounded-full border-2 transition-transform ${
                        avatarColor === color
                          ? 'border-gray-800 scale-110'
                          : 'border-transparent hover:scale-105'
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  饮食目标
                </label>
                <input
                  type="text"
                  value={dietaryGoal}
                  onChange={(e) => setDietaryGoal(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="例如：减肥、增肌、保持健康"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    setEditingMember(null);
                    resetForm();
                  }}
                  className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-xl hover:bg-gray-200 transition-colors font-semibold"
                >
                  取消
                </button>
                <button
                  onClick={editingMember ? handleEditMember : handleAddMember}
                  className="flex-1 bg-primary-600 text-white py-3 rounded-xl hover:bg-primary-700 transition-colors font-semibold"
                >
                  {editingMember ? '保存' : '添加'}
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
          <a href="/members" className="flex flex-col items-center py-3 text-primary-600">
            <span className="text-xl">👨‍👩‍👧</span>
            <span className="text-xs mt-1">成员</span>
          </a>
        </div>
      </nav>
    </main>
  );
}