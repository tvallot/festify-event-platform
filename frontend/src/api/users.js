import api from './axios'

export const registerUser = (userData) => api.post('/users', userData)

export const loginUser = (email, password) => api.post('/users/login', { email, password })

/** The token can be passed explicitly right after login, before it is stored in Redux. */
export const fetchMyProfile = (token) =>
    api.get('/users/profile', token ? { headers: { Authorization: `Bearer ${token}` } } : undefined)

export const updateMyProfile = (userData) => api.put('/users/profile', userData)

export const deleteMyAccount = () => api.delete('/users/profile')

export const fetchMyEvents = () => api.get('/users/profile/events')

export const likeEvent = (eventId) => api.post(`/users/profile/like/${eventId}`)

export const unlikeEvent = (eventId) => api.delete(`/users/profile/like/${eventId}`)

export const fetchAllUsers = () => api.get('/users/all')

export const deleteUser = (id) => api.delete(`/users/${id}`)
