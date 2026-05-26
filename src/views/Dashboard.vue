<template>
  <div class="dashboard-wrapper w-100 h-100">
    <!-- Navbar Premium -->
    <v-app-bar flat class="glass-navbar px-4" border="b">
      <div class="d-flex align-center">
        <v-avatar color="primary" class="mr-3" size="40" variant="elevated">
          <span class="text-white font-weight-bold">{{ userInitials }}</span>
        </v-avatar>
        <div>
          <div class="text-subtitle-1 font-weight-bold" :class="isDarkTheme ? 'text-white' : 'text-black'">Portal de Soporte</div>
          <div class="text-caption text-grey-lighten-1">{{ clientName }} ({{ clientEmail }})</div>
        </div>
      </div>
      <v-spacer></v-spacer>
      <v-btn icon variant="text" @click="toggleTheme" class="mr-3" :color="isDarkTheme ? 'white' : 'black'">
        <v-icon>{{ isDarkTheme ? 'mdi-weather-sunny' : 'mdi-weather-night' }}</v-icon>
      </v-btn>
      <v-btn variant="outlined" color="error" prepend-icon="mdi-logout" @click="logout" class="rounded-lg">
        Cerrar Sesión
      </v-btn>
    </v-app-bar>

    <v-main :class="isDarkTheme ? 'bg-dark' : 'bg-grey-lighten-4'">
      <div v-if="isDarkTheme" class="bg-overlay"></div>
      <v-container class="py-8 z-index-2 position-relative">
        <!-- Main Dashboard Header -->
        <v-row class="mb-4 align-center">
          <v-col cols="12" sm="8">
            <h1 class="text-h4 font-weight-black gradient-text" :class="isDarkTheme ? 'text-white' : 'text-black'">Resumen Principal</h1>
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
                <div class="text-h4 font-weight-black" :class="isDarkTheme ? 'text-white' : 'text-black'">{{ tickets.length }}</div>
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
                <div class="text-h4 font-weight-black" :class="isDarkTheme ? 'text-white' : 'text-black'">{{ openTickets }}</div>
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
                <div class="text-h4 font-weight-black" :class="isDarkTheme ? 'text-white' : 'text-black'">{{ closedTickets }}</div>
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
              <v-card-title class="text-h6 font-weight-bold px-4 pt-4" :class="isDarkTheme ? 'text-white' : 'text-black'">Historial de Casos</v-card-title>
              <v-data-table
                :headers="headers"
                :items="tickets"
                :loading="loading"
                loading-text="Cargando tus tickets..."
                no-data-text="No tienes ningún ticket de soporte registrado aún."
                class="bg-transparent custom-table"
                :theme="isDarkTheme ? 'dark' : 'light'"
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
              <span class="text-h5 font-weight-bold" :class="isDarkTheme ? 'text-white' : 'text-black'">Crear Solicitud de Soporte</span>
              <v-btn icon="mdi-close" :color="isDarkTheme ? 'white' : 'black'" variant="text" @click="createTicketDialog = false" :disabled="formLoading"></v-btn>
            </v-card-title>
            
            <v-card-text class="pt-4">
              <v-form ref="ticketForm" v-model="isFormValid">
                <!-- Detalles Principales -->
                <v-row>
                  <v-col cols="12" sm="6">
                    <v-text-field
                      v-model="newTicket.title"
                      label="Asunto / Título Breve"
                      placeholder="Ej: Problema con el ERP"
                      variant="solo-filled"
                      :bg-color="isDarkTheme ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'"
                      :rules="[v => !!v || 'El asunto es obligatorio']"
                      :disabled="formLoading"
                      class="custom-input"
                      required
                    ></v-text-field>
                  </v-col>
                  <v-col cols="12" sm="6">
                    <v-select
                      v-model="newTicket.category"
                      :items="categories"
                      item-title="Name"
                      item-value="CategoryID"
                      label="Categoría del Problema"
                      variant="solo-filled"
                      :bg-color="isDarkTheme ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'"
                      :rules="[v => !!v || 'Selecciona una categoría']"
                      :disabled="formLoading"
                      class="custom-input"
                      required
                    ></v-select>
                  </v-col>
                  <v-col cols="12" sm="6">
                    <v-select
                      v-model="newTicket.ticketType"
                      :items="typeOptions"
                      item-title="title"
                      item-value="value"
                      label="Tipo de Solicitud"
                      variant="solo-filled"
                      :bg-color="isDarkTheme ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'"
                      :disabled="formLoading"
                      class="custom-input"
                    ></v-select>
                  </v-col>
                  <v-col cols="12" sm="6">
                    <v-select
                      v-model="newTicket.priority"
                      :items="priorityOptions"
                      item-title="title"
                      item-value="value"
                      label="Prioridad / Urgencia"
                      variant="solo-filled"
                      :bg-color="isDarkTheme ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'"
                      :disabled="formLoading"
                      class="custom-input"
                    ></v-select>
                  </v-col>
                  <v-col cols="12" sm="6">
                    <v-text-field
                      v-model="newTicket.contactPhone"
                      label="Teléfono de Contacto"
                      placeholder="Ej: +52 555 123 4567"
                      variant="solo-filled"
                      :bg-color="isDarkTheme ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'"
                      :disabled="formLoading"
                      class="custom-input"
                    ></v-text-field>
                  </v-col>
                  <v-col cols="12" sm="6">
                    <v-text-field
                      v-model="newTicket.location"
                      label="Ubicación / Sucursal"
                      placeholder="Ej: Oficina Central MTY"
                      variant="solo-filled"
                      :bg-color="isDarkTheme ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'"
                      :disabled="formLoading"
                      class="custom-input"
                    ></v-text-field>
                  </v-col>
                  <v-col cols="12" sm="12">
                    <v-text-field
                      v-model="newTicket.contactAddress"
                      label="Dirección de Contacto"
                      placeholder="Ej: Av. Principal 123"
                      variant="solo-filled"
                      :bg-color="isDarkTheme ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'"
                      :disabled="formLoading"
                      class="custom-input"
                    ></v-text-field>
                  </v-col>
                </v-row>

                <!-- Switch para activar Placa de Activo -->
                <v-switch
                  v-model="enableAssetPlate"
                  label="Habilitar Detalles de Equipo / Placa de Activo"
                  color="primary"
                  class="mb-2"
                  hide-details
                ></v-switch>

                <!-- Panel Colapsable de Activos -->
                <v-expansion-panels v-if="enableAssetPlate" class="mb-4 glass-expansion" variant="accordion">
                  <v-expansion-panel :bg-color="isDarkTheme ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)'">
                    <v-expansion-panel-title class="font-weight-bold" :class="isDarkTheme ? 'text-white' : 'text-black'">
                      <v-icon left class="mr-2" color="primary">mdi-laptop</v-icon>
                      Detalles del Equipo / Activo (Opcional)
                    </v-expansion-panel-title>
                    <v-expansion-panel-text>
                      <v-row class="pt-2">
                        <v-col cols="12" sm="4">
                          <v-text-field
                            v-model="newTicket.model"
                            label="Marca y Modelo"
                            placeholder="Ej: Dell Latitude"
                            variant="solo-filled"
                            :bg-color="isDarkTheme ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'"
                            :disabled="formLoading"
                            class="custom-input mb-0"
                            hide-details
                          ></v-text-field>
                        </v-col>
                        <v-col cols="12" sm="4">
                          <v-text-field
                            v-model="newTicket.serialNumber"
                            label="Número de Serie"
                            placeholder="Ej: SN-987654"
                            variant="solo-filled"
                            :bg-color="isDarkTheme ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'"
                            :disabled="formLoading"
                            class="custom-input mb-0"
                            hide-details
                          ></v-text-field>
                        </v-col>
                        <v-col cols="12" sm="4">
                          <v-text-field
                            v-model="newTicket.assetNumber"
                            label="Placa de Activo"
                            placeholder="Ej: INV-00123"
                            variant="solo-filled"
                            :bg-color="isDarkTheme ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'"
                            :disabled="formLoading"
                            class="custom-input mb-0"
                            hide-details
                          ></v-text-field>
                        </v-col>
                      </v-row>
                    </v-expansion-panel-text>
                  </v-expansion-panel>
                </v-expansion-panels>

                <!-- Adjuntos -->
                <v-file-input
                  v-model="newTicket.photo"
                  label="Adjuntar Evidencia (Foto/Video)"
                  placeholder="Selecciona un archivo"
                  prepend-icon="mdi-camera"
                  variant="solo-filled"
                  :bg-color="isDarkTheme ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'"
                  accept="image/*,video/*"
                  :disabled="formLoading"
                  class="custom-input mb-4"
                  show-size
                  clearable
                ></v-file-input>

                <v-textarea
                  v-model="newTicket.description"
                  label="Descripción Detallada"
                  placeholder="Describe de la manera más clara el problema."
                  variant="solo-filled"
                  :bg-color="isDarkTheme ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'"
                  rows="3"
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
            
            <v-card-text class="pa-6" :class="isDarkTheme ? 'text-white' : 'text-black'" style="max-height: 60vh;">
              <!-- Ficha técnica del ticket -->
              <v-row class="mb-6 rounded-lg pa-3 mx-0" :style="{ background: isDarkTheme ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }">
                <v-col cols="12" sm="4" md="3" class="py-1">
                  <div class="text-caption text-grey-lighten-1">Estado</div>
                  <v-chip :color="getStatusColor(selectedTicket.Status)" size="small" class="font-weight-bold text-uppercase" variant="flat">
                    {{ translateStatus(selectedTicket.Status) }}
                  </v-chip>
                </v-col>
                <v-col cols="12" sm="4" md="3" class="py-1">
                  <div class="text-caption text-grey-lighten-1">Categoría</div>
                  <div class="font-weight-bold text-truncate">{{ selectedTicket.CategoryName || 'General' }}</div>
                </v-col>
                <v-col cols="12" sm="4" md="3" class="py-1">
                  <div class="text-caption text-grey-lighten-1">Prioridad</div>
                  <div class="font-weight-bold text-warning">{{ selectedTicket.Priority || 'Medium' }}</div>
                </v-col>
                <v-col cols="12" sm="6" md="3" class="py-1">
                  <div class="text-caption text-grey-lighten-1">Atendido Por</div>
                  <div class="font-weight-bold text-primary text-truncate">
                    {{ selectedTicket.AssignedEngineerName || 'En Cola' }}
                  </div>
                </v-col>
                <v-col cols="12" sm="6" md="3" class="py-1 mt-2" v-if="selectedTicket.Location">
                  <div class="text-caption text-grey-lighten-1">Ubicación</div>
                  <div class="font-weight-bold text-truncate">{{ selectedTicket.Location }}</div>
                </v-col>
                <v-col cols="12" sm="6" md="3" class="py-1 mt-2" v-if="selectedTicket.ContactPhone">
                  <div class="text-caption text-grey-lighten-1">Teléfono</div>
                  <div class="font-weight-bold text-truncate">{{ selectedTicket.ContactPhone }}</div>
                </v-col>
                <v-col cols="12" sm="12" md="6" class="py-1 mt-2" v-if="selectedTicket.Model || selectedTicket.SerialNumber || selectedTicket.AssetNumber">
                  <div class="text-caption text-grey-lighten-1">Equipo / Activo</div>
                  <div class="font-weight-bold text-truncate">
                    {{ [selectedTicket.Model, selectedTicket.SerialNumber, selectedTicket.AssetNumber].filter(Boolean).join(' | ') }}
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
                  <div class="text-body-1 whitespace-pre-line" :class="isDarkTheme ? 'text-white' : 'text-black'">{{ selectedTicket.Message }}</div>
                </v-card>
              </div>

              <!-- Adjuntos -->
              <div v-if="ticketAttachments.length > 0" class="mb-6">
                <h4 class="text-subtitle-1 font-weight-bold mb-3">Evidencia Adjunta</h4>
                <v-row>
                  <v-col v-for="att in ticketAttachments" :key="att.AttachmentID" cols="12" sm="6" md="4">
                    <v-card class="pa-2 rounded-lg text-center bg-surface" border>
                      <v-img v-if="att.FileType.startsWith('image/')" :src="att.FileData" height="150" cover class="rounded-lg mb-2"></v-img>
                      <video v-else-if="att.FileType.startsWith('video/')" :src="att.FileData" controls height="150" class="w-100 rounded-lg mb-2 bg-black"></video>
                      <v-icon v-else size="48" color="grey" class="my-4">mdi-file-document-outline</v-icon>
                      <div class="text-caption text-truncate px-2">{{ att.FileName }}</div>
                      <v-btn
                        variant="text"
                        color="primary"
                        size="small"
                        block
                        class="mt-1"
                        :href="att.FileData"
                        :download="att.FileName"
                      >
                        Descargar
                      </v-btn>
                    </v-card>
                  </v-col>
                </v-row>
              </div>

              <v-divider class="my-4 border-opacity-25" :color="isDarkTheme ? 'white' : 'black'"></v-divider>

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
                    :color="msg.UserID === selectedTicket.UserID ? (isDarkTheme ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)') : 'rgba(33,150,243,0.15)'"
                    flat
                    class="pa-3 rounded-lg border border-opacity-10"
                    style="max-width: 85%;"
                  >
                    <div class="text-body-2 whitespace-pre-line" :class="isDarkTheme ? 'text-white' : 'text-black'">{{ msg.Message }}</div>
                  </v-card>
                </div>
              </div>
            </v-card-text>

            <v-divider class="border-opacity-25" :color="isDarkTheme ? 'white' : 'black'"></v-divider>

            <!-- Campo para Agregar Respuesta -->
            <v-card-actions class="pa-4 d-flex flex-column" v-if="selectedTicket.Status !== 'Closed' && selectedTicket.Status !== 'Resolved'">
              <div class="w-100 d-flex align-end">
                <v-textarea
                  v-model="replyText"
                  label="Escribe tu respuesta..."
                  variant="solo-filled"
                  :bg-color="isDarkTheme ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'"
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
            <v-card-actions class="pa-4 justify-center" :style="{ background: isDarkTheme ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)' }" v-else>
              <span class="text-caption text-grey-lighten-1 font-weight-bold">
                <v-icon left size="small">mdi-lock</v-icon>
                Este ticket ha sido resuelto o cerrado y no admite más respuestas.
              </span>
            </v-card-actions>
          </v-card>
        </v-dialog>
      </v-container>
    </v-main>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useTheme } from 'vuetify'
