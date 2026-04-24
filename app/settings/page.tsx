'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api-client';
import {
  User,
  Lock,
  TrendingUp,
  LogOut,
  Loader2,
  Check,
  AlertCircle,
  ChefHat,
  BookOpen,
  Calendar,
  ShoppingCart,
  Settings as SettingsIcon,
} from 'lucide-react';

interface UserData {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

export default function SettingsPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileMessage, setProfileMessage] = useState('');

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState('');

  useEffect(() => {
    fetchUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchUser = async () => {
    try {
      const data = await api.get('/api/auth/me') as { user: UserData };
      setUser(data.user);
      setName(data.user.name);
      setEmail(data.user.email);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch user:', error);
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSaving(true);
    setProfileMessage('');

    try {
      const data = await api.patch('/api/settings/profile', { name, email }) as { user: UserData };
      setProfileMessage('个人资料已更新');
      setUser(data.user);
    } catch (error: any) {
      console.error('Failed to update profile:', error);
      setProfileMessage(error.message || '更新失败');
    } finally {
      setProfileSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordSaving(true);
    setPasswordMessage('');

    if (newPassword !== confirmPassword) {
      setPasswordMessage('两次输入的新密码不一致');
      setPasswordSaving(false);
      return;
    }

    if (newPassword.length < 6) {
      setPasswordMessage('新密码至少 6 位');
      setPasswordSaving(false);
      return;
    }

    try {
      await api.post('/api/settings/password', {
        currentPassword,
        newPassword,
      });

      setPasswordMessage('密码修改成功');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      console.error('Failed to change password:', error);
      setPasswordMessage(error.message || '修改失败');
    } finally {
      setPasswordSaving(false);
    }
  };

  const handleLogout = () => {
    if (confirm('确定要退出登录吗？')) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      router.push('/auth/login');
    }
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
      <div className="max-w-2xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-display text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            设置
          </h1>
          <p className="text-gray-500">管理个人账户信息和偏好</p>
        </div>

        {/* Profile Section */}
        <div className="food-card p-6 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center">
              <User size={24} className="text-amber-600" />
            </div>
            <div>
              <h2 className="font-display text-xl font-bold text-gray-900">个人资料</h2>
              <p className="text-gray-500 text-sm">更新您的基本信息</p>
            </div>
          </div>

          {profileMessage && (
            <div className={`mb-6 p-4 rounded-xl text-sm flex items-center gap-2 ${
              profileMessage.includes('成功') || profileMessage.includes('更新')
                ? 'bg-green-50 text-green-700 border border-green-100'
                : 'bg-red-50 text-red-700 border border-red-100'
            }`}>
              {profileMessage.includes('成功') ? <Check size={20} /> : <AlertCircle size={20} />}
              {profileMessage}
            </div>
          )}

          <form onSubmit={handleUpdateProfile} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                姓名
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="input-field"
                placeholder="您的姓名"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                邮箱
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field"
                placeholder="your@email.com"
              />
            </div>

            <button
              type="submit"
              disabled={profileSaving}
              className="btn-primary disabled:opacity-50"
            >
              {profileSaving ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="animate-spin" size={16} />
                  保存中...
                </span>
              ) : (
                '保存修改'
              )}
            </button>
          </form>
        </div>

        {/* Change Password Section */}
        <div className="food-card p-6 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-terracotta-100 flex items-center justify-center">
              <Lock size={24} className="text-terracotta-600" />
            </div>
            <div>
              <h2 className="font-display text-xl font-bold text-gray-900">修改密码</h2>
              <p className="text-gray-500 text-sm">保护您的账户安全</p>
            </div>
          </div>

          {passwordMessage && (
            <div className={`mb-6 p-4 rounded-xl text-sm flex items-center gap-2 ${
              passwordMessage.includes('成功')
                ? 'bg-green-50 text-green-700 border border-green-100'
                : 'bg-red-50 text-red-700 border border-red-100'
            }`}>
              {passwordMessage.includes('成功') ? <Check size={20} /> : <AlertCircle size={20} />}
              {passwordMessage}
            </div>
          )}

          <form onSubmit={handleChangePassword} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                当前密码
              </label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="input-field"
                placeholder="输入当前密码"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                新密码
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="input-field"
                placeholder="至少 6 位"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                确认新密码
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="input-field"
                placeholder="再次输入新密码"
              />
            </div>

            <button
              type="submit"
              disabled={passwordSaving}
              className="btn-primary bg-gradient-to-r from-terracotta-500 to-terracotta-600 disabled:opacity-50"
            >
              {passwordSaving ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="animate-spin" size={16} />
                  修改中...
                </span>
              ) : (
                '修改密码'
              )}
            </button>
          </form>
        </div>

        {/* Account Info */}
        <div className="food-card p-6 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-sage-100 flex items-center justify-center">
              <TrendingUp size={24} className="text-sage-600" />
            </div>
            <div>
              <h2 className="font-display text-xl font-bold text-gray-900">账户信息</h2>
              <p className="text-gray-500 text-sm">查看账户详情</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center py-3 border-b border-gray-100">
              <span className="text-gray-500">用户 ID</span>
              <span className="text-gray-800 font-mono text-sm">{user?.id}</span>
            </div>
            <div className="flex justify-between items-center py-3 border-b border-gray-100">
              <span className="text-gray-500">注册时间</span>
              <span className="text-gray-800">
                {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('zh-CN', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                }) : '-'}
              </span>
            </div>
          </div>
        </div>

        {/* Logout */}
        <div className="food-card p-6">
          <button
            onClick={handleLogout}
            className="w-full py-4 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-colors font-semibold flex items-center justify-center gap-2"
          >
            <LogOut size={20} />
            退出登录
          </button>
        </div>
      </div>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 glass border-t border-gray-200 md:hidden safe-area-pb z-50">
        <div className="grid grid-cols-5 py-2">
          {[
            { href: '/', Icon: ChefHat, label: '首页' },
            { href: '/recipes', Icon: BookOpen, label: '菜谱' },
            { href: '/planner', Icon: Calendar, label: '计划' },
            { href: '/shopping', Icon: ShoppingCart, label: '采购' },
            { href: '/settings', Icon: SettingsIcon, label: '设置', active: true },
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
