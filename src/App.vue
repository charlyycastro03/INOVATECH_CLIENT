<template>
  <v-app class="dark-theme">
    <router-view></router-view>
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
</style>
