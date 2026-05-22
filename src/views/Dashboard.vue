<template>
  <v-app id="inspire">
    <!-- Navbar Premium -->
    <v-app-bar flat color="white" border="b">
      <v-container class="fill-height d-flex align-center justify-space-between py-0">
        <div class="d-flex align-center">
          <v-avatar color="primary" class="mr-3" size="40">
            <span class="text-white font-weight-bold">{{ userInitials }}</span>
          </v-avatar>
          <div>
            <div class="text-subtitle-1 font-weight-bold text-grey-darken-3">Portal de Soporte</div>
            <div class="text-caption text-grey-darken-1">{{ clientName }} ({{ clientEmail }})</div>
          </div>
        </div>

        <v-btn
          variant="outlined"
          color="error"
          prepend-icon="mdi-logout"
          @click="logout"
        >
          Cerrar Sesión
        </v-btn>
      </v-container>
    </v-app-bar>

    <v-main class="bg-grey-lighten-4">
      <v-container class="py-8">
        <!-- Encabezado Principal -->
        <v-row class="mb-6 align-center">
          <v-col cols="12" sm="8">
            <h1 class="text-h4 font-weight-black text-grey-darken-4">Mis Casos de Soporte</h1>
            <p class="text-body-1 text-grey-darken-1 mt-1">Monitorea y da seguimiento a tus solicitudes de ayuda técnica en tiempo real.</p>
          </v-col>
          <v-col cols="12" sm="4" class="text-sm-right">
            <v-btn
              color="primary"
              size="large"
              prepend-icon="mdi-plus"
              class="px-6 rounded-lg font-weight-bold elevation-2"
              @click="openNewTicketDialog"
            >
              Nuevo Ticket
            </v-btn>
          </v-col>
        </v-row>

        <!-- Alertas de Estado -->
        <v-alert
          v-if="globalMsg"
          :type="globalMsgType"
          variant="tonal"
          closable
          class="mb-6"
          @click:close="globalMsg = ''"
        >
          {{ globalMsg }}
        </v-alert>

        <!-- Tabla y Contenido -->
        <v-row>
          <v-col cols="12">
            <v-card class="rounded-xl border" flat>
              <v-data-table
                :headers="headers"
                :items="tickets"
                :loading="loading"
                loading-text="Cargando tus tickets..."
                no-data-text="No tienes ningún ticket de soporte registrado aún."
                class="px-4 py-2"
              >
                <!-- Formatear Folio / ID -->
                <template v-slot:item.TrackingID="{ item }">
                  <span class="font-weight-bold text-primary">{{ item.TrackingID }}</span>
                </template>

                <!-- Formatear Estado -->
                <template v-slot:item.Status="{ item }">
                  <v-chip
                    :color="getStatusColor(item.Status)"
                    size="small"
                    class="font-weight-bold text-uppercase px-3"
                    variant="flat"
                  >
                    {{ translateStatus(item.Status) }}
                  </v-chip>
                </template>

                <!-- Formatear Fecha -->
                <template v-slot:item.CreatedAt="{ item }">
                  <span>{{ formatDate(item.CreatedAt) }}</span>
                </template>

                <!-- Acciones -->
                <template v-slot:item.actions="{ item }">
                  <v-btn
                    icon="mdi-eye-outline"
                    variant="text"
                    color="primary"
                    @click="viewTicketDetails(item)"
                    title="Ver Detalles del Ticket"
                  ></v-btn>
                </template>
              </v-data-table>
            </v-card>
          </v-col>
        </v-row>

        <!-- Diálogo: Crear Nuevo Ticket -->
        <v-dialog v-model="createTicketDialog" max-width="600px" persistent>
          <v-card class="rounded-xl pa-4">
            <v-card-title class="d-flex justify-space-between align-center px-4">
              <span class="text-h5 font-weight-bold">Crear Solicitud de Soporte</span>
              <v-btn icon="mdi-close" variant="text" @click="createTicketDialog = false" :disabled="formLoading"></v-btn>
            </v-card-title>
            
            <v-card-text class="pt-4">
              <v-form ref="ticketForm" v-model="isFormValid">
                <v-text-field
                  v-model="newTicket.title"
                  label="Asunto / Título Breve"
                  placeholder="Ej: Problema al conectar a la VPN corporativa"
                  variant="outlined"
                  :rules="[v => !!v || 'El asunto es obligatorio']"
                  :disabled="formLoading"
                  class="mb-3"
                  required
                ></v-text-field>

                <v-select
                  v-model="newTicket.category"
                  :items="categories"
                  item-title="name"
                  item-value="id"
                  label="Categoría del Problema"
                  variant="outlined"
                  :rules="[v => !!v || 'Selecciona una categoría']"
                  :disabled="formLoading"
                  class="mb-3"
                  required
                ></v-select>

                <v-textarea
                  v-model="newTicket.description"
                  label="Descripción Detallada"
                  placeholder="Por favor describe de la manera más clara el problema, incluyendo pasos para reproducirlo si aplica."
                  variant="outlined"
                  rows="4"
                  :rules="[v => !!v || 'La descripción es obligatoria']"
                  :disabled="formLoading"
                  required
                ></v-textarea>
              </v-form>
            </v-card-text>

            <v-card-actions class="px-4 pb-4">
              <v-spacer></v-spacer>
              <v-btn
                variant="text"
                color="secondary"
                :disabled="formLoading"
                @click="createTicketDialog = false"
              >
                Cancelar
              </v-btn>
              <v-btn
                color="primary"
                class="px-6 rounded-lg font-weight-bold"
                :loading="formLoading"
                :disabled="!isFormValid"
                @click="submitTicket"
              >
                Enviar Ticket
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>

        <!-- Diálogo: Detalles del Ticket y Conversación -->
        <v-dialog v-model="detailsDialog" max-width="800px" scrollable>
          <v-card class="rounded-xl" v-if="selectedTicket">
            <v-card-title class="d-flex justify-space-between align-center px-6 py-4 bg-primary text-white">
              <div>
                <span class="text-caption text-uppercase font-weight-bold opacity-75">Caso {{ selectedTicket.TrackingID }}</span>
                <h3 class="text-h6 font-weight-bold">{{ selectedTicket.Subject }}</h3>
              </div>
              <v-btn icon="mdi-close" color="white" variant="text" @click="detailsDialog = false"></v-btn>
            </v-card-title>
            
            <v-card-text class="pa-6" style="max-height: 60vh;">
              <!-- Ficha técnica del ticket -->
              <v-row class="mb-6 bg-grey-lighten-4 rounded-lg pa-3 mx-0 border">
                <v-col cols="12" sm="4" class="py-1">
                  <div class="text-caption text-grey-darken-1">Estado</div>
                  <v-chip :color="getStatusColor(selectedTicket.Status)" size="small" class="font-weight-bold text-uppercase" variant="flat">
                    {{ translateStatus(selectedTicket.Status) }}
                  </v-chip>
                </v-col>
                <v-col cols="12" sm="4" class="py-1">
                  <div class="text-caption text-grey-darken-1">Categoría</div>
                  <div class="font-weight-bold">{{ selectedTicket.CategoryName || 'General' }}</div>
                </v-col>
                <v-col cols="12" sm="4" class="py-1">
                  <div class="text-caption text-grey-darken-1">Atendido Por</div>
                  <div class="font-weight-bold text-primary">
                    {{ selectedTicket.AssignedEngineerName || 'Cola de Espera' }}
                  </div>
                </v-col>
              </v-row>

              <!-- Mensaje Inicial -->
              <div class="mb-6">
                <div class="d-flex align-center mb-2">
                  <v-avatar color="primary" size="32" class="mr-2">
                    <span class="text-white text-caption font-weight-bold">{{ userInitials }}</span>
                  </v-avatar>
                  <strong class="text-subtitle-2">{{ selectedTicket.ReportedByName || 'Tú' }}</strong>
                  <span class="text-caption text-grey ml-3">{{ formatDate(selectedTicket.CreatedAt) }}</span>
                </div>
                <v-card variant="tonal" color="primary" class="pa-4 rounded-lg">
                  <div class="text-body-1 whitespace-pre-line text-grey-darken-3">{{ selectedTicket.Message }}</div>
                </v-card>
              </div>

              <v-divider class="my-4"></v-divider>

              <!-- Historial de Respuestas -->
              <h4 class="text-subtitle-1 font-weight-bold mb-4">Respuestas y Seguimiento</h4>
              
              <div v-if="ticketMessages.length === 0" class="text-center py-6 text-grey text-body-2">
                <v-icon size="large" class="mb-2">mdi-message-text-outline</v-icon>
                <div>No hay respuestas en este ticket todavía.</div>
              </div>
              
              <div v-else class="d-flex flex-column gap-4">
                <div
                  v-for="msg in ticketMessages"
                  :key="msg.ReplyID"
                  :class="['d-flex flex-column mb-4', msg.UserID === selectedTicket.UserID ? 'align-start' : 'align-end']"
                >
                  <div class="d-flex align-center mb-1">
                    <v-avatar :color="msg.UserID === selectedTicket.UserID ? 'primary' : 'secondary'" size="28" class="mr-2">
                      <span class="text-white text-caption font-weight-bold">
                        {{ msg.SenderName ? msg.SenderName.substring(0, 2).toUpperCase() : 'ST' }}
                      </span>
                    </v-avatar>
                    <strong class="text-caption font-weight-bold">{{ msg.SenderName || 'Soporte Técnico' }}</strong>
                    <span class="text-caption text-grey ml-3">{{ formatDate(msg.CreatedAt) }}</span>
                  </div>
                  
                  <v-card
                    :color="msg.UserID === selectedTicket.UserID ? 'grey-lighten-3' : 'light-blue-lighten-5'"
                    flat
                    class="pa-3 rounded-lg"
                    style="max-width: 85%;"
                  >
                    <div class="text-body-2 whitespace-pre-line text-grey-darken-4">{{ msg.Message }}</div>
                  </v-card>
                </div>
              </div>
            </v-card-text>

            <v-divider></v-divider>

            <!-- Campo para Agregar Respuesta (Solo si no está Cerrado) -->
            <v-card-actions class="pa-4 d-flex flex-column" v-if="selectedTicket.Status !== 'Closed' && selectedTicket.Status !== 'Resolved'">
              <div class="w-100 d-flex align-end">
                <v-textarea
                  v-model="replyText"
                  label="Escribe tu respuesta..."
                  variant="outlined"
                  rows="2"
                  hide-details
                  :disabled="replyLoading"
                  class="mr-2 w-100"
                ></v-textarea>
                <v-btn
                  color="primary"
                  icon="mdi-send"
                  size="large"
                  class="rounded-lg"
                  :loading="replyLoading"
                  :disabled="!replyText.trim()"
                  @click="submitReply"
                ></v-btn>
              </div>
            </v-card-actions>
            <v-card-actions class="pa-4 bg-grey-lighten-4 justify-center" v-else>
              <span class="text-caption text-grey-darken-1 font-weight-bold">
                <v-icon left size="small">mdi-lock</v-icon>
                Este ticket ha sido resuelto o cerrado y no admite más respuestas.
              </span>
            </v-card-actions>
          </v-card>
        </v-dialog>
      </v-container>
    </v-main>
  </v-app>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import api from '../plugins/axios'

