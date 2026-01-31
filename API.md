# API文档

## 基础信息

- **基础URL**: `http://localhost:3000/api` (开发环境)
- **认证方式**: JWT Bearer Token
- **内容类型**: `application/json`

## 认证

所有API请求都需要在请求头中包含JWT令牌：

```
Authorization: Bearer <your-jwt-token>
```

## 端点详情

### 健康检查

#### GET /health

检查服务器状态。

**请求示例**:
```bash
curl http://localhost:3000/health
```

**响应**:
```json
{
  "status": "ok"
}
```

---

### 卡牌组管理

#### GET /api/decks

获取当前用户的所有卡牌组。

**请求示例**:
```bash
curl -H "Authorization: Bearer <token>" \
     http://localhost:3000/api/decks
```

**响应**:
```json
[
  {
    "id": 1,
    "user_id": 1,
    "name": "英语单词",
    "description": "常用英语单词学习",
    "created_at": "2024-01-01T00:00:00.000Z",
    "updated_at": "2024-01-01T00:00:00.000Z"
  }
]
```

#### POST /api/decks

创建新的卡牌组。

**请求体**:
```json
{
  "name": "日语单词",
  "description": "N5级别日语单词"
}
```

**响应**:
```json
{
  "id": 2,
  "user_id": 1,
  "name": "日语单词",
  "description": "N5级别日语单词",
  "created_at": "2024-01-02T00:00:00.000Z",
  "updated_at": "2024-01-02T00:00:00.000Z"
}
```

#### GET /api/decks/:id

获取指定卡牌组的详细信息。

**路径参数**:
- `id`: 卡牌组ID

**响应**:
```json
{
  "id": 1,
  "user_id": 1,
  "name": "英语单词",
  "description": "常用英语单词学习",
  "created_at": "2024-01-01T00:00:00.000Z",
  "updated_at": "2024-01-01T00:00:00.000Z"
}
```

#### PUT /api/decks/:id

更新卡牌组信息。

**路径参数**:
- `id`: 卡牌组ID

**请求体**:
```json
{
  "name": "英语单词（更新）",
  "description": "常用英语单词学习 - 已更新"
}
```

**响应**:
```json
{
  "id": 1,
  "user_id": 1,
  "name": "英语单词（更新）",
  "description": "常用英语单词学习 - 已更新",
  "created_at": "2024-01-01T00:00:00.000Z",
  "updated_at": "2024-01-03T00:00:00.000Z"
}
```

#### DELETE /api/decks/:id

删除卡牌组及其所有卡片。

**路径参数**:
- `id`: 卡牌组ID

**响应**: 
- 状态码: 204 No Content

---

### 卡片管理

#### GET /api/cards/deck/:deckId

获取指定卡牌组的所有卡片。

**路径参数**:
- `deckId`: 卡牌组ID

**响应**:
```json
[
  {
    "id": 1,
    "deck_id": 1,
    "front": "hello",
    "back": "你好",
    "source_url": "https://example.com",
    "created_at": "2024-01-01T00:00:00.000Z",
    "updated_at": "2024-01-01T00:00:00.000Z"
  }
]
```

#### GET /api/cards/deck/:deckId/random

获取指定卡牌组的随机卡片。

**路径参数**:
- `deckId`: 卡牌组ID

**查询参数**:
- `limit`: 返回的卡片数量（默认: 10）

**请求示例**:
```bash
curl -H "Authorization: Bearer <token>" \
     http://localhost:3000/api/cards/deck/1/random?limit=5
```

**响应**:
```json
[
  {
    "id": 3,
    "deck_id": 1,
    "front": "goodbye",
    "back": "再见",
    "source_url": null,
    "created_at": "2024-01-01T00:00:00.000Z",
    "updated_at": "2024-01-01T00:00:00.000Z"
  }
]
```

#### POST /api/cards

创建新卡片。

**请求体**:
```json
{
  "deckId": 1,
  "front": "world",
  "back": "世界",
  "sourceUrl": "https://example.com/page"
}
```

**响应**:
```json
{
  "id": 2,
  "deck_id": 1,
  "front": "world",
  "back": "世界",
  "source_url": "https://example.com/page",
  "created_at": "2024-01-02T00:00:00.000Z",
  "updated_at": "2024-01-02T00:00:00.000Z"
}
```

#### GET /api/cards/:id

获取指定卡片的详细信息。

**路径参数**:
- `id`: 卡片ID

**响应**:
```json
{
  "id": 1,
  "deck_id": 1,
  "front": "hello",
  "back": "你好",
  "source_url": "https://example.com",
  "created_at": "2024-01-01T00:00:00.000Z",
  "updated_at": "2024-01-01T00:00:00.000Z"
}
```

#### PUT /api/cards/:id

更新卡片内容。

**路径参数**:
- `id`: 卡片ID

