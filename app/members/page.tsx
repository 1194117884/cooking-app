"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api-client";
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
} from "lucide-react";

interface FamilyMember {
  id: string;
  name: string;
  role: "ADULT" | "CHILD" | "ELDER";
  avatarColor: string;
  dietaryGoal?: string;
  isActive: boolean;
}

const ROLES = [
  { value: "ADULT", label: "成人", Icon: User },
  { value: "CHILD", label: "儿童", Icon: Baby },
  { value: "ELDER", label: "老人", Icon: Crown },
];

const COLORS = [
  "#f97316",
  "#ef4444",
  "#10b981",
  "#3b82f6",
  "#8b5cf6",
  "#ec4899",
];

export default function MembersPage() {
  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingMember, setEditingMember] = useState<FamilyMember | null>(null);

  const [name, setName] = useState("");
  const [role, setRole] = useState<"ADULT" | "CHILD" | "ELDER">("ADULT");
  const [avatarColor, setAvatarColor] = useState("#f97316");
  const [dietaryGoal, setDietaryGoal] = useState("");

  useEffect(() => {
    fetchMembers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchMembers = async () => {
    try {
      const data = (await api.get("/api/members")) as {
        members: FamilyMember[];
      };
      setMembers(data.members || []);
      setLoading(false);
    } catch (error) {
      console.error("Failed to fetch members:", error);
      setLoading(false);
    }
  };

  const handleAddMember = async () => {
    try {
      await api.post("/api/members", {
        name,
        role,
        avatarColor,
        dietaryGoal,
      });

      await fetchMembers();
      setShowAddModal(false);
      resetForm();
    } catch (error: any) {
      console.error("Failed to add member:", error);
      alert(error.message || "添加失败");
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
      console.error("Failed to edit member:", error);
      alert(error.message || "更新失败");
    }
  };

  const handleDeleteMember = async (id: string) => {
    if (!confirm("确定要删除该家庭成员吗？")) return;

    try {
      await api.delete(`/api/members/${id}`);
      await fetchMembers();
    } catch (error: any) {
      console.error("Failed to delete member:", error);
      alert(error.message || "删除失败");
    }
  };

  const resetForm = () => {
    setName("");
    setRole("ADULT");
    setAvatarColor("#f97316");
    setDietaryGoal("");
  };

  const openEditModal = (member: FamilyMember) => {
    setEditingMember(member);
    setName(member.name);
    setRole(member.role);
    setAvatarColor(member.avatarColor);
    setDietaryGoal(member.dietaryGoal || "");
    setShowAddModal(true);
  };

  const getRoleIcon = (roleValue: string) => {
    const role = ROLES.find((r) => r.value === roleValue);
    return role ? role.Icon : User;
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

  return (
    <main className="min-h-screen bg-pale-gray pb-24">
      <div className="max-w-4xl mx-auto px-5 py-8">
        <div className="flex items-center justify-end gap-4 mb-6">
          <button
            onClick={() => {
              resetForm();
              setEditingMember(null);
              setShowAddModal(true);
            }}
            className="btn-primary"
          >
            <Plus size={18} />
            添加成员
          </button>
        </div>

        {members.length === 0 ? (
          <div className="card p-12 text-center">
            <div className="w-20 h-20 rounded-full bg-accent-50 flex items-center justify-center mx-auto mb-5">
              <Users size={40} className="text-accent-500" />
            </div>
            <h3 className="font-display text-utility-heading text-ink mb-2">
              还没有家庭成员
            </h3>
            <p className="text-body-lg text-text-secondary mb-8 max-w-sm mx-auto">
              添加第一位家庭成员，开始定制专属菜谱
            </p>
            <button onClick={() => setShowAddModal(true)} className="btn-primary">
              添加第一位成员
            </button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {members.map((member, idx) => {
              const RoleIcon = getRoleIcon(member.role);
              return (
                <div
                  key={member.id}
                  className="card p-5 relative group animate-in"
                  style={{ animationDelay: `${idx * 0.08}s` }}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div
                        className="w-14 h-14 rounded-module flex items-center justify-center"
                        style={{
                          backgroundColor: member.avatarColor + "18",
                        }}
                      >
                        <RoleIcon
                          size={28}
                          style={{ color: member.avatarColor }}
                        />
                      </div>
                      <div>
                        <h3 className="font-display text-utility-heading text-ink">
                          {member.name}
                        </h3>
                        <p className="text-label text-text-secondary">
                          {ROLES.find((r) => r.value === member.role)?.label}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`text-xs px-2.5 py-1 rounded-pill font-medium ${
                        member.isActive
                          ? "bg-green-50 text-green-700"
                          : "bg-black/3 text-text-secondary"
                      }`}
                    >
                      {member.isActive ? "活跃" : "不活跃"}
                    </span>
                  </div>

                  {member.dietaryGoal && (
                    <div className="mb-5 p-4 bg-accent-50 rounded-field">
                      <p className="text-sm text-accent-700 flex items-center gap-2">
                        <Target size={15} />
                        {member.dietaryGoal}
                      </p>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <button
                      onClick={() => openEditModal(member)}
                      className="flex-1 py-2.5 bg-black/3 text-ink rounded-pill hover:bg-black/8 transition-colors text-sm font-medium flex items-center justify-center gap-1.5"
                    >
                      <Edit size={13} />
                      编辑
                    </button>
                    <button
                      onClick={() => handleDeleteMember(member.id)}
                      className="flex-1 py-2.5 bg-red-50 text-red-600 rounded-pill hover:bg-red-100 transition-colors text-sm font-medium flex items-center justify-center gap-1.5"
                    >
                      <Trash2 size={13} />
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
              <h3 className="font-display text-utility-heading text-ink">
                {editingMember ? "编辑成员" : "添加成员"}
              </h3>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setEditingMember(null);
                  resetForm();
                }}
                className="w-9 h-9 rounded-full bg-black/3 flex items-center justify-center text-text-secondary hover:bg-black/8 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="field-label">
                  姓名 <span className="text-accent-500">*</span>
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
                <label className="field-label">角色</label>
                <div className="grid grid-cols-3 gap-2">
                  {ROLES.map((r) => (
                    <button
                      key={r.value}
                      type="button"
                      onClick={() => setRole(r.value as any)}
                      className={`p-4 rounded-control border transition-all ${
                        role === r.value
                          ? "border-accent-400 bg-accent-50"
                          : "border-border-soft hover:border-border-mid"
                      }`}
                    >
                      <r.Icon
                        size={22}
                        className={`mx-auto mb-1 ${
                          role === r.value
                            ? "text-accent-500"
                            : "text-text-secondary"
                        }`}
                      />
                      <div className="text-xs font-medium text-ink">
                        {r.label}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="field-label">头像颜色</label>
                <div className="flex gap-3">
                  {COLORS.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setAvatarColor(color)}
                      className={`w-11 h-11 rounded-full border-2 transition-transform ${
                        avatarColor === color
                          ? "border-ink scale-110 shadow-subtle"
                          : "border-transparent hover:scale-105"
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              <div>
                <label className="field-label">饮食目标</label>
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
                  className="flex-1 btn-secondary"
                >
                  取消
                </button>
                <button
                  onClick={
                    editingMember ? handleEditMember : handleAddMember
                  }
                  className="flex-1 btn-primary"
                >
                  {editingMember ? "保存" : "添加"}
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
            { href: "/", Icon: ChefHat, label: "首页" },
            { href: "/recipes", Icon: BookOpen, label: "菜谱" },
            { href: "/planner", Icon: Calendar, label: "计划" },
            { href: "/shopping", Icon: ShoppingCart, label: "采购" },
            { href: "/settings", Icon: Settings, label: "设置", active: true },
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
