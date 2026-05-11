# Tasks

- [x] Task 1: 修复 EditorPage.vue 中的 restoreVersion 函数
  - 修改 `restoreVersion` 函数，移除 `saveDocument()` 调用
  - 改为直接更新 `lastSavedContent` 和 `lastSavedTitle`，避免回溯后立即触发自动保存
  - 确保版本历史面板正确关闭

- [x] Task 2: 修复 AppLayout.vue 中的 restoreVersion 函数
  - 检查并应用相同的修改逻辑
