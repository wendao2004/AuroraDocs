import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useSettingsStore = defineStore('settings', () => {
  const isDarkMode = ref(false)
  const userName = ref('用户')

  const toggleDarkMode = () => {
    isDarkMode.value = !isDarkMode.value
    applyTheme()
    saveSettings()
  }

  const applyTheme = () => {
    if (isDarkMode.value) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }

  const saveSettings = () => {
    localStorage.setItem('settings', JSON.stringify({
      isDarkMode: isDarkMode.value,
      userName: userName.value,
    }))
  }

  const loadSettings = () => {
    const saved = localStorage.getItem('settings')
    if (saved) {
      const settings = JSON.parse(saved)
      isDarkMode.value = settings.isDarkMode || false
      userName.value = settings.userName || '用户'
      applyTheme()
    }
  }

  return {
    isDarkMode,
    userName,
    toggleDarkMode,
    applyTheme,
    saveSettings,
    loadSettings,
  }
})
