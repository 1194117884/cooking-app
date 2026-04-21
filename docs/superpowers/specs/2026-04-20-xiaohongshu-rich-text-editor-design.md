# 菜谱烹饪步骤富文本编辑器设计文档

## 概述

将菜谱详情页的烹饪步骤从纯文本输入改为小红书风格的富文本编辑器，支持字体样式、表情符号、多张图片上传和混排展示。

## 背景与动机

**当前问题：**
- 烹饪步骤使用简单 textarea，只能输入纯文本
- 步骤描述不够生动，无法插入图片辅助说明
- 不支持格式化（加粗、高亮等）

**目标：**
- 提供类似小红书的编辑体验
- 支持图文混排，提升菜谱可读性
- 图片存储到服务器本地数据库

## 技术选型

### 富文本编辑器：Tiptap

**选择理由：**
- 基于 ProseMirror，稳定可靠
- 高度可定制，易于实现小红书样式
- 支持图片拖拽上传
- 输出结构化 JSON，便于存储和渲染
- 模块化设计，按需加载插件

**核心插件：**
- `@tiptap/starter-kit` - 基础功能（加粗、斜体、列表等）
- `@tiptap/extension-image` - 图片支持
- `@tiptap/extension-placeholder` - 占位符提示
- `@tiptap/extension-history` - 撤销/重做

### 图片存储：服务器本地文件系统

**选择理由：**
- 实现简单，无需额外云服务配置
- 成本最低
- 备份容易（直接复制文件夹）

**存储路径：** `/public/uploads/recipes/{recipeId}/`

**数据库记录：** 新增 `RecipeImage` 表存储图片元数据

## 数据模型变更

### Prisma Schema 修改

```prisma
// Recipe 模型修改
model Recipe {
  // ... 现有字段 ...
  steps          Json?    // 改为 Json 类型存储 Tiptap 文档结构
  stepImages     RecipeImage[]
}

// 新增：步骤图片表
model RecipeImage {
  id          String   @id @default(uuid())
  recipeId    String
  filename    String   // 存储文件名
  url         String   // 访问路径 /uploads/recipes/{recipeId}/{filename}
  alt         String?  // 图片替代文本
  order       Int      @default(0)  // 排序
  createdAt   DateTime @default(now())
  recipe      Recipe   @relation(fields: [recipeId], references: [id], onDelete: Cascade)

  @@index([recipeId])
  @@map("recipe_images")
}
```

### 存储格式示例

```json
{
  "type": "doc",
  "content": [
    {
      "type": "heading",
      "attrs": { "level": 3 },
      "content": [{ "type": "text", "text": "准备工作" }]
    },
    {
      "type": "paragraph",
      "content": [
        { "type": "text", "text": "将鸡肉切成" },
        { "type": "text", "marks": [{ "type": "bold" }], "text": "2cm见方" },
        { "type": "text", "text": "的小块，加入料酒腌制10分钟 🍗" }
      ]
    },
    {
      "type": "image",
      "attrs": {
        "src": "/uploads/recipes/abc123/step-1.jpg",
        "alt": "腌制鸡肉"
      }
    },
    {
      "type": "paragraph",
      "content": [{ "type": "text", "text": "热锅凉油，放入干辣椒爆香..." }]
    }
  ]
}
```

## 组件设计

### 1. RichTextEditor 组件

**文件：** `components/RichTextEditor.tsx`

**功能：**
- 基于 Tiptap 的富文本编辑器
- 工具栏：加粗、斜体、高亮、表情、图片上传按钮
- 支持直接粘贴图片
- 支持拖拽图片到编辑器

**样式：**
- 小红书风格的工具栏（圆角、柔和阴影）
- 编辑区域最小高度 300px
- 图片在编辑器内显示为卡片样式

### 2. ImageGalleryUpload 组件

**文件：** `components/ImageGalleryUpload.tsx`

**功能：**
- 多图上传管理
- 拖拽排序
- 预览和删除
- 上传进度显示

**与编辑器集成：**
- 图片先上传到此组件管理
- 点击"插入到文章"将图片插入编辑器光标位置

