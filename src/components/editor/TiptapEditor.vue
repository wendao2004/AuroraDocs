<template>
  <div class="editor-page">
    <div class="editor-container">
      <div v-if="editor" class="toolbar">
        <div class="toolbar-group">
          <button
            @mousedown.prevent="editor.chain().focus().toggleBold().run()"
            :class="{ 'is-active': editor.isActive('bold') }"
            class="toolbar-btn"
            title="加粗 (Ctrl+B)"
          >
            <strong>B</strong>
          </button>
          <button
            @mousedown.prevent="editor.chain().focus().toggleItalic().run()"
            :class="{ 'is-active': editor.isActive('italic') }"
            class="toolbar-btn"
            title="斜体 (Ctrl+I)"
          >
            <em>I</em>
          </button>
          <button
            @mousedown.prevent="editor.chain().focus().toggleStrike().run()"
            :class="{ 'is-active': editor.isActive('strike') }"
            class="toolbar-btn"
            title="删除线"
          >
            <s>S</s>
          </button>
          <button
            @mousedown.prevent="editor.chain().focus().toggleCode().run()"
            :class="{ 'is-active': editor.isActive('code') }"
            class="toolbar-btn"
            title="行内代码"
          >
            <code>&lt;/&gt;</code>
          </button>
        </div>
        <div class="toolbar-divider"></div>
        <div class="toolbar-group">
          <button
            @mousedown.prevent="editor.chain().focus().toggleHeading({ level: 1 }).run()"
            :class="{ 'is-active': editor.isActive('heading', { level: 1 }) }"
            class="toolbar-btn"
            title="标题1"
          >
            H1
          </button>
          <button
            @mousedown.prevent="editor.chain().focus().toggleHeading({ level: 2 }).run()"
            :class="{ 'is-active': editor.isActive('heading', { level: 2 }) }"
            class="toolbar-btn"
            title="标题2"
          >
            H2
          </button>
          <button
            @mousedown.prevent="editor.chain().focus().toggleHeading({ level: 3 }).run()"
            :class="{ 'is-active': editor.isActive('heading', { level: 3 }) }"
            class="toolbar-btn"
            title="标题3"
          >
            H3
          </button>
        </div>
        <div class="toolbar-divider"></div>
        <div class="toolbar-group">
          <button
            @mousedown.prevent="editor.chain().focus().toggleBulletList().run()"
            :class="{ 'is-active': editor.isActive('bulletList') }"
            class="toolbar-btn"
            title="无序列表"
          >
            •
          </button>
          <button
            @mousedown.prevent="editor.chain().focus().toggleOrderedList().run()"
            :class="{ 'is-active': editor.isActive('orderedList') }"
            class="toolbar-btn"
            title="有序列表"
          >
            1.
          </button>
          <button
            @mousedown.prevent="editor.chain().focus().toggleBlockquote().run()"
            :class="{ 'is-active': editor.isActive('blockquote') }"
            class="toolbar-btn"
            title="引用"
          >
            "
          </button>
        </div>
        <div class="toolbar-divider"></div>
        <div class="toolbar-group">
          <div class="code-block-dropdown">
            <button
              @mousedown.prevent="toggleCodeBlockMenu"
              :class="{ 'is-active': editor.isActive('codeBlock') }"
              class="toolbar-btn"
              title="代码块"
            >
              { }
            </button>
            <div v-if="showCodeBlockMenu" class="dropdown-menu">
              <div class="dropdown-item" @click="insertCodeBlock('javascript')">JavaScript</div>
              <div class="dropdown-item" @click="insertCodeBlock('typescript')">TypeScript</div>
              <div class="dropdown-item" @click="insertCodeBlock('python')">Python</div>
              <div class="dropdown-item" @click="insertCodeBlock('java')">Java</div>
              <div class="dropdown-item" @click="insertCodeBlock('cpp')">C++</div>
              <div class="dropdown-item" @click="insertCodeBlock('rust')">Rust</div>
              <div class="dropdown-item" @click="insertCodeBlock('go')">Go</div>
              <div class="dropdown-item" @click="insertCodeBlock('html')">HTML</div>
              <div class="dropdown-item" @click="insertCodeBlock('css')">CSS</div>
              <div class="dropdown-item" @click="insertCodeBlock('json')">JSON</div>
              <div class="dropdown-item" @click="insertCodeBlock('sql')">SQL</div>
              <div class="dropdown-item" @click="insertCodeBlock('bash')">Bash</div>
              <div class="dropdown-item" @click="insertCodeBlock('')">无语言</div>
            </div>
          </div>
        </div>
        <div class="toolbar-divider"></div>
        <div class="toolbar-group">
          <button
            @mousedown.prevent="editor.chain().focus().undo().run()"
            class="toolbar-btn"
            title="撤销 (Ctrl+Z)"
          >
            ↩
          </button>
          <button
            @mousedown.prevent="editor.chain().focus().redo().run()"
            class="toolbar-btn"
            title="重做 (Ctrl+Shift+Z)"
          >
            ↪
          </button>
        </div>
      </div>
      <div class="editor-wrapper" @click="focusEditor">
        <editor-content :editor="editor" class="editor-content" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { watch, onBeforeUnmount, ref, onMounted, onBeforeUnmount as cleanup } from 'vue'
