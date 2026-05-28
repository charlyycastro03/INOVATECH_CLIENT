<template>
  <div class="survey-wrapper">
    <!-- Loading -->
    <div v-if="loading" class="survey-center">
      <v-progress-circular indeterminate color="primary" size="60"></v-progress-circular>
      <p class="mt-4 text-body-1 text-grey">Cargando encuesta...</p>
    </div>

    <!-- Error: no encontrado -->
    <div v-else-if="error" class="survey-center">
      <v-icon size="64" color="error" class="mb-4">mdi-alert-circle-outline</v-icon>
      <h2 class="text-h5 font-weight-bold mb-2">Ticket no encontrado</h2>
      <p class="text-body-1 text-grey-lighten-1">{{ error }}</p>
    </div>

    <!-- Ya respondida -->
    <div v-else-if="alreadyAnswered" class="survey-center">
      <div class="survey-card pa-10 text-center">
        <v-icon size="80" color="success" class="mb-4">mdi-check-circle</v-icon>
        <h2 class="text-h5 font-weight-bold mb-3">Esta encuesta ya fue respondida</h2>
        <p class="text-body-1 text-grey-lighten-1">Gracias por tomarte el tiempo de calificar nuestro servicio.</p>
      </div>
    </div>

    <!-- Encuesta completada con éxito -->
    <div v-else-if="submitted" class="survey-center">
      <div class="survey-card pa-10 text-center">
        <v-icon size="80" color="success" class="mb-4">mdi-emoticon-happy-outline</v-icon>
        <h2 class="text-h5 font-weight-bold mb-3">¡Gracias por tu retroalimentación!</h2>
        <p class="text-body-1 text-grey-lighten-1 mb-6">Tu opinión nos ayuda a mejorar el servicio día a día.</p>
        <v-rating :model-value="form.rating" readonly size="36" color="warning" half-increments></v-rating>
      </div>
    </div>

    <!-- Formulario de encuesta -->
    <div v-else-if="ticket" class="survey-outer">
      <!-- Header -->
      <div class="survey-header pa-6 text-center">
        <div class="survey-logo mb-2">
          <v-icon size="32" color="white">mdi-headset</v-icon>
        </div>
        <h1 class="text-h5 font-weight-bold text-white">Encuesta de Satisfacción</h1>
        <p class="text-body-2 text-blue-lighten-3 mt-1">Inovatech — Mesa de Ayuda</p>
      </div>

      <div class="survey-card pa-8">
        <!-- Info del ticket -->
        <div class="ticket-info-box pa-4 rounded-lg mb-6">
          <div class="d-flex align-center mb-2">
            <v-icon color="primary" size="20" class="mr-2">mdi-ticket-confirmation-outline</v-icon>
            <span class="text-caption font-weight-bold text-grey-lighten-1 text-uppercase">Folio del Ticket</span>
          </div>
          <div class="text-h6 font-weight-bold text-primary">{{ ticket.TrackingID }}</div>
          <div class="text-body-2 text-grey-lighten-1 mt-1">{{ ticket.Subject }}</div>
          <div class="text-caption text-grey mt-1">Reportado por: {{ ticket.ReportedByName }}</div>
        </div>

        <!-- Pregunta 1: Rating -->
        <div class="mb-6">
          <p class="text-subtitle-1 font-weight-bold mb-3">¿Cómo calificarías el servicio recibido?</p>
          <div class="d-flex align-center flex-column">
            <v-rating
              v-model="form.rating"
              :length="5"
              size="48"
              color="warning"
              empty-icon="mdi-star-outline"
              full-icon="mdi-star"
              half-icon="mdi-star-half-full"
              hover
              class="mb-2"
            ></v-rating>
            <div class="text-body-2 text-grey-lighten-1">
              {{ ratingLabel }}
            </div>
          </div>
        </div>

        <v-divider class="mb-6 border-opacity-20"></v-divider>

        <!-- Pregunta 2: ¿Resuelto? -->
        <div class="mb-6">
          <p class="text-subtitle-1 font-weight-bold mb-3">¿Tu problema fue resuelto completamente?</p>
          <div class="d-flex gap-3">
            <v-btn
              :variant="form.wasResolved === true ? 'elevated' : 'outlined'"
              :color="form.wasResolved === true ? 'success' : 'grey'"
              prepend-icon="mdi-check-circle-outline"
              @click="form.wasResolved = true"
              class="flex-grow-1 rounded-lg"
              size="large"
            >
              Sí, fue resuelto
            </v-btn>
            <v-btn
              :variant="form.wasResolved === false ? 'elevated' : 'outlined'"
              :color="form.wasResolved === false ? 'error' : 'grey'"
              prepend-icon="mdi-close-circle-outline"
              @click="form.wasResolved = false"
              class="flex-grow-1 rounded-lg"
              size="large"
            >
              No fue resuelto
            </v-btn>
          </div>
        </div>

        <v-divider class="mb-6 border-opacity-20"></v-divider>

        <!-- Pregunta 3: Comentarios -->
        <div class="mb-6">
          <p class="text-subtitle-1 font-weight-bold mb-3">¿Algún comentario adicional? <span class="text-grey-lighten-1 font-weight-regular">(Opcional)</span></p>
          <v-textarea
            v-model="form.comments"
            placeholder="Cuéntanos cómo podemos mejorar el servicio..."
            variant="solo-filled"
            bg-color="rgba(255,255,255,0.05)"
            rows="3"
            hide-details
            class="rounded-lg"
          ></v-textarea>
        </div>

        <!-- Enviar -->
        <v-btn
          color="primary"
          size="large"
          block
          class="rounded-lg font-weight-bold"
          :disabled="!form.rating || form.wasResolved === null"
          :loading="submitting"
          @click="submitSurvey"
          prepend-icon="mdi-send"
        >
          Enviar Encuesta
        </v-btn>

        <p v-if="!form.rating || form.wasResolved === null" class="text-caption text-grey-lighten-1 text-center mt-3">
          Por favor califica el servicio e indica si tu problema fue resuelto para continuar
        </p>
      </div>

      <!-- Footer -->
      <div class="text-center py-4">
        <p class="text-caption text-grey">© {{ new Date().getFullYear() }} Inovatech — Mesa de Ayuda Tecnológica</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const trackingId = route.params.trackingId

