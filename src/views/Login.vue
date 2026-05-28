<template>
  <div class="login-container h-screen overflow-hidden d-flex align-center justify-center">
    <div class="login-bg-overlay"></div>

    <!-- Contenido Principal -->
    <v-row class="ma-0 fill-height w-100 z-index-2 align-center justify-center">
      <v-col cols="12" sm="10" md="8" lg="6" xl="4">
        <v-card class="glass-card pa-8 rounded-xl" elevation="24">
          <div class="text-center mb-8 logo-container">
            <v-img src="/assets/logo-Em6pMsZK.png" height="42" contain class="mx-auto mb-5" alt="Inovatech Logo"></v-img>
            <h1 class="text-h4 font-weight-black text-white gradient-text">Bienvenido a Inovatech</h1>
            <p class="text-subtitle-1 text-grey-lighten-2 mt-2">Mesa de Ayuda y Soporte Técnico</p>
          </div>

          <v-divider class="mb-6 opacity-20" color="white"></v-divider>
          
          <v-alert v-if="errorMsg" type="error" variant="tonal" closable class="mb-4" @click:close="errorMsg = ''">
              {{ errorMsg }}
          </v-alert>
          <v-alert v-if="successMsg" type="success" variant="tonal" class="mb-4">
              {{ successMsg }}
          </v-alert>

          <v-tabs v-model="tab" color="primary" bg-color="transparent" grow class="mb-6" slider-color="primary">
            <v-tab value="login" :disabled="step === 2 || loading" class="text-white">Ingresar</v-tab>
            <v-tab value="register" :disabled="step === 2 || loading" class="text-white">Crear Cuenta</v-tab>
          </v-tabs>

          <v-window v-model="tab" class="bg-transparent overflow-visible">
            <!-- LOGIN TAB -->
            <v-window-item value="login">
              <div v-if="step === 1" class="fade-in">
                <p class="text-body-2 text-grey-lighten-2 mb-6 text-center">
                  Ingresa tu correo para recibir un código de acceso.
                </p>
                <v-form @submit.prevent="requestLogin">
                  <v-text-field
                    v-model="email"
                    prepend-inner-icon="mdi-email-outline"
                    placeholder="tucorreo@empresa.com"
                    variant="solo-filled"
                    class="custom-input mb-4"
                    bg-color="rgba(255,255,255,0.05)"
                    rounded="lg"
                    type="email"
                    :disabled="loading"
                    required
                  ></v-text-field>
                  <v-btn block color="primary" size="x-large" variant="elevated" :loading="loading" @click="requestLogin" class="premium-btn mt-2">
                    Recibir Código <v-icon end icon="mdi-arrow-right"></v-icon>
                  </v-btn>
                </v-form>
              </div>
            </v-window-item>

            <!-- REGISTER TAB -->
            <v-window-item value="register">
              <div v-if="step === 1" class="fade-in">
                <p class="text-body-2 text-grey-lighten-2 mb-6 text-center">
                  Completa tus datos para crear una nueva cuenta.
                </p>
                <v-form @submit.prevent="registerAccount">
                  <v-text-field v-model="regForm.fullName" label="Nombre Completo" variant="solo-filled" class="custom-input mb-2" bg-color="rgba(255,255,255,0.05)" rounded="lg" prepend-inner-icon="mdi-account" required></v-text-field>
                  <v-text-field v-model="regForm.email" label="Correo Electrónico" type="email" variant="solo-filled" class="custom-input mb-2" bg-color="rgba(255,255,255,0.05)" rounded="lg" prepend-inner-icon="mdi-email" required></v-text-field>
                  <v-text-field v-model="regForm.phone" label="Teléfono" variant="solo-filled" class="custom-input mb-2" bg-color="rgba(255,255,255,0.05)" rounded="lg" prepend-inner-icon="mdi-phone" required></v-text-field>
                  <v-text-field v-model="regForm.address" label="Dirección Completa" variant="solo-filled" class="custom-input mb-2" bg-color="rgba(255,255,255,0.05)" rounded="lg" prepend-inner-icon="mdi-map-marker" required></v-text-field>
                  
                  <v-row>
                    <v-col cols="12" sm="6" class="py-0">
                      <v-text-field v-model="regForm.company" label="Empresa" variant="solo-filled" class="custom-input mb-2" bg-color="rgba(255,255,255,0.05)" rounded="lg" prepend-inner-icon="mdi-domain"></v-text-field>
                    </v-col>
                    <v-col cols="12" sm="6" class="py-0">
                      <v-text-field v-model="regForm.department" label="Departamento" variant="solo-filled" class="custom-input mb-2" bg-color="rgba(255,255,255,0.05)" rounded="lg" prepend-inner-icon="mdi-office-building"></v-text-field>
                    </v-col>
                  </v-row>
                  <v-text-field v-model="regForm.position" label="Cargo" variant="solo-filled" class="custom-input mb-4" bg-color="rgba(255,255,255,0.05)" rounded="lg" prepend-inner-icon="mdi-briefcase"></v-text-field>

                  <v-btn block color="primary" size="x-large" variant="elevated" :loading="loading" @click="registerAccount" class="premium-btn mt-2">
                    Registrarme <v-icon end icon="mdi-account-plus"></v-icon>
                  </v-btn>
                </v-form>
              </div>
            </v-window-item>
          </v-window>

          <!-- OTP VERIFICATION (SHARED) -->
          <div v-if="step === 2" class="fade-in mt-2">
            <v-btn icon="mdi-chevron-left" variant="text" size="small" class="mb-2 text-white" @click="step = 1; code = '';"></v-btn>
            
            <div class="text-center mb-6">
              <div class="d-inline-flex pa-4 rounded-circle mb-4 pulse-animation" style="background: rgba(33, 150, 243, 0.15) !important;">
                <v-icon size="48" color="primary">mdi-shield-lock-outline</v-icon>
              </div>
              <h2 class="text-h5 font-weight-bold mb-2 text-white text-center">Código de Seguridad</h2>
              <p class="text-body-2 text-grey-lighten-2 text-center px-4" style="line-height: 1.4;">
                Hemos enviado un código temporal de 6 dígitos a <br>
                <span class="text-primary font-weight-bold">{{ tab === 'register' ? regForm.email : email }}</span>
              </p>
            </div>

            <v-form @submit.prevent="verifyLogin" class="px-4">
              <v-text-field
                v-model="code"
                placeholder="······"
                variant="solo-filled"
                class="custom-input otp-input mb-4"
                bg-color="rgba(255,255,255,0.04)"
                rounded="xl"
                maxlength="6"
                flat
                :disabled="loading"
                required
              ></v-text-field>
              <v-btn block color="primary" size="x-large" variant="elevated" :loading="loading" @click="verifyLogin" class="premium-btn mt-4">
                Verificar e Ingresar <v-icon end icon="mdi-login-variant"></v-icon>
              </v-btn>
            </v-form>
          </div>

        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import api from '../plugins/axios'

