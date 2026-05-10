# 部署到 Supabase PostgreSQL + Vercel

这个项目已经从 SQLite 配置切换为 Supabase PostgreSQL，适合部署到 Vercel 后在手机上随时访问。请先保留本地的 `prisma/dev.db`，确认线上数据迁移成功后再决定是否处理旧 SQLite 文件。

参考官方文档：

- Supabase Prisma: https://supabase.com/docs/guides/database/prisma
- Supabase Postgres connections: https://supabase.com/docs/guides/database/connecting-to-postgres
- Prisma Supabase notes: https://www.prisma.io/docs/orm/v6/overview/databases/supabase
- Vercel environment variables: https://vercel.com/docs/environment-variables
- Next.js manifest: https://nextjs.org/docs/app/api-reference/file-conventions/metadata/manifest

## 1. 创建 Supabase 项目

1. 打开 https://supabase.com 并登录。
2. 创建一个新项目。
3. 记录项目密码和 Project Ref。
4. 等待数据库初始化完成。

## 2. 获取连接字符串

在 Supabase 项目中进入 **Connect** 或数据库连接设置，准备两个变量：

- `DATABASE_URL`: 给线上应用运行时使用。Vercel 这类 serverless 环境建议使用 Supavisor transaction pooler，通常是 `6543` 端口，并给 Prisma 加上 `?pgbouncer=true`。
- `DIRECT_URL`: 给 Prisma CLI 迁移使用。使用 direct connection，或 Supavisor session pooler，通常是 `5432` 端口。

示例格式：

```env
DATABASE_URL="postgresql://postgres.PROJECT_REF:YOUR_PASSWORD@aws-0-REGION.pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.PROJECT_REF:YOUR_PASSWORD@aws-0-REGION.pooler.supabase.com:5432/postgres"
```

如果你的 Supabase 控制台给的是 direct connection，也可以把它放进 `DIRECT_URL`。

## 3. 设置本地 `.env`

1. 打开项目根目录的 `.env`。
2. 不要删除 `prisma/dev.db`。
3. 把旧的 SQLite 连接替换为 Supabase PostgreSQL 连接：

```env
DATABASE_URL="你的 Supabase transaction pooler URL"
DIRECT_URL="你的 Supabase direct 或 session pooler URL"
```

可以参考项目里的 `.env.example`。

## 4. 生成 Prisma Client

```bash
npx prisma generate
```

## 5. 运行数据库迁移

首次部署到空的 Supabase 数据库时，运行：

```bash
npx prisma migrate deploy
```

这会把项目里的 PostgreSQL migration 应用到 Supabase，创建 `CardItem` 表。

如果你想在本地开发过程中创建新的迁移，之后再使用：

```bash
npx prisma migrate dev --name your_change_name
```

不要对生产数据库运行 destructive reset 命令。

## 6. 本地测试

确认 `.env` 已经填好 Supabase 连接后：

```bash
npm run dev
```

打开：

```text
http://127.0.0.1:3000
```

测试：

- 添加卡牌
- 编辑卡牌
- 快捷卖出
- 软删除
- 恢复
- CSV 导出

## 7. 推送到 GitHub

1. 确认 `.env` 没有提交到 GitHub。
2. 提交项目代码。
3. 推送到你的 GitHub 仓库。

## 8. 导入到 Vercel

1. 打开 https://vercel.com。
2. Import 你的 GitHub 仓库。
3. Framework 选择 Next.js。
4. Build command 使用默认值：

```bash
npm run build
```

## 9. 添加 Vercel 环境变量

在 Vercel 项目设置里添加：

```env
DATABASE_URL="你的 Supabase transaction pooler URL"
DIRECT_URL="你的 Supabase direct 或 session pooler URL"
```

环境建议至少勾选：

- Production
- Preview
- Development

保存后重新部署。

## 10. 部署后测试

部署完成后，打开 Vercel 域名并测试：

- 首页统计是否加载
- 添加卡牌是否成功
- 编辑卡牌是否成功
- 快捷卖出是否成功
- 删除是否进入回收站
- 恢复是否成功
- `/api/export?type=all` 是否下载 CSV
- 手机浏览器是否可以“添加到主屏幕”

## 11. 手机安装方式

### iPhone Safari

1. 打开 Vercel 部署地址。
2. 点击分享按钮。
3. 选择 **添加到主屏幕**。
4. 使用主屏幕图标打开。

### Android Chrome

1. 打开 Vercel 部署地址。
2. 点击浏览器菜单。
3. 选择 **安装应用** 或 **添加到主屏幕**。
4. 使用主屏幕图标打开。

## 12. 更换 App 图标

如果要使用自己的图标：

1. 把原图保存为：

```text
public/app-icon-source.png
```

2. 运行：

```powershell
powershell -ExecutionPolicy Bypass -File scripts/update-app-icons.ps1
```

脚本会自动生成：

```text
public/icon-192.png
public/icon-512.png
```

这两个文件已经被 `src/app/manifest.ts` 和 `src/app/layout.tsx` 使用。
