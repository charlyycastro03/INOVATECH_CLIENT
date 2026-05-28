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
      <v-btn v-if="isAdminOrInovatech" icon variant="text" to="/helpdesk/kpis" class="mr-2" :color="isDarkTheme ? 'white' : 'black'" title="Dashboard KPIs">
        <v-icon>mdi-chart-box-outline</v-icon>
      </v-btn>
      <v-btn v-if="isAdminOrInovatech" icon variant="text" to="/helpdesk/settings/notifications" class="mr-2" :color="isDarkTheme ? 'white' : 'black'" title="Configuración de Notificaciones">
        <v-icon>mdi-cog-outline</v-icon>
      </v-btn>
      <v-btn icon variant="text" @click="toggleTheme" class="mr-3" :color="isDarkTheme ? 'white' : 'black'" title="Cambiar Tema">
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
              <v-tabs v-model="activeTab" color="primary" align-tabs="start" class="px-4 pt-2">
                <v-tab value="my_tickets" class="text-subtitle-2 font-weight-bold">Mis Tickets</v-tab>
                <v-tab value="all_tickets" class="text-subtitle-2 font-weight-bold" v-if="isAdminOrInovatech">Todos los Tickets</v-tab>
                <v-tab value="users" class="text-subtitle-2 font-weight-bold" v-if="isAdminOrInovatech">Usuarios y Clientes</v-tab>
              </v-tabs>
              
              <v-divider class="mb-2"></v-divider>

              <!-- Acciones Rápidas (Buscador y Export) -->
              <div class="px-4 pb-3 pt-1 d-flex flex-wrap align-center gap-4">
                <v-text-field
                  v-model="searchQuery"
                  prepend-inner-icon="mdi-magnify"
                  label="Buscar por folio, asunto, estado o nombre..."
                  variant="solo-filled"
                  density="compact"
                  hide-details
                  clearable
                  :bg-color="isDarkTheme ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)'"
                  class="rounded-lg flex-grow-1"
                  style="min-width: 250px;"
                ></v-text-field>

                <v-btn
                  v-if="isAdminOrInovatech"
                  color="success"
                  prepend-icon="mdi-file-excel"
                  variant="elevated"
                  class="rounded-lg font-weight-bold premium-btn"
                  @click="openExportDialog"
                >
                  Exportar a CSV
                </v-btn>
              </div>

              <v-divider class="mb-4"></v-divider>

              <v-window v-model="activeTab">
                <v-window-item value="my_tickets">
                  <v-data-table
                    :headers="headers"
                    :items="filteredTickets"
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
                </v-window-item>

                <v-window-item value="all_tickets" v-if="isAdminOrInovatech">
                  <v-data-table
                    :headers="headersAllTickets"
                    :items="allTickets"
                    :loading="loadingAllTickets"
                    loading-text="Cargando todos los tickets..."
                    no-data-text="No hay tickets en el sistema."
                    class="bg-transparent custom-table"
                    :theme="isDarkTheme ? 'dark' : 'light'"
                  >
                    <template v-slot:item.TrackingID="{ item }">
                      <span class="font-weight-bold text-primary">{{ item.TrackingID }}</span>
                    </template>
                    <template v-slot:item.Status="{ item }">
                      <v-chip :color="getStatusColor(item.Status)" size="small" :class="['font-weight-bold', 'text-uppercase', 'px-3', item.Status === 'Visa en Día' ? 'text-black' : 'text-white']" variant="flat">
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
                </v-window-item>

                <v-window-item value="users" v-if="isAdminOrInovatech">
                  <div class="d-flex justify-end px-4 mb-2">
                    <v-btn color="success" prepend-icon="mdi-account-plus" @click="openNewUserDialog" class="rounded-lg premium-btn">Nuevo Usuario</v-btn>
                  </div>
                  <v-data-table
                    :headers="headersUsers"
                    :items="companyUsers"
                    :loading="loadingUsers"
                    loading-text="Cargando usuarios..."
                    no-data-text="No hay usuarios registrados."
                    class="bg-transparent custom-table"
                    :theme="isDarkTheme ? 'dark' : 'light'"
                  >
                    <template v-slot:item.RoleID="{ item }">
                      <v-chip :color="item.RoleID === 1 ? 'error' : (item.RoleID === 4 ? 'info' : (item.RoleID === 3 ? 'success' : 'primary'))" size="small" variant="flat">
                        {{ { 1: 'Admin', 2: 'Caja', 3: 'Cliente', 4: 'Ingeniería', 5: 'Monitor' }[item.RoleID] || 'Staff' }}
                      </v-chip>
                    </template>
                    <template v-slot:item.IsActive="{ item }">
                      <v-chip :color="item.IsActive ? 'success' : 'grey'" size="small" variant="flat">
                        {{ item.IsActive ? 'Activo' : 'Inactivo' }}
                      </v-chip>
                    </template>
                    <template v-slot:item.actions="{ item }">
                      <v-btn icon="mdi-pencil-outline" variant="text" color="info" size="small" @click="editUser(item)" title="Editar"></v-btn>
                      <v-btn icon="mdi-delete-outline" variant="text" color="error" size="small" @click="deleteUser(item)" title="Eliminar" v-if="item.IsActive"></v-btn>
                    </template>
                  </v-data-table>
                </v-window-item>
              </v-window>
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
                      label="Ubicación del Equipo"
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

                  <!-- Campo Referencia (entre Asunto y Descripción) -->
                  <v-col cols="12">
                    <v-text-field
                      v-model="newTicket.reference"
                      label="Referencia (Opcional)"
                      placeholder="Ej: OC-2024-001, Folio interno, etc."
                      variant="solo-filled"
                      :bg-color="isDarkTheme ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'"
                      :disabled="formLoading"
                      class="custom-input"
                      prepend-inner-icon="mdi-tag-outline"
                    ></v-text-field>
                  </v-col>
                  <!-- On Behalf Of (Admins/Inovatech) -->
                  <v-col cols="12" sm="12" v-if="isAdminOrInovatech">
                    <v-autocomplete
                      v-model="newTicket.onBehalfOf"
                      :items="autocompleteUsers"
                      item-title="FullName"
                      item-value="UserID"
                      label="Reportar en nombre de (Opcional)"
                      placeholder="Busca por nombre o correo"
                      variant="solo-filled"
                      :bg-color="isDarkTheme ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'"
                      :disabled="formLoading"
                      class="custom-input mb-0"
                      return-object
                      clearable
                      @update:modelValue="onBehalfOfSelected"
                      hide-details
                    >
                      <template v-slot:item="{ props, item }">
                        <v-list-item v-bind="props" :title="item.raw.FullName" :subtitle="item.raw.Email + ' - ' + (item.raw.Company || 'Sin Empresa')"></v-list-item>
                      </template>
                    </v-autocomplete>
                  </v-col>

                  <v-col cols="12" sm="4">
                    <v-text-field
                      v-model="newTicket.brand"
                      label="Marca (Ej: Dell)"
                      variant="solo-filled"
                      :bg-color="isDarkTheme ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'"
                      :disabled="formLoading"
                      class="custom-input"
                    ></v-text-field>
                  </v-col>
                  <v-col cols="12" sm="4" v-if="newTicket.brand">
                    <v-text-field
                      v-model="newTicket.model"
                      label="Modelo (Ej: Latitude)"
                      variant="solo-filled"
                      :bg-color="isDarkTheme ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'"
                      :disabled="formLoading"
                      class="custom-input"
                    ></v-text-field>
                  </v-col>
                  <v-col cols="12" sm="4" v-if="newTicket.model">
                    <v-text-field
                      v-model="newTicket.serialNumber"
                      label="No. de Serie (Opcional)"
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
                  label="Agregar Placa de Activo (Opcional)"
                  color="primary"
                  class="mb-2"
                  hide-details
                ></v-switch>

                <v-expand-transition>
                  <div v-if="enableAssetPlate" class="mb-4">
                    <v-text-field
                      v-model="newTicket.assetNumber"
                      label="Número de Placa de Activo"
                      placeholder="Ej: INV-00123"
                      hint="Solo si cuenta con contrato o póliza de soporte"
                      persistent-hint
                      variant="solo-filled"
                      :bg-color="isDarkTheme ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'"
                      :disabled="formLoading"
                      class="custom-input mb-0"
                      prepend-inner-icon="mdi-barcode-scan"
                    ></v-text-field>
                  </div>
                </v-expand-transition>

                <!-- Adjuntos: Drag and Drop -->
                <div 
                  class="file-dropzone mb-4 rounded-lg d-flex flex-column align-center justify-center pa-6 position-relative"
                  :class="[isDarkTheme ? 'border-grey-darken-3 bg-grey-darken-4' : 'border-grey-lighten-2 bg-grey-lighten-4', isDragging ? 'dropzone-active' : '']"
                  @dragover.prevent="isDragging = true"
                  @dragleave.prevent="isDragging = false"
                  @drop.prevent="handleDrop"
                  @click="!newTicket.photo ? fileInput.click() : null"
                  style="border: 2px dashed; cursor: pointer; transition: all 0.3s ease; min-height: 150px;"
                >
                  <input 
                    type="file" 
                    ref="fileInput" 
                    class="d-none" 
                    accept="image/*,video/*,application/pdf" 
                    @change="handleFileSelect" 
                  />
                  
                  <template v-if="!newTicket.photo">
                    <v-icon size="48" color="grey-lighten-1" class="mb-2">mdi-cloud-upload-outline</v-icon>
                    <div class="text-body-1 text-center font-weight-bold" :class="isDarkTheme ? 'text-white' : 'text-black'">
                      Arrastra tu evidencia aquí o haz clic para explorar
                    </div>
                    <div class="text-caption text-grey-lighten-1 mt-1">Formatos: PNG, JPG, PDF, DOCX | Tamaño máximo: 5 MB</div>
                  </template>
                  
                  <template v-else>
                    <v-img v-if="previewUrl && newTicket.photo.type.startsWith('image/')" :src="previewUrl" height="100" class="rounded-lg mb-2" cover></v-img>
                    <v-icon v-else size="48" color="primary" class="mb-2">mdi-file-document</v-icon>
                    <div class="text-body-2 font-weight-bold text-center w-100 text-truncate" :class="isDarkTheme ? 'text-white' : 'text-black'" style="max-width: 200px;">{{ newTicket.photo.name }}</div>
                    
                    <v-btn icon="mdi-close" color="error" size="small" class="position-absolute" style="top: 10px; right: 10px; z-index: 5;" @click.stop="clearFile"></v-btn>
                    
                    <v-overlay v-model="uploadingFile" contained class="align-center justify-center rounded-lg">
                      <v-progress-circular indeterminate color="primary" size="40"></v-progress-circular>
                    </v-overlay>
                  </template>
                </div>

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
                  <v-chip :color="getStatusColor(selectedTicket.Status)" size="small" :class="['font-weight-bold', 'text-uppercase', selectedTicket.Status === 'Visa en Día' ? 'text-black' : 'text-white']" variant="flat">
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
                <v-col cols="12" sm="6" md="3" class="py-1" v-if="selectedTicket.Status === 'Resolved' || selectedTicket.Status === 'Closed'">
                  <div class="text-caption text-grey-lighten-1">Resuelto Por</div>
                  <div class="font-weight-bold text-success text-truncate">
                    {{ selectedTicket.ResolvedByUserName || 'Staff' }}
                  </div>
                </v-col>
                <v-col cols="12" sm="6" md="3" class="py-1" v-else>
                  <div class="text-caption text-grey-lighten-1">Atendido Por</div>
                  <div class="d-flex flex-wrap gap-2 align-center mt-1">
                    <v-chip
                      v-for="eng in ticketAssignees"
                      :key="eng.UserID"
                      size="small"
                      color="primary"
                      variant="flat"
                      :closable="isAdminOrInovatech"
                      @click:close="removeAssignee(eng.UserID)"
                    >
                      {{ eng.FullName }}
                    </v-chip>
                    <span v-if="ticketAssignees.length === 0" class="text-caption text-grey">En Cola</span>
                    <v-btn
                      v-if="isAdminOrInovatech"
                      icon="mdi-plus"
                      size="x-small"
                      variant="tonal"
                      color="success"
                      class="ml-1"
                      @click="assignEngineerDialog = true"
                      title="Asignar Ingeniero"
                    ></v-btn>
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
                <v-col cols="12" sm="12" md="6" class="py-1 mt-2" v-if="selectedTicket.Brand || selectedTicket.Model || selectedTicket.SerialNumber || selectedTicket.AssetNumber">
                  <div class="text-caption text-grey-lighten-1">Equipo / Activo</div>
                  <div class="font-weight-bold">
                    <span v-if="selectedTicket.Brand" class="mr-1">{{ selectedTicket.Brand }}</span>
                    <span v-if="selectedTicket.Model"> — {{ selectedTicket.Model }}</span>
                    <span v-if="selectedTicket.SerialNumber" class="text-grey-lighten-1 text-caption ml-2">(S/N: {{ selectedTicket.SerialNumber }})</span>
                    <span v-if="selectedTicket.AssetNumber" class="text-grey-lighten-1 text-caption ml-2">[Activo: {{ selectedTicket.AssetNumber }}]</span>
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
                <div class="d-flex flex-column gap-2">
                  <v-btn
                    v-if="isAdminOrInovatech"
                    color="info"
                    icon="mdi-text-box-multiple-outline"
                    size="small"
                    class="rounded-lg premium-btn"
                    title="Respuestas Automáticas"
                    @click="fetchCannedResponses"
                  ></v-btn>
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

      <v-dialog v-model="userDialog" max-width="500px" persistent>
        <v-card class="glass-modal rounded-xl pa-4" :class="{ 'bg-dark': isDarkTheme }">
          <v-card-title class="d-flex justify-space-between align-center px-4">
            <span class="text-h5 font-weight-bold" :class="isDarkTheme ? 'text-white' : 'text-black'">
              {{ isEditingUser ? 'Editar Usuario' : 'Nuevo Usuario' }}
            </span>
            <v-btn icon="mdi-close" :color="isDarkTheme ? 'white' : 'black'" variant="text" @click="userDialog = false" :disabled="userLoading"></v-btn>
          </v-card-title>
          
          <v-card-text class="pt-4">
            <v-form ref="userForm" v-model="isUserFormValid">
              <v-text-field
                v-model="userFormData.FullName"
                label="Nombre Completo"
                variant="solo-filled"
                :bg-color="isDarkTheme ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'"
                :rules="[v => !!v || 'El nombre es obligatorio']"
                :disabled="userLoading"
                class="custom-input mb-3"
              ></v-text-field>

              <v-text-field
                v-model="userFormData.Email"
                label="Correo Electrónico"
                type="email"
                variant="solo-filled"
                :bg-color="isDarkTheme ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'"
                :rules="[
                  v => !!v || 'El correo es obligatorio',
                  v => /.+@.+\..+/.test(v) || 'Correo no válido'
                ]"
                :disabled="userLoading || isEditingUser"
                class="custom-input mb-3"
              ></v-text-field>

              <v-text-field
                v-model="userFormData.Phone"
                label="Teléfono"
                variant="solo-filled"
                :bg-color="isDarkTheme ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'"
                :disabled="userLoading"
                class="custom-input mb-3"
              ></v-text-field>

              <v-text-field
                v-model="userFormData.Company"
                label="Empresa"
                variant="solo-filled"
                :bg-color="isDarkTheme ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'"
                :disabled="userLoading"
                class="custom-input mb-3"
              ></v-text-field>

              <v-select
                v-model="userFormData.RoleID"
                :items="[{ title: 'Admin', value: 1 }, { title: 'Ingeniería', value: 4 }, { title: 'Cliente', value: 3 }, { title: 'Monitor', value: 5 }, { title: 'Caja', value: 2 }]"
                item-title="title"
                item-value="value"
                label="Rol de Sistema"
                variant="solo-filled"
                :bg-color="isDarkTheme ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'"
                :disabled="userLoading"
                class="custom-input mb-3"
              ></v-select>
            </v-form>
          </v-card-text>
          
          <v-card-actions class="px-6 pb-6 pt-0 justify-end">
            <v-btn color="grey" variant="text" @click="userDialog = false" :disabled="userLoading" class="font-weight-bold px-4">
              Cancelar
            </v-btn>
            <v-btn color="primary" variant="elevated" @click="saveUser" :loading="userLoading" :disabled="!isUserFormValid" class="premium-btn px-6 font-weight-bold">
              Guardar
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <v-dialog v-model="exportDialog" max-width="400px" persistent>
        <v-card class="glass-modal rounded-xl pa-4" :class="{ 'bg-dark': isDarkTheme }">
          <v-card-title class="d-flex justify-space-between align-center px-4">
            <span class="text-h6 font-weight-bold" :class="isDarkTheme ? 'text-white' : 'text-black'">
              Exportar Tickets a CSV
            </span>
            <v-btn icon="mdi-close" :color="isDarkTheme ? 'white' : 'black'" variant="text" @click="exportDialog = false" :disabled="exportLoading"></v-btn>
          </v-card-title>
          
          <v-card-text class="pt-4">
            <p class="text-body-2 text-grey-lighten-1 mb-4">
              Selecciona el rango de fechas de creación para exportar los tickets. Deja en blanco para exportar todos.
            </p>
            <v-text-field
              v-model="exportDates.from"
              label="Desde (Opcional)"
              type="date"
              variant="solo-filled"
              :bg-color="isDarkTheme ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'"
              class="custom-input mb-3"
            ></v-text-field>

            <v-text-field
              v-model="exportDates.to"
              label="Hasta (Opcional)"
              type="date"
              variant="solo-filled"
              :bg-color="isDarkTheme ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'"
              class="custom-input"
            ></v-text-field>
          </v-card-text>
          
          <v-card-actions class="px-6 pb-6 pt-0 justify-end">
            <v-btn color="grey" variant="text" @click="exportDialog = false" :disabled="exportLoading" class="font-weight-bold px-4">
              Cancelar
            </v-btn>
            <v-btn color="success" variant="elevated" @click="downloadCsv" :loading="exportLoading" prepend-icon="mdi-download" class="premium-btn px-6 font-weight-bold">
              Descargar
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <!-- Diálogo para Asignar Ingeniero -->
      <v-dialog v-model="assignEngineerDialog" max-width="400px">
        <v-card class="glass-modal rounded-xl pa-4" :class="{ 'bg-dark': isDarkTheme }">
          <v-card-title class="d-flex justify-space-between align-center px-4">
            <span class="text-h6 font-weight-bold" :class="isDarkTheme ? 'text-white' : 'text-black'">Asignar Ingeniero</span>
            <v-btn icon="mdi-close" :color="isDarkTheme ? 'white' : 'black'" variant="text" @click="assignEngineerDialog = false"></v-btn>
          </v-card-title>
          <v-card-text class="pt-4">
            <v-autocomplete
              v-model="selectedEngineerToAssign"
              :items="engineersList"
              item-title="FullName"
              item-value="UserID"
              label="Buscar Ingeniero"
              variant="solo-filled"
              :bg-color="isDarkTheme ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'"
              class="custom-input"
            ></v-autocomplete>
          </v-card-text>
          <v-card-actions class="px-6 pb-6 pt-0 justify-end">
            <v-btn color="grey" variant="text" @click="assignEngineerDialog = false" class="font-weight-bold px-4">Cancelar</v-btn>
            <v-btn color="primary" variant="elevated" @click="assignEngineer" :loading="assignLoading" :disabled="!selectedEngineerToAssign" class="premium-btn px-6 font-weight-bold">Asignar</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <v-dialog v-model="cannedResponseDialog" max-width="600px">
        <v-card class="glass-modal rounded-xl pa-4" :class="{ 'bg-dark': isDarkTheme }">
          <v-card-title class="d-flex justify-space-between align-center px-4">
            <span class="text-h6 font-weight-bold" :class="isDarkTheme ? 'text-white' : 'text-black'">Respuestas Automáticas</span>
            <v-btn icon="mdi-close" :color="isDarkTheme ? 'white' : 'black'" variant="text" @click="cannedResponseDialog = false"></v-btn>
          </v-card-title>
          <v-card-text class="pt-4">
            <div v-if="cannedResponses.length === 0" class="text-center text-grey">
              No hay respuestas automáticas configuradas.
            </div>
            <v-list class="bg-transparent">
              <v-list-item
                v-for="resp in cannedResponses"
                :key="resp.AutoReplyID"
                class="mb-2 rounded-lg border border-opacity-10"
                :class="isDarkTheme ? 'bg-grey-darken-4' : 'bg-grey-lighten-4'"
                @click="applyCannedResponse(resp.Body)"
              >
                <v-list-item-title class="font-weight-bold text-primary">{{ resp.Title }}</v-list-item-title>
                <v-list-item-subtitle class="text-caption mt-1 whitespace-pre-line" style="line-height: 1.2; max-height: 2.4em; overflow: hidden; text-overflow: ellipsis; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical;">
                  {{ resp.Body }}
                </v-list-item-subtitle>
              </v-list-item>
            </v-list>
          </v-card-text>
        </v-card>
      </v-dialog>

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

