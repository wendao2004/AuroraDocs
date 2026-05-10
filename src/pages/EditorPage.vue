<template>
  <div class="editor-page">
    <TiptapEditor v-model="content" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import TiptapEditor from '../components/editor/TiptapEditor.vue'

const content = ref(`<h1>欢迎使用极光文档编辑器</h1>
<p>这是一个功能强大的<strong>富文本编辑器</strong>，基于 <em>Tiptap</em> 和 <em>ProseMirror</em> 构建。</p>

<h2>主要功能</h2>
<ul>
  <li>支持 <strong>加粗</strong>、<em>斜体</em>、<s>删除线</s> 和 <code>行内代码</code></li>
  <li>支持多级标题（标题1、标题2、标题3）</li>
  <li>支持有序和无序列表</li>
  <li>支持引用块和代码块</li>
  <li>支持撤销和重做操作</li>
</ul>

<h2>代码示例</h2>
<pre><code>function hello() {
  console.log('你好，Tiptap！');
}</code></pre>

<blockquote>提示：使用工具栏按钮或相应的快捷键来格式化文本</blockquote>

<p>开始编辑你的文档吧！</p>`)
</script>

<style scoped>
.editor-page {
  height: 100%;
  display: flex;
  flex-direction: column;
}
</style>
