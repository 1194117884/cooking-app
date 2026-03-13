# 🍳 家庭美食规划系统 v1.0

> 智能规划每周美食，让做饭更轻松

[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-blue.svg)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-14.2-black.svg)](https://nextjs.org/)
[![Prisma](https://img.shields.io/badge/Prisma-5.17-blue.svg)](https://www.prisma.io/)

---

## ✨ 功能特性

### 🎯 核心功能

- **📚 菜谱库**: 16+ 道经典菜谱，支持搜索/筛选
- **📅 周计划**: 智能规划每周菜单，一日三餐管理
- **🛒 采购清单**: 自动生成，分类管理，勾选完成
- **👨‍👩‍👧 家庭成员**: 多成员管理，角色定制
- **❤️ 口味偏好**: 喜欢/忌口管理，4 种分类
- **🤖 智能推荐**: 基于偏好推荐菜谱
- **📊 营养分析**: 可视化图表，营养建议

### 🔐 用户系统

- 注册/登录 (JWT 认证)
- 个人资料管理
- 密码修改
- 多成员支持

### 🎨 界面设计

- 响应式设计 (手机/平板/PC)
- PWA 支持 (可安装到桌面)
- 优雅 UI/UX
- 底部导航 (移动端)

---

## 🚀 快速开始

### 环境要求

- Node.js 18+ 
- PostgreSQL 13+
- npm 或 yarn

### 安装

```bash
# 克隆项目
git clone <repo-url>
cd cooking-app

# 安装依赖
npm install

# 配置环境变量
cp .env.example .env
# 编辑 .env 配置数据库连接

# 初始化数据库
npm run db:generate
npm run db:push
npm run db:seed

# 启动开发服务器
npm run dev
```

访问 http://localhost:3000

### 测试账户

```
邮箱：yongkl@test.com
密码：654321
```

---

## 📁 项目结构

```
cooking-app/
├── app/                      # Next.js App Router
│   ├── api/                  # API 路由
│   │   ├── auth/             # 认证相关
│   │   ├── members/          # 家庭成员
│   │   ├── preferences/      # 口味偏好
│   │   ├── recommend/        # 智能推荐
│   │   ├── nutrition/        # 营养分析
│   │   └── ...
│   ├── auth/                 # 认证页面
│   ├── members/              # 家庭成员管理
│   ├── preferences/          # 偏好设置
│   ├── recommend/            # 智能推荐
│   ├── nutrition/            # 营养分析
│   ├── recipes/              # 菜谱相关
│   ├── planner/              # 周计划
│   ├── shopping/             # 采购清单
│   └── settings/             # 设置
├── components/               # React 组件
│   ├── ErrorBoundary.tsx     # 错误边界
│   └── Skeleton.tsx          # 骨架屏
├── lib/                      # 工具库
│   └── prisma.ts             # Prisma 客户端
├── prisma/                   # 数据库
│   ├── schema.prisma         # Schema 定义
│   └── seed.ts               # 种子数据
└── public/                   # 静态资源
```

---

## 🛠️ 技术栈

| 分类 | 技术 |
|------|------|
| **前端** | Next.js 14, React 18, TypeScript |
| **样式** | Tailwind CSS |
| **数据库** | PostgreSQL, Prisma ORM |
| **认证** | JWT, bcryptjs |
| **图表** | Recharts |
| **部署** | Vercel (推荐) |

---

## 📊 数据库设计

### 核心表 (10 张)

1. `users` - 用户账户
2. `family_members` - 家庭成员
3. `preferences` - 口味偏好
4. `recipes` - 菜谱
5. `ingredients` - 食材
6. `recipe_ingredients` - 菜谱 - 食材关联
7. `meal_plans` - 周计划
8. `meal_ratings` - 餐食评分
9. `shopping_lists` - 采购清单
10. `shopping_list_items` - 采购清单项

---

## 🔌 API 接口

### 认证
- `POST /api/auth/login` - 登录
- `POST /api/auth/register` - 注册
- `GET /api/auth/me` - 获取用户信息

### 设置
- `PATCH /api/settings/profile` - 更新资料
- `POST /api/settings/password` - 修改密码

### 家庭成员
- `GET /api/members` - 获取列表
- `POST /api/members` - 添加成员
- `PATCH /api/members/[id]` - 更新成员
- `DELETE /api/members/[id]` - 删除成员

### 偏好
- `GET /api/preferences` - 获取偏好
- `POST /api/preferences` - 添加偏好
- `DELETE /api/preferences/[id]` - 删除偏好

### 推荐
- `GET /api/recommend` - 智能推荐

### 营养
- `GET /api/nutrition` - 营养分析

### 菜谱
- `GET /api/recipes` - 菜谱列表
- `GET /api/recipes/[id]` - 菜谱详情

### 周计划
- `GET /api/meal-plans` - 获取计划
- `POST /api/meal-plans` - 添加计划
- `DELETE /api/meal-plans/[id]` - 删除计划

### 采购
- `GET /api/shopping-list` - 获取清单
- `POST /api/shopping-list/generate` - 生成清单
- `PATCH /api/shopping-list/items/[id]` - 更新物品

---

## 📱 页面列表

| 路由 | 说明 |
|------|------|
| `/` | 首页 |
| `/recipes` | 菜谱库 |
| `/recipes/[id]` | 菜谱详情 |
| `/planner` | 周计划 |
| `/shopping` | 采购清单 |
| `/members` | 家庭成员 |
| `/preferences` | 口味偏好 |
| `/recommend` | 智能推荐 |
| `/nutrition` | 营养分析 |
| `/settings` | 设置 |
| `/auth/login` | 登录 |
| `/auth/register` | 注册 |

---

## 🚀 部署

详见 [DEPLOYMENT.md](./DEPLOYMENT.md)

### 快速部署到 Vercel

```bash
npm i -g vercel
vercel --prod
```

---

## 📝 开发日志

详见 [DEVLOG.md](./DEVLOG.md)

### 版本历史

- **v1.0.0** (2026-03-12): Phase 1-3 完成
  - ✅ 用户认证系统
  - ✅ 核心功能完整
  - ✅ 智能推荐算法
  - ✅ 营养分析图表

- **v0.2.0** (2026-03-12): Phase 2 完成
- **v0.1.0** (2026-03-11): Phase 1 完成

---

## 🧪 测试

```bash
# TypeScript 检查
npx tsc --noEmit

# ESLint 检查
npm run lint

# 生产构建测试
npm run build
```

---

## 📄 许可证

MIT License

---

## 👨‍💻 开发团队

- **yongkl** - 全栈开发

---

## 🙏 致谢

感谢以下开源项目:
- [Next.js](https://nextjs.org/)
- [Prisma](https://www.prisma.io/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Recharts](https://recharts.org/)

---

**🎉 1.0 版本完成！享受美食规划的乐趣！**