const activeTab = ref('my_tickets')

// Export CSV
const exportDialog = ref(false)
const exportLoading = ref(false)
const exportDates = ref({ from: '', to: '' })

const openExportDialog = () => {
  exportDates.value = { from: '', to: '' }
  exportDialog.value = true
}

const downloadCsv = async () => {
  exportLoading.value = true
  try {
    let url = '/api/client/tickets/export'
    if (exportDates.value.from && exportDates.value.to) {
      url += `?from=${exportDates.value.from}&to=${exportDates.value.to}`
    }
    const response = await api.get(url, { responseType: 'blob' })
    const urlObj = window.URL.createObjectURL(new Blob([response.data]))
    const link = document.createElement('a')
    link.href = urlObj
    const fileName = `Tickets_${exportDates.value.from || 'todos'}_${exportDates.value.to || 'todos'}.csv`
    link.setAttribute('download', fileName)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    exportDialog.value = false
  } catch (error) {
    console.error('Error exporting CSV:', error)
    globalMsg.value = 'Error al exportar los datos.'
    globalMsgType.value = 'error'
  } finally {
    exportLoading.value = false
  }
}

// Buscador r\u00e1pido
const searchQuery = ref('')
const filteredTickets = computed(() => {
  const q = searchQuery.value?.toLowerCase().trim() || ''
  if (!q) return tickets.value
  return tickets.value.filter(t =>
    t.TrackingID?.toLowerCase().includes(q) ||
    t.Subject?.toLowerCase().includes(q) ||
    translateStatus(t.Status)?.toLowerCase().includes(q) ||
    t.ReportedByName?.toLowerCase().includes(q) ||
    t.CompanyName?.toLowerCase().includes(q)
  )
})


