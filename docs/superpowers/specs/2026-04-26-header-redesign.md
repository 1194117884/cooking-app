# Header Redesign — Remove Page Titles, Add Glass Nav Bar

## Problem

Every page has a large `<h1>` title + subtitle block (~80px) at the top that repeats what the bottom nav already communicates. It's redundant visual noise that delays content. Desktop users have no navigation at all (bottom nav is mobile-only).

## Solution

Remove all per-page title headers. Add a shared glass-morphism top nav bar for desktop, simplify to logo-only on mobile.

## Header Component

- **File:** `components/Header.tsx`
- **Location:** Inserted in `app/layout.tsx`, wraps all non-auth routes
- **Desktop (`md:` and above):** Logo "家庭美食" left, 4 text nav links (菜谱/计划/采购/家人), avatar right
- **Mobile:** Logo only + avatar (nav stays in bottom bar)
- **Style:** `rgba(255,255,255,0.78)` background, `backdrop-filter: blur(20px)`, `1px solid rgba(0,0,0,0.06)` bottom border, sticky top, ~46px height
- **Active state:** Accent orange (`#f97316`) text color, no underline
- **CSS:** Add `.glass-header` class to `globals.css`

## Page Cleanup

Remove the `<h1>` + `<p>` title block from every page. Content starts directly below the glass header.

| Page | Removed |
|------|---------|
| `/recipes` | "菜谱库" + count subtitle |
| `/planner` | "周计划" + count subtitle |
| `/shopping` | "采购清单" |
| `/members` | "家庭成员" + count subtitle |
| `/preferences` | "口味偏好" + subtitle |
| `/ratings` | "餐食评分" + subtitle |
| `/settings` | "设置" |
| `/recommend` | Title block |
| `/nutrition` | "营养分析" |
| `/recipes/add` | "添加菜谱" |

**Kept:** Home hero section, recipe detail page name, auth pages (login/register).

## Routing

Header active state determined by `usePathname()` from `next/navigation`. Nav links:
- `/recipes` → 菜谱
- `/planner` → 计划
- `/shopping` → 采购
- `/members` → 家人

## Responsive

| Breakpoint | Header | Navigation |
|------------|--------|------------|
| `< md` (768px) | Logo + avatar only | Bottom nav bar |
| `>= md` | Full nav bar | No bottom nav (existing) |

## Unchanged

- Bottom mobile nav bar (`glass-nav` class)
- Home page hero section
- Recipe detail page recipe name heading
- Auth pages (separate layout, no header)
- All existing CSS custom properties and design tokens
