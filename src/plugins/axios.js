import axios from 'axios'

let rawBaseUrl = import.meta.env.VITE_API_URL || '';
// Fix double /api if Vercel injects it
if (rawBaseUrl === '/api') {
  rawBaseUrl = '';
}

const api = axios.create({
  baseURL: rawBaseUrl,
  timeout: 60000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Interceptor para inyectar automáticamente el token JWT en las peticiones
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('clientToken')
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Interceptor para manejar errores comunes (como 401 si expira la sesión)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('clientToken')
      localStorage.removeItem('clientUser')
      // Redirigir al login si no estamos en él
      if (window.location.pathname !== '/login') {
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

export default api
