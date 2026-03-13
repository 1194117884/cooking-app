# 🚀 部署指南

## 生产环境部署

### 1. 环境变量配置

复制 `.env.example` 为 `.env.production`:

```bash
cp .env.example .env.production
```

配置以下变量:

```env
# 数据库连接 (生产环境)
DATABASE_URL="postgresql://user:password@host:5432/dbname"

# JWT 密钥 (生成强随机密钥)
JWT_SECRET="your-super-secret-key-min-32-chars"

# 应用配置
NEXT_PUBLIC_APP_NAME="家庭美食规划系统"
NEXT_PUBLIC_APP_URL="https://your-domain.com"

# 文件上传
NEXT_PUBLIC_MAX_UPLOAD_SIZE="5242880"
```

### 2. 数据库迁移

```bash
# 生成 Prisma Client
npx prisma generate

# 推送 Schema 到生产数据库
npx prisma db push

# 导入种子数据
npm run db:seed
```

### 3. 构建

```bash
# 安装依赖
npm ci

# 生产构建
npm run build

# 测试生产构建
npm start
```

### 4. 部署到 Vercel (推荐)

```bash
# 安装 Vercel CLI
npm i -g vercel

# 登录
vercel login

# 部署
vercel --prod
```

**环境变量**: 在 Vercel 控制台配置:
- `DATABASE_URL`
- `JWT_SECRET`

### 5. 部署到 Docker

```bash
# 构建镜像
docker build -t cooking-app .

# 运行容器
docker run -p 3000:3000 \
  -e DATABASE_URL=your-db-url \
  -e JWT_SECRET=your-secret \
  cooking-app
```

### 6. 部署到服务器

```bash
# 使用 PM2
npm i -g pm2

# 构建
npm run build

# 启动
pm2 start npm --name "cooking-app" -- start

# 设置开机自启
pm2 startup
pm2 save
```

---

## 数据库备份

### 定期备份

```bash
# PostgreSQL 备份
pg_dump -U username cooking_app > backup_$(date +%Y%m%d).sql

# 恢复
psql -U username cooking_app < backup_20260312.sql
```

### 自动化脚本

创建 `scripts/backup.sh`:

```bash
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
pg_dump $DATABASE_URL > backups/backup_$DATE.sql
# 保留最近 7 天备份
find backups -name "*.sql" -mtime +7 -delete
```

---

## 监控和日志

### 性能监控

- Vercel Analytics (如果用 Vercel)
- Google Analytics
- Sentry (错误追踪)

### 日志收集

```bash
# 查看 PM2 日志
pm2 logs cooking-app

# 查看 Docker 日志
docker logs cooking-app
```

---

## 安全建议

1. **使用 HTTPS**: 强制 HTTPS 连接
2. **定期更新**: 保持依赖最新
3. **强密码策略**: 密码至少 8 位
4. **速率限制**: 防止暴力破解
5. **CORS 配置**: 限制跨域请求
6. **数据库备份**: 每日自动备份

---

## 故障排除

### 常见问题

**1. 数据库连接失败**
```bash
# 检查连接字符串
echo $DATABASE_URL

# 测试连接
psql $DATABASE_URL -c "SELECT 1"
```

**2. 构建失败**
```bash
# 清理缓存
rm -rf .next node_modules
npm ci
npm run build
```

**3. 内存不足**
```bash
# 增加 Node 内存
NODE_OPTIONS="--max-old-space-size=4096" npm run build
```

---

## 性能优化

### 图片优化
- 使用 WebP 格式
- 实现懒加载
- 使用 CDN

### 代码优化
- 启用 Gzip/Brotli
- 配置浏览器缓存
- 代码分割

### 数据库优化
- 添加索引
- 查询优化
- 连接池配置

---

**部署检查清单**:
- [ ] 环境变量配置
- [ ] 数据库迁移完成
- [ ] HTTPS 启用
- [ ] 备份策略配置
- [ ] 监控工具集成
- [ ] 错误追踪配置
- [ ] 性能测试通过
