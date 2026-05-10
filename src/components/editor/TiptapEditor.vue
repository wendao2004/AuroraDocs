<template>
  <div class="tiptap-editor">
    <div v-if="editor" class="toolbar">
      <button
        @mousedown.prevent="editor.chain().focus().toggleBold().run()"
        :class="{ 'is-active': editor.isActive('bold') }"
        type="button"
        title="加粗 (Ctrl+B)"
      >
        <span class="btn-icon">B</span>
      </button>
      <button
        @mousedown.prevent="editor.chain().focus().toggleItalic().run()"
        :class="{ 'is-active': editor.isActive('italic') }"
        type="button"
        title="斜体 (Ctrl+I)"
      >
        <span class="btn-icon italic">I</span>
      </button>
      <button
        @mousedown.prevent="editor.chain().focus().toggleStrike().run()"
        :class="{ 'is-active': editor.isActive('strike') }"
        type="button"
        title="删除线"
      >
        <span class="btn-icon strike">S</span>
      </button>
      <button
        @mousedown.prevent="editor.chain().focus().toggleCode().run()"
        :class="{ 'is-active': editor.isActive('code') }"
        type="button"
        title="行内代码"
      >
        <span class="btn-icon code">&lt;/&gt;</span>
      </button>
      <span class="divider"></span>
      <button
        @mousedown.prevent="editor.chain().focus().toggleHeading({ level: 1 }).run()"
        :class="{ 'is-active': editor.isActive('heading', { level: 1 }) }"
        type="button"
        title="标题1"
      >
        H1
      </button>
      <button
        @mousedown.prevent="editor.chain().focus().toggleHeading({ level: 2 }).run()"
        :class="{ 'is-active': editor.isActive('heading', { level: 2 }) }"
        type="button"
        title="标题2"
      >
        H2
      </button>
      <button
        @mousedown.prevent="editor.chain().focus().toggleHeading({ level: 3 }).run()"
        :class="{ 'is-active': editor.isActive('heading', { level: 3 }) }"
        type="button"
        title="标题3"
      >
        H3
      </button>
      <span class="divider"></span>
      <button
        @mousedown.prevent="editor.chain().focus().toggleBulletList().run()"
        :class="{ 'is-active': editor.isActive('bulletList') }"
        type="button"
        title="无序列表"
      >
        <span class="btn-icon">•</span>
      </button>
      <button
        @mousedown.prevent="editor.chain().focus().toggleOrderedList().run()"
        :class="{ 'is-active': editor.isActive('orderedList') }"
        type="button"
        title="有序列表"
      >
        <span class="btn-icon">1.</span>
      </button>
      <button
        @mousedown.prevent="editor.chain().focus().toggleBlockquote().run()"
        :class="{ 'is-active': editor.isActive('blockquote') }"
        type="button"
        title="引用"
      >
        <span class="btn-icon quote">"</span>
      </button>
      <span class="divider"></span>
      <div class="code-block-dropdown">
        <button
          @mousedown.prevent="toggleCodeBlockMenu"
          :class="{ 'is-active': editor.isActive('codeBlock') }"
          type="button"
          title="代码块"
        >
          <span class="btn-icon code">&lt;&gt;</span>
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
      <span class="divider"></span>
      <button
        @mousedown.prevent="editor.chain().focus().undo().run()"
        type="button"
        title="撤销 (Ctrl+Z)"
      >
        ↩
      </button>
      <button
        @mousedown.prevent="editor.chain().focus().redo().run()"
        type="button"
        title="重做 (Ctrl+Shift+Z)"
      >
        ↪
      </button>
    </div>
    <div class="editor-wrapper" @click="focusEditor">
      <editor-content :editor="editor" class="editor-content" />
      <div v-if="!editor?.getText()" class="placeholder">开始输入内容...</div>
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

cleanup(() => {
  if (clickListener) {
    document.removeEventListener('click', clickListener)
  }
})
</script>

<style>
.tiptap-editor {
  background-color: #ffffff;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  height: 100%;
  display: flex;
  flex-direction: column;
  border: 1px solid #e8e8e8;
}

.toolbar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 4px;
  padding: 12px 16px;
  background: linear-gradient(180deg, #fafbfc 0%, #f5f6f8 100%);
  border-bottom: 1px solid #e4e7eb;
  flex-shrink: 0;
}

.toolbar button {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 32px;
  height: 32px;
  padding: 0 8px;
  font-size: 13px;
  font-weight: 600;
  color: #3c4257;
  background-color: transparent;
  border: 1px solid transparent;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.15s ease;
}

.toolbar button:hover {
  background-color: #e8ecf1;
  border-color: #dce0e8;
}

.toolbar button.is-active {
  background-color: #0078d4;
  color: white;
  border-color: #0078d4;
}

.toolbar button.is-active:hover {
  background-color: #006cbd;
}

.toolbar .divider {
  width: 1px;
  height: 20px;
  background-color: #e4e7eb;
  margin: 0 4px;
}

.btn-icon {
  font-family: 'Georgia', serif;
  font-weight: 700;
}