const router = useRouter()

// Datos del Cliente (Session)
const clientName = ref('Cliente')
const clientEmail = ref('')

const userInitials = computed(() => {
  if (!clientName.value) return 'CL'
  return clientName.value.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
})

// Listado de tickets
const headers = [
  { title: 'Folio', align: 'start', key: 'TrackingID' },
  { title: 'Asunto / Título', key: 'Subject' },
  { title: 'Fecha de Creación', key: 'CreatedAt' },
  { title: 'Estado del Caso', key: 'Status', align: 'center' },
  { title: 'Detalles', key: 'actions', sortable: false, align: 'center' },
]

const tickets = ref([])
const loading = ref(false)
const globalMsg = ref('')
const globalMsgType = ref('success')

// Diálogo de Creación
const createTicketDialog = ref(false)
const isFormValid = ref(false)
const formLoading = ref(false)
const ticketForm = ref(null)
const newTicket = ref({
  title: '',
  category: 1,
  description: ''
})

const categories = [
  { id: 1, name: 'Soporte General' },
  { id: 2, name: 'Redes y Conectividad' },
  { id: 3, name: 'Hardware y Equipos' },
  { id: 4, name: 'Sistemas y Software' },
]

// Diálogo de Detalles del ticket
const detailsDialog = ref(false)
const selectedTicket = ref(null)
const ticketMessages = ref([])
const replyText = ref('')
const replyLoading = ref(false)

