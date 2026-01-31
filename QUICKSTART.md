# Anki Anywhere - 快速开始指南

## 5分钟快速体验

本指南将帮助你在5分钟内快速启动Anki Anywhere系统。

### 前提条件

确保你的系统已安装：
- [Node.js](https://nodejs.org/) (v16或更高)
- [PostgreSQL](https://www.postgresql.org/download/) (v12或更高)
- Git

### 步骤1: 克隆项目

```bash
git clone https://github.com/huihao/anki-anywhere.git
cd anki-anywhere
```

### 步骤2: 设置数据库

```bash
# 创建数据库
createdb anki_anywhere

# 运行数据库初始化脚本
psql -d anki_anywhere -f backend/src/config/schema.sql
```

### 步骤3: 配置后端

```bash
cd backend

# 安装依赖
npm install

# 创建环境配置文件
cp .env.example .env

# 编辑 .env 文件
# 使用你喜欢的编辑器修改数据库连接信息
nano .env
```

**.env 示例配置**:
```env
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=anki_anywhere
DB_USER=你的用户名
DB_PASSWORD=你的密码
JWT_SECRET=随机生成一个强密钥
```

### 步骤4: 启动后端

```bash
# 在 backend 目录下
npm run dev
```

✅ 后端现在应该在 `http://localhost:3000` 运行

### 步骤5: 启动前端

打开新的终端窗口：

```bash
cd frontend

# 安装依赖
npm install

# 启动开发服务器
npm start
```

✅ 前端将在浏览器中自动打开（通常是 `http://localhost:3001`）

### 步骤6: 安装浏览器插件

#### Chrome/Edge:
1. 打开 `chrome://extensions/`
2. 开启右上角的"开发者模式"
3. 点击"加载已解压的扩展程序"
4. 选择 `browser-extension` 文件夹
5. ✅ 插件已安装！

#### Firefox:
1. 打开 `about:debugging#/runtime/this-firefox`
2. 点击"临时加载附加组件"
3. 选择 `browser-extension/manifest.json`
4. ✅ 插件已安装！

### 步骤7: 配置插件

1. 点击浏览器工具栏中的Anki Anywhere图标
2. 滚动到设置部分
3. 设置API地址: `http://localhost:3000/api`
4. 设置访问令牌: 暂时可以使用任意值（生产环境需要真实JWT令牌）
5. 点击"保存设置"

### 步骤8: 测试系统

#### 8.1 创建卡牌组
1. 在前端页面点击"创建新卡牌组"
2. 输入名称（例如："英语单词"）
3. 添加描述（可选）
4. 点击"创建"

#### 8.2 使用浏览器插件创建卡片
1. 在任意网页选择一段文字
2. 点击工具栏的Anki Anywhere图标
3. 选中的文字会自动填入"正面"
4. 填写"背面"（答案）
5. 选择卡牌组
6. 点击"保存卡片"
7. ✅ 卡片创建成功！

#### 8.3 在前端查看卡片
1. 回到前端管理页面
2. 点击刚创建的卡牌组
3. 查看卡片列表
4. 可以编辑或删除卡片

### 移动应用（可选）

#### iOS:
```bash
# 需要Mac和Xcode
open ios/AnkiAnywhere/AnkiAnywhere.xcodeproj

# 在Xcode中:
# 1. 选择模拟器或真机
# 2. 点击运行按钮
# 3. 在设置中配置API地址为你的服务器IP
```

#### Android:
```bash
# 使用Android Studio
# 1. 打开 android 文件夹
# 2. 等待Gradle同步
# 3. 点击运行按钮
# 4. 在设置中配置API地址
```

## 常见问题

### 问题1: 数据库连接失败
**错误**: `Error: connect ECONNREFUSED`

**解决方案**:
- 确认PostgreSQL正在运行: `pg_isready`
- 检查 `.env` 中的数据库配置
- 验证数据库是否已创建: `psql -l | grep anki_anywhere`

### 问题2: 前端无法连接后端
**错误**: `Network Error`

**解决方案**:
- 确认后端正在运行
- 检查端口是否正确（默认3000）
- 查看浏览器控制台的网络请求

### 问题3: 插件无法保存卡片
**错误**: `401 Unauthorized`

**解决方案**:
- 检查API地址是否正确
- 暂时可以修改后端代码临时禁用JWT验证进行测试
- 或者实现完整的用户认证系统

### 问题4: 端口冲突
**错误**: `Port 3000 is already in use`

**解决方案**:
```bash
# 方法1: 修改端口
# 编辑 backend/.env
PORT=3001

# 方法2: 停止占用端口的进程
# Mac/Linux:
lsof -ti:3000 | xargs kill
# Windows:
netstat -ano | findstr :3000
taskkill /PID <进程ID> /F
```

## 下一步

现在你已经成功启动了Anki Anywhere系统！

**建议下一步操作**:

1. 📚 阅读 [API.md](API.md) 了解完整API
2. 🚀 阅读 [DEPLOYMENT.md](DEPLOYMENT.md) 部署到生产环境
3. 💻 阅读 [DEVELOPMENT.md](DEVELOPMENT.md) 进行二次开发
4. 🔧 实现用户认证系统（当前仅有JWT验证框架）
5. 📱 在真机上测试移动应用

## 获取帮助

如果遇到问题：
1. 查看项目文档
2. 检查GitHub Issues
3. 提交新的Issue描述问题

## 自动化设置

如果你使用Linux/Mac，可以运行自动化设置脚本：

```bash
chmod +x setup.sh
./setup.sh
```

这将自动安装所有依赖并配置环境。

---

**祝你使用愉快！Happy Learning! 🎉**
