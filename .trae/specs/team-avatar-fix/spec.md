# 团队页面头像优化 - PRD

## Overview
- **Summary**: 修复团队页面头像大小不固定的问题，确保头像在各种布局情况下保持固定尺寸
- **Purpose**: 确保团队头像和成员头像始终保持一致的固定大小，不受布局变化影响
- **Target Users**: 所有使用团队管理功能的用户

## Goals
- 团队列表中的头像保持固定大小 44x44px
- 团队详情中的头像保持固定大小 64x64px
- 成员头像保持固定大小 40x40px

## Non-Goals (Out of Scope)
- 不修改头像的样式设计（颜色、边框等）
- 不修改其他页面的头像样式

## Background & Context
当前头像虽然设置了固定的 width 和 height，但缺少 `flex-shrink: 0` 属性，在 flex 布局中可能被压缩或拉伸。

## Functional Requirements
- **FR-1**: 团队列表头像保持固定大小 44x44px
- **FR-2**: 团队详情头像保持固定大小 64x64px  
- **FR-3**: 成员头像保持固定大小 40x40px

## Non-Functional Requirements
- **NFR-1**: 在各种布局情况下头像尺寸保持一致
- **NFR-2**: 不影响其他布局元素

## Constraints
- **Technical**: 基于 Vue 3 + CSS
- **Dependencies**: 使用现有的 CSS 变量

## Acceptance Criteria

### AC-1: 团队列表头像固定大小
- **Given**: 团队名称或描述很长
- **When**: 查看团队列表
- **Then**: 头像保持 44x44px 不变形
- **Verification**: `human-judgment`

### AC-2: 团队详情头像固定大小
- **Given**: 团队描述很长
- **When**: 查看团队详情页
- **Then**: 头像保持 64x64px 不变形
- **Verification**: `human-judgment`

### AC-3: 成员头像固定大小
- **Given**: 成员信息很长
- **When**: 查看成员列表
- **Then**: 头像保持 40x40px 不变形
- **Verification**: `human-judgment`

## Implementation Plan

### Task 1: 给 `.detail-avatar` 添加 `flex-shrink: 0`
- **Priority**: P0
- **Depends On**: None
- **Description**: 
  - 给 `.detail-avatar` 添加 `flex-shrink: 0` 属性
- **Acceptance Criteria Addressed**: AC-2
- **Test Requirements**:
  - `human-judgment`: 验证头像在长描述情况下保持固定大小

## Verification Checklist
- [ ] `.detail-avatar` 已添加 `flex-shrink: 0`
- [ ] 团队详情头像在各种布局下保持 64x64px
- [ ] 团队列表头像保持 44x44px
- [ ] 成员头像保持 40x40px