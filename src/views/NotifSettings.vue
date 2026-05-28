<template>
  <v-app :theme="isDarkTheme ? 'dark' : 'light'">
    <v-app-bar :color="isDarkTheme ? 'grey-darken-4' : 'white'" elevation="1">
      <v-btn icon="mdi-arrow-left" @click="router.push('/dashboard')"></v-btn>
      <v-app-bar-title class="font-weight-bold">
        <v-icon left color="primary" class="mr-2">mdi-bell-cog</v-icon>
        Configuración de Notificaciones
      </v-app-bar-title>
      <v-spacer></v-spacer>
      <v-btn icon @click="toggleTheme">
        <v-icon>{{ isDarkTheme ? 'mdi-weather-sunny' : 'mdi-weather-night' }}</v-icon>
      </v-btn>
    </v-app-bar>

    <v-main :class="isDarkTheme ? 'bg-grey-darken-4' : 'bg-grey-lighten-4'">
      <v-container max-width="800">
        <v-card class="rounded-xl mt-6 pa-6" elevation="2" :class="isDarkTheme ? 'bg-grey-darken-3' : 'bg-white'">
          <div class="mb-6">
            <h2 class="text-h5 font-weight-bold mb-2">Reglas de Notificación por Correo</h2>
            <p class="text-body-2 text-grey">Activa o desactiva las notificaciones automáticas que se envían por correo electrónico a clientes y staff según diferentes eventos del sistema.</p>
          </div>

          <v-divider class="mb-6"></v-divider>

          <v-skeleton-loader v-if="loading" type="list-item-avatar-two-line@5"></v-skeleton-loader>

          <v-list v-else bg-color="transparent" class="pa-0">
            <template v-for="(setting, index) in settings" :key="setting.RuleCode">
              <v-list-item class="px-0 py-3">
                <template v-slot:prepend>
                  <v-icon :color="setting.IsActive ? 'success' : 'grey'" size="large" class="mr-4">
                    {{ setting.IsActive ? 'mdi-bell-ring' : 'mdi-bell-off' }}
                  </v-icon>
                </template>
                
                <v-list-item-title class="font-weight-bold text-body-1 mb-1">{{ setting.Description }}</v-list-item-title>
                <v-list-item-subtitle class="text-caption text-grey font-monospace">{{ setting.RuleCode }}</v-list-item-subtitle>
                
                <template v-slot:append>
                  <v-switch
                    v-model="setting.IsActive"
                    color="success"
                    hide-details
                    :loading="updating === setting.RuleCode"
                    :disabled="updating === setting.RuleCode"
                    @change="updateSetting(setting)"
                  ></v-switch>
                </template>
              </v-list-item>
              <v-divider v-if="index < settings.length - 1" class="border-opacity-10"></v-divider>
            </template>
          </v-list>
        </v-card>
      </v-container>

      <v-snackbar v-model="snackbar" :color="snackbarColor" timeout="3000" location="top right">
        {{ snackbarText }}
      </v-snackbar>
    </v-main>
  </v-app>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import api from '../plugins/axios'

const router = useRouter()
const isDarkTheme = ref(localStorage.getItem('theme') === 'dark')
const settings = ref([])
const loading = ref(true)
const updating = ref(null)
const snackbar = ref(false)
const snackbarText = ref('')
const snackbarColor = ref('success')

const toggleTheme = () => {
  isDarkTheme.value = !isDarkTheme.value
  localStorage.setItem('theme', isDarkTheme.value ? 'dark' : 'light')
}

const showSnackbar = (text, color = 'success') => {
  snackbarText.value = text
  snackbarColor.value = color
  snackbar.value = true
}

const fetchSettings = async () => {
  try {
    const res = await api.get('/api/helpdesk/settings/notifications')
    // El backend devuelve 1 o 0 en IsActive, lo pasamos a booleano
    settings.value = res.data.map(s => ({
      ...s,
      IsActive: s.IsActive === 1
    }))
  } catch (error) {
    console.error('Error fetching settings:', error)
    showSnackbar('Error al cargar la configuración', 'error')
  } finally {
    loading.value = false
  }
}

const updateSetting = async (setting) => {
  updating.value = setting.RuleCode
  try {
    await api.patch(`/api/helpdesk/settings/notifications/${setting.RuleCode}`, {
      isActive: setting.IsActive
    })
    showSnackbar('Configuración guardada exitosamente')
  } catch (error) {
    console.error('Error updating setting:', error)
    showSnackbar('Error al guardar', 'error')
    // Revert on UI if failed
    setting.IsActive = !setting.IsActive
  } finally {
    updating.value = null
  }
}

onMounted(() => {
  const token = localStorage.getItem('token')
  if (!token) {
    router.push('/login')
    return
  }
  
  try {
    const userPayload = JSON.parse(atob(token.split('.')[1]))
    // Solo admins (RoleID = 1) pueden ver esto, o 4 para testing
    if (userPayload.role !== 1 && userPayload.role !== 4) {
      router.push('/dashboard')
    } else {
      fetchSettings()
    }
  } catch (e) {
    router.push('/login')
  }
})
</script>

<style scoped>
.font-monospace {
  font-family: monospace;
}
</style>