import api from '../plugins/axios'

const router = useRouter()
const theme = useTheme()

const isDarkTheme = computed(() => theme.global.name.value === 'dark')

const toggleTheme = () => {
  theme.global.name.value = isDarkTheme.value ? 'light' : 'dark'
  localStorage.setItem('portal_theme', theme.global.name.value)
}

// Datos del Cliente (Session)
const clientName = ref('Cliente')
const clientEmail = ref('')
const clientPhone = ref('')
const clientAddress = ref('')
const user = ref(null)

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
const priorityOptions = ref([
  { title: 'Baja', value: 'Low' },
  { title: 'Media', value: 'Medium' },
  { title: 'Alta', value: 'High' },
  { title: 'Crítica', value: 'Critical' }
])
const typeOptions = ref([
  { title: 'Incidente', value: 'Incident' },
  { title: 'Requerimiento', value: 'Service Request' },
  { title: 'Problema', value: 'Problem' },
  { title: 'Cambio', value: 'Change' }
])
const newTicket = ref({
  title: '',
  category: null,
  description: '',
  priority: 'Medium',
  ticketType: 'Incident',
  contactPhone: '',
  contactAddress: '',
  location: '',
  serialNumber: '',
  model: '',
  assetNumber: '',
  impactLevel: 'Low',
  photo: null
})

