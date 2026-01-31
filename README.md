# Anki Anywhere

一个全平台的Anki学习系统，包含浏览器插件、后端API、前端管理页面和移动应用（iOS和Android）。

## 项目结构

```
anki-anywhere/
├── backend/              # Node.js后端API
├── frontend/             # React前端管理页面
├── browser-extension/    # Chrome/Firefox浏览器插件
├── ios/                  # iOS原生应用 (Swift)
├── android/              # Android原生应用 (Kotlin)
└── README.md
```

## 功能特性

### 1. 浏览器插件
- ✅ 选择页面文字后快速创建Anki卡片
- ✅ 跨页面保留选中文本与上下文
- ✅ 右键菜单支持
- ✅ 选择卡牌组保存
- ✅ 自动保存来源URL与上下文
- ✅ 支持Chrome和Firefox

### 2. 后端API
- ✅ RESTful API设计
- ✅ PostgreSQL数据库
- ✅ 卡牌组管理
- ✅ 卡片管理
- ✅ SM-2间隔重复算法
- ✅ JWT认证

### 3. 前端管理页面
- ✅ 卡牌组创建和管理
- ✅ 卡片查看和编辑
- ✅ 响应式设计
- ✅ React构建

### 4. 移动应用
- ✅ iOS原生应用（Swift + SwiftUI）
- ✅ Android原生应用（Kotlin）
- ✅ SM-2学习算法
- ✅ 卡片复习功能
- ✅ 随机浏览卡片

## 快速开始

### 1. 数据库设置

首先需要创建PostgreSQL数据库：

```bash
# 连接到PostgreSQL
psql -U postgres

# 创建数据库
CREATE DATABASE anki_anywhere;

# 运行初始化脚本
\c anki_anywhere
\i backend/src/config/schema.sql
```

### 2. 后端设置

```bash
cd backend

# 安装依赖
npm install

# 配置环境变量
cp .env.example .env
# 编辑 .env 文件，填入你的数据库配置

# 启动开发服务器
npm run dev
```

后端服务将在 `http://localhost:3000` 运行。

### 3. 前端设置

```bash
cd frontend

# 安装依赖
npm install

# 启动开发服务器
npm start
```

前端将在 `http://localhost:3000` 运行（如果3000端口被占用，会自动选择其他端口）。

### 4. 浏览器插件安装

#### Chrome/Edge:
1. 打开 `chrome://extensions/`
2. 启用"开发者模式"
3. 点击"加载已解压的扩展程序"
4. 选择 `browser-extension` 文件夹

#### Firefox:
1. 打开 `about:debugging#/runtime/this-firefox`
2. 点击"临时加载附加组件"
3. 选择 `browser-extension/manifest.json`

### 5. iOS应用设置

1. 使用Xcode打开 `ios/AnkiAnywhere/AnkiAnywhere.xcodeproj`
2. 在设置中配置API地址
3. 编译并运行到模拟器或真机

### 6. Android应用设置

1. 使用Android Studio打开 `android` 文件夹
2. 等待Gradle同步完成
3. 在设置中配置API地址
4. 编译并运行到模拟器或真机

## API文档

详细API文档请查看 [API.md](API.md)

### 认证
所有API请求（除了健康检查）都需要JWT令牌认证：
```
Authorization: Bearer <your-jwt-token>
```

### 主要端点

#### 卡牌组 (Decks)
- `GET /api/decks` - 获取所有卡牌组
- `POST /api/decks` - 创建新卡牌组
- `GET /api/decks/:id` - 获取单个卡牌组
- `PUT /api/decks/:id` - 更新卡牌组
- `DELETE /api/decks/:id` - 删除卡牌组

#### 卡片 (Cards)
- `GET /api/cards/deck/:deckId` - 获取卡牌组的所有卡片
- `GET /api/cards/deck/:deckId/random?limit=10` - 获取随机卡片
- `POST /api/cards` - 创建新卡片
- `GET /api/cards/:id` - 获取单个卡片
- `PUT /api/cards/:id` - 更新卡片
- `DELETE /api/cards/:id` - 删除卡片

#### 复习 (Reviews)
- `POST /api/reviews/review` - 提交卡片复习
- `GET /api/reviews/due?deckId=<id>` - 获取待复习卡片
- `GET /api/reviews/stats/:cardId` - 获取卡片复习统计

## 间隔重复算法

本项目实现了SuperMemo 2 (SM-2)算法：

- **质量评分**: 0-5，其中0表示完全忘记，5表示完美记忆
- **间隔计算**: 基于上次的表现自动计算下次复习时间
- **难度因子**: 根据回答质量动态调整

## 技术栈

### 后端
- Node.js + Express
- PostgreSQL
- JWT认证
- CORS支持

### 前端
- React 18
- Axios
- CSS Modules

### 浏览器插件
- Manifest V3
- Vanilla JavaScript
- Chrome Extension APIs

### iOS
- Swift 5
- SwiftUI
- URLSession

### Android
- Kotlin
- Material Design
- OkHttp3
- Gson

## 部署

详细部署指南请查看 [DEPLOYMENT.md](DEPLOYMENT.md)

### 推荐配置（阿里云）
- ECS服务器（2核4G，Ubuntu 20.04 LTS）
- RDS PostgreSQL实例
- 域名 + SSL证书

## 安全建议

1. 使用强JWT密钥
2. 启用HTTPS
3. 实施请求频率限制
4. 定期备份数据库
5. 使用环境变量管理敏感信息
6. 在生产环境禁用CORS通配符

## 开发路线图

- [x] 后端API基础架构
- [x] 数据库设计与实现
- [x] SM-2算法实现
- [x] 浏览器插件开发
- [x] 前端管理页面
- [x] iOS应用
- [x] Android应用
- [ ] 用户认证系统
- [ ] 数据同步优化
- [ ] 离线支持
- [ ] 多语言支持
- [ ] 统计分析功能

## 贡献

欢迎提交Issue和Pull Request！

## 许可证

MIT License

## 联系方式

如有问题，请提交Issue或联系项目维护者。
