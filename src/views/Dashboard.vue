<template>
  <v-app id="inspire" class="dark-theme">
    <!-- Navbar Premium -->
    <v-app-bar flat class="glass-navbar px-4" border="b">
      <div class="d-flex align-center">
        <v-avatar color="primary" class="mr-3" size="40" variant="elevated">
          <span class="text-white font-weight-bold">{{ userInitials }}</span>
        </v-avatar>
        <div>
          <div class="text-subtitle-1 font-weight-bold text-white">Portal de Soporte</div>
          <div class="text-caption text-grey-lighten-1">{{ clientName }} ({{ clientEmail }})</div>
        </div>
      </div>
      <v-spacer></v-spacer>
      <v-btn variant="outlined" color="error" prepend-icon="mdi-logout" @click="logout" class="rounded-lg">
        Cerrar Sesión
      </v-btn>
    </v-app-bar>

    <v-main class="bg-dark">
      <div class="bg-overlay"></div>
      <v-container class="py-8 z-index-2 position-relative">
        <!-- Main Dashboard Header -->
        <v-row class="mb-4 align-center">
          <v-col cols="12" sm="8">
            <h1 class="text-h4 font-weight-black text-white gradient-text">Resumen Principal</h1>
            <p class="text-body-1 text-grey-lighten-1 mt-1">Bienvenido a tu centro de soporte inteligente.</p>
          </v-col>
          <v-col cols="12" sm="4" class="text-sm-right">
            <v-btn color="primary" size="large" prepend-icon="mdi-plus" class="px-6 rounded-lg font-weight-bold premium-btn" @click="openNewTicketDialog">
              Nuevo Ticket
            </v-btn>
          </v-col>
        </v-row>

        <!-- KPI Cards -->
        <v-row class="mb-8">
          <v-col cols="12" md="4">
            <v-card class="glass-card pa-4 rounded-xl d-flex align-center">
              <v-avatar color="rgba(33,150,243,0.15)" size="60" class="mr-4 text-primary">
                <v-icon size="30">mdi-ticket-confirmation</v-icon>
              </v-avatar>
              <div>
                <div class="text-h4 font-weight-black text-white">{{ tickets.length }}</div>
                <div class="text-subtitle-2 text-grey-lighten-1">Total de Tickets</div>
              </div>
            </v-card>
          </v-col>
          <v-col cols="12" md="4">
            <v-card class="glass-card pa-4 rounded-xl d-flex align-center">
              <v-avatar color="rgba(76,175,80,0.15)" size="60" class="mr-4 text-success">
                <v-icon size="30">mdi-alert-circle-outline</v-icon>
              </v-avatar>
              <div>
                <div class="text-h4 font-weight-black text-white">{{ openTickets }}</div>
                <div class="text-subtitle-2 text-grey-lighten-1">Tickets Abiertos</div>
              </div>
            </v-card>
          </v-col>
          <v-col cols="12" md="4">
            <v-card class="glass-card pa-4 rounded-xl d-flex align-center">
              <v-avatar color="rgba(158,158,158,0.15)" size="60" class="mr-4 text-grey-lighten-1">
                <v-icon size="30">mdi-check-circle-outline</v-icon>
              </v-avatar>
              <div>
                <div class="text-h4 font-weight-black text-white">{{ closedTickets }}</div>
                <div class="text-subtitle-2 text-grey-lighten-1">Tickets Resueltos</div>
              </div>
            </v-card>
          </v-col>
        </v-row>

        <!-- Alertas -->
        <v-alert v-if="globalMsg" :type="globalMsgType" variant="tonal" closable class="mb-6" @click:close="globalMsg = ''">
          {{ globalMsg }}
        </v-alert>

        <!-- Tabla -->
        <v-row>
          <v-col cols="12">
            <v-card class="glass-card rounded-xl pa-2">
              <v-card-title class="text-h6 font-weight-bold text-white px-4 pt-4">Historial de Casos</v-card-title>
              <v-data-table
                :headers="headers"
                :items="tickets"
                :loading="loading"
                loading-text="Cargando tus tickets..."
                no-data-text="No tienes ningún ticket de soporte registrado aún."
                class="bg-transparent text-white custom-table"
                theme="dark"
              >
                <template v-slot:item.TrackingID="{ item }">
                  <span class="font-weight-bold text-primary">{{ item.TrackingID }}</span>
                </template>
                <template v-slot:item.Status="{ item }">
                  <v-chip :color="getStatusColor(item.Status)" size="small" class="font-weight-bold text-uppercase px-3" variant="flat">
                    {{ translateStatus(item.Status) }}
                  </v-chip>
                </template>
                <template v-slot:item.CreatedAt="{ item }">
                  <span>{{ formatDate(item.CreatedAt) }}</span>
                </template>
                <template v-slot:item.actions="{ item }">
                  <v-btn icon="mdi-eye-outline" variant="text" color="primary" @click="viewTicketDetails(item)" title="Ver Detalles"></v-btn>
                </template>
              </v-data-table>
            </v-card>
          </v-col>
        </v-row>

        <!-- Diálogo: Crear Nuevo Ticket -->
        <v-dialog v-model="createTicketDialog" max-width="600px" persistent>
          <v-card class="glass-modal rounded-xl pa-4">
            <v-card-title class="d-flex justify-space-between align-center px-4">
              <span class="text-h5 font-weight-bold text-white">Crear Solicitud de Soporte</span>
              <v-btn icon="mdi-close" color="white" variant="text" @click="createTicketDialog = false" :disabled="formLoading"></v-btn>
            </v-card-title>
            
            <v-card-text class="pt-4">
              <v-form ref="ticketForm" v-model="isFormValid">
                <v-text-field
                  v-model="newTicket.title"
                  label="Asunto / Título Breve"
                  placeholder="Ej: Problema al conectar a la VPN"
                  variant="solo-filled"
                  bg-color="rgba(255,255,255,0.05)"
                  :rules="[v => !!v || 'El asunto es obligatorio']"
                  :disabled="formLoading"
                  class="mb-3 custom-input"
                  required
                ></v-text-field>

                <v-select
                  v-model="newTicket.category"
                  :items="categories"
                  item-title="name"
                  item-value="id"
                  label="Categoría del Problema"
                  variant="solo-filled"
                  bg-color="rgba(255,255,255,0.05)"
                  :rules="[v => !!v || 'Selecciona una categoría']"
                  :disabled="formLoading"
                  class="mb-3 custom-input"
                  required
                ></v-select>

                <v-textarea
                  v-model="newTicket.description"
                  label="Descripción Detallada"
                  placeholder="Describe de la manera más clara el problema."
                  variant="solo-filled"
                  bg-color="rgba(255,255,255,0.05)"
                  rows="4"
                  :rules="[v => !!v || 'La descripción es obligatoria']"
                  :disabled="formLoading"
                  class="custom-input"
                  required
                ></v-textarea>
              </v-form>
            </v-card-text>

            <v-card-actions class="px-4 pb-4">
              <v-spacer></v-spacer>
              <v-btn variant="text" color="grey-lighten-1" :disabled="formLoading" @click="createTicketDialog = false">
                Cancelar
              </v-btn>
              <v-btn color="primary" class="px-6 rounded-lg font-weight-bold premium-btn" :loading="formLoading" :disabled="!isFormValid" @click="submitTicket">
                Enviar Ticket
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>

        <!-- Diálogo: Detalles del Ticket y Conversación -->
        <v-dialog v-model="detailsDialog" max-width="800px" scrollable>
          <v-card class="glass-modal rounded-xl" v-if="selectedTicket">
            <v-card-title class="d-flex justify-space-between align-center px-6 py-4 bg-primary text-white" style="background: linear-gradient(45deg, #1e3a8a, #2563eb) !important;">
              <div>
                <span class="text-caption text-uppercase font-weight-bold opacity-75">Caso {{ selectedTicket.TrackingID }}</span>
                <h3 class="text-h6 font-weight-bold">{{ selectedTicket.Subject }}</h3>
              </div>
              <v-btn icon="mdi-close" color="white" variant="text" @click="detailsDialog = false"></v-btn>
            </v-card-title>
            
            <v-card-text class="pa-6 text-white" style="max-height: 60vh;">
              <!-- Ficha técnica del ticket -->
              <v-row class="mb-6 rounded-lg pa-3 mx-0" style="background: rgba(255,255,255,0.05);">
                <v-col cols="12" sm="4" class="py-1">
                  <div class="text-caption text-grey-lighten-1">Estado</div>
                  <v-chip :color="getStatusColor(selectedTicket.Status)" size="small" class="font-weight-bold text-uppercase" variant="flat">
                    {{ translateStatus(selectedTicket.Status) }}
                  </v-chip>
                </v-col>
                <v-col cols="12" sm="4" class="py-1">
                  <div class="text-caption text-grey-lighten-1">Categoría</div>
                  <div class="font-weight-bold">{{ selectedTicket.CategoryName || 'General' }}</div>
                </v-col>
                <v-col cols="12" sm="4" class="py-1">
                  <div class="text-caption text-grey-lighten-1">Atendido Por</div>
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
                  <span class="text-caption text-grey-lighten-1 ml-3">{{ formatDate(selectedTicket.CreatedAt) }}</span>
                </div>
                <v-card variant="tonal" color="primary" class="pa-4 rounded-lg">
                  <div class="text-body-1 whitespace-pre-line text-white">{{ selectedTicket.Message }}</div>
                </v-card>
              </div>

              <v-divider class="my-4 border-opacity-25" color="white"></v-divider>

              <!-- Historial de Respuestas -->
              <h4 class="text-subtitle-1 font-weight-bold mb-4">Respuestas y Seguimiento</h4>
              
              <div v-if="ticketMessages.length === 0" class="text-center py-6 text-grey-lighten-1 text-body-2">
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
                    <span class="text-caption text-grey-lighten-1 ml-3">{{ formatDate(msg.CreatedAt) }}</span>
                  </div>
                  
                  <v-card
                    :color="msg.UserID === selectedTicket.UserID ? 'rgba(255,255,255,0.1)' : 'rgba(33,150,243,0.15)'"
                    flat
                    class="pa-3 rounded-lg border border-opacity-10"
                    style="max-width: 85%;"
                  >
                    <div class="text-body-2 whitespace-pre-line text-white">{{ msg.Message }}</div>
                  </v-card>
                </div>
              </div>
            </v-card-text>

            <v-divider class="border-opacity-25" color="white"></v-divider>

            <!-- Campo para Agregar Respuesta -->
            <v-card-actions class="pa-4 d-flex flex-column" v-if="selectedTicket.Status !== 'Closed' && selectedTicket.Status !== 'Resolved'">
              <div class="w-100 d-flex align-end">
                <v-textarea
                  v-model="replyText"
                  label="Escribe tu respuesta..."
                  variant="solo-filled"
                  bg-color="rgba(255,255,255,0.05)"
                  rows="2"
                  hide-details
                  :disabled="replyLoading"
                  class="mr-2 w-100 custom-input"
                ></v-textarea>
                <v-btn
                  color="primary"
                  icon="mdi-send"
                  size="large"
                  class="rounded-lg premium-btn"
                  :loading="replyLoading"
                  :disabled="!replyText.trim()"
                  @click="submitReply"
                ></v-btn>
              </div>
            </v-card-actions>
            <v-card-actions class="pa-4 justify-center" style="background: rgba(255,255,255,0.02);" v-else>
              <span class="text-caption text-grey-lighten-1 font-weight-bold">
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

