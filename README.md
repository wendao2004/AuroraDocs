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

| 功能 | 状态 | 说明 |
|------|------|------|
| Markdown 编辑器 | ✅ 已完成 | 基于 Tiptap 的富文本编辑，支持多种格式 |
| 文档管理 | 🔨 开发中 | 文章列表、分类与检索 |
| 团队管理 | 🔨 开发中 | 成员添加、角色分配 |
| 任务管理 | 📋 计划中 | 任务创建、分配与进度跟踪 |
| 链接分享 | 📋 计划中 | 一键生成分享链接 |

## 🛠️ 技术栈

### 前端

- **框架**: Tauri 2 + Vue 3
- **构建工具**: Vite + Cargo
- **包管理**: pnpm
- **路由**: Vue Router
- **状态管理**: Pinia
- **编辑器**: Tiptap (ProseMirror)

### 后端

- **语言**: Rust
- **Web 服务**: Salvo

### 基础设施

- **数据库**: PostgreSQL
- **容器化**: Docker
- **实时协作**: Yjs

## 📁 项目结构

```
AuroraDocs/
├── src/                      # 前端源代码
│   ├── components/           # Vue 组件
│   │   ├── editor/          # 编辑器组件
│   │   └── layout/          # 布局组件
│   ├── models/              # 数据模型
│   ├── pages/                # 页面组件
│   │   ├── DocumentPage.vue  # 文档管理页
│   │   ├── EditorPage.vue   # 编辑器页
│   │   └── TeamPage.vue     # 团队管理页
│   ├── router/               # 路由配置
│   ├── services/             # API 服务
│   ├── stores/               # Pinia 状态管理
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
