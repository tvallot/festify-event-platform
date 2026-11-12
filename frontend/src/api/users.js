import api from './axios'

export const registerUser = (userData) => {
    return api.post('/users', userData)
}

export const loginUser = (email, password) => {
    return api.post('/users/login', { email, password })
}

export const fetchMyProfile = () => {
    return api.get('/users/profile')
}

export const updateMyProfile = (userData) => {
    return api.put('/users/profile', userData)
}

export const deleteMyAccount = () => {
    return api.delete('/users/profile')
}

export const fetchMyEvents = () => {
    return api.get('/users/profile/events')
}

export const likeEvent = (eventId) => {
    return api.post(`/users/profile/like/${eventId}`)
}

export const unlikeEvent = (eventId) => {
    return api.delete(`/users/profile/like/${eventId}`)
}

export const fetchAllUsers = () => {
    return api.get('/users/all')
}

export const fetchUserById = (id) => {
    return api.get(`/users/${id}`)
}