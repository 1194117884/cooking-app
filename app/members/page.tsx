'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api-client';
import {
  Users,
  Plus,
  X,
  User,
  Baby,
  Crown,
  Loader2,
  ChefHat,
  BookOpen,
  Calendar,
  ShoppingCart,
  Settings,
  Edit,
  Trash2,
  Target,
} from 'lucide-react';

interface FamilyMember {
  id: string;
  name: string;
  role: 'ADULT' | 'CHILD' | 'ELDER';
  avatarColor: string;
  dietaryGoal?: string;
  isActive: boolean;
}

const ROLES = [
  { value: 'ADULT', label: '成人', Icon: User },
  { value: 'CHILD', label: '儿童', Icon: Baby },
  { value: 'ELDER', label: '老人', Icon: Crown },
];

const COLORS = [
  '#f59e0b', '#ef4444', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899',
];

export default function MembersPage() {
  const router = useRouter();
  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingMember, setEditingMember] = useState<FamilyMember | null>(null);

  const [name, setName] = useState('');
  const [role, setRole] = useState<'ADULT' | 'CHILD' | 'ELDER'>('ADULT');
  const [avatarColor, setAvatarColor] = useState('#f59e0b');
  const [dietaryGoal, setDietaryGoal] = useState('');

  useEffect(() => {
    fetchMembers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchMembers = async () => {
    try {
      const data = await api.get('/api/members') as { members: FamilyMember[] };
      setMembers(data.members || []);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch members:', error);
      setLoading(false);
    }
  };

  const handleAddMember = async () => {
    try {
      await api.post('/api/members', {
        name,
        role,
        avatarColor,
        dietaryGoal,
      });

      await fetchMembers();
      setShowAddModal(false);
      resetForm();
    } catch (error: any) {
      console.error('Failed to add member:', error);
      alert(error.message || '添加失败');
    }
  };

  const handleEditMember = async () => {
    if (!editingMember) return;

    try {
      await api.patch(`/api/members/${editingMember.id}`, {
        name,
        role,
        avatarColor,
        dietaryGoal,
      });

      await fetchMembers();
      setEditingMember(null);
      resetForm();
    } catch (error: any) {
      console.error('Failed to edit member:', error);
      alert(error.message || '更新失败');
    }
  };

  const handleDeleteMember = async (id: string) => {
    if (!confirm('确定要删除该家庭成员吗？')) return;

    try {
      await api.delete(`/api/members/${id}`);
      await fetchMembers();
    } catch (error: any) {
      console.error('Failed to delete member:', error);
      alert(error.message || '删除失败');
    }
  };

  const resetForm = () => {
    setName('');
    setRole('ADULT');
    setAvatarColor('#f59e0b');
    setDietaryGoal('');
  };

  const openEditModal = (member: FamilyMember) => {
    setEditingMember(member);
    setName(member.name);
    setRole(member.role);
    setAvatarColor(member.avatarColor);
    setDietaryGoal(member.dietaryGoal || '');
    setShowAddModal(true);
  };

  const getRoleIcon = (roleValue: string) => {
    const role = ROLES.find((r) => r.value === roleValue);
    return role ? role.Icon : User;
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

  return (
    <main className="min-h-screen bg-cream-gradient pb-24">
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="font-display text-3xl md:text-4xl font-bold text-gray-900 mb-2">
              家庭成员
            </h1>
            <p className="text-gray-500">
              共 <span className="text-amber-600 font-semibold">{members.length}</span> 位成员
            </p>
          </div>
          <button
            onClick={() => {
              resetForm();
              setEditingMember(null);
              setShowAddModal(true);
            }}
            className="btn-primary inline-flex items-center gap-2"
          >
            <Plus size={20} />
            添加成员
          </button>
        </div>

        {/* Members Grid */}
        {members.length === 0 ? (
          <div className="food-card p-12 text-center">
            <div className="w-24 h-24 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Users size={48} className="text-amber-500" />
            </div>
            <h3 className="font-display text-xl font-bold text-gray-800 mb-2">
              还没有家庭成员
            </h3>
            <p className="text-gray-500 mb-8 max-w-sm mx-auto">
              添加第一位家庭成员，开始定制专属菜谱
            </p>
            <button
              onClick={() => setShowAddModal(true)}
              className="btn-primary"
            >
              添加第一位成员
            </button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {members.map((member, idx) => {
              const RoleIcon = getRoleIcon(member.role);
              return (
                <div
                  key={member.id}
                  className="food-card p-6 relative group"
                  style={{ animationDelay: `${idx * 0.1}s` }}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div
                        className="w-16 h-16 rounded-2xl flex items-center justify-center"
                        style={{ backgroundColor: member.avatarColor + '20' }}
                      >
                        <RoleIcon size={32} style={{ color: member.avatarColor }} />
                      </div>
                      <div>
                        <h3 className="font-display text-lg font-bold text-gray-800">{member.name}</h3>
                        <p className="text-sm text-gray-500">
                          {ROLES.find((r) => r.value === member.role)?.label}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`text-xs px-3 py-1 rounded-full font-medium ${
                        member.isActive
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-500'
                      }`}
                    >
                      {member.isActive ? '活跃' : '不活跃'}
                    </span>
                  </div>

                  {member.dietaryGoal && (
                    <div className="mb-5 p-4 bg-amber-50 rounded-xl">
                      <p className="text-sm text-amber-800 flex items-center gap-2">
                        <Target size={16} />
                        {member.dietaryGoal}
                      </p>
                    </div>
                  )}

                  <div className="flex gap-3">
                    <button
                      onClick={() => openEditModal(member)}
                      className="flex-1 py-2.5 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors text-sm font-medium flex items-center justify-center gap-2"
                    >
                      <Edit size={14} />
                      编辑
                    </button>
                    <button
                      onClick={() => handleDeleteMember(member.id)}
                      className="flex-1 py-2.5 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-colors text-sm font-medium flex items-center justify-center gap-2"
                    >
                      <Trash2 size={14} />
                      删除
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal-content p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-display text-xl font-bold">
                {editingMember ? '编辑成员' : '添加成员'}
              </h3>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setEditingMember(null);
                  resetForm();
                }}
                className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  姓名 *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="input-field"
                  placeholder="例如：爸爸"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  角色
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {ROLES.map((r) => (
                    <button
                      key={r.value}
                      onClick={() => setRole(r.value as any)}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        role === r.value
                          ? 'border-amber-500 bg-amber-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <r.Icon size={24} className={`mx-auto mb-1 ${role === r.value ? 'text-amber-600' : 'text-gray-400'}`} />
                      <div className="text-sm font-medium">{r.label}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  头像颜色
                </label>
                <div className="flex gap-3">
                  {COLORS.map((color) => (
                    <button
                      key={color}
                      onClick={() => setAvatarColor(color)}
                      className={`w-12 h-12 rounded-full border-2 transition-transform ${
                        avatarColor === color
                          ? 'border-gray-800 scale-110 shadow-md'
                          : 'border-transparent hover:scale-105'
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  饮食目标
                </label>
                <input
                  type="text"
                  value={dietaryGoal}
                  onChange={(e) => setDietaryGoal(e.target.value)}
                  className="input-field"
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
                  className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-medium"
                >
                  取消
                </button>
                <button
                  onClick={editingMember ? handleEditMember : handleAddMember}
                  className="flex-1 btn-primary"
                >
                  {editingMember ? '保存' : '添加'}
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
            { href: '/', Icon: ChefHat, label: '首页' },
            { href: '/recipes', Icon: BookOpen, label: '菜谱' },
            { href: '/planner', Icon: Calendar, label: '计划' },
            { href: '/shopping', Icon: ShoppingCart, label: '采购' },
            { href: '/settings', Icon: Settings, label: '设置', active: true },
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
