import { createRouter, createWebHashHistory } from 'vue-router'
import BaseLayout from '../components/layout/BaseLayout.vue'
import EditorPage from '../pages/EditorPage.vue'
import DocumentPage from '../pages/DocumentPage.vue'
import TaskPage from '../pages/TaskPage.vue'
import TeamPage from '../pages/TeamPage.vue'

const routes = [
  {
    path: '/',
    name: 'Layout',
    component: BaseLayout,
    children: [
      {
        path: '',
        name: 'Editor',
        component: EditorPage,
      },
      {
        path: 'documents',
        name: 'Documents',
        component: DocumentPage,
      },
      {
        path: 'tasks',
        name: 'Tasks',
        component: TaskPage,
      },
      {
        path: 'team',
        name: 'Team',
        component: TeamPage,
      },
    ],
  },
]

const router = createRouter({
  history: createWebHashHistory(),
  routes,
})

export default router
