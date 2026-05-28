<template>
  <div class="d-flex justify-center align-center min-vh-100" style="background: linear-gradient(135deg, #1A3A5C 0%, #0D1F33 100%); width: 100vw; height: 100vh;">
    <v-card class="pa-8 rounded-xl elevation-24" width="450" style="background: rgba(255, 255, 255, 0.1); backdrop-filter: blur(10px); border: 1px solid rgba(255,255,255,0.2);">
      <div class="text-center mb-6">
        <v-img src="/logo-inovatech.png" height="80" contain class="mb-4" v-if="hasLogo"></v-img>
        <v-icon v-else size="64" color="white" class="mb-4">mdi-shield-account</v-icon>
        <h2 class="text-h4 font-weight-bold text-white mb-2">Portal IT</h2>
        <p class="text-body-2 text-white opacity-70">Acceso exclusivo para Staff y Administración</p>
      </div>

      <v-form @submit.prevent="handleLogin" ref="loginForm">
        <v-text-field
          v-model="email"
          label="Correo Institucional"
          prepend-inner-icon="mdi-email-outline"
          variant="solo-filled"
          bg-color="rgba(255,255,255,0.1)"
          color="white"
          class="custom-input mb-4"
          :rules="[v => !!v || 'Requerido', v => /.+@.+\..+/.test(v) || 'Correo inválido']"
          required
          dark
        ></v-text-field>

        <v-text-field
          v-model="password"
          label="Contraseña"
          prepend-inner-icon="mdi-lock-outline"
          :append-inner-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
          :type="showPassword ? 'text' : 'password'"
          @click:append-inner="showPassword = !showPassword"
          variant="solo-filled"
          bg-color="rgba(255,255,255,0.1)"
          color="white"
          class="custom-input mb-6"
          :rules="[v => !!v || 'Requerido']"
          required
          dark
        ></v-text-field>

        <v-alert v-if="errorMsg" type="error" variant="tonal" class="mb-4 text-white" dense>
          {{ errorMsg }}
        </v-alert>

        <v-btn
          type="submit"
          color="primary"
          block
          size="x-large"
          class="rounded-lg font-weight-bold mb-4"
          :loading="loading"
          style="background: linear-gradient(45deg, #2563eb, #1e3a8a) !important; color: white;"
        >
          INICIAR SESIÓN
        </v-btn>

        <div class="text-center">
          <v-btn variant="text" color="white" size="small" to="/login" class="opacity-70">
            ¿Eres cliente? Ingresa aquí
          </v-btn>
        </div>
      </v-form>
    </v-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import api from '../plugins/axios'

const router = useRouter()
const loginForm = ref(null)
const email = ref('')
const password = ref('')
const showPassword = ref(false)
const loading = ref(false)
const errorMsg = ref('')
const hasLogo = ref(false)

const handleLogin = async () => {
  const { valid } = await loginForm.value.validate()
  if (!valid) return

  loading.value = true
  errorMsg.value = ''

  try {
    const response = await api.post('/api/client/login', {
      email: email.value,
      password: password.value
    })

    const { token, user } = response.data
    
    if (user.RoleID !== 1 && user.RoleID !== 4 && user.RoleID !== 5 && user.RoleID !== 2) {
      errorMsg.value = 'Acceso denegado. Solo personal autorizado.'
      loading.value = false
      return
    }

    localStorage.setItem('token', token)
    router.push('/dashboard')
  } catch (error) {
    errorMsg.value = error.response?.data?.message || 'Error al iniciar sesión'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.custom-input :deep(.v-field__input) {
  color: white !important;
}
.custom-input :deep(.v-label) {
  color: rgba(255,255,255,0.7) !important;
}
.custom-input :deep(.v-icon) {
  color: rgba(255,255,255,0.7) !important;
}
</style>
