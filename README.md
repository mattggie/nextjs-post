# DocSpace - Markdown 文档编辑系统

一个简洁美观的在线 Markdown 编辑器，基于 Next.js 和 Supabase 构建。

## 功能特性
- **文件管理**：支持多层级文件夹组织文档。
- **Markdown 编辑器**：实时分栏预览，自动保存。
- **安全认证**：基于 Supabase Auth 的用户认证系统。
- **API 上传**：支持通过 API 接口上传文档（适用于自动化脚本）。
- **现代 UI**：毛玻璃效果、暗色模式、流畅交互。

## 配置步骤

### 1. Supabase 设置
1. 在 [Supabase](https://supabase.com) 创建项目。
2. 进入 SQL Editor，运行 [`supabase_schema.sql`](./supabase_schema.sql) 中的内容。
3. 从 Project Settings > API 获取 URL、Anon Key 和 Service Role Key。

### 2. 环境变量
创建 `.env.local` 文件并填入：

```bash
NEXT_PUBLIC_SUPABASE_URL=你的项目URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=你的anon_key
DEFAULT_EMAIL=admin@example.com
DEFAULT_PASSWORD=你的密码

# API 上传功能需要 (可选)
SUPABASE_SERVICE_ROLE_KEY=你的service_role_key
API_SECRET=自定义的API密钥
```

### 3. 安装与运行
```bash
npm install
npm run dev
```

## API 接口文档

### 获取文件夹列表
```
GET /api/upload
Headers: x-api-key: 你的API_SECRET
```

响应示例：
```json
{
  "folders": [
    { "id": "xxx", "name": "文件夹名", "parent_id": null }
  ]
}
```

### 上传文档
```
POST /api/upload
Headers: 
  x-api-key: 你的API_SECRET
  Content-Type: application/json
Body:
{
  "title": "文档标题",
  "content": "Markdown内容",
  "folder_id": "目标文件夹ID"
}
```

响应示例：
```json
{ "success": true, "id": "新文档ID" }
```

### cURL 示例
```bash
# 获取文件夹
curl -X GET https://你的域名/api/upload \
  -H "x-api-key: 你的API_SECRET"

# 上传文档
curl -X POST https://你的域名/api/upload \
  -H "x-api-key: 你的API_SECRET" \
  -H "Content-Type: application/json" \
  -d '{"title":"测试文档","content":"# Hello","folder_id":"xxx"}'
```

## 部署到 Vercel

1. 将代码推送到 GitHub。
2. 登录 [Vercel](https://vercel.com) 并导入仓库。
3. 在 Environment Variables 中添加所有 `.env.local` 中的变量。
4. 点击 Deploy。

**注意**：每次 `git push` 到 GitHub 后，Vercel 会自动重新部署。

## 使用说明
- 首次使用 `DEFAULT_EMAIL` 和 `DEFAULT_PASSWORD` 登录时，账户会自动创建。
- 请确保在 Supabase 中关闭邮箱验证 (Authentication > Providers > Email > 关闭 Confirm email)。
