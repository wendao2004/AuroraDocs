# AuroraDocs 极光文档

[![License: AGPL-3.0](https://img.shields.io/badge/License-AGPL--3.0-blue.svg)](https://opensource.org/licenses/AGPL-3.0)
[![Platform](https://img.shields.io/badge/platform-Windows%20%7C%20macOS%20%7C%20Linux-yellow)](https://tauri.app/)
[![Vue.js](https://img.shields.io/badge/Vue-3.5-green)](https://vuejs.org/)
[![Tauri](https://img.shields.io/badge/Tauri-2.0-black)](https://tauri.app/)

AuroraDocs 是一款面向个人、团队及小型组织的**一体化知识协作与管理平台**，整合文章管理、计划跟踪、成员协同与 AI 辅助功能。

## 🎯 项目定位

**开源、轻量、AI 原生的团队知识管理平台**，专为大学社团、大学生、个人开发者及小型团队设计，解决团队协作中"资料分散、操作繁琐、成本高昂"的痛点。

## ✨ 核心价值

- **零成本启动**：基础功能完全开源，无需付费即可使用
- **极简上手**：10 分钟掌握核心功能，告别专业软件学习成本
- **AI 赋能**：自然语言操作（如"写一篇活动策划文档"），替代多工具切换
- **完全自主**：文章/数据自托管，公网发布仅需自建服务器，无厂商锁定

## 🚀 快速开始

### 环境要求

- Node.js >= 18
- Rust >= 1.70
- Windows 10/11, macOS 10.15+, Linux

### 安装依赖

```bash
npm install
```

### 开发模式

```bash
npm run tauri dev
```

### 构建应用

```bash
npm run tauri build
```

## 📦 第一阶段功能 (MVP)

> 当前版本处于第一阶段开发，目标是实现 Windows 平台可运行的核心功能原型。

### ✅ 已完成

| 功能 | 说明 |
|------|------|
| **富文本编辑器** | 基于 Tiptap 的编辑器，支持加粗、斜体、删除线、行内代码、多级标题、有序/无序列表、引用块、撤销/重做 |
| **代码块高亮** | 支持 13+ 编程语言（JavaScript、TypeScript、Python、Java、C++、Rust、Go 等）的语法高亮，macOS 风格语言选择器 |
| **文档管理** | 完整的 CRUD 操作：创建、编辑、删除文档，支持本地 localStorage 持久化存储 |
| **团队管理** | 创建团队、添加/移除成员、成员角色管理（所有者/管理员/成员） |
| **任务管理** | 创建/编辑/删除任务、任务优先级（低/中/高）、任务状态（待处理/进行中/已完成）、截止日期、状态切换、筛选过滤、统计看板 |
| **链接分享** | 一键生成分享链接、复制到剪贴板功能 |
| **本地存储** | 所有数据通过 localStorage 本地持久化存储 |
| **现代化 UI** | 深色侧边栏、卡片式布局、渐变按钮、毛玻璃对话框、流畅动画 |

### 🔨 开发中

- [ ] 文档版本历史与回溯
- [ ] 多文档分类与标签
- [ ] 任务分配给团队成员

## 🛠️ 技术栈

### 前端

- **框架**: Tauri 2 + Vue 3
- **构建工具**: Vite + Cargo
- **包管理**: npm
- **路由**: Vue Router
- **状态管理**: Pinia
- **编辑器**: Tiptap (ProseMirror)
- **语法高亮**: lowlight + highlight.js

### 后端

- **语言**: Rust
- **Web 服务**: Salvo

### 基础设施

- **数据库**: PostgreSQL (计划中)
- **容器化**: Docker (计划中)
- **实时协作**: Yjs (计划中)

## 📁 项目结构

```
AuroraDocs/
├── src/                      # 前端源代码
│   ├── assets/               # 静态资源
│   │   └── styles/          # 全局样式
│   │       └── global.css
│   ├── components/           # Vue 组件
│   │   ├── editor/          # 编辑器组件
│   │   │   ├── TiptapEditor.vue
│   │   │   └── CodeBlockComponent.vue
│   │   └── layout/          # 布局组件
│   │       ├── AppLayout.vue
│   │       └── TitleBar.vue
│   ├── models/              # 数据模型
│   │   ├── Document.ts
│   │   ├── Task.ts
│   │   ├── Team.ts
│   │   └── User.ts
│   ├── pages/               # 页面组件
│   │   ├── DocumentPage.vue # 文档管理页
│   │   ├── EditorPage.vue   # 编辑器页
│   │   ├── TaskPage.vue     # 任务管理页
│   │   └── TeamPage.vue     # 团队管理页
│   ├── router/               # 路由配置
│   │   └── index.ts
│   ├── services/             # 业务服务
│   │   ├── storage/         # 存储服务
│   │   │   ├── documentService.ts
│   │   │   ├── localStorage.ts
│   │   │   ├── taskService.ts
│   │   │   └── teamService.ts
│   │   └── shareService.ts   # 分享服务
│   ├── stores/               # Pinia 状态管理
│   │   └── editorStore.ts
│   ├── App.vue               # 根组件
│   └── main.ts               # 入口文件
├── src-tauri/                # Tauri/Rust 后端
│   ├── src/                  # Rust 源代码
│   ├── capabilities/         # 权限配置
│   ├── icons/               # 应用图标
│   ├── Cargo.toml           # Rust 依赖
│   └── tauri.conf.json      # Tauri 配置
├── public/                   # 静态资源
├── index.html               # HTML 入口
├── package.json             # Node 依赖
├── vite.config.ts           # Vite 配置
└── tsconfig.json            # TypeScript 配置
```

## 🔮 未来规划

### 第二阶段：基础版本（6 个月）

- [ ] 多平台支持（Windows、macOS、Linux）
- [ ] 实时协作编辑（Yjs 集成）
- [ ] 基础 AI 功能（OpenAI API 接入）
- [ ] 团队静态站点生成器
- [ ] 离线模式

### 第三阶段：功能完善版（1 年）

- [ ] 移动端适配
- [ ] 第三方登录
- [ ] 网盘与文件管理
- [ ] 内置聊天系统
- [ ] 任务高级视图（看板、甘特图）

### 第四阶段：成熟版本（2 年）

- [ ] AI Agent 全功能集成
- [ ] 插件系统
- [ ] 企业级功能
- [ ] API 开放平台

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

本项目采用 [AGPL-3.0](https://opensource.org/licenses/AGPL-3.0) 开源许可证。
