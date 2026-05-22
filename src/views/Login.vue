<template>
  <v-container class="fill-height" fluid>
    <v-row align="center" justify="center">
      <v-col cols="12" sm="8" md="4">
        <v-card class="elevation-12 rounded-lg pa-4">
          <v-toolbar color="primary" dark flat class="rounded-t-lg">
            <v-toolbar-title class="font-weight-bold">Portal de Clientes</v-toolbar-title>
          </v-toolbar>
          
          <v-card-text class="pt-6">
            <v-alert
              v-if="errorMsg"
              type="error"
              variant="tonal"
              closable
              class="mb-4"
              @click:close="errorMsg = ''"
            >
              {{ errorMsg }}
            </v-alert>
            
            <v-alert
              v-if="successMsg"
              type="success"
              variant="tonal"
              class="mb-4"
            >
              {{ successMsg }}
            </v-alert>

            <v-form @submit.prevent="step === 1 ? requestLogin() : verifyLogin()">
              <v-text-field
                v-model="email"
                label="Correo Electrónico"
                name="email"
                prepend-inner-icon="mdi-email-outline"
                type="email"
                variant="outlined"
                :disabled="step === 2 || loading"
                required
              ></v-text-field>
              
              <v-text-field
                v-if="step === 2"
                v-model="code"
                label="Código OTP de 6 dígitos"
                name="code"
                prepend-inner-icon="mdi-lock-open-outline"
                type="text"
                variant="outlined"
                :disabled="loading"
                required
                maxlength="6"
              ></v-text-field>
            </v-form>
          </v-card-text>
          
          <v-card-actions class="pb-4 px-4">
            <v-btn
              v-if="step === 2"
              variant="text"
              color="secondary"
              :disabled="loading"
              @click="step = 1; code = ''; errorMsg = ''; successMsg = ''"
            >
              Cambiar correo
            </v-btn>
            <v-spacer></v-spacer>
            <v-btn
              color="primary"
              size="large"
              :loading="loading"
              @click="step === 1 ? requestLogin() : verifyLogin()"
            >
              {{ step === 1 ? 'Solicitar Código' : 'Ingresar' }}
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import api from '../plugins/axios'

const router = useRouter()
const email = ref('')
const code = ref('')
const step = ref(1)
const loading = ref(false)
const errorMsg = ref('')
const successMsg = ref('')

const requestLogin = async () => {
  if (!email.value) {
    errorMsg.value = 'El correo electrónico es requerido.'
    return
  }
  
  loading.value = true
  errorMsg.value = ''
  successMsg.value = ''

  try {
    const response = await api.post('/api/auth/login-request', { email: email.value })
    successMsg.value = response.data.msg || 'Código enviado con éxito. Revisa tu correo.'
    step.value = 2
  } catch (error) {
    console.error('Error al solicitar login:', error)
    errorMsg.value = error.response?.data?.msg || 'Error de conexión. Inténtalo de nuevo.'
  } finally {
    loading.value = false
  }
}

const verifyLogin = async () => {
  if (!code.value) {
    errorMsg.value = 'El código OTP es requerido.'
    return
  }
  
  loading.value = true
  errorMsg.value = ''

  try {
    const response = await api.post('/api/auth/login-verify', {
      email: email.value,
      code: code.value
    })
    
    // Guardar token y datos del usuario
    localStorage.setItem('clientToken', response.data.token)
    localStorage.setItem('clientUser', JSON.stringify(response.data.user))
    
    successMsg.value = '¡Acceso exitoso!'
    
    setTimeout(() => {
      router.push('/dashboard')
    }, 500)
  } catch (error) {
    console.error('Error al verificar código:', error)
    errorMsg.value = error.response?.data?.msg || 'Código incorrecto o expirado.'
  } finally {
    loading.value = false
  }
}
</script>
