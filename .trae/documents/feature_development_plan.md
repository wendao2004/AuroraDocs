# AuroraDocs 功能开发计划

## 项目概述
AuroraDocs 是一个基于 Vue 3 + Tauri 2 + Rust 的一体化知识协作与管理平台。本文档规划了三个核心功能的实现步骤。

---

## 功能一：文档版本历史与回溯

### 现状分析
✅ **已实现**：
- `documentVersionService` 已完整实现版本创建、获取、恢复等核心逻辑
- `AppLayout.vue` 已包含版本历史面板 UI
- 版本对比、差异显示功能已实现
- 自动保存和手动保存版本功能已集成

### 需要完善
✅ 该功能已基本可用，无需额外开发

---

## 功能二：多文档分类与标签

### 1. 数据模型扩展 (`src/models/Document.ts`)
- 新增 `Category` 接口（分类）
- 新增 `Tag` 接口（标签）
- 扩展 `Document` 接口，添加 `categoryId` 和 `tags` 字段
- 更新 `DocumentListItem` 接口

### 2. 存储服务扩展 (`src/services/storage/localStorage.ts`)
- 添加 `CATEGORIES` 和 `TAGS` 存储键
- 确保数据持久化

### 3. 新建服务模块 (`src/services/storage/categoryService.ts`)
- `getAll()` - 获取所有分类
- `getById(id)` - 获取单个分类
- `create(name, color)` - 创建分类
- `update(id, updates)` - 更新分类
- `delete(id)` - 删除分类

### 4. 新建服务模块 (`src/services/storage/tagService.ts`)
- `getAll()` - 获取所有标签
- `getById(id)` - 获取单个标签
- `create(name, color)` - 创建标签
- `update(id, updates)` - 更新标签
- `delete(id)` - 删除标签

### 5. 更新文档服务 (`src/services/storage/documentService.ts`)
- 扩展 `create()` 支持分类和标签
- 扩展 `update()` 支持分类和标签
- 添加 `getByCategory(categoryId)` - 按分类筛选文档
- 添加 `getByTag(tagId)` - 按标签筛选文档
- 添加 `search(keyword)` - 搜索文档

### 6. UI 组件开发

#### 6.1 侧边栏分类标签面板 (AppLayout.vue)
- 在文档列表上方添加分类筛选区
- 显示所有分类，点击可筛选
- 显示常用标签云
- 添加"管理分类/标签"按钮

#### 6.2 文档分类标签管理对话框
- 分类管理：增删改分类，支持颜色选择
- 标签管理：增删改标签，支持颜色选择
- 支持拖拽排序

#### 6.3 文档列表增强 (DocumentPage.vue)
- 显示文档所属分类
- 显示文档标签
- 添加筛选下拉框（按分类、按标签）
- 添加搜索框

#### 6.4 文档编辑页增强 (AppLayout.vue)
- 在工具栏添加分类选择器
- 在工具栏添加标签输入框
- 支持标签自动补全

---

## 功能三：任务分配给团队成员

### 1. 任务模型更新 (`src/models/Task.ts`)
- 确保 `assigneeId` 和 `assigneeName` 字段完整
- 优化类型定义

### 2. 任务服务增强 (`src/services/storage/taskService.ts`)
- 更新 `getAll()` 正确加载并返回 `assigneeName`
- 添加 `getByAssignee(userId)` - 按负责人筛选任务
- 更新 `create()` 和 `update()` 确保负责人信息正确保存

### 3. 团队成员服务增强 (`src/services/storage/teamService.ts`)
- 添加 `getMemberById(memberId)` - 获取单个成员
- 添加 `updateMember(memberId, updates)` - 更新成员信息

### 4. UI 更新

#### 4.1 任务页增强 (TaskPage.vue)
- 任务创建/编辑对话框中添加"负责人"下拉选择器
- 显示所有团队成员供选择
- 任务卡片显示负责人头像或姓名
- 添加"按负责人筛选"功能

#### 4.2 任务统计看板增强
- 添加按负责人的任务分布统计
- 显示每个人的任务完成率

---

## 实施步骤

### 阶段一：文档分类与标签
1. 更新数据模型
2. 实现分类和标签服务
3. 更新文档服务
4. 开发 UI 组件
5. 测试功能

### 阶段二：任务分配
1. 更新任务服务
2. 更新 UI 组件
3. 测试功能

---

## 涉及文件清单

### 新增文件
- `src/services/storage/categoryService.ts`
- `src/services/storage/tagService.ts`

### 修改文件
- `src/models/Document.ts`
- `src/models/Task.ts`
- `src/services/storage/localStorage.ts`
- `src/services/storage/documentService.ts`
- `src/services/storage/taskService.ts`
- `src/services/storage/teamService.ts`
- `src/components/layout/AppLayout.vue`
- `src/pages/DocumentPage.vue`
- `src/pages/TaskPage.vue`

---

## 注意事项
1. 保持代码风格一致
2. 遵循现有 TypeScript 类型定义规范
3. 确保 localStorage 数据向后兼容
4. UI 设计保持与现有风格一致
