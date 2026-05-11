# Checklist

- [x] EditorPage.vue 中 restoreVersion 函数已修改，不再调用 saveDocument()
- [x] EditorPage.vue 中 restoreVersion 函数更新了 lastSavedContent 和 lastSavedTitle
- [x] AppLayout.vue 中 restoreVersion 函数已修改，不再调用 saveDocument()
- [x] AppLayout.vue 中 restoreVersion 函数更新了 lastSavedContent 和 lastSavedTitle
- [x] 版本回溯后不会立即触发自动保存创建新版本
