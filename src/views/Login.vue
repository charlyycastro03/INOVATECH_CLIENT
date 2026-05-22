<template>
  <v-container class="fill-height" fluid>
    <v-row align="center" justify="center">
      <v-col cols="12" sm="8" md="4">
        <v-card class="elevation-12">
          <v-toolbar color="primary" dark flat>
            <v-toolbar-title>Acceso Clientes</v-toolbar-title>
          </v-toolbar>
          <v-card-text>
            <v-form @submit.prevent="requestLogin">
              <v-text-field
                v-model="email"
                label="Correo Electrónico"
                name="email"
                prepend-icon="mdi-account"
                type="email"
                required
              ></v-text-field>
              
              <v-text-field
                v-if="step === 2"
                v-model="code"
                label="Código OTP"
                name="code"
                prepend-icon="mdi-lock"
                type="text"
                required
              ></v-text-field>
            </v-form>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="primary" @click="step === 1 ? requestLogin() : verifyLogin()">
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
// import axios from 'axios'

const router = useRouter()
const email = ref('')
const code = ref('')
const step = ref(1)

const requestLogin = async () => {
  if (!email.value) return
  // TODO: Implementar llamada a API /api/auth/login-request
  console.log('Solicitando código para', email.value)
  step.value = 2
}

const verifyLogin = async () => {
  if (!code.value) return
  // TODO: Implementar llamada a API /api/auth/login-verify
  console.log('Verificando código', code.value)
  // Mock login success
  localStorage.setItem('clientToken', 'mock-token')
  router.push('/dashboard')
}
</script>