// Configuración de Estados
const getStatusColor = (status) => {
  if (status === 'Open') return 'success'
  if (status === 'In Progress') return 'info'
  if (status === 'Resolved') return 'warning'
  if (status === 'Closed') return 'grey-darken-1'
  return 'primary'
}

const translateStatus = (status) => {
  if (status === 'Open') return 'Abierto'
  if (status === 'In Progress') return 'En Progreso'
  if (status === 'Resolved') return 'Resuelto'
  if (status === 'Closed') return 'Cerrado'
  return status
}

const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('es-MX', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// Carga de Tickets desde API
const fetchTickets = async () => {
  loading.value = true
  try {
    const response = await api.get('/api/client/tickets')
    tickets.value = response.data
  } catch (error) {
    console.error('Error al cargar tickets:', error)
    globalMsg.value = 'No se pudieron cargar tus tickets. Revisa tu conexión.'
    globalMsgType.value = 'error'
  } finally {
    loading.value = false
  }
}

// Abrir diálogo de creación
const openNewTicketDialog = () => {
  newTicket.value = { title: '', category: 1, description: '' }
  createTicketDialog.value = true
  if (ticketForm.value) ticketForm.value.resetValidation()
}

// Enviar Ticket nuevo
const submitTicket = async () => {
  if (!newTicket.value.title || !newTicket.value.description) return
  formLoading.value = true
  try {
    await api.post('/api/client/tickets', {
      title: newTicket.value.title,
      category: newTicket.value.category,
      description: newTicket.value.description
    })
    globalMsg.value = '¡Tu ticket ha sido creado con éxito! Le daremos seguimiento a la brevedad.'
    globalMsgType.value = 'success'
    createTicketDialog.value = false
    fetchTickets()
  } catch (error) {
    console.error('Error al crear ticket:', error)
    globalMsg.value = error.response?.data?.message || 'Error al procesar el ticket.'
    globalMsgType.value = 'error'
  } finally {
    formLoading.value = false
  }
}

// Ver detalles e historial de conversación de un Ticket
const viewTicketDetails = async (ticket) => {
  selectedTicket.value = ticket
  detailsDialog.value = true
  ticketMessages.value = []
  replyText.value = ''
  
  try {
    const response = await api.get(`/api/client/tickets/${ticket.TicketID}`)
    selectedTicket.value = response.data.ticket
    ticketMessages.value = response.data.messages
  } catch (error) {
    console.error('Error al cargar el detalle del ticket:', error)
  }
}

// Responder a un Ticket
const submitReply = async () => {
  if (!replyText.value.trim() || !selectedTicket.value) return
  replyLoading.value = true
  try {
    const ticketId = selectedTicket.value.TicketID
    await api.post(`/api/client/tickets/${ticketId}/reply`, {
      message: replyText.value
    })
    
    // Recargar historial del ticket
    const response = await api.get(`/api/client/tickets/${ticketId}`)
    ticketMessages.value = response.data.messages
    replyText.value = ''
  } catch (error) {
    console.error('Error al responder ticket:', error)
  } finally {
    replyLoading.value = false
  }
}

// Cerrar sesión
const logout = () => {
  localStorage.removeItem('clientToken')
  localStorage.removeItem('clientUser')
  router.push('/login')
}

// Inicialización
onMounted(() => {
  // Cargar info del usuario del localStorage
  const rawUser = localStorage.getItem('clientUser')
  const token = localStorage.getItem('clientToken')
  
  if (!token) {
    router.push('/login')
    return
  }

  if (rawUser) {
    try {
      const user = JSON.parse(rawUser)
      clientName.value = user.name || 'Cliente'
      clientEmail.value = user.email || ''
    } catch (e) {
      console.error(e)
    }
  }
  
  fetchTickets()
})
</script>

<style scoped>
.whitespace-pre-line {
  white-space: pre-line;
}
.gap-4 {
  gap: 16px;
}
</style>