const enableAssetPlate = ref(false)

const categories = ref([])

const fetchCategories = async () => {
  try {
    const response = await api.get('/api/client/categories')
    categories.value = response.data
    if (categories.value.length > 0) {
      newTicket.value.category = categories.value[0].CategoryID
    }
  } catch (error) {
    console.error('Error al cargar categorías:', error)
    // Fallback in case of error
    categories.value = [
      { CategoryID: 1, Name: 'Soporte General' },
      { CategoryID: 2, Name: 'Hardware' },
      { CategoryID: 3, Name: 'Software' },
      { CategoryID: 4, Name: 'Red / Conectividad' }
    ]
  }
}

// Diálogo de Detalles del ticket
const detailsDialog = ref(false)
const selectedTicket = ref(null)
const ticketMessages = ref([])
const ticketAttachments = ref([])
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

const openNewTicketDialog = () => {
  newTicket.value = {
    title: '',
    category: categories.value.length > 0 ? categories.value[0].CategoryID : 1,
    description: '',
    priority: 'Low',
    ticketType: 'Incident',
    contactPhone: clientPhone.value || '',
    contactAddress: clientAddress.value || '',
    location: '',
    serialNumber: '',
    model: '',
    assetNumber: '',
    impactLevel: 'Low',
    photo: null
  }
  enableAssetPlate.value = false
  createTicketDialog.value = true
  if (ticketForm.value) ticketForm.value.resetValidation()
}