const loading = ref(true)
const error = ref('')
const ticket = ref(null)
const alreadyAnswered = ref(false)
const submitted = ref(false)
const submitting = ref(false)

const form = ref({
  rating: 0,
  wasResolved: null,
  comments: ''
})

const ratingLabel = computed(() => {
  const labels = { 1: '😞 Muy malo', 2: '😕 Malo', 3: '😐 Regular', 4: '😊 Bueno', 5: '🤩 Excelente' }
  return labels[form.value.rating] || 'Selecciona una calificación'
})

const API_BASE = import.meta.env.VITE_API_URL || 'https://inovatech.com.mx'

onMounted(async () => {
  try {
    const res = await fetch(`${API_BASE}/api/client/survey/${trackingId}`)
    const data = await res.json()
    if (!res.ok) throw new Error(data.message || 'Error al cargar')
    ticket.value = data.ticket
    alreadyAnswered.value = data.alreadyAnswered
  } catch (e) {
    error.value = e.message
  } finally {
    loading.value = false
  }
})

const submitSurvey = async () => {
  if (!form.value.rating || form.value.wasResolved === null) return
  submitting.value = true
  try {
    const res = await fetch(`${API_BASE}/api/client/survey/${trackingId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        rating: form.value.rating,
        wasResolved: form.value.wasResolved,
        comments: form.value.comments
      })
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.message)
    submitted.value = true
  } catch (e) {
    alert(e.message || 'Error al enviar la encuesta')
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
.survey-wrapper {
  min-height: 100vh;
  background: linear-gradient(135deg, #0D1F33 0%, #1A3A5C 50%, #0D1F33 100%);
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding: 24px 16px;
}

.survey-center {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  text-align: center;
  color: white;
}

.survey-outer {
  width: 100%;
  max-width: 520px;
}

.survey-header {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 16px 16px 0 0;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-bottom: none;
}

.survey-logo {
  width: 56px;
  height: 56px;
  background: linear-gradient(135deg, #2563eb, #1A3A5C);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 12px;
  box-shadow: 0 8px 24px rgba(37, 99, 235, 0.4);
}

.survey-card {
  background: #1e2d3d;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 0 0 16px 16px;
  color: white;
}

.ticket-info-box {
  background: rgba(37, 99, 235, 0.1);
  border: 1px solid rgba(37, 99, 235, 0.3);
}

.gap-3 {
  gap: 12px;
}
</style>
