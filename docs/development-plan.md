# Anki-like 移动端应用开发计划（iOS + Android 原生）

> 目标：实现一个**原生 iOS + 原生 Android** 的间隔重复学习 App，在功能与学习效果上对标 Anki 的核心能力，算法层采用 **FSRS（Free Spaced Repetition Scheduler）**。

---

## 一、产品目标与范围界定

### 1. 核心目标（MVP）

必须支持的功能：

* 基于卡片（Front / Back）的学习模型
* 间隔重复调度（FSRS）
* 四按钮反馈机制：Again / Hard / Good / Easy
* 离线可用（本地数据库）
* 原生 iOS 与原生 Android，体验一致

### 2. 第一阶段明确不做

* 社区牌组 / 市场
* 富文本与复杂卡片模板
* 插件系统
* Web 端
* 多设备冲突解决

---

## 二、算法设计

### 1. 为什么选择 FSRS

* SM-2：规则驱动，难以个性化
* FSRS：概率模型，已成为 Anki 事实标准
* 支持参数训练与长期演进

**第一阶段策略**：

* 使用官方默认 FSRS 参数
* 固定目标回忆概率（如 90%）
* 不启用个性化训练，仅预留接口

---

### 2. 卡片数据模型（算法层）

```text
Card
├── id
├── deck_id
├── front
├── back
├── state: New | Learning | Review | Relearning
├── stability (S)
├── difficulty (D)
├── due_date
├── last_reviewed_at
├── lapse_count
├── review_count
```

### 3. 算法核心接口

```text
next_review(card, rating, now) -> updated_card
```

要求：

* 与 UI / 平台无关
* 可单元测试
* 可被多端复用

---

### 4. 算法模块复用方案

**推荐：Kotlin Multiplatform（KMP）**

* Android：直接调用
* iOS：编译为 Framework
* 算法只实现一次

备选方案：

* Rust + FFI
* C++

不推荐：

* iOS / Android 各自重写算法

---

## 三、整体系统架构

```text
┌────────────┐
│   UI层     │  SwiftUI / Compose
└─────┬──────┘
      │
┌─────▼──────┐
│ ViewModel  │  MVVM
└─────┬──────┘
      │
┌─────▼──────┐
│ Domain层   │  学习流程 / 调度逻辑
└─────┬──────┘
      │
┌─────▼──────┐
│ FSRS Core  │  Kotlin Multiplatform
└─────┬──────┘
      │
┌─────▼──────┐
│ Local DB   │  SQLite
└────────────┘
```

---

## 四、客户端实现

### 1. iOS（原生）

**技术栈**

| 模块  | 技术                |
| --- | ----------------- |
| UI  | SwiftUI           |
| 架构  | MVVM              |
| 数据库 | SQLite + GRDB     |
| 并发  | Swift Concurrency |
| 算法  | KMP Framework     |

**核心页面**

1. Deck 列表
2. 今日学习队列
3. 学习页（翻卡 + 四按钮）
4. 新建卡片
5. 设置页（学习上限 / 算法选项）

---

### 2. Android（原生）

**技术栈**

| 模块  | 技术                |
| --- | ----------------- |
| UI  | Jetpack Compose   |
| 架构  | MVVM              |
| 数据库 | Room              |
| 并发  | Kotlin Coroutines |
| 算法  | KMP Module        |

---

## 五、本地数据库设计

### 1. decks 表

```sql
id TEXT PRIMARY KEY
name TEXT
parent_id TEXT
```

### 2. cards 表

```sql
id TEXT PRIMARY KEY
deck_id TEXT
front TEXT
back TEXT
state TEXT
stability REAL
difficulty REAL
due_date INTEGER
last_reviewed_at INTEGER
```

### 3. reviews 表（为训练与同步预留）

```sql
id TEXT PRIMARY KEY
card_id TEXT
rating INTEGER
review_time INTEGER
```

---

## 六、学习流程（时序）

```text
启动 App
 → 查询 due_date <= today
 → 生成今日学习队列
 → 展示卡片
 → 用户翻卡并评分
 → 调用 FSRS
 → 更新 card 状态
 → 写入 review 记录
```

---

## 七、FSRS 参数管理策略

### 第一阶段

* 使用官方默认参数
* 不暴露训练能力

### 第二阶段

* 基于 review 表训练参数
* 本地或云端生成个性化模型
* 参数可导出 / 备份

---

## 八、测试策略

### 1. 算法测试（关键）

* 固定输入 → 固定输出
* 与 Anki 官方示例对比
* 极端间隔（天 → 年）验证

### 2. 回归测试

* 评分顺序一致性
* due_date 单调性

### 3. UI 测试

* 翻卡手势
* 快速连续评分

---

## 九、同步与账号系统（第二阶段）

### 同步模型

* Append-only review log
* Card 状态可由 review 重建
* 类似 event sourcing

### 云端建议

* REST / gRPC API
* PostgreSQL
* 只同步用户行为数据

---

## 十、开发里程碑

### Phase 1（4–6 周）

* FSRS KMP 实现
* iOS / Android MVP
* 本地学习闭环

### Phase 2（约 4 周）

* 多设备同步
* 参数训练
* 学习统计

### Phase 3（长期）

* 卡片模板系统
* 插件化架构
* 社区牌组

---

## 十一、后续可深入方向

* FSRS 数学模型与参数训练推导
* 最小 FSRS 调度器代码实现
* 学习型 App 的长期数据建模

---

**本文档可作为：**

* 产品需求文档（PRD）
* 技术设计文档（TDD）
* MVP 开发蓝本