**请求体**:
```json
{
  "front": "hello (updated)",
  "back": "你好（已更新）",
  "sourceUrl": "https://example.com/updated"
}
```

**响应**:
```json
{
  "id": 1,
  "deck_id": 1,
  "front": "hello (updated)",
  "back": "你好（已更新）",
  "source_url": "https://example.com/updated",
  "created_at": "2024-01-01T00:00:00.000Z",
  "updated_at": "2024-01-03T00:00:00.000Z"
}
```

#### DELETE /api/cards/:id

删除卡片。

**路径参数**:
- `id`: 卡片ID

**响应**: 
- 状态码: 204 No Content

---

### 复习管理

#### POST /api/reviews/review

提交卡片复习结果。

**请求体**:
```json
{
  "cardId": 1,
  "quality": 4
}
```

**质量评分说明**:
- 0: 完全忘记
- 1: 错误，但想起来了
- 2: 错误，但很简单
- 3: 正确，但很困难
- 4: 正确，有些犹豫
- 5: 完美记忆

**响应**:
```json
{
  "id": 1,
  "card_id": 1,
  "user_id": 1,
  "ease_factor": 2.6,
  "interval": 6,
  "repetitions": 2,
  "next_review_date": "2024-01-09T00:00:00.000Z",
  "last_review_date": "2024-01-03T00:00:00.000Z",
  "created_at": "2024-01-01T00:00:00.000Z",
  "updated_at": "2024-01-03T00:00:00.000Z"
}
```

#### GET /api/reviews/due

获取待复习的卡片。

**查询参数**:
- `deckId`: 卡牌组ID（可选，不提供则返回所有待复习卡片）

**请求示例**:
```bash
curl -H "Authorization: Bearer <token>" \
     http://localhost:3000/api/reviews/due?deckId=1
```

**响应**:
```json
[
  {
    "id": 1,
    "deck_id": 1,
    "front": "hello",
    "back": "你好",
    "source_url": "https://example.com",
    "next_review_date": "2024-01-03T00:00:00.000Z",
    "interval": 1,
    "repetitions": 1,
    "created_at": "2024-01-01T00:00:00.000Z",
    "updated_at": "2024-01-01T00:00:00.000Z"
  }
]
```

#### GET /api/reviews/stats/:cardId

获取指定卡片的复习统计信息。

**路径参数**:
- `cardId`: 卡片ID

**响应**:
```json
{
  "id": 1,
  "card_id": 1,
  "user_id": 1,
  "ease_factor": 2.5,
  "interval": 6,
  "repetitions": 2,
  "next_review_date": "2024-01-09T00:00:00.000Z",
  "last_review_date": "2024-01-03T00:00:00.000Z",
  "created_at": "2024-01-01T00:00:00.000Z",
  "updated_at": "2024-01-03T00:00:00.000Z"
}
```

---

### 笔记类型管理 (Note Types)

笔记类型定义了卡片的字段结构和模板。

#### GET /api/note-types

获取所有可用的笔记类型（包括系统默认和用户自定义）。

**响应**:
```json
[
  {
    "id": 1,
    "user_id": null,
    "name": "Basic",
    "config": {
      "fields": ["Front", "Back"],
      "templates": [{"name": "Card 1", "front": "{{Front}}", "back": "{{FrontSide}}<hr id=answer>{{Back}}"}],
      "css": ".card { font-family: arial; font-size: 20px; }"
    },
    "created_at": "2024-01-01T00:00:00.000Z",
    "updated_at": "2024-01-01T00:00:00.000Z"
  },
  {
    "id": 3,
    "user_id": null,
    "name": "Cloze",
    "config": {
      "fields": ["Text", "Extra"],
      "templates": [{"name": "Cloze", "front": "{{cloze:Text}}", "back": "{{cloze:Text}}<br>{{Extra}}"}],
      "css": ".card { font-family: arial; } .cloze { font-weight: bold; color: blue; }"
    },
    "created_at": "2024-01-01T00:00:00.000Z",
    "updated_at": "2024-01-01T00:00:00.000Z"
  }
]
```

#### POST /api/note-types

创建新的笔记类型。

**请求体**:
```json
{
  "name": "Vocabulary",
  "config": {
    "fields": ["Word", "Definition", "Example"],
    "templates": [
      {"name": "Word -> Definition", "front": "{{Word}}", "back": "{{Definition}}<br><i>{{Example}}</i>"}
    ],
    "css": ".card { font-family: Georgia; font-size: 18px; }"
  }
}
```

**响应**:
```json
{
  "id": 4,
  "user_id": 1,
  "name": "Vocabulary",
  "config": {...},
  "created_at": "2024-01-02T00:00:00.000Z",
  "updated_at": "2024-01-02T00:00:00.000Z"
}
```

#### GET /api/note-types/:id

获取指定笔记类型的详细信息。

