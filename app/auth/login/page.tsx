"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ChefHat, AlertCircle, Loader2 } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "登录失败");
        return;
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      router.push("/");
      router.refresh();
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
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-spotlight bg-accent-500 flex items-center justify-center mx-auto mb-5">
              <ChefHat size={32} className="text-white" />
            </div>
            <h1 className="font-display text-[28px] font-semibold text-ink mb-1.5 tracking-[-0.01em]">
              欢迎回来
            </h1>
            <p className="text-body-lg text-text-secondary">
              登录账户，开启美食之旅
            </p>
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-field mb-6 text-sm flex items-center gap-2">
              <AlertCircle size={18} />
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
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
                placeholder="••••••••"
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
                  登录中...
                </>
              ) : (
                "登录"
              )}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-label text-text-secondary">
              还没有账户？{" "}
              <Link
                href="/auth/register"
                className="text-accent-500 hover:text-accent-600 font-semibold"
              >
                立即注册
              </Link>
            </p>
          </div>
        </div>

        <p className="text-center text-xs text-text-secondary mt-6">
          登录即表示您同意我们的服务条款和隐私政策
        </p>
      </div>
    </main>
  );
}
