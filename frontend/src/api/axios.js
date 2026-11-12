import axios from 'axios'
import { store } from '../redux/store'
import { logout } from '../redux/userSlice'

const api = axios.create({
    baseURL: '/api',
})

api.interceptors.request.use((config) => {
    const token = store.getState().user.token
    if (token && !config.headers.Authorization) {
        config.headers.Authorization = `Bearer ${token}`
    }
    return config
})

// An expired or invalid token ends the session
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401 && store.getState().user.token) {
            store.dispatch(logout())
        }
        return Promise.reject(error)
    }
)

export default api
