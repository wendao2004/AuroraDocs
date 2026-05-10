<template>
  <div class="tiptap-editor">
    <div v-if="editor" class="toolbar">
      <button
        @click="editor.chain().focus().toggleBold().run()"
        :class="{ 'is-active': editor.isActive('bold') }"
        type="button"
      >
        加粗
      </button>
      <button
        @click="editor.chain().focus().toggleItalic().run()"
        :class="{ 'is-active': editor.isActive('italic') }"
        type="button"
      >
        斜体
      </button>
      <button
        @click="editor.chain().focus().toggleStrike().run()"
        :class="{ 'is-active': editor.isActive('strike') }"
        type="button"
      >
        删除线
      </button>
      <button
        @click="editor.chain().focus().toggleCode().run()"
        :class="{ 'is-active': editor.isActive('code') }"
        type="button"
      >
        行内代码
      </button>
      <span class="divider">|</span>
      <button
        @click="editor.chain().focus().toggleHeading({ level: 1 }).run()"
        :class="{ 'is-active': editor.isActive('heading', { level: 1 }) }"
        type="button"
      >
        标题1
      </button>
      <button
        @click="editor.chain().focus().toggleHeading({ level: 2 }).run()"
        :class="{ 'is-active': editor.isActive('heading', { level: 2 }) }"
        type="button"
      >
        标题2
      </button>
      <button
        @click="editor.chain().focus().toggleHeading({ level: 3 }).run()"
        :class="{ 'is-active': editor.isActive('heading', { level: 3 }) }"
        type="button"
      >
        标题3
      </button>
      <span class="divider">|</span>
      <button
        @click="editor.chain().focus().toggleBulletList().run()"
        :class="{ 'is-active': editor.isActive('bulletList') }"
        type="button"
      >
        无序列表
      </button>
      <button
        @click="editor.chain().focus().toggleOrderedList().run()"
        :class="{ 'is-active': editor.isActive('orderedList') }"
        type="button"
      >
        有序列表
      </button>
      <button
        @click="editor.chain().focus().toggleBlockquote().run()"
        :class="{ 'is-active': editor.isActive('blockquote') }"
        type="button"
      >
        引用
      </button>
      <button
        @click="editor.chain().focus().toggleCodeBlock().run()"
        :class="{ 'is-active': editor.isActive('codeBlock') }"
        type="button"
      >
        代码块
      </button>
      <span class="divider">|</span>
      <button @click="editor.chain().focus().undo().run()" type="button">
        撤销
      </button>
      <button @click="editor.chain().focus().redo().run()" type="button">
        重做
      </button>
    </div>
    <editor-content :editor="editor" />
  </div>
</template>

<script setup lang="ts">
import { useEditor, EditorContent } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import { watch, onBeforeUnmount } from 'vue'

const props = defineProps<{
  modelValue: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const editor = useEditor({
  content: props.modelValue,
  extensions: [StarterKit],
  onUpdate: ({ editor }) => {
    emit('update:modelValue', editor.getHTML())
  },
})

watch(
  () => props.modelValue,
  (newValue) => {
    const isSame = editor.value?.getHTML() === newValue
    if (!isSame) {
      editor.value?.commands.setContent(newValue)
    }
  }
)

onBeforeUnmount(() => {
  editor.value?.destroy()
})
</script>

<style>
.tiptap-editor {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.toolbar {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  padding: 8px 12px;
  background-color: #f8f8f8;
  border-bottom: 1px solid #e0e0e0;
  flex-shrink: 0;
}

.toolbar button {
  padding: 6px 10px;
  font-size: 12px;
  font-weight: 500;
  color: #333;
  background-color: white;
  border: 1px solid #ccc;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.15s ease;
}

.toolbar button:hover {
  background-color: #e8e8e8;
  border-color: #aaa;
}

.toolbar button.is-active {
  background-color: #0078d4;
  color: white;
  border-color: #0078d4;
}

.toolbar .divider {
  width: 1px;
  height: 20px;
  background-color: #ccc;
  margin: 0 4px;
}

.editor-content {
  flex: 1;
  padding: 16px;
  overflow-y: auto;
  background-color: white;
}

.editor-content .ProseMirror {
  outline: none;
  min-height: 100%;
  height: 100%;
}

.editor-content .ProseMirror p {
  margin: 0 0 12px 0;
  line-height: 1.6;
}

.editor-content .ProseMirror h1,
.editor-content .ProseMirror h2,
.editor-content .ProseMirror h3 {
  margin: 20px 0 12px 0;
  font-weight: 600;
}

.editor-content .ProseMirror h1 {
  font-size: 28px;
}

.editor-content .ProseMirror h2 {
  font-size: 22px;
}

.editor-content .ProseMirror h3 {
  font-size: 18px;
}

.editor-content .ProseMirror ul,
.editor-content .ProseMirror ol {
  padding-left: 24px;
  margin: 0 0 12px 0;
}

.editor-content .ProseMirror li {
  margin-bottom: 6px;
}

.editor-content .ProseMirror blockquote {
  padding-left: 14px;
  margin: 14px 0;
  border-left: 3px solid #0078d4;
  color: #666;
}

.editor-content .ProseMirror code {
  background-color: #f3f3f3;
  padding: 2px 5px;
  border-radius: 3px;
  font-family: 'Consolas', 'Monaco', monospace;
  font-size: 13px;
}

.editor-content .ProseMirror pre {
  background-color: #1e1e1e;
  color: #d4d4d4;
  padding: 14px;
  border-radius: 6px;
  margin: 14px 0;
  overflow-x: auto;
}

.editor-content .ProseMirror pre code {
  background-color: transparent;
  padding: 0;
  color: inherit;
  font-size: 13px;
}
</style>
