#!/bin/bash

echo "=== Anki Anywhere 开发环境设置 ==="

# 检查Node.js
if ! command -v node &> /dev/null; then
    echo "错误: 未安装Node.js。请从 https://nodejs.org/ 下载安装。"
    exit 1
fi

echo "✓ Node.js 版本: $(node -v)"

# 检查PostgreSQL
if ! command -v psql &> /dev/null; then
    echo "警告: 未安装PostgreSQL。请从 https://www.postgresql.org/download/ 下载安装。"
else
    echo "✓ PostgreSQL 已安装"
fi

# 安装后端依赖
echo ""
echo "=== 安装后端依赖 ==="
cd backend
npm install
if [ $? -eq 0 ]; then
    echo "✓ 后端依赖安装成功"
else
    echo "✗ 后端依赖安装失败"
    exit 1
fi

# 复制环境变量文件
if [ ! -f .env ]; then
    cp .env.example .env
    echo "✓ 已创建 backend/.env 文件，请编辑并填入数据库配置"
fi

cd ..

# 安装前端依赖
echo ""
echo "=== 安装前端依赖 ==="
cd frontend
npm install
if [ $? -eq 0 ]; then
    echo "✓ 前端依赖安装成功"
else
    echo "✗ 前端依赖安装失败"
    exit 1
fi

cd ..

echo ""
echo "=== 设置完成 ==="
echo ""
echo "下一步操作："
echo "1. 创建PostgreSQL数据库: createdb anki_anywhere"
echo "2. 运行数据库初始化脚本: psql -d anki_anywhere -f backend/src/config/schema.sql"
echo "3. 编辑 backend/.env 文件，配置数据库连接信息"
echo "4. 启动后端: cd backend && npm run dev"
echo "5. 启动前端: cd frontend && npm start"
echo "6. 安装浏览器插件: 在Chrome中加载 browser-extension 文件夹"
echo ""
echo "详细文档请查看 README.md"
