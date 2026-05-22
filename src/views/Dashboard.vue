<template>
  <div>
    <v-row>
      <v-col cols="12" class="d-flex justify-space-between align-center">
        <h2>Mis Tickets</h2>
        <v-btn color="primary" @click="createTicketDialog = true">
          <v-icon left>mdi-plus</v-icon>
          Nuevo Ticket
        </v-btn>
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="12">
        <v-card>
          <v-data-table
            :headers="headers"
            :items="tickets"
            :loading="loading"
            class="elevation-1"
          >
            <template v-slot:item.Status="{ item }">
              <v-chip
                :color="getStatusColor(item.Status)"
                dark
                small
              >
                {{ item.Status }}
              </v-chip>
            </template>
            <template v-slot:item.actions="{ item }">
              <v-btn icon small @click="viewTicket(item)">
                <v-icon>mdi-eye</v-icon>
              </v-btn>
            </template>
          </v-data-table>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const headers = [
  { title: 'Folio', align: 'start', key: 'TrackingID' },
  { title: 'Asunto', key: 'Subject' },
  { title: 'Estado', key: 'Status' },
  { title: 'Categoría', key: 'CategoryName' },
  { title: 'Fecha', key: 'CreatedAt' },
  { title: 'Acciones', key: 'actions', sortable: false },
]

const tickets = ref([])
const loading = ref(false)
const createTicketDialog = ref(false)

const getStatusColor = (status) => {
  if (status === 'Open') return 'green'
  if (status === 'In Progress') return 'orange'
  if (status === 'Resolved' || status === 'Closed') return 'grey'
  return 'blue'
}

const fetchTickets = async () => {
  loading.value = true
  // Mock data for now until API is connected
  setTimeout(() => {
    tickets.value = [
      { TrackingID: 'INV-123', Subject: 'Problema con la red', Status: 'Open', CategoryName: 'Redes', CreatedAt: '2023-10-01' },
      { TrackingID: 'INV-124', Subject: 'Impresora no funciona', Status: 'Resolved', CategoryName: 'Hardware', CreatedAt: '2023-10-02' },
    ]
    loading.value = false
  }, 500)
}

const viewTicket = (ticket) => {
  console.log('Ver ticket', ticket)
  // router.push(`/ticket/${ticket.TicketID}`)
}

onMounted(() => {
  fetchTickets()
})
</script>
