import { createRouter, createWebHashHistory } from 'vue-router'
import EditorPage from '../pages/EditorPage.vue'
import DocumentPage from '../pages/DocumentPage.vue'
import TeamPage from '../pages/TeamPage.vue'

const routes = [
  {
    path: '/',
    name: 'Editor',
    component: EditorPage,
  },
  {
    path: '/documents',
    name: 'Documents',
    component: DocumentPage,
  },
  {
    path: '/team',
    name: 'Team',
    component: TeamPage,
  },
]

const router = createRouter({
  history: createWebHashHistory(),
  routes,
})

export default router
