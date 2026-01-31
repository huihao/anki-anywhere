# Anki Anywhere 开发指南

## 开发环境要求

- Node.js 16+
- PostgreSQL 12+
- Git
- (可选) Xcode 14+ (iOS开发)
- (可选) Android Studio (Android开发)

## 项目架构

### 后端架构

```
backend/
├── src/
│   ├── config/          # 配置文件
│   │   ├── database.js  # 数据库连接配置
│   │   └── schema.sql   # 数据库架构
│   ├── models/          # 数据模型
│   │   ├── Deck.js      # 卡牌组模型
│   │   ├── Card.js      # 卡片模型
│   │   └── CardReview.js # 复习记录模型
│   ├── controllers/     # 控制器
│   │   ├── deckController.js
│   │   ├── cardController.js
│   │   └── reviewController.js
│   ├── routes/          # 路由
│   │   ├── decks.js
│   │   ├── cards.js
│   │   └── reviews.js
│   ├── middleware/      # 中间件
│   │   └── auth.js      # JWT认证中间件
│   └── index.js         # 入口文件
└── package.json
```

### 前端架构

```
frontend/
├── public/
│   └── index.html
├── src/
│   ├── components/      # React组件
│   │   ├── DeckList.js  # 卡牌组列表
│   │   └── CardList.js  # 卡片列表
│   ├── services/        # API服务
│   │   └── api.js       # API调用封装
│   ├── styles/          # 样式文件
│   │   └── App.css
│   ├── App.js           # 主应用组件
│   └── index.js         # 入口文件
└── package.json
```

### 浏览器插件架构

```
browser-extension/
├── manifest.json        # 插件配置文件
├── popup/               # 弹出窗口
│   ├── popup.html
│   └── popup.js
├── content/             # 内容脚本
│   ├── content.js
│   └── content.css
└── background/          # 后台脚本
    └── background.js
```

## 数据库设计

### users 表
- 用户基本信息
- 认证凭据

### decks 表
- 卡牌组信息
- 关联到用户

### cards 表
- 卡片内容（正面/背面）
- 关联到卡牌组
- 来源URL

### card_reviews 表
- 复习记录
- SM-2算法参数
- 下次复习日期

## SM-2算法详解

SuperMemo-2是一种广泛使用的间隔重复算法。

### 算法参数

1. **Ease Factor (EF)**: 难度因子，初始值2.5
2. **Interval (I)**: 复习间隔（天数）
3. **Repetitions (n)**: 连续正确回答次数

### 计算公式

```
如果 quality >= 3 (回答正确):
  if n == 0: I = 1
  if n == 1: I = 6
  if n >= 2: I = I * EF
  n = n + 1
else (回答错误):
  n = 0
  I = 1

EF = EF + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
if EF < 1.3: EF = 1.3
```

### 质量评分

- 0: 完全忘记
- 1: 错误，但想起来了
- 2: 错误，答案很明显
- 3: 正确，但很困难
- 4: 正确，有些犹豫
- 5: 完美记忆

## API开发规范

### 命名约定

- 路由：使用复数名词（/api/decks, /api/cards）
- 变量：使用驼峰命名法（deckId, userId）
- 数据库字段：使用下划线命名法（user_id, created_at）

### 错误处理

所有错误应返回一致的JSON格式：

```json
{
  "error": "错误消息"
}
```

### 响应格式

成功响应应直接返回数据或数据数组，不需要额外包装。

## 前端开发规范

### 组件设计

- 使用函数式组件和Hooks
- 保持组件单一职责
- 将可复用逻辑提取为自定义Hooks

### 状态管理

- 使用React的useState和useEffect
- 对于复杂状态可考虑useReducer
- API调用统一在services层处理

### 样式规范

- 使用CSS Modules或styled-components
- 保持样式的模块化
- 遵循BEM命名规范

## 移动应用开发

### iOS开发

使用SwiftUI进行UI开发：

- 声明式UI编程
- 使用@State和@ObservedObject管理状态
- 使用URLSession进行网络请求

### Android开发

使用Kotlin和Material Design：

- 使用协程处理异步操作
- RecyclerView展示列表
- OkHttp处理网络请求

## 测试

### 后端测试

```bash
cd backend
npm test
```

### 前端测试

```bash
cd frontend
npm test
```

## 调试技巧

### 后端调试

使用nodemon自动重启：
```bash
npm run dev
```

查看请求日志：
```javascript
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});
```

### 前端调试

使用React DevTools：
- 安装浏览器扩展
- 检查组件状态和props

### 浏览器插件调试

1. 打开插件页面
2. 点击"检查视图"
3. 使用Chrome DevTools

## 常见问题

### CORS错误

确保后端正确配置CORS：
```javascript
app.use(cors());
```

### 数据库连接失败

1. 检查PostgreSQL是否运行
2. 验证.env中的数据库配置
3. 确认数据库已创建

### JWT认证失败

1. 检查令牌格式
2. 验证JWT_SECRET配置
3. 确认令牌未过期

## 最佳实践

1. **代码审查**: 所有代码合并前进行审查
2. **版本控制**: 使用语义化版本号
3. **文档更新**: 代码变更时同步更新文档
4. **安全第一**: 永远不要提交敏感信息
5. **性能优化**: 定期进行性能分析和优化

## 发布流程

1. 测试所有功能
2. 更新版本号
3. 生成变更日志
4. 创建Git标签
5. 部署到生产环境
6. 监控错误日志

## 贡献指南

1. Fork项目
2. 创建特性分支
3. 提交更改
4. 推送到分支
5. 创建Pull Request

提交信息格式：
```
feat: 添加新功能
fix: 修复bug
docs: 更新文档
style: 代码格式调整
refactor: 重构代码
test: 添加测试
chore: 构建工具或辅助工具的变动
```
