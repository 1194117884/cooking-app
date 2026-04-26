"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ChefHat, AlertCircle, Loader2 } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("两次输入的密码不一致");
      return;
    }

    if (password.length < 6) {
      setError("密码至少 6 位");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "注册失败");
        return;
      }

      router.push("/auth/login");
    } catch (err) {
      setError("网络错误，请稍后重试");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center p-6 bg-pale-gray">
      <div className="w-full max-w-md">
        <div className="card p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-spotlight bg-accent-500 flex items-center justify-center mx-auto mb-5">
              <ChefHat size={32} className="text-white" />
            </div>
            <h1 className="font-display text-[28px] font-semibold text-ink mb-1.5 tracking-[-0.01em]">
              创建账户
            </h1>
            <p className="text-body-lg text-text-secondary">
              开启您的家庭美食之旅
            </p>
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-field mb-6 text-sm flex items-center gap-2">
              <AlertCircle size={18} />
              {error}
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="field-label">姓名</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="input-field"
                placeholder="您的姓名"
              />
            </div>

            <div>
              <label className="field-label">邮箱</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="input-field"
                placeholder="your@email.com"
              />
            </div>

            <div>
              <label className="field-label">密码</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="input-field"
                placeholder="至少 6 位"
              />
            </div>

            <div>
              <label className="field-label">确认密码</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="input-field"
                placeholder="再次输入密码"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary py-3.5"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={18} />
                  注册中...
                </>
              ) : (
                "创建账户"
              )}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-label text-text-secondary">
              已有账户？{" "}
              <Link
                href="/auth/login"
                className="text-accent-500 hover:text-accent-600 font-semibold"
              >
                立即登录
              </Link>
            </p>
          </div>
        </div>

        <p className="text-center text-xs text-text-secondary mt-6">
          注册即表示您同意我们的服务条款和隐私政策
        </p>
      </div>
    </main>
  );
}
