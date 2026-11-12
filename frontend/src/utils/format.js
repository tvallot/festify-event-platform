const LOCALE = 'en-GB'

export function formatDate(value, options = { day: 'numeric', month: 'short', year: 'numeric' }) {
    if (!value) return ''
    // Dates come from the API as "yyyy-MM-dd": parse them as local dates, not UTC
    const date = typeof value === 'string' && value.length === 10 ? new Date(`${value}T00:00`) : new Date(value)
    return date.toLocaleDateString(LOCALE, options)
}

export function spotsLeft(event) {
    if (!event.capacity) return null
    return Math.max(0, event.capacity - (event.participantCount || 0))
}

export function errorMessage(err, fallback) {
    const data = err?.response?.data
    if (typeof data === 'string' && data) return data
    return data?.message || fallback
}
