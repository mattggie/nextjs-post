# HTTP API Upload Guide

本系统提供了一套基于 HTTP 的 API，方便您通过脚本或外部工具自动化上传文章和管理文件夹。

## 基础信息

- **接口地址**: `POST /api/upload`
- **鉴权方式**: 在 Header 中添加 `x-api-key`
- **API Key**: 详见 `.env.local` 中的 `API_SECRET`

---

## 1. 获取文件夹列表

获取当前系统中已有的文件夹和对应的 ID。

- **方法**: `GET`
- **URL**: `/api/upload`
- **Header**:
  - `x-api-key`: `您的API密钥`

**响应示例**:
```json
{
  "folders": [
    { "id": "uuid-1", "name": "日记" },
    { "id": "uuid-2", "name": "技术" }
  ]
}
```

---

## 2. 新建文件夹

新建一个目录，如果同名目录已存在将返回已有目录的 ID。

- **方法**: `POST`
- **Body (JSON)**:
  ```json
  {
    "action": "create_folder",
    "name": "新文件夹名称"
  }
  ```

**响应示例**:
```json
{
  "success": true,
  "id": "new-folder-uuid"
}
```

---

## 3. 上传文章 (推荐方式)

您可以直接指定文件夹名称上传文章。如果文件夹不存在，系统会自动为您创建。

- **方法**: `POST`
- **Body (JSON)**:
  ```json
  {
    "action": "upload_document",
    "title": "文章标题",
    "content": "文章正文内容 (Markdown)",
    "folder_name": "分类名称"
  }
  ```

**参数说明**:
- `action`: 固定为 `upload_document`。
- `title`: 文章标题 (必填)。
- `content`: 文章内容，支持 Markdown。
- `folder_name`: 文件夹名称。如果文件夹不存在会自动创建；如果已存在则归类到该文件夹下。

---

## 4. 上传文章 (通过文件夹 ID)

如果您已经知道文件夹的 ID，可以通过 ID 更加精准地上传。

- **方法**: `POST`
- **Body (JSON)**:
  ```json
  {
    "action": "upload_document",
    "title": "文章标题",
    "content": "文章内容",
    "folder_id": "文件夹的UUID"
  }
  ```

---

## Curl 示例

### 上传一篇文章并自动创建文件夹
```bash
curl -X POST http://localhost:3000/api/upload \
  -H "Content-Type: application/json" \
  -H "x-api-key: your_api_secret_here" \
  -d '{
    "action": "upload_document",
    "title": "我的第一篇API文章",
    "content": "这是内容...",
    "folder_name": "API自动化"
  }'
```