// Enviar Ticket nuevo
const submitTicket = async () => {
  if (!newTicket.value.title || !newTicket.value.description) return
  formLoading.value = true
  try {
    const formData = new FormData()
    formData.append('title', newTicket.value.title)
    formData.append('category', newTicket.value.category)
    formData.append('description', newTicket.value.description)
    formData.append('priority', newTicket.value.priority)
    formData.append('ticketType', newTicket.value.ticketType)
    formData.append('contactPhone', newTicket.value.contactPhone)
    formData.append('contactAddress', newTicket.value.contactAddress)
    formData.append('location', newTicket.value.location)
    formData.append('impactLevel', newTicket.value.impactLevel)

    if (enableAssetPlate.value) {
      formData.append('serialNumber', newTicket.value.serialNumber)
      formData.append('model', newTicket.value.model)
      formData.append('assetNumber', newTicket.value.assetNumber)
    }

    if (newTicket.value.photo) {
      // In Vuetify 3, file inputs often give an array. Check if it's an array.
      const photoFile = Array.isArray(newTicket.value.photo) ? newTicket.value.photo[0] : newTicket.value.photo;
      if (photoFile) {
        formData.append('photo', photoFile)
      }
    }

    await api.post('/api/client/tickets', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
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
  ticketAttachments.value = []
  replyText.value = ''
  
  try {
    const response = await api.get(`/api/client/tickets/${ticket.TicketID}`)
    selectedTicket.value = response.data.ticket
    ticketMessages.value = response.data.messages
    ticketAttachments.value = response.data.attachments || []
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
  const savedTheme = localStorage.getItem('portal_theme')
  if (savedTheme) {
    theme.global.name.value = savedTheme
  }

  const rawUser = localStorage.getItem('clientUser')
  const token = localStorage.getItem('clientToken')
  
  if (!token) {
    router.push('/login')
    return
  }

  if (rawUser) {
    try {
      const parsedUser = JSON.parse(rawUser)
      user.value = parsedUser
      clientName.value = parsedUser.name || parsedUser.FullName || 'Cliente'
      clientEmail.value = parsedUser.email || parsedUser.Email || ''
      clientPhone.value = parsedUser.phone || parsedUser.Phone || ''
      clientAddress.value = parsedUser.address || parsedUser.Address || ''
    } catch (e) {
      console.error(e)
    }
  }
  
  fetchCategories()
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
  backdrop-filter: blur(12px) !important;
  -webkit-backdrop-filter: blur(12px) !important;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05) !important;
  will-change: transform, backdrop-filter;
}

.glass-card {
  background: rgba(255, 255, 255, 0.03) !important;
  backdrop-filter: blur(12px) !important;
  -webkit-backdrop-filter: blur(12px) !important;
  border: 1px solid rgba(255, 255, 255, 0.08) !important;
  box-shadow: 0 15px 35px -10px rgba(0, 0, 0, 0.4) !important;
  color: white;
  will-change: transform, backdrop-filter;
}

.glass-modal {
  background: rgba(15, 20, 25, 0.95) !important; /* Much more solid background for readability */
  backdrop-filter: blur(16px) !important;
  -webkit-backdrop-filter: blur(16px) !important;
  border: 1px solid rgba(255, 255, 255, 0.1) !important;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.6) !important;
  color: white;
  will-change: transform, backdrop-filter;
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

.glass-expansion :deep(.v-expansion-panel) {
  background: rgba(255, 255, 255, 0.03) !important;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
}
.glass-expansion :deep(.v-expansion-panel-title) {
  padding: 12px 16px;
}
</style>