const isAdminOrInovatech = computed(() => {
  if (!user.value) return false;
  const email = user.value.email || user.value.Email || '';
  const role = user.value.role || user.value.RoleID || '';
  return email.endsWith('@inovatech.com.mx') || email === 'charlyycastro03@inovatech.com.mx' || role === 'ADMIN' || role === 1;
})

const allTickets = ref([])
const loadingAllTickets = ref(false)
const headersAllTickets = [
  { title: 'Folio', align: 'start', key: 'TrackingID' },
  { title: 'Asunto / Título', key: 'Subject' },
  { title: 'Creado Por', key: 'ReportedByName' },
  { title: 'Empresa', key: 'CompanyName' },
  { title: 'Fecha', key: 'CreatedAt' },
  { title: 'Estado', key: 'Status', align: 'center' },
  { title: 'Detalles', key: 'actions', sortable: false, align: 'center' },
]

const companyUsers = ref([])
const loadingUsers = ref(false)
const headersUsers = [
  { title: 'Nombre', key: 'FullName' },
  { title: 'Correo', key: 'Email' },
  { title: 'Empresa', key: 'Company' },
  { title: 'Rol', key: 'RoleID', align: 'center' },
  { title: 'Estado', key: 'IsActive', align: 'center' },
  { title: 'Acciones', key: 'actions', sortable: false, align: 'center' },
]

