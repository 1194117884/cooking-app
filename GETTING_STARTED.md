# 🚀 快速开始指南

## 第一步：配置数据库 (5 分钟)

### 选项 A: Neon (推荐 - 免费 PostgreSQL 托管)

1. 访问 https://neon.tech
2. 用 GitHub 账号登录
3. 创建新项目 `cooking-app`
4. 复制连接字符串 (Connection string)

### 选项 B: Supabase (备选)

1. 访问 https://supabase.com
2. 创建新项目
3. 进入 Settings → Database
4. 复制 URI (Pooler mode)

### 配置环境变量

```bash
cd /Users/yongkl/.openclaw/workspace/cooking-app

# 复制环境变量模板
cp .env.example .env

# 编辑 .env 文件，填入你的 DATABASE_URL
# 同时修改 JWT_SECRET (生成方法：openssl rand -base64 32)
```

`.env` 文件示例：
```env
DATABASE_URL="postgresql://user:password@host.neon.tech/dbname?sslmode=require"
JWT_SECRET="your-random-secret-key-here"
NEXT_PUBLIC_APP_NAME="家庭美食规划系统"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

---

## 第二步：初始化数据库 (2 分钟)

```bash
# 1. 生成 Prisma 客户端
npm run db:generate

# 2. 推送 Schema 到数据库
npm run db:push

# 3. 导入种子数据 (8 道菜谱 + 30 种食材)
npm run db:seed
```

看到 `🎉 数据库初始化完成!` 即成功！

---

## 第三步：启动开发服务器 (30 秒)

```bash
npm run dev
```

访问 **http://localhost:3000**

---

## ✅ 验证成功

你应该看到：

1. **首页** - 显示欢迎界面 + 快捷操作卡片
2. **底部导航** - 5 个 Tab (首页/菜谱/计划/采购/设置)
3. **统计数据** - 全部显示 0 (因为还没添加数据)

---

## 🔧 常用命令

```bash
# 开发
npm run dev              # 启动开发服务器

# 数据库
npm run db:generate      # 生成 Prisma 客户端
npm run db:push          # 推送 Schema (开发环境)
npm run db:seed          # 导入种子数据
npm run db:studio        # 打开 Prisma Studio (可视化数据)

# 生产
npm run build            # 构建生产版本
npm run start            # 启动生产服务器

# 代码质量
npm run lint             # ESLint 检查
```

---

## 📱 PWA 安装 (可选)

### Chrome/Edge
1. 访问 http://localhost:3000
2. 地址栏右侧出现 "安装" 图标
3. 点击安装到桌面

### Safari (iOS)
1. 访问 http://localhost:3000
2. 点击分享按钮
3. 选择 "添加到主屏幕"

---

## 🐛 遇到问题？

### 问题：`npm run db:push` 失败

**解决：**
1. 检查 `.env` 文件是否存在
2. 检查 `DATABASE_URL` 是否正确
3. 确保数据库连接正常 (可以用 psql 测试)

### 问题：种子数据导入失败

**解决：**
```bash
# 先清空数据库
npm run db:push -- --force-reset

# 重新导入
npm run db:seed
```

### 问题：端口 3000 被占用

**解决：**
```bash
# 使用其他端口
PORT=3001 npm run dev
```

---

## 📖 下一步

数据库配置好后，可以开始开发功能了！

**推荐开发顺序：**

1. **用户认证** - 登录/注册
2. **家庭成员管理** - 添加家人档案
3. **偏好设置** - 设置喜欢/忌口
4. **菜谱管理** - CRUD 操作
5. **周计划** - 日历视图 + 智能推荐
6. **采购清单** - 自动生成

---

## 🎯 当前进度

- [x] Phase 0: 需求确认 + 设计
- [x] Phase 1: 项目骨架搭建
- [ ] Phase 2: 菜谱库功能 (下一步)
- [ ] Phase 3: 周计划 + 智能推荐
- [ ] Phase 4: 优化上线

---

**开发文档**: 查看 [DEVLOG.md](./DEVLOG.md) 了解详细进度

**设计文档**: 查看 [cooking-app-design-v2.html](../cooking-app-design-v2.html)
