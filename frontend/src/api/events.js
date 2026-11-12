import api from './axios'

export const fetchEvents = (filters = {}) => {
    const params = {}
    if (filters.keyword) params.keyword = filters.keyword
    if (filters.category) params.category = filters.category
    if (filters.isFree !== undefined && filters.isFree !== null) params.isFree = filters.isFree
    if (filters.region) params.region = filters.region
    return api.get('/events', { params })
}

export const fetchEventById = async (id) => {
    const res = await api.get('/events')
    const event = res.data.find((e) => e.id === Number(id))
    if (!event) throw new Error('Event not found')
    return { data: event }
}

export const createEvent = (eventData) => {
    return api.post('/events', eventData)
}

export const updateEvent = (id, eventData) => {
    return api.put(`/events/${id}`, eventData)
}

export const deleteEvent = (id) => {
    return api.delete(`/events/${id}`)
}

export const joinEvent = (eventId) => {
    return api.post(`/events/${eventId}/join`)
}

export const leaveEvent = (eventId) => {
    return api.delete(`/events/${eventId}/join`)
}

export const fetchParticipants = (eventId) => {
    return api.get(`/events/${eventId}/participants`)
}