const autocompleteUsers = ref([])
const previewUrl = ref(null)
const uploadingFile = ref(false)

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

const isDragging = ref(false)
const fileInput = ref(null)

const handleDrop = (e) => {
  isDragging.value = false
  const files = e.dataTransfer.files
  handleFileSelection(files)
}

const handleFileSelect = (e) => {
  const files = e.target.files
  handleFileSelection(files)
}

const handleFileSelection = (files) => {
  if (files.length > 0) {
    const file = files[0]
    if (file.size > 5 * 1024 * 1024) {
      globalMsg.value = 'El archivo es demasiado grande. El máximo permitido es 5MB.'
      globalMsgType.value = 'error'
      return
    }
    newTicket.value.photo = file
    if (file.type.startsWith('image/')) {
      previewUrl.value = URL.createObjectURL(file)
    } else {
      previewUrl.value = null
    }
  }
}

const clearFile = () => {
  newTicket.value.photo = null
  previewUrl.value = null
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

const onBehalfOfSelected = (selectedUser) => {
  if (selectedUser) {
    newTicket.value.reportedByEmail = selectedUser.Email;
    newTicket.value.reportedByName = selectedUser.FullName;
    newTicket.value.reportedByCompany = selectedUser.Company;
    newTicket.value.contactPhone = selectedUser.Phone || '';
    newTicket.value.contactAddress = selectedUser.Address || '';
  } else {
    newTicket.value.reportedByEmail = null;
    newTicket.value.reportedByName = null;
    newTicket.value.reportedByCompany = null;
  }
}

const newTicket = ref({
  title: '',
  reference: '',
  category: null,
  description: '',
  priority: 'Medium',
  ticketType: 'Incident',
  contactPhone: '',
  contactAddress: '',
  location: '',
  brand: '',
  model: '',
  serialNumber: '',
  assetNumber: '',
  impactLevel: 'Low',
  photo: null,
  onBehalfOf: null,
  reportedByEmail: null,
  reportedByName: null,
  reportedByCompany: null
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

// Configuración de Estados — colores exactos del MASTER_SCRIPT
const statusConfig = {
  'Open':          { label: 'Nuevo',             color: '#2E6DA4' },
  'Waiting':       { label: 'Esperando resp.',   color: '#D35400' },
  'Replied':       { label: 'Respondido',        color: '#1D7A4C' },
  'In Progress':   { label: 'En progreso',       color: '#1A8CFF' },
  'On Hold':       { label: 'En espera',         color: '#607D8B' },
  'Waiting Parts': { label: 'En espera piezas',  color: '#7B1FA2' },
  'Resolved':      { label: 'Resuelto',          color: '#2E7D32' },
  'Closed':        { label: 'Cerrado',           color: '#455A64' },
}

const getStatusColor = (status) => statusConfig[status]?.color || '#607D8B'
const translateStatus = (status) => statusConfig[status]?.label || status

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
    reference: '',
    category: categories.value.length > 0 ? categories.value[0].CategoryID : 1,
    description: '',
    priority: 'Low',
    ticketType: 'Incident',
    contactPhone: clientPhone.value || '',
    contactAddress: clientAddress.value || '',
    location: '',
    brand: '',
    model: '',
    serialNumber: '',
    assetNumber: '',
    impactLevel: 'Low',
    photo: null,
    onBehalfOf: null,
    reportedByEmail: null,
    reportedByName: null,
    reportedByCompany: null
  }
  enableAssetPlate.value = false
  previewUrl.value = null
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
    formData.append('ticketType', 'Incident')  // siempre Incident para clientes
    formData.append('contactPhone', newTicket.value.contactPhone)
    formData.append('contactAddress', newTicket.value.contactAddress)
    formData.append('location', newTicket.value.location)
    formData.append('impactLevel', newTicket.value.impactLevel)
    if (newTicket.value.reference) formData.append('reference', newTicket.value.reference)

    if (newTicket.value.brand) formData.append('brand', newTicket.value.brand)
    if (newTicket.value.model) formData.append('model', newTicket.value.model)
    if (newTicket.value.serialNumber) formData.append('serialNumber', newTicket.value.serialNumber)
    
    if (newTicket.value.reportedByEmail) {
      formData.append('reportedByEmail', newTicket.value.reportedByEmail)
      formData.append('reportedByName', newTicket.value.reportedByName)
      formData.append('reportedByCompany', newTicket.value.reportedByCompany || '')
    }

    if (enableAssetPlate.value && newTicket.value.assetNumber) {
      formData.append('assetNumber', newTicket.value.assetNumber)
    }

    if (newTicket.value.photo) {
      // In Vuetify 3, file inputs often give an array. Check if it's an array.
      const photoFile = Array.isArray(newTicket.value.photo) ? newTicket.value.photo[0] : newTicket.value.photo;
      if (photoFile) {
        formData.append('photo', photoFile)
      }
    }

    uploadingFile.value = true;
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
    uploadingFile.value = false
    if (activeTab.value === 'all_tickets') fetchAllTickets()
  }
}