### 3. RichContentViewer 组件

**文件：** `components/RichContentViewer.tsx`

**功能：**
- 渲染 Tiptap JSON 内容
- 支持表情符号显示
- 图片懒加载
- 移动端适配

### 4. 表情选择器

**文件：** `components/EmojiPicker.tsx`

**功能：**
- 常用表情分类展示
- 点击插入到编辑器

## API 设计

### 1. 上传步骤图片

```http
POST /api/recipes/{id}/step-images
Content-Type: multipart/form-data

file: <image-file>
```

**响应：**
```json
{
  "success": true,
  "image": {
    "id": "img-123",
    "url": "/uploads/recipes/abc123/step-1.jpg",
    "filename": "step-1.jpg"
  }
}
```

### 2. 重新排序图片

```http
PATCH /api/recipes/{id}/step-images/reorder
Content-Type: application/json

{
  "imageIds": ["img-1", "img-2", "img-3"]
}
```

### 3. 删除图片

```http
DELETE /api/recipes/{id}/step-images/{imageId}
```

### 4. 修改 Recipe API

**创建/更新菜谱时：**

```json
{
  "name": "宫保鸡丁",
  "steps": {
    "type": "doc",
    "content": [...]
  },
  // ... 其他字段
}
```

## 页面修改

### 1. app/recipes/add/page.tsx

**变更：**
- 将 `steps` textarea 替换为 `RichTextEditor`
- 添加 `ImageGalleryUpload` 组件
- 表单提交时保存 Tiptap JSON

### 2. app/recipes/[id]/page.tsx

**变更：**
- 使用 `RichContentViewer` 渲染烹饪步骤
- 支持图文混排展示

### 3. 新增编辑页面 app/recipes/[id]/edit/page.tsx

- 复用 RichTextEditor
- 加载现有内容并允许编辑

## 依赖安装

```bash
npm install @tiptap/react @tiptap/starter-kit @tiptap/extension-image @tiptap/extension-placeholder
```

## 安全考虑

1. **XSS 防护：**
   - 使用 `sanitize-html` 清理输出（已在项目依赖中）
   - Tiptap 的 JSON 格式天然防 XSS

2. **文件上传安全：**
   - 限制文件类型（仅图片）
   - 限制文件大小（单张最大 5MB）
   - 生成随机文件名防止覆盖
   - 使用 sharp 处理图片（压缩、转格式）

3. **权限控制：**
   - 只有菜谱所有者可以上传/编辑图片
   - API 端点需验证 JWT token

## 回退策略

如果新编辑器出现问题，可快速回退：
1. 数据库保留新旧两种格式（`steps` 和 `stepsLegacy`）
2. 前端支持两种格式的渲染
3. 切换开关控制使用哪种编辑器

## 性能优化

1. **图片处理：**
   - 上传时使用 sharp 压缩到 WebP 格式
   - 生成缩略图用于列表展示

2. **懒加载：**
   - 详情页图片使用 `loading="lazy"`

3. **CDN：**
   - 后期可将 `/uploads` 目录配置 CDN

## 测试计划

1. **单元测试：**
   - RichTextEditor 基础功能
   - 图片上传 API
   - 数据格式转换

2. **集成测试：**
   - 完整流程：创建菜谱 → 编辑步骤 → 插入图片 → 保存 → 展示

3. **E2E 测试：**
   - Playwright 测试富文本编辑流程

## 实施优先级

1. **P0 - 核心功能：**
   - Tiptap 编辑器基础功能
   - 图文混排存储和展示
   - 单张图片上传

2. **P1 - 增强功能：**
   - 多图批量上传
   - 表情选择器
   - 图片拖拽排序

3. **P2 - 优化：**
   - 图片压缩
   - 性能优化
   - 回退机制

## 验收标准

- [ ] 富文本编辑器支持加粗、斜体、高亮
- [ ] 支持插入表情符号
- [ ] 支持上传多张图片并插入到任意位置
- [ ] 图片正确存储到服务器本地
- [ ] 详情页正确展示格式化和图片
- [ ] 移动端编辑体验良好
- [ ] 无 XSS 安全漏洞
