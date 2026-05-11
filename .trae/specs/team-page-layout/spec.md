# 团队页面排版优化 - PRD

## Overview
- **Summary**: 优化团队详情页的头部排版，解决团队描述文字过长时挤压操作按钮的问题
- **Purpose**: 提升团队页面的视觉体验，确保在不同屏幕尺寸下按钮都能正常显示
- **Target Users**: 所有使用团队管理功能的用户

## Goals
- 优化 `.detail-header` 的布局，避免描述文字挤压按钮
- 确保在小屏幕或长描述情况下按钮仍可正常点击
- 保持整体设计风格一致

## Non-Goals (Out of Scope)
- 不修改其他页面的布局
- 不改变按钮的功能和样式

## Background & Context
当前布局使用 `display: flex; justify-content: space-between; align-items: center;`，当团队描述过长时，按钮会被挤压甚至被挤出可视区域。

## Functional Requirements
- **FR-1**: 团队描述过长时，按钮区域不应被挤压
- **FR-2**: 在小屏幕上，按钮应自动换行到标题下方
- **FR-3**: 标题区域应有最大宽度限制

## Non-Functional Requirements
- **NFR-1**: 响应式设计，适配不同屏幕尺寸
- **NFR-2**: 过渡动画流畅自然

## Constraints
- **Technical**: 基于 Vue 3 + CSS，需保持现有设计风格
- **Dependencies**: 使用现有的 CSS 变量和组件样式

## Acceptance Criteria

### AC-1: 长描述不挤压按钮
- **Given**: 团队描述包含超过50个字符
- **When**: 查看团队详情页
- **Then**: 描述文字自动换行，按钮保持正常尺寸
- **Verification**: `programmatic`

### AC-2: 小屏幕响应式布局
- **Given**: 窗口宽度小于768px
- **When**: 查看团队详情页
- **Then**: 按钮区域自动换行到标题下方
- **Verification**: `human-judgment`

### AC-3: 最大宽度限制
- **Given**: 团队名称和描述都很长
- **When**: 查看团队详情页
- **Then**: 标题区域最大宽度不超过容器的70%
- **Verification**: `programmatic`

## Open Questions
- [ ] 是否需要添加更多的响应式断点？

## Implementation Plan

### Task 1: 修改 `.detail-header` 的布局样式
- **Priority**: P0
- **Depends On**: None
- **Description**: 
  - 将 `align-items: center` 改为 `align-items: flex-start`
  - 添加 `flex-wrap: wrap` 允许换行
  - 设置 `gap` 间距
- **Acceptance Criteria Addressed**: AC-1, AC-2
- **Test Requirements**:
  - `programmatic`: 验证 flex-wrap 属性已设置
  - `human-judgment`: 在不同屏幕尺寸下验证布局效果

### Task 2: 设置标题区域的最大宽度
- **Priority**: P0
- **Depends On**: Task 1
- **Description**: 
  - 给 `.detail-title` 设置 `max-width: 70%`
  - 设置描述文字 `overflow: hidden` 和 `text-overflow: ellipsis`（可选）
- **Acceptance Criteria Addressed**: AC-3
- **Test Requirements**:
  - `programmatic`: 验证 max-width 属性已设置

### Task 3: 调整按钮区域的对齐方式
- **Priority**: P1
- **Depends On**: Task 1
- **Description**: 
  - 设置 `.detail-actions` 在换行时右对齐
  - 保持按钮的垂直间距
- **Acceptance Criteria Addressed**: AC-2
- **Test Requirements**:
  - `human-judgment`: 验证按钮在换行后仍保持良好的视觉效果

## Verification Checklist
- [ ] `.detail-header` 已添加 `flex-wrap: wrap`
- [ ] `.detail-title` 已设置 `max-width: 70%`
- [ ] 长描述情况下按钮仍可正常点击
- [ ] 小屏幕下按钮自动换行
- [ ] 整体布局保持美观一致