const fetchAllTickets = async () => {
  if (!isAdminOrInovatech.value) return;
  loadingAllTickets.value = true
  try {
    const response = await api.get('/api/client/all-tickets')
    allTickets.value = response.data
  } catch (e) {
    console.error(e)
  } finally {
    loadingAllTickets.value = false
  }
}

const fetchCompanyUsers = async () => {
  if (!isAdminOrInovatech.value) return;
  loadingUsers.value = true
  try {
    const response = await api.get('/api/client/users')
    companyUsers.value = response.data
  } catch (e) {
    console.error(e)
  } finally {
    loadingUsers.value = false
  }
}

const fetchAutocompleteUsers = async () => {
  if (!isAdminOrInovatech.value) return;
  try {
    const response = await api.get('/api/client/autocomplete-users')
    autocompleteUsers.value = response.data
  } catch (e) {
    console.error(e)
  }
}

// User Management Methods
const userDialog = ref(false)
const isEditingUser = ref(false)
const isUserFormValid = ref(false)
const userLoading = ref(false)
const userForm = ref(null)
const selectedUserId = ref(null)

const userFormData = ref({
  FullName: '',
  Email: '',
  Phone: '',
  Company: '',
  RoleID: 3
})

const openNewUserDialog = () => {
  isEditingUser.value = false
  selectedUserId.value = null
  userFormData.value = {
    FullName: '',
    Email: '',
    Phone: '',
    Company: '',
    RoleID: 3
  }
  userDialog.value = true
  if (userForm.value) userForm.value.resetValidation()
}

