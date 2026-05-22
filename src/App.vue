<template>
  <v-app class="dark-theme">
    <router-view v-slot="{ Component }">
      <transition name="fade" mode="out-in">
        <component :is="Component" />
      </transition>
    </router-view>
  </v-app>
</template>

<script setup>
</script>

<style>
.dark-theme {
  background-color: #0a0a0a !important;
  color: white !important;
}
html, body {
  margin: 0;
  padding: 0;
  height: 100%;
  background-color: #0a0a0a;
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
