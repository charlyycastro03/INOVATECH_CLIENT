<template>
  <v-app :class="isDarkTheme ? 'dark-theme' : 'light-theme'">
    <router-view v-slot="{ Component }">
      <transition name="fade" mode="out-in">
        <component :is="Component" />
      </transition>
    </router-view>
  </v-app>
</template>

<script setup>
import { computed, onMounted, watch } from 'vue'
import { useTheme } from 'vuetify'

const theme = useTheme()
const isDarkTheme = computed(() => theme.global.name.value === 'dark')

const updateBodyBackground = () => {
  document.body.style.backgroundColor = isDarkTheme.value ? '#0a0a0a' : '#f5f5f5'
}

watch(isDarkTheme, updateBodyBackground)

onMounted(() => {
  const savedTheme = localStorage.getItem('portal_theme')
  if (savedTheme) {
    theme.global.name.value = savedTheme
  } else {
    theme.global.name.value = 'dark' // default to dark
    localStorage.setItem('portal_theme', 'dark')
  }
  
  updateBodyBackground()
})
</script>

<style>
* {
  font-family: 'Plus Jakarta Sans', 'Outfit', 'Roboto', sans-serif;
}
.dark-theme {
  background-color: #0a0a0a !important;
  color: white !important;
}
.light-theme {
  background-color: #f5f5f5 !important;
  color: #333333 !important;
}
html, body {
  margin: 0;
  padding: 0;
  height: 100%;
}

/* Page Transitions */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.fade-enter-from {
  opacity: 0;
  transform: translateY(10px);
}

.fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>
