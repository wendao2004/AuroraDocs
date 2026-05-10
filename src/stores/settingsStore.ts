import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useSettingsStore = defineStore('settings', () => {
  const isDarkMode = ref(false)

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
    }))
  }

  const loadSettings = () => {
    const saved = localStorage.getItem('settings')
    if (saved) {
      const settings = JSON.parse(saved)
      isDarkMode.value = settings.isDarkMode || false
      applyTheme()
    }
  }

  return {
    isDarkMode,
    toggleDarkMode,
    applyTheme,
    loadSettings,
  }
})
