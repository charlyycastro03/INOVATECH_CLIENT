<template>
  <v-app :theme="isDarkTheme ? 'dark' : 'light'">
    <v-app-bar :color="isDarkTheme ? 'grey-darken-4' : 'white'" elevation="1" class="glass-navbar">
      <v-btn icon="mdi-arrow-left" @click="router.push('/dashboard')"></v-btn>
      <v-app-bar-title class="font-weight-bold gradient-text">
        <v-icon left class="mr-2">mdi-chart-bar</v-icon>
        Dashboard de KPIs
      </v-app-bar-title>
      <v-spacer></v-spacer>
      
      <v-btn color="primary" variant="flat" prepend-icon="mdi-file-word" @click="downloadReport" class="mr-4 text-none font-weight-bold rounded-lg" :loading="reportLoading">
        Exportar Reporte
      </v-btn>
      <v-btn icon @click="toggleTheme">
        <v-icon>{{ isDarkTheme ? 'mdi-weather-sunny' : 'mdi-weather-night' }}</v-icon>
      </v-btn>
    </v-app-bar>

    <v-main :class="isDarkTheme ? 'bg-dark' : 'bg-grey-lighten-4'">
      <v-container fluid class="py-6 px-md-10">
        
        <!-- Filtros -->
        <v-card class="mb-6 glass-card rounded-xl pa-4" elevation="0">
          <v-row align="center">
            <v-col cols="12" sm="4" md="3">
              <v-text-field
                v-model="filters.from"
                type="date"
                label="Desde"
                variant="outlined"
                density="compact"
                hide-details
                prepend-inner-icon="mdi-calendar"
              ></v-text-field>
            </v-col>
            <v-col cols="12" sm="4" md="3">
              <v-text-field
                v-model="filters.to"
                type="date"
                label="Hasta"
                variant="outlined"
                density="compact"
                hide-details
                prepend-inner-icon="mdi-calendar"
              ></v-text-field>
            </v-col>
            <v-col cols="12" sm="4" md="3">
              <v-autocomplete
                v-model="filters.engineer"
                :items="engineers"
                item-title="FullName"
                item-value="UserID"
                label="Ingeniero"
                variant="outlined"
                density="compact"
                hide-details
                prepend-inner-icon="mdi-account-hard-hat"
              ></v-autocomplete>
            </v-col>
            <v-col cols="12" sm="12" md="3" class="text-right">
              <v-btn color="primary" @click="fetchKpis" size="large" class="rounded-lg font-weight-bold w-100" elevation="2">
                Actualizar Datos
              </v-btn>
            </v-col>
          </v-row>
        </v-card>

        <v-skeleton-loader v-if="loading" type="card, table"></v-skeleton-loader>

        <div v-else>
          <!-- Resumen Tarjetas -->
          <v-row class="mb-6">
            <v-col cols="12" sm="6" md="3">
              <v-card class="glass-card pa-4 rounded-xl d-flex flex-column align-center text-center">
                <v-icon size="40" color="primary" class="mb-2">mdi-ticket-confirmation</v-icon>
                <div class="text-h3 font-weight-black mb-1">{{ kpis.total }}</div>
                <div class="text-subtitle-2 text-grey">Total Tickets</div>
              </v-card>
            </v-col>
            <v-col cols="12" sm="6" md="3">
              <v-card class="glass-card pa-4 rounded-xl d-flex flex-column align-center text-center">
                <v-icon size="40" color="success" class="mb-2">mdi-check-decagram</v-icon>
                <div class="text-h3 font-weight-black mb-1">{{ kpis.slaCompliance }}%</div>
                <div class="text-subtitle-2 text-grey">% Cumplimiento SLA</div>
              </v-card>
            </v-col>
            <!-- Simulamos TPA y TMR -->
            <v-col cols="12" sm="6" md="3">
              <v-card class="glass-card pa-4 rounded-xl d-flex flex-column align-center text-center">
                <v-icon size="40" color="warning" class="mb-2">mdi-timer-sand</v-icon>
                <div class="text-h3 font-weight-black mb-1">4.2h</div>
                <div class="text-subtitle-2 text-grey">TPA (Promedio)</div>
              </v-card>
            </v-col>
            <v-col cols="12" sm="6" md="3">
              <v-card class="glass-card pa-4 rounded-xl d-flex flex-column align-center text-center">
                <v-icon size="40" color="info" class="mb-2">mdi-flag-checkered</v-icon>
                <div class="text-h3 font-weight-black mb-1">1.5d</div>
                <div class="text-subtitle-2 text-grey">TMR (Resolución)</div>
              </v-card>
            </v-col>
          </v-row>

          <v-row>
            <v-col cols="12" md="6">
              <v-card class="glass-card pa-4 rounded-xl h-100">
                <h3 class="text-h6 font-weight-bold mb-4 text-center">Distribución por Estado</h3>
                <div style="height: 300px; display: flex; justify-content: center;">
                  <Doughnut v-if="statusData.datasets[0].data.length > 0" :data="statusData" :options="pieOptions" />
                  <div v-else class="text-grey d-flex align-center h-100">Sin datos</div>
                </div>
              </v-card>
            </v-col>
            <v-col cols="12" md="6">
              <v-card class="glass-card pa-4 rounded-xl h-100">
                <h3 class="text-h6 font-weight-bold mb-4 text-center">Tickets por Ingeniero</h3>
                <div style="height: 300px;">
                  <Bar v-if="engineerData.datasets[0].data.length > 0" :data="engineerData" :options="barOptions" />
                  <div v-else class="text-grey d-flex align-center justify-center h-100">Sin datos</div>
                </div>
              </v-card>
            </v-col>
          </v-row>
        </div>
      </v-container>
    </v-main>
  </v-app>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import api from '../utils/api'
