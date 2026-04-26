"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChefHat } from "lucide-react";

const navItems = [
  { href: "/recipes", label: "菜谱" },
  { href: "/planner", label: "计划" },
  { href: "/shopping", label: "采购" },
  { href: "/members", label: "家人" },
];

export default function Header() {
  const pathname = usePathname();

  if (pathname.startsWith("/auth")) return null;

  return (
    <header className="glass-header sticky top-0 z-50 border-b border-black/5">
      <div className="max-w-6xl mx-auto flex items-center justify-between h-[46px] px-5">
        <Link
          href="/"
          className="flex items-center gap-2 no-underline hover:opacity-80 transition-opacity"
        >
          <div className="w-7 h-7 rounded-control bg-accent-500 flex items-center justify-center">
            <ChefHat size={15} className="text-white" />
          </div>
          <span className="font-display text-[15px] font-semibold text-ink tracking-[-0.01em]">
            家庭美食
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-7">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`text-[13px] font-medium no-underline transition-colors duration-150 ${
                pathname.startsWith(item.href)
                  ? "text-accent-500"
                  : "text-text-secondary hover:text-ink"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <Link
          href="/settings"
          className="w-7 h-7 rounded-full bg-gradient-to-br from-accent-500 to-accent-600 flex items-center justify-center text-white text-[11px] font-semibold no-underline hover:scale-105 transition-transform"
        >
          Y
        </Link>
      </div>
    </header>
  );
}