const editUser = (userItem) => {
  isEditingUser.value = true
  selectedUserId.value = userItem.UserID
  userFormData.value = {
    FullName: userItem.FullName,
    Email: userItem.Email,
    Phone: userItem.Phone || '',
    Company: userItem.Company || '',
    RoleID: userItem.RoleID
  }
  userDialog.value = true
  if (userForm.value) userForm.value.resetValidation()
}

const saveUser = async () => {
  userLoading.value = true
  try {
    if (isEditingUser.value) {
      await api.put(`/api/client/users/${selectedUserId.value}`, userFormData.value)
      globalMsg.value = 'Usuario actualizado correctamente.'
    } else {
      await api.post('/api/client/users', userFormData.value)
      globalMsg.value = 'Usuario creado correctamente.'
    }
    globalMsgType.value = 'success'
    userDialog.value = false
    fetchCompanyUsers()
    fetchAutocompleteUsers()
  } catch (error) {
    console.error('Error saving user:', error)
    globalMsg.value = error.response?.data?.message || 'Error al guardar el usuario.'
    globalMsgType.value = 'error'
  } finally {
    userLoading.value = false
  }
}

const deleteUser = async (userItem) => {
  if (!confirm(`¿Estás seguro de que deseas desactivar al usuario ${userItem.FullName}?`)) return
  try {
    await api.delete(`/api/client/users/${userItem.UserID}`)
    globalMsg.value = 'Usuario desactivado correctamente.'
    globalMsgType.value = 'success'
    fetchCompanyUsers()
    fetchAutocompleteUsers()
  } catch (error) {
    console.error('Error deleting user:', error)
    globalMsg.value = 'Error al desactivar el usuario.'
    globalMsgType.value = 'error'
  }
}

