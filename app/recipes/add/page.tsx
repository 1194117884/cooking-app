'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { JSONContent } from '@tiptap/react';
import ImageUpload from '@/components/ImageUpload';
import RichTextEditor from '@/components/RichTextEditor';
import { createEmptyDoc } from '@/lib/tiptap-utils';
import { getAuthToken } from '@/lib/auth-client';
import {
  Plus,
  Loader2,
  ChefHat,
  BookOpen,
  Calendar,
  ShoppingCart,
  Settings,
} from 'lucide-react';

const DIFFICULTIES = [
  { value: 'EASY', label: '简单' },
  { value: 'MEDIUM', label: '中等' },
  { value: 'HARD', label: '困难' },
];

const CUISINE_TYPES = ['川菜', '粤菜', '湘菜', '鲁菜', '苏菜', '浙菜', '闽菜', '徽菜', '家常菜', '其他'];

async function createRecipe(recipeData: any) {
  const token = await getAuthToken();

  const res = await fetch('/api/recipes', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(recipeData),
  });

  if (res.status === 401) {
    window.location.href = '/auth/login';
    throw new Error('未授权访问');
  }

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || '创建失败');
  }
  return res.json();
}

export default function AddRecipePage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    name: '',
    cuisineType: '家常菜',
    difficulty: 'EASY',
    cookTimeMin: 30,
    servings: 4,
    caloriesPerServing: '',
    tags: '',
    coverImageUrl: '',
    steps: createEmptyDoc() as JSONContent,
  });

  const createMutation = useMutation({
    mutationFn: createRecipe,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recipes'] });
      router.push('/recipes');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate({
      ...formData,
      tags: formData.tags.split(',').map((t) => t.trim()).filter(Boolean),
      caloriesPerServing: formData.caloriesPerServing ? parseInt(formData.caloriesPerServing) : null,
    });
  };

  return (
    <main className="min-h-screen bg-cream-gradient pb-24">
      <div className="max-w-2xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
            <Plus className="text-amber-500" />
            添加菜谱
          </h1>
          <p className="text-gray-500">分享您的美味食谱</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="food-card p-6 space-y-6">
          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              封面图片
            </label>
            <ImageUpload
              value={formData.coverImageUrl}
              onChange={(url) => setFormData({ ...formData, coverImageUrl: url })}
            />
          </div>

          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              菜谱名称 *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="input-field"
              placeholder="例如：宫保鸡丁"
            />
          </div>

          {/* Cuisine Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              菜系
            </label>
            <select
              value={formData.cuisineType}
              onChange={(e) => setFormData({ ...formData, cuisineType: e.target.value })}
              className="input-field"
            >
              {CUISINE_TYPES.map((type) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          {/* Difficulty */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              难度
            </label>
            <div className="flex gap-4">
              {DIFFICULTIES.map((diff) => (
                <label
                  key={diff.value}
                  className={`flex-1 py-3 px-4 border rounded-xl text-center cursor-pointer transition-colors ${
                    formData.difficulty === diff.value
                      ? 'bg-amber-50 border-amber-500 text-amber-700'
                      : 'border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <input
                    type="radio"
                    value={diff.value}
                    checked={formData.difficulty === diff.value}
                    onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                    className="hidden"
                  />
                  {diff.label}
                </label>
              ))}
            </div>
          </div>

          {/* Time & Servings */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                烹饪时间（分钟）*
              </label>
              <input
                type="number"
                required
                min={1}
                value={formData.cookTimeMin}
                onChange={(e) => setFormData({ ...formData, cookTimeMin: parseInt(e.target.value) || 0 })}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                份量（人）*
              </label>
              <input
                type="number"
                required
                min={1}
                value={formData.servings}
                onChange={(e) => setFormData({ ...formData, servings: parseInt(e.target.value) || 0 })}
                className="input-field"
              />
            </div>
          </div>

          {/* Calories */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              热量（卡路里/份）
            </label>
            <input
              type="number"
              value={formData.caloriesPerServing}
              onChange={(e) => setFormData({ ...formData, caloriesPerServing: e.target.value })}
              className="input-field"
              placeholder="可选"
            />
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              标签（用逗号分隔）
            </label>
            <input
              type="text"
              value={formData.tags}
              onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
              className="input-field"
              placeholder="例如：快手菜, 家常菜, 下饭菜"
            />
          </div>

          {/* Steps */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              烹饪步骤 *
            </label>
            <RichTextEditor
              value={formData.steps}
              onChange={(content) => setFormData({ ...formData, steps: content })}
              placeholder="写下你的烹饪步骤，支持加粗、高亮、插入图片..."
            />
          </div>

          {/* Error */}
          {createMutation.error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-xl">
              {createMutation.error.message}
            </div>
          )}

          {/* Submit */}
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="flex-1 py-3 border border-gray-200 rounded-xl hover:bg-gray-50 font-medium"
            >
              取消
            </button>
            <button
              type="submit"
              disabled={createMutation.isPending}
              className="flex-1 btn-primary disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {createMutation.isPending ? (
                <>
                  <Loader2 className="animate-spin" size={18} />
                  保存中...
                </>
              ) : (
                '保存菜谱'
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 glass border-t border-gray-200 md:hidden safe-area-pb z-50">
        <div className="grid grid-cols-5 py-2">
          {[
            { href: '/', Icon: ChefHat, label: '首页' },
            { href: '/recipes', Icon: BookOpen, label: '菜谱', active: true },
            { href: '/planner', Icon: Calendar, label: '计划' },
            { href: '/shopping', Icon: ShoppingCart, label: '采购' },
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
