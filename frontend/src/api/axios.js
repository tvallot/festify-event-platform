import axios from 'axios'
import { store } from '../redux/store'
import { logout } from '../redux/userSlice'

const api = axios.create({
    baseURL: '/api',
})

api.interceptors.request.use((config) => {
    let token = store.getState().user.token
    if (!token) {
        const stored = JSON.parse(localStorage.getItem('festify_user'))
        token = stored?.token
    }
    if (token) {
        config.headers.Authorization = `Bearer ${token}`
    }
    return config
})

api.interceptors.response.use(
    (response) => response,
    (error) => {
        const status = error.response?.status
        const url = error.config?.url || ''
        const hasToken = store.getState().user.token

        if (hasToken && (status === 401 || (status === 403 && url.includes('/users/profile')))) {
            store.dispatch(logout())
        }
        return Promise.reject(error)
    }
)

export default api