import { useEditor, EditorContent, VueNodeViewRenderer } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight'
import { createLowlight, common } from 'lowlight'
import CodeBlockComponent from './CodeBlockComponent.vue'

const lowlight = createLowlight(common)

const props = defineProps<{
  modelValue: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const showCodeBlockMenu = ref(false)

const toggleCodeBlockMenu = () => {
  showCodeBlockMenu.value = !showCodeBlockMenu.value
}

const insertCodeBlock = (language: string) => {
  showCodeBlockMenu.value = false
  if (language) {
    editor.value?.chain().focus().toggleCodeBlock({ language }).run()
  } else {
    editor.value?.chain().focus().toggleCodeBlock().run()
  }
}

const focusEditor = (event: MouseEvent) => {
  const target = event.target as HTMLElement
  if (target.classList.contains('editor-wrapper') || target.classList.contains('editor-content')) {
    editor.value?.commands.focus()
  }
}

const editor = useEditor({
  content: props.modelValue,
  extensions: [
    StarterKit.configure({
      codeBlock: false,
    }),
    CodeBlockLowlight.extend({
      addNodeView() {
        return VueNodeViewRenderer(CodeBlockComponent as any)
      },
    }).configure({ lowlight }),
  ],
  onUpdate: ({ editor: ed }) => {
    emit('update:modelValue', ed.getHTML())
  },
})

watch(
  () => props.modelValue,
  (newValue) => {
    if (editor.value) {
      const isSame = editor.value.getHTML() === newValue
      if (!isSame) {
        editor.value.commands.setContent(newValue)
      }
    }
  }
)

onBeforeUnmount(() => {
  editor.value?.destroy()
})

let clickListener: ((e: MouseEvent) => void) | null = null

onMounted(() => {
  clickListener = (e: MouseEvent) => {
    if (showCodeBlockMenu.value) {
      const dropdown = document.querySelector('.code-block-dropdown')
      if (dropdown && !dropdown.contains(e.target as Node)) {
        showCodeBlockMenu.value = false
      }
    }
  }
  document.addEventListener('click', clickListener)
})

defineExpose({
  setContent: (content: string) => {
    if (editor.value) {
      editor.value.commands.setContent(content)
    }
  }
})

cleanup(() => {
  if (clickListener) {
    document.removeEventListener('click', clickListener)
  }
})
</script>

<style scoped>
.editor-page {
  height: 100%;
  display: flex;
  justify-content: center;
  padding: 24px;
}

.editor-container {
  width: 100%;
  max-width: 900px;
  background: var(--color-bg-white);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--color-border-light);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

@media (min-width: 1200px) {
  .editor-container {
    max-width: 1000px;
  }
}

@media (min-width: 1600px) {
  .editor-container {
    max-width: 1200px;
  }
}

@media (max-width: 768px) {
  .editor-page {
    padding: 12px;
  }

  .editor-container {
    max-width: 100%;
  }
}

.toolbar {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 8px 12px;
  border-bottom: 1px solid var(--color-border-light);
  background: var(--color-bg-white);
  flex-wrap: wrap;
}

.toolbar-group {
  display: flex;
  gap: 2px;
}

.toolbar-divider {
  width: 1px;
  height: 20px;
  background: var(--color-border);
  margin: 0 6px;
}

.toolbar-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 28px;
  height: 28px;
  padding: 0 8px;
  font-size: 13px;
  color: var(--color-text-secondary);
  background: transparent;
  border: none;
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: all 0.15s ease;
}

