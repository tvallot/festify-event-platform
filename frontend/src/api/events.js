import api from './axios'

export const fetchEvents = (filters = {}) => {
    const params = {}
    if (filters.keyword) params.keyword = filters.keyword
    if (filters.category) params.category = filters.category
    if (filters.isFree !== undefined && filters.isFree !== null) params.isFree = filters.isFree
    if (filters.region) params.region = filters.region
    return api.get('/events', { params })
}

export const fetchEventById = (id) => api.get(`/events/${id}`)

export const createEvent = (eventData) => api.post('/events', eventData)

export const updateEvent = (id, eventData) => api.put(`/events/${id}`, eventData)

export const deleteEvent = (id) => api.delete(`/events/${id}`)

export const joinEvent = (eventId) => api.post(`/events/${eventId}/join`)

export const leaveEvent = (eventId) => api.delete(`/events/${eventId}/join`)

export const fetchParticipants = (eventId) => api.get(`/events/${eventId}/participants`)