#### PUT /api/note-types/:id

更新笔记类型。

#### DELETE /api/note-types/:id

删除笔记类型（同时删除关联的笔记和卡片）。

---

### 笔记管理 (Notes)

笔记是存储学习内容的容器，根据笔记类型的模板自动生成卡片。

#### POST /api/notes

创建新笔记并自动生成卡片。

**请求体**:
```json
{
  "noteTypeId": 1,
  "fields": ["Apple", "苹果"],
  "tags": "水果 英语::单词",
  "sourceUrl": "https://example.com",
  "deckId": 1
}
```

**响应**:
```json
{
  "id": 1,
  "note_type_id": 1,
  "fields": ["Apple", "苹果"],
  "tags": "水果 英语::单词",
  "source_url": "https://example.com",
  "created_at": "2024-01-02T00:00:00.000Z",
  "updated_at": "2024-01-02T00:00:00.000Z"
}
```

#### GET /api/notes?noteTypeId=1

获取指定类型的所有笔记。

#### GET /api/notes/:id

获取指定笔记的详细信息。

#### PUT /api/notes/:id

更新笔记内容。

**请求体**:
```json
{
  "fields": ["Apple", "苹果（水果）"],
  "tags": "水果 英语::单词 更新",
  "sourceUrl": "https://example.com/updated",
  "deckId": 1,
  "regenerateCards": true
}
```

*注意*: 设置 `regenerateCards: true` 会删除旧卡片并根据更新后的笔记重新生成。

#### DELETE /api/notes/:id

删除笔记（同时删除关联的卡片）。

#### GET /api/notes/:id/cards

获取笔记关联的所有卡片。

#### POST /api/notes/check-duplicate

检查是否存在重复笔记（基于第一个字段）。

**请求体**:
```json
{
  "noteTypeId": 1,
  "firstFieldValue": "Apple",
  "excludeNoteId": null
}
```

**响应**:
```json
{
  "hasDuplicate": true,
  "duplicates": [
    {"id": 1, "fields": ["Apple", "苹果"], ...}
  ]
}
```

#### GET /api/notes/search?tag=英语

按标签搜索笔记。支持层次化标签（如 `语言::日语::动词`）。

#### POST /api/notes/create-cloze

创建填空题标记。

**请求体**:
```json
{
  "text": "hidden content",
  "existingText": "Some {{c1::other}} text",
  "index": null,
  "hint": "提示"
}
```

**响应**:
```json
{
  "clozeText": "{{c2::hidden content::提示}}",
  "index": 2
}
```

---

### 填空题 (Cloze Deletion)

填空题使用特殊语法 `{{c1::隐藏内容::提示}}`：

- `c1`, `c2`, `c3`... 表示不同的填空项
- 每个填空项生成一张独立的卡片
- 提示（可选）在卡片正面显示

**示例**:
```
The {{c1::capital}} of Japan is {{c2::Tokyo}}.
```

这会生成两张卡片：
1. 卡片1: "The [capital] of Japan is Tokyo."
2. 卡片2: "The capital of Japan is [Tokyo]."

## 错误响应

所有错误响应都遵循以下格式：

```json
{
  "error": "错误信息描述"
}
```

### 常见HTTP状态码

- `200 OK`: 请求成功
- `201 Created`: 资源创建成功
- `204 No Content`: 请求成功但无返回内容
- `400 Bad Request`: 请求参数错误
- `401 Unauthorized`: 未授权（缺少或无效的令牌）
- `404 Not Found`: 资源不存在
- `500 Internal Server Error`: 服务器内部错误

## SM-2算法说明

本系统使用SuperMemo 2算法计算复习间隔：

1. **首次复习**: 间隔1天
2. **第二次复习**: 间隔6天
3. **后续复习**: 间隔 = 上次间隔 × 难度因子

难度因子根据回答质量动态调整：
- 质量 ≥ 3: 难度因子增加
- 质量 < 3: 重置为第一次复习

## 使用示例

### JavaScript (浏览器)

```javascript
const API_URL = 'http://localhost:3000/api';
const token = 'your-jwt-token';

// 获取卡牌组
fetch(`${API_URL}/decks`, {
  headers: {
    'Authorization': `Bearer ${token}`
  }
})
.then(res => res.json())
.then(decks => console.log(decks));

// 创建卡片
fetch(`${API_URL}/cards`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    deckId: 1,
    front: 'test',
    back: '测试'
  })
})
.then(res => res.json())
.then(card => console.log(card));
```

### Python

```python
import requests

API_URL = 'http://localhost:3000/api'
token = 'your-jwt-token'
headers = {
    'Authorization': f'Bearer {token}',
    'Content-Type': 'application/json'
}

# 获取待复习卡片
response = requests.get(f'{API_URL}/reviews/due', headers=headers)
due_cards = response.json()
print(due_cards)
```