.toolbar-btn:hover {
  background: var(--color-bg-gray);
  color: var(--color-text-primary);
}

.toolbar-btn.is-active {
  background: var(--color-primary-light);
  color: var(--color-primary);
}

.toolbar-btn strong {
  font-weight: 600;
}

.toolbar-btn em {
  font-style: italic;
}

.toolbar-btn s {
  text-decoration: line-through;
}

.toolbar-btn code {
  font-family: var(--font-mono);
  font-size: 11px;
}

.code-block-dropdown {
  position: relative;
}

.dropdown-menu {
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  z-index: 100;
  background: var(--color-bg-white);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-md);
  min-width: 120px;
  max-height: 280px;
  overflow-y: auto;
  padding: 4px 0;
}

.dropdown-item {
  padding: 8px 14px;
  font-size: 13px;
  color: var(--color-text-primary);
  cursor: pointer;
  transition: background-color 0.1s;
}

.dropdown-item:hover {
  background: var(--color-bg-gray);
}

.editor-wrapper {
  flex: 1;
  overflow-y: auto;
  cursor: text;
}

.editor-content {
  min-height: 100%;
}

.editor-content :deep(.ProseMirror) {
  outline: none;
  padding: 48px 64px;
  min-height: 600px;
  font-size: 16px;
  line-height: 1.8;
  color: var(--color-text-primary);
  max-width: 100%;
}

@media (min-width: 1600px) {
  .editor-content :deep(.ProseMirror) {
    padding: 64px 96px;
    font-size: 17px;
  }
}

@media (max-width: 768px) {
  .editor-content :deep(.ProseMirror) {
    padding: 24px;
    font-size: 15px;
  }
}

.editor-content :deep(.ProseMirror p) {
  margin: 0 0 12px 0;
}

.editor-content :deep(.ProseMirror h1),
.editor-content :deep(.ProseMirror h2),
.editor-content :deep(.ProseMirror h3) {
  margin: 28px 0 14px 0;
  font-weight: 600;
  color: var(--color-text-primary);
  line-height: 1.3;
}

.editor-content :deep(.ProseMirror h1) {
  font-size: 26px;
  padding-bottom: 10px;
  border-bottom: 1px solid var(--color-border-light);
}

.editor-content :deep(.ProseMirror h2) {
  font-size: 20px;
}

.editor-content :deep(.ProseMirror h3) {
  font-size: 16px;
}

.editor-content :deep(.ProseMirror ul),
.editor-content :deep(.ProseMirror ol) {
  padding-left: 22px;
  margin: 0 0 12px 0;
}

.editor-content :deep(.ProseMirror li) {
  margin-bottom: 6px;
}

.editor-content :deep(.ProseMirror blockquote) {
  padding: 10px 18px;
  margin: 16px 0;
  border-left: 3px solid var(--color-primary);
  background: var(--color-primary-light);
  color: var(--color-text-secondary);
  border-radius: 0 var(--radius-sm) var(--radius-sm) 0;
}

.editor-content :deep(.ProseMirror code:not(pre code)) {
  background: var(--color-bg-gray);
  padding: 2px 6px;
  border-radius: 4px;
  font-family: var(--font-mono);
  font-size: 13px;
  color: #d12f1b;
}

.editor-content :deep(.ProseMirror pre) {
  background: #1e1e1e;
  border-radius: var(--radius-md);
  color: #d4d4d4;
  font-family: var(--font-mono);
  margin: 16px 0;
  overflow: hidden;
}

.editor-content :deep(.ProseMirror pre code) {
  background: none;
  color: inherit;
  font-size: 13px;
  padding: 16px;
  display: block;
  line-height: 1.6;
}
</style>
