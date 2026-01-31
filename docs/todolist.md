# 开发 Todo List（完成度跟踪）

> 本文档用于记录 Phase 1 MVP 完成程度，便于本地跟踪。

## Phase 1（MVP）

### 1. FSRS Core（KMP）

- [ ] 初始化 Kotlin Multiplatform 模块
- [ ] 实现 Card 数据结构（state / stability / difficulty 等字段）
- [ ] 实现 next_review(card, rating, now) 接口
- [ ] 添加默认 FSRS 参数配置
- [ ] 添加核心算法单元测试

### 2. 本地数据库

- [ ] 定义 decks / cards / reviews 表结构
- [ ] iOS 端 SQLite + GRDB 初始化
- [ ] Android 端 Room 初始化
- [ ] 编写本地迁移策略

### 3. iOS（SwiftUI）

- [ ] 构建 Deck 列表页面
- [ ] 构建今日学习队列页面
- [ ] 构建学习页（翻卡 + 四按钮）
- [ ] 构建新建卡片页面
- [ ] 构建设置页（学习上限 / 算法选项）

### 4. Android（Compose）

- [ ] 构建 Deck 列表页面
- [ ] 构建今日学习队列页面
- [ ] 构建学习页（翻卡 + 四按钮）
- [ ] 构建新建卡片页面
- [ ] 构建设置页（学习上限 / 算法选项）

### 5. 学习流程

- [ ] 今日到期卡片查询逻辑（due_date <= today）
- [ ] 学习队列生成与展示
- [ ] 评分流程接入 FSRS 调度
- [ ] 写入 review 记录
- [ ] due_date / state 更新

### 6. 测试与质量

- [ ] FSRS 关键路径单元测试
- [ ] 评分顺序一致性回归测试
- [ ] due_date 单调性验证
- [ ] UI 交互测试计划（翻卡、快速评分）

### 7. 文档与规划

- [x] 开发计划文档初稿（PRD / TDD）
- [ ] 架构图或模块关系说明补充
- [ ] 里程碑复盘与下一阶段规划