const openTickets = computed(() => tickets.value.filter(t => t.Status === 'Open' || t.Status === 'In Progress').length)
const closedTickets = computed(() => tickets.value.filter(t => t.Status === 'Closed' || t.Status === 'Resolved').length)

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
  if (status === 'Closed') return 'grey-lighten-1'
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
.dark-theme {
  background-color: #0a0a0a !important;
  color: white !important;
}

.bg-dark {
  background-color: #0a0a0a;
  position: relative;
  background-image: radial-gradient(circle at top right, rgba(30, 58, 138, 0.5) 0%, transparent 50%),
                    radial-gradient(circle at bottom left, rgba(15, 23, 42, 0.8) 0%, transparent 50%);
  min-height: 100vh;
}

.glass-navbar {
  background: rgba(10, 10, 10, 0.6) !important;
  backdrop-filter: blur(20px) !important;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05) !important;
}

.glass-card, .glass-modal {
  background: rgba(255, 255, 255, 0.03) !important;
  backdrop-filter: blur(20px) !important;
  border: 1px solid rgba(255, 255, 255, 0.08) !important;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5) !important;
  color: white;
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
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.3s ease;
  color: white;
}

.custom-input :deep(.v-field--focused) {
  border-color: #2196F3;
  background: rgba(33, 150, 243, 0.08) !important;
}

.custom-table {
  background: transparent !important;
}
.custom-table :deep(th) {
  background: rgba(255,255,255,0.02) !important;
  color: #90CAF9 !important;
  font-weight: bold !important;
  border-bottom: 1px solid rgba(255,255,255,0.1) !important;
}
.custom-table :deep(td) {
  border-bottom: 1px solid rgba(255,255,255,0.05) !important;
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

.whitespace-pre-line {
  white-space: pre-line;
}
.gap-4 {
  gap: 16px;
}
</style>
