# 摄影师自用在线选片系统 MVP 1.0

这是一个 Next.js + Supabase 的轻量级网页选片系统。核心闭环是：创建相册、上传 JPG 小样、生成客户链接、客户微信网页选片、后台查看结果、导出 CSV/TXT 编号。

## 本地运行

1. 安装依赖

```bash
npm install
```

2. 复制环境变量

```bash
cp .env.example .env.local
```

3. 在 Supabase 创建项目，并填写：

```txt
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
PHOTO_PASSWORD_SECRET
SUPABASE_STORAGE_BUCKET=photo-previews
```

4. 在 Supabase SQL Editor 依次执行：

```txt
db/schema.sql
db/policies.sql
db/storage-policies.sql
```

5. 确认 Supabase Storage bucket：

```txt
photo-previews
```

`db/storage-policies.sql` 会创建 public bucket。MVP 当前使用 public URL 展示 JPG 小样。请只上传压缩 JPG 小样，不要上传 RAW、CR3、ARW、NEF、RAF、DNG 或最终精修大图。

6. 创建摄影师账号

在 Supabase Auth 后台创建一个用户，或开启邮箱注册后创建。登录地址：

```txt
http://localhost:3000/login
```

7. 启动开发服务器

```bash
npm run dev
```

## 部署建议

- 前端和服务端：Vercel
- 数据库：Supabase Postgres
- 图片存储：Supabase Storage
- 域名：摄影工作室自己的域名

部署到 Vercel 后，把 `.env.local` 中同样的变量配置到 Vercel Environment Variables，并把 `NEXT_PUBLIC_SITE_URL` 改成线上域名。

## 文件名解析规则

系统上传 JPG 时会保留原始文件名：

```txt
DSC_8123.jpg -> DSC_8123 -> 8123
IMG_3881.JPG -> IMG_3881 -> 3881
_H1A1024.jpeg -> _H1A1024 -> 1024
20260509-DSC_2031.jpg -> 20260509-DSC_2031 -> 2031
```

`camera_sequence` 只是辅助字段。摄影师最终回本地硬盘查找 RAW 原片时，应以 `original_basename` 为准。