// Ver detalles e historial de conversación de un Ticket

// Asignación Múltiple
const ticketAssignees = ref([])
const engineersList = ref([])
const assignEngineerDialog = ref(false)
const selectedEngineerToAssign = ref(null)
const assignLoading = ref(false)

// Respuestas automáticas
const cannedResponseDialog = ref(false)
const cannedResponses = ref([])

const fetchAssignees = async (ticketId) => {
  if (!isAdminOrInovatech.value) return
  try {
    const res = await api.get(`/api/helpdesk/tickets/${ticketId}/assignees`)
    ticketAssignees.value = res.data
  } catch (error) {
    console.error('Error fetching assignees:', error)
  }
}

const fetchEngineersList = async () => {
  if (!isAdminOrInovatech.value) return
  try {
    const res = await api.get('/api/helpdesk/engineers')
    engineersList.value = res.data
  } catch (error) {
    console.error('Error fetching engineers:', error)
  }
}

const assignEngineer = async () => {
  if (!selectedEngineerToAssign.value || !selectedTicket.value) return
  assignLoading.value = true
  try {
    await api.post(`/api/helpdesk/tickets/${selectedTicket.value.TicketID}/assignees`, {
      userID: selectedEngineerToAssign.value
    })
    globalMsg.value = 'Ingeniero asignado exitosamente.'
    globalMsgType.value = 'success'
    assignEngineerDialog.value = false
    selectedEngineerToAssign.value = null
    fetchAssignees(selectedTicket.value.TicketID)
    fetchTickets()
  } catch (error) {
    console.error('Error assigning engineer:', error)
    globalMsg.value = error.response?.data?.message || 'Error al asignar.'
    globalMsgType.value = 'error'
  } finally {
    assignLoading.value = false
  }
}

const removeAssignee = async (userId) => {
  if (!confirm('¿Seguro que deseas remover este ingeniero del ticket?')) return
  try {
    await api.delete(`/api/helpdesk/tickets/${selectedTicket.value.TicketID}/assignees/${userId}`)
    globalMsg.value = 'Ingeniero removido.'
    globalMsgType.value = 'success'
    fetchAssignees(selectedTicket.value.TicketID)
    fetchTickets()
  } catch (error) {
    console.error('Error removing assignee:', error)
    globalMsg.value = error.response?.data?.message || 'Error al remover.'
    globalMsgType.value = 'error'
  }
}

