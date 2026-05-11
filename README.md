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

- **Node.js** >= 18.x
- **Rust** >= 1.70（推荐使用 rustup 管理）
- **操作系统**: Windows 10/11, macOS 10.15+, Linux

### Rust 环境配置（Windows）

如果遇到 `rustup could not choose a version of cargo to run` 错误，请按以下步骤配置：

1. 确认 Rust 工具链已安装（通常在 `E:\rust` 或 `C:\Users\<用户名>\.rustup`）
2. 设置环境变量：
   ```powershell
   $env:RUSTUP_HOME="E:\rust\.rustup"
   $env:CARGO_HOME="E:\rust\.cargo"
   $env:PATH="E:\rust\.cargo\bin;$env:PATH"
   ```
3. 验证配置：
   ```powershell
   rustc --version
   cargo --version
   ```

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

### 项目运行检查清单

- [ ] Node.js 版本 >= 18.x
- [ ] Rust 工具链已配置（`rustup show` 显示 active toolchain）
- [ ] 工作目录在项目根目录
- [ ] 已安装所有依赖（`npm install`）

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
| **文档版本历史** | 自动保存版本、版本对比、版本恢复回溯 |
| **文档分类** | 创建/编辑/删除分类、分类颜色标记、按分类筛选文档 |
| **文档标签** | 创建/编辑/删除标签、标签颜色标记、多标签关联 |
| **任务分配** | 将任务分配给团队成员、负责人显示、成员管理 |
| **链接分享** | 一键生成分享链接、复制到剪贴板功能 |
| **本地存储** | 所有数据通过 localStorage 本地持久化存储 |
| **现代化 UI** | 深色侧边栏、卡片式布局、渐变按钮、毛玻璃对话框、流畅动画 |

### 🔨 开发中

- [ ] AI 辅助写作功能
- [ ] 实时协作编辑
- [ ] 多平台支持（macOS、Linux）

## 🛠️ 技术栈

### 前端

| 组件 | 技术 | 版本 | 说明 |
|------|------|------|------|
| 框架 | Tauri 2 + Vue 3 | Tauri 2.x, Vue 3.5+ | 跨平台桌面应用框架 + 渐进式前端框架 |
| 构建工具 | Vite + Cargo | Vite 6.x | 快速构建工具，支持热更新 |
| 包管理 | npm | 10.x+ | Node.js 包管理器 |
| 路由 | Vue Router | 4.x | Vue 官方路由管理器 |
| 状态管理 | Pinia | 2.x | Vue 官方状态管理库 |
| 编辑器 | Tiptap | 2.x | 基于 ProseMirror 的富文本编辑器 |
| 语法高亮 | lowlight + highlight.js | 最新版 | 支持 13+ 编程语言语法高亮 |

### 后端

| 组件 | 技术 | 版本 | 说明 |
|------|------|------|------|
| 语言 | Rust | 1.70+ | 系统级编程语言，安全高效 |
| Web 服务 | Salvo | 0.65+ | Rust 异步 Web 框架 |

### 基础设施

| 组件 | 技术 | 状态 | 说明 |
|------|------|------|------|
| 数据库 | PostgreSQL | 计划中 | 关系型数据库 |
| 容器化 | Docker | 计划中 | 应用容器化部署 |
| 实时协作 | Yjs | 计划中 | 实时协同编辑库 |

### 开发工具

- **IDE**: Visual Studio Code + Rust Analyzer
- **代码格式化**: Prettier + rustfmt
- **调试**: Tauri DevTools

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
│   │   │   ├── documentVersionService.ts
│   │   │   ├── categoryService.ts
│   │   │   ├── tagService.ts
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

### 贡献流程

1. **Fork 项目** - 点击 GitHub 页面的 Fork 按钮
2. **克隆仓库** - `git clone https://github.com/<你的用户名>/AuroraDocs.git`
3. **创建分支** - `git checkout -b feature/your-feature-name`
4. **提交代码** - `git commit -m "feat: 添加新功能"`
5. **推送分支** - `git push origin feature/your-feature-name`
6. **创建 PR** - 在 GitHub 上创建 Pull Request

### 代码规范

- **JavaScript/TypeScript**: 使用 Prettier 进行代码格式化
- **Rust**: 使用 rustfmt 进行代码格式化
- **提交信息**: 遵循 [Conventional Commits](https://www.conventionalcommits.org/) 规范

### 开发建议

- 先查看现有 Issue，了解项目现状和待解决问题
- 对于新功能，建议先创建 Issue 讨论设计方案
- PR 请关联相关 Issue，便于追踪

## 📄 许可证

本项目采用 [AGPL-3.0](https://opensource.org/licenses/AGPL-3.0) 开源许可证。

## 📞 联系方式

如有问题或建议，欢迎通过以下方式联系：

- **GitHub Issues**: [提交 Issue](https://github.com/AuroraDocs/AuroraDocs/issues)
- **邮件**: aurora-docs@example.com

---

⭐ 如果这个项目对你有帮助，请给它一个 Star！