const router = useRouter()
const tab = ref('login')
const email = ref('')
const code = ref('')
const step = ref(1)
const loading = ref(false)
const errorMsg = ref('')
const successMsg = ref('')

const regForm = ref({
  fullName: '',
  email: '',
  phone: '',
  address: '',
  company: '',
  department: '',
  position: ''
})

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

const registerAccount = async () => {
  if (!regForm.value.fullName || !regForm.value.email) {
    errorMsg.value = 'Nombre completo y correo son requeridos.'
    return
  }

  loading.value = true
  errorMsg.value = ''
  successMsg.value = ''

  try {
    const response = await api.post('/api/auth/register', regForm.value)
    successMsg.value = response.data.msg || 'Cuenta creada. Revisa tu correo para el código OTP.'
    step.value = 2
  } catch (error) {
    console.error('Error al registrar cuenta:', error)
    errorMsg.value = error.response?.data?.msg || 'Error al crear la cuenta.'
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
    const currentEmail = tab.value === 'register' ? regForm.value.email : email.value
    const response = await api.post('/api/auth/login-verify', {
      email: currentEmail,
      code: code.value
    })
    
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

<style scoped>
.login-container {
  background-color: #0a0a0a;
  position: relative;
  background-image: radial-gradient(circle at top right, #1e3a8a 0%, transparent 40%),
                    radial-gradient(circle at bottom left, #0f172a 0%, transparent 40%);
}

.login-bg-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, rgba(10,10,10,0.85) 0%, rgba(10,10,10,0.6) 100%);
  z-index: 1;
}

.glass-card {
  background: rgba(255, 255, 255, 0.03) !important;
  backdrop-filter: blur(20px) !important;
  border: 1px solid rgba(255, 255, 255, 0.08) !important;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5) !important;
}

.z-index-2 {
  z-index: 2;
}

.gradient-text {
  background: linear-gradient(45deg, #FFFFFF, #90CAF9);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  letter-spacing: 1px;
}

.custom-input :deep(.v-field) {
  border: 1px solid rgba(255, 255, 255, 0.1) !important;
  transition: all 0.3s ease;
}

.custom-input :deep(.v-field__input) {
  color: white !important;
}

.custom-input :deep(.v-label) {
  color: rgba(255, 255, 255, 0.7) !important;
}

.custom-input :deep(.v-icon) {
  color: rgba(255, 255, 255, 0.7) !important;
}

.custom-input :deep(.v-field--focused) {
  border-color: #2196F3 !important;
  background: rgba(33, 150, 243, 0.08) !important;
}

.otp-input :deep(input) {
  text-align: center !important;
  font-size: 2.2rem !important;
  letter-spacing: 1.4rem !important;
  font-weight: 800 !important;
  color: #90CAF9 !important;
  font-family: 'Courier New', Courier, monospace !important;
  padding-left: 1.4rem !important;
  height: 70px !important;
}

.pulse-animation {
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(33, 150, 243, 0.4);
  }
  70% {
    box-shadow: 0 0 0 15px rgba(33, 150, 243, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(33, 150, 243, 0);
  }
}

.premium-btn {
  border-radius: 12px !important;
  text-transform: none !important;
  font-weight: 700 !important;
  letter-spacing: 0.5px !important;
  box-shadow: 0 8px 20px -6px rgba(33, 150, 243, 0.5) !important;
  transition: all 0.3s ease;
}

.premium-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 25px -8px rgba(33, 150, 243, 0.7) !important;
}

.fade-in {
  animation: fadeIn 0.5s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.opacity-20 {
  opacity: 0.2;
}

:deep(.v-tab) {
  text-transform: none !important;
  font-weight: bold;
  letter-spacing: 0;
}
</style>