import { Chart as ChartJS, Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale, ArcElement } from 'chart.js'
import { Bar, Doughnut } from 'vue-chartjs'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement)

const router = useRouter()
const isDarkTheme = ref(localStorage.getItem('theme') === 'dark')

const loading = ref(true)
const reportLoading = ref(false)
const engineers = ref([{ UserID: 'all', FullName: 'Todos los Ingenieros' }])

const filters = ref({
  from: '',
  to: '',
  engineer: 'all'
})

const kpis = ref({
  total: 0,
  slaCompliance: 100,
  statusDistribution: [],
  engineerDistribution: []
})

const statusColors = {
  'Open': '#2E6DA4',
  'Waiting': '#D35400',
  'Replied': '#1D7A4C',
  'In Progress': '#1A8CFF',
  'On Hold': '#607D8B',
  'Waiting Parts': '#7B1FA2',
  'Resolved': '#2E7D32',
  'Closed': '#455A64',
}

const statusTranslations = {
  'Open': 'Nuevo',
  'Waiting': 'Esperando',
  'Replied': 'Respondido',
  'In Progress': 'En Progreso',
  'On Hold': 'En Espera',
  'Waiting Parts': 'En espera piezas',
  'Resolved': 'Resuelto',
  'Closed': 'Cerrado',
}

const statusData = computed(() => {
  const labels = kpis.value.statusDistribution.map(s => statusTranslations[s.Status] || s.Status)
  const data = kpis.value.statusDistribution.map(s => s.count)
  const bgColors = kpis.value.statusDistribution.map(s => statusColors[s.Status] || '#999')
  
  return {
    labels,
    datasets: [{
      backgroundColor: bgColors,
      data
    }]
  }
})

const engineerData = computed(() => {
  const labels = kpis.value.engineerDistribution.map(e => e.FullName || 'Desconocido')
  const data = kpis.value.engineerDistribution.map(e => e.count)
  
  return {
    labels,
    datasets: [{
      label: 'Tickets Asignados',
      backgroundColor: '#2563eb',
      borderRadius: 6,
      data
    }]
  }
})

const pieOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { position: 'right', labels: { color: isDarkTheme.value ? '#fff' : '#333' } }
  }
}

const barOptions = {
  responsive: true,
  maintainAspectRatio: false,
  scales: {
    y: { beginAtZero: true, ticks: { color: isDarkTheme.value ? '#fff' : '#333' } },
    x: { ticks: { color: isDarkTheme.value ? '#fff' : '#333' } }
  },
  plugins: {
    legend: { display: false }
  }
}

const toggleTheme = () => {
  isDarkTheme.value = !isDarkTheme.value
  localStorage.setItem('theme', isDarkTheme.value ? 'dark' : 'light')
}

const fetchEngineers = async () => {
  try {
    const res = await api.get('/api/helpdesk/engineers')
    engineers.value = [{ UserID: 'all', FullName: 'Todos los Ingenieros' }, ...res.data]
  } catch (error) {
    console.error(error)
  }
}

const fetchKpis = async () => {
  loading.value = true
  try {
    const res = await api.get('/api/helpdesk/kpis', { params: filters.value })
    kpis.value = res.data
  } catch (error) {
    console.error('Error fetching KPIs', error)
  } finally {
    loading.value = false
  }
}

const downloadReport = async () => {
  reportLoading.value = true
  try {
    const query = new URLSearchParams(filters.value).toString()
    const token = localStorage.getItem('token')
    const response = await fetch(`http://localhost:5000/api/helpdesk/kpis/report?${query}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    
    if (!response.ok) throw new Error('Error al generar reporte')
      
    const blob = await response.blob()
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `Reporte_KPI_${filters.value.from || 'all'}_${filters.value.to || 'all'}.docx`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
  } catch (error) {
    console.error(error)
    alert('No se pudo descargar el reporte')
  } finally {
    reportLoading.value = false
  }
}

onMounted(() => {
  const token = localStorage.getItem('token')
  if (!token) {
    router.push('/login')
    return
  }
  
  // Set default dates (last 30 days)
  const end = new Date()
  const start = new Date()
  start.setDate(end.getDate() - 30)
  
  filters.value.to = end.toISOString().split('T')[0]
  filters.value.from = start.toISOString().split('T')[0]
  
  fetchEngineers()
  fetchKpis()
})
</script>

<style scoped>
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
  border: 1px solid rgba(255, 255, 255, 0.2) !important;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.bg-dark {
  background-color: #121212 !important;
  color: #ffffff !important;
}

.bg-dark .glass-card {
  background: rgba(20, 20, 20, 0.6) !important;
  border: 1px solid rgba(255, 255, 255, 0.05) !important;
}
</style>
