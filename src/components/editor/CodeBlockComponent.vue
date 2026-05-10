<template>
  <node-view-wrapper class="code-block">
    <div class="code-block-header">
      <select v-model="selectedLanguage" @change="updateLanguage">
        <option :value="null">auto</option>
        <option disabled>—</option>
        <option v-for="lang in languages" :value="lang" :key="lang">
          {{ lang }}
        </option>
      </select>
    </div>
    <pre><code><node-view-content /></code></pre>
  </node-view-wrapper>
</template>

<script setup lang="ts">
import { NodeViewContent, nodeViewProps, NodeViewWrapper } from '@tiptap/vue-3'

const props = defineProps(nodeViewProps)

const languages = props.extension.options.lowlight.listLanguages()

const selectedLanguage = props.node.attrs.language

const updateLanguage = (event: Event) => {
  const target = event.target as HTMLSelectElement
  props.updateAttributes({ language: target.value || null })
}
</script>

<style scoped>
.code-block {
  position: relative;
  margin: 1rem 0;
  background: #1e1e1e;
  border-radius: 8px;
  overflow: hidden;
}

.code-block-header {
  display: flex;
  justify-content: flex-end;
  padding: 8px;
  background: #2d2d2d;
  border-bottom: 1px solid #3d3d3d;
}

.code-block-header select {
  background-color: #3d3d3d;
  color: #ccc;
  border: 1px solid #555;
  border-radius: 4px;
  padding: 4px 8px;
  font-size: 12px;
  cursor: pointer;
}

.code-block-header select:hover {
  background-color: #4d4d4d;
}

.code-block pre {
  margin: 0;
  padding: 16px;
  overflow-x: auto;
}

.code-block code {
  background: none;
  color: #d4d4d4;
  font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
  font-size: 13px;
  line-height: 1.6;
}
</style>
