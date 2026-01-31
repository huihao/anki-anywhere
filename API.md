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