const fetchCannedResponses = async () => {
  try {
    const res = await api.get('/api/helpdesk/auto-replies')
    cannedResponses.value = res.data
    cannedResponseDialog.value = true
  } catch (error) {
    console.error('Error fetching canned responses:', error)
    globalMsg.value = 'Error al cargar respuestas automáticas.'
    globalMsgType.value = 'error'
  }
}

const applyCannedResponse = (bodyTemplate) => {
  let body = bodyTemplate
  if (selectedTicket.value) {
    body = body.replace(/{NOMBRE_CLIENTE}/g, selectedTicket.value.ReportedByName || '')
    body = body.replace(/{FOLIO_TICKET}/g, selectedTicket.value.TrackingID || '')
    body = body.replace(/{NOMBRE_INGENIERO}/g, clientName.value || '')
    body = body.replace(/{LINK_PORTAL}/g, `${window.location.origin}/dashboard`)
    body = body.replace(/{LINK_ENCUESTA}/g, `${window.location.origin}/survey/${selectedTicket.value.TrackingID || ''}`)
  }
  replyText.value = body
  cannedResponseDialog.value = false
}

const viewTicketDetails = async (ticket) => {
  selectedTicket.value = ticket
  detailsDialog.value = true
  ticketMessages.value = []
  ticketAttachments.value = []
  replyText.value = ''
  
  try {
    const response = await api.get(`/api/client/tickets/${ticket.TicketID}`)
    const data = response.data
    selectedTicket.value = data.ticket
    ticketMessages.value = data.messages || []
    ticketAttachments.value = data.attachments || []
    detailsDialog.value = true
    
    if (isAdminOrInovatech.value) {
      await fetchAssignees(ticket.TicketID)
    }
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
  
  if (isAdminOrInovatech.value) {
    fetchAllTickets()
    fetchCompanyUsers()
    fetchAutocompleteUsers()
  }
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
  background-image: radial-gradient(circle at top right, rgba(30, 58, 138, 0.5) 0%, transparent 50%);
}

.glass-navbar {
  background: rgba(255, 255, 255, 0.05) !important;
  backdrop-filter: blur(10px) !important;
  -webkit-backdrop-filter: blur(10px) !important;
}

.gradient-text {
  background: linear-gradient(45deg, #1e3a8a, #2563eb, #3b82f6);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.bg-dark .gradient-text {
  background: linear-gradient(45deg, #60a5fa, #93c5fd, #bfdbfe);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.glass-card {
  background: rgba(255, 255, 255, 0.6) !important;
  backdrop-filter: blur(10px) !important;
  -webkit-backdrop-filter: blur(10px) !important;
  border: 1px solid rgba(255, 255, 255, 0.2) !important;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.glass-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1) !important;
}

.bg-dark .glass-card {
  background: rgba(20, 20, 20, 0.6) !important;
  border: 1px solid rgba(255, 255, 255, 0.05) !important;
}

.bg-dark .glass-card:hover {
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3) !important;
}

.glass-modal {
  background: rgba(255, 255, 255, 0.95) !important;
  backdrop-filter: blur(20px) !important;
  -webkit-backdrop-filter: blur(20px) !important;
  border: 1px solid rgba(0, 0, 0, 0.08) !important;
  box-shadow: 0 24px 48px rgba(0, 0, 0, 0.1) !important;
}

.glass-modal.bg-dark {
  background: rgba(30, 30, 30, 0.95) !important;
  border: 1px solid rgba(255, 255, 255, 0.1) !important;
}

.z-index-2 {
  z-index: 2;
}

.gradient-text {
  background: linear-gradient(45deg, #1e3a8a, #3b82f6) !important;
  -webkit-background-clip: text !important;
  -webkit-text-fill-color: transparent !important;
  letter-spacing: 1px;
}

.bg-dark .gradient-text {
  background: linear-gradient(45deg, #FFFFFF, #90CAF9) !important;
  -webkit-background-clip: text !important;
  -webkit-text-fill-color: transparent !important;
}

.custom-input :deep(.v-field) {
  border: 1px solid rgba(0, 0, 0, 0.12) !important;
  transition: all 0.3s ease;
  color: #1e293b !important;
}

.custom-input :deep(.v-field__input) {
  color: #1e293b !important;
}

.custom-input :deep(.v-label) {
  color: #64748b !important;
}

.bg-dark .custom-input :deep(.v-field) {
  border: 1px solid rgba(255, 255, 255, 0.1) !important;
  color: white !important;
}

.bg-dark .custom-input :deep(.v-field__input) {
  color: white !important;
}

.bg-dark .custom-input :deep(.v-label) {
  color: rgba(255, 255, 255, 0.6) !important;
}

.custom-input :deep(.v-field--focused) {
  border-color: #2196F3 !important;
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
