# Anki Anywhere 部署指南

## 阿里云部署步骤

### 1. 准备工作

#### 1.1 购买阿里云服务
- ECS服务器（推荐：2核4G，Ubuntu 20.04 LTS）
- RDS PostgreSQL实例（推荐：PostgreSQL 13+）
- 域名（可选，推荐）

#### 1.2 配置安全组
在ECS安全组中开放以下端口：
- 22 (SSH)
- 80 (HTTP)
- 443 (HTTPS)
- 3000 (后端API，可选)

### 2. 数据库设置

#### 2.1 配置RDS PostgreSQL
1. 登录阿里云控制台
2. 进入RDS管理页面
3. 创建数据库账号
4. 创建数据库 `anki_anywhere`
5. 设置白名单，添加ECS服务器IP

#### 2.2 初始化数据库
```bash
# 连接到RDS
psql -h your-rds-host.pg.rds.aliyuncs.com -U username -d anki_anywhere

# 运行schema.sql
\i backend/src/config/schema.sql
```

### 3. 后端部署

#### 3.1 安装依赖
```bash
# 连接到ECS
ssh root@your-ecs-ip

# 安装Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# 安装PM2
sudo npm install -g pm2

# 安装Git
sudo apt-get install git
```

#### 3.2 部署后端
```bash
# 克隆代码
cd /opt
git clone <your-repo-url> anki-anywhere
cd anki-anywhere/backend

# 安装依赖
npm install

# 配置环境变量
cp .env.example .env
nano .env
# 填写以下内容：
# PORT=3000
# DB_HOST=your-rds-host.pg.rds.aliyuncs.com
# DB_PORT=5432
# DB_NAME=anki_anywhere
# DB_USER=your_username
# DB_PASSWORD=your_password
# JWT_SECRET=generate_a_random_secret_here

# 使用PM2启动
pm2 start src/index.js --name anki-backend
pm2 save
pm2 startup
```

### 4. Nginx配置

#### 4.1 安装Nginx
```bash
sudo apt-get update
sudo apt-get install nginx
```

#### 4.2 配置反向代理
```bash
sudo nano /etc/nginx/sites-available/anki-anywhere
```

添加以下内容：
```nginx
server {
    listen 80;
    server_name your-domain.com;  # 替换为你的域名

    # API反向代理
    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    # 前端静态文件
    location / {
        root /var/www/anki-anywhere;
        try_files $uri $uri/ /index.html;
    }
}
```

启用配置：
```bash
sudo ln -s /etc/nginx/sites-available/anki-anywhere /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 5. 前端部署

```bash
# 在本地构建前端
cd frontend
echo "REACT_APP_API_URL=https://your-domain.com/api" > .env
npm run build

# 上传到服务器
scp -r build/* root@your-ecs-ip:/var/www/anki-anywhere/
```

### 6. 启用HTTPS (Let's Encrypt)

```bash
# 安装Certbot
sudo apt-get install certbot python3-certbot-nginx

# 获取证书
sudo certbot --nginx -d your-domain.com

# 自动续期
sudo certbot renew --dry-run
```

### 7. 移动应用配置

#### 7.1 iOS应用
1. 在Xcode中打开项目
2. 修改API URL为 `https://your-domain.com/api`
3. 配置签名证书
4. Archive并上传到App Store Connect

#### 7.2 Android应用
1. 在Android Studio中打开项目
2. 修改默认API URL
3. 生成签名密钥
4. 构建Release APK
5. 上传到Google Play Console

### 8. 监控和维护

#### 8.1 查看后端日志
```bash
pm2 logs anki-backend
```

#### 8.2 重启服务
```bash
pm2 restart anki-backend
```

#### 8.3 数据库备份
```bash
# 设置自动备份脚本
nano /opt/backup-db.sh
```

```bash
#!/bin/bash
BACKUP_DIR="/opt/backups"
DATE=$(date +%Y%m%d_%H%M%S)
mkdir -p $BACKUP_DIR

pg_dump -h your-rds-host.pg.rds.aliyuncs.com \
        -U username \
        -d anki_anywhere \
        > $BACKUP_DIR/anki_anywhere_$DATE.sql

# 保留最近7天的备份
find $BACKUP_DIR -name "*.sql" -mtime +7 -delete
```

```bash
chmod +x /opt/backup-db.sh

# 添加到crontab（每天凌晨2点备份）
crontab -e
# 添加：0 2 * * * /opt/backup-db.sh
```

## 性能优化建议

1. **数据库优化**
   - 在RDS中启用慢查询日志
   - 定期分析查询性能
   - 适当增加连接池大小

2. **CDN加速**
   - 使用阿里云CDN加速前端静态资源
   - 配置合适的缓存策略

3. **应用优化**
   - 使用Redis缓存热点数据
   - 启用Gzip压缩
   - 优化API响应时间

4. **安全加固**
   - 定期更新系统补丁
   - 配置防火墙规则
   - 启用fail2ban防止暴力破解
   - 使用阿里云安全组限制访问

## 故障排查

### 数据库连接失败
- 检查RDS白名单配置
- 验证数据库凭据
- 确认网络连通性

### API请求失败
- 检查Nginx配置
- 查看PM2日志
- 验证CORS设置

### 前端加载失败
- 检查静态文件路径
- 验证API_URL配置
- 查看浏览器控制台错误

## 成本估算（阿里云）

- ECS (2核4G): ~100元/月
- RDS PostgreSQL (基础版): ~150元/月
- 域名: ~60元/年
- SSL证书: 免费 (Let's Encrypt)
- 流量费用: 按实际使用计费

**总计**: 约250-300元/月