.btn-icon.italic {
  font-style: italic;
}

.btn-icon.strike {
  text-decoration: line-through;
}

.btn-icon.code {
  font-family: 'Consolas', 'Monaco', monospace;
  font-size: 11px;
  font-weight: 600;
}

.btn-icon.quote {
  font-family: 'Georgia', serif;
  font-size: 18px;
  line-height: 1;
}

.code-block-dropdown {
  position: relative;
}

.dropdown-menu {
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  z-index: 100;
  background: white;
  border: 1px solid #e4e7eb;
  border-radius: 8px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
  min-width: 130px;
  max-height: 320px;
  overflow-y: auto;
  padding: 4px 0;
}

.dropdown-item {
  padding: 10px 14px;
  font-size: 13px;
  color: #3c4257;
  cursor: pointer;
  transition: background-color 0.1s;
}

.dropdown-item:hover {
  background-color: #f0f5fa;
}

.editor-wrapper {
  flex: 1;
  position: relative;
  overflow-y: auto;
  overflow-x: hidden;
  cursor: text;
}

.editor-content {
  flex: 1;
  padding: 24px 32px;
  min-height: 100%;
}

.editor-content .ProseMirror {
  outline: none;
  min-height: 100%;
  min-height: 400px;
  padding: 8px 0;
  line-height: 1.7;
  font-size: 15px;
  color: #1a1d23;
}

.editor-content .ProseMirror p {
  margin: 0 0 16px 0;
}

.editor-content .ProseMirror h1,
.editor-content .ProseMirror h2,
.editor-content .ProseMirror h3 {
  margin: 28px 0 16px 0;
  font-weight: 700;
  color: #1a1d23;
  line-height: 1.3;
}

.editor-content .ProseMirror h1 {
  font-size: 28px;
  padding-bottom: 8px;
  border-bottom: 2px solid #e4e7eb;
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
  margin: 0 0 16px 0;
}

.editor-content .ProseMirror li {
  margin-bottom: 8px;
}

.editor-content .ProseMirror li::marker {
  color: #0078d4;
}

.editor-content .ProseMirror blockquote {
  padding: 12px 20px;
  margin: 16px 0;
  border-left: 4px solid #0078d4;
  background-color: #f8fbfe;
  color: #5a6677;
  border-radius: 0 8px 8px 0;
}

.editor-content .ProseMirror code:not(pre code) {
  background-color: #f3f4f6;
  padding: 2px 6px;
  border-radius: 4px;
  font-family: 'Consolas', 'Monaco', monospace;
  font-size: 13px;
  color: #e83e3e;
  border: 1px solid #e8eaed;
}

.editor-content .ProseMirror pre {
  background: #1e1e1e;
  border-radius: 8px;
  color: #d4d4d4;
  font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
  margin: 16px 0;
  padding: 0;
  overflow: hidden;
}

.editor-content .ProseMirror pre code {
  background: none;
  color: inherit;
  font-size: 13px;
  padding: 16px;
  display: block;
  line-height: 1.6;
}

.placeholder {
  position: absolute;
  top: 24px;
  left: 32px;
  color: #b4b9c2;
  font-size: 15px;
  pointer-events: none;
  user-select: none;
}

/* Syntax highlighting styles */
.editor-content .ProseMirror .hljs-comment,
.editor-content .ProseMirror .hljs-quote {
  color: #6a9955;
}

.editor-content .ProseMirror .hljs-keyword,
.editor-content .ProseMirror .hljs-selector-tag {
  color: #569cd6;
}

.editor-content .ProseMirror .hljs-string,
.editor-content .ProseMirror .hljs-title,
.editor-content .ProseMirror .hljs-section {
  color: #ce9178;
}

.editor-content .ProseMirror .hljs-number,
.editor-content .ProseMirror .hljs-literal {
  color: #b5cea8;
}

.editor-content .ProseMirror .hljs-variable,
.editor-content .ProseMirror .hljs-template-variable {
  color: #9cdcfe;
}

.editor-content .ProseMirror .hljs-built_in,
.editor-content .ProseMirror .hljs-builtin-name {
  color: #4ec9b0;
}

.editor-content .ProseMirror .hljs-type,
.editor-content .ProseMirror .hljs-class {
  color: #4ec9b0;
}

.editor-content .ProseMirror .hljs-function {
  color: #dcdcaa;
}

.editor-content .ProseMirror .hljs-attr,
.editor-content .ProseMirror .hljs-attribute {
  color: #9cdcfe;
}

/* Scrollbar styling */
.editor-wrapper::-webkit-scrollbar {
  width: 10px;
}

.editor-wrapper::-webkit-scrollbar-track {
  background: #f5f6f8;
}

.editor-wrapper::-webkit-scrollbar-thumb {
  background: #c1c7d0;
  border-radius: 5px;
}

.editor-wrapper::-webkit-scrollbar-thumb:hover {
  background: #a3abb8;
}

/* Selection color */
.editor-content .ProseMirror ::selection {
  background-color: #cce4f7;
}
</style>
