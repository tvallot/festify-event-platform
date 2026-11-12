import { useState, useEffect, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { fetchEvents } from '../api/events'
import EventCard from '../components/EventCard'
import Spinner from '../components/Spinner'

const ALL = 'All'
const selectClass = 'w-full bg-gray-900 border border-gray-600 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-purple-500 transition-colors'

function EventsList() {
    const [searchParams, setSearchParams] = useSearchParams()
    const [events, setEvents] = useState([])
    const [loading, setLoading] = useState(true)
    const [loadError, setLoadError] = useState(false)
    const [category, setCategory] = useState(ALL)
    const [city, setCity] = useState(ALL)
    const [price, setPrice] = useState(ALL)
    const [filtersOpen, setFiltersOpen] = useState(false)

    const search = searchParams.get('keyword') || ''
    const setSearch = (value) => setSearchParams(value ? { keyword: value } : {}, { replace: true })

    useEffect(() => {
        fetchEvents()
            .then((res) => setEvents(res.data))
            .catch(() => setLoadError(true))
            .finally(() => setLoading(false))
    }, [])

    const categories = useMemo(() => [ALL, ...new Set(events.map((e) => e.category).filter(Boolean))], [events])
    const cities = useMemo(() => [ALL, ...new Set(events.map((e) => e.location).filter(Boolean))], [events])

    const query = search.toLowerCase()
    const filteredEvents = events.filter((event) => {
        const matchesSearch = !query
            || event.title?.toLowerCase().includes(query)
            || event.description?.toLowerCase().includes(query)
        const matchesCategory = category === ALL || event.category === category
        const matchesCity = city === ALL || event.location === city
        const matchesPrice = price === ALL || (price === 'Free') === Boolean(event.isFree)
        return matchesSearch && matchesCategory && matchesCity && matchesPrice
    })

    const hasActiveFilters = search || category !== ALL || city !== ALL || price !== ALL

    const resetFilters = () => {
        setSearch('')
        setCategory(ALL)
        setCity(ALL)
        setPrice(ALL)
    }

    if (loading) return <Spinner />

    return (
        <main className="min-h-screen bg-gray-900 text-white px-4 sm:px-6 md:px-12 lg:px-20 pt-28 pb-12">
            <div className="mb-8">
                <h1 className="text-3xl sm:text-4xl font-bold mb-2">Browse events</h1>
                <p className="text-gray-400 text-sm sm:text-base">
                    {filteredEvents.length} event{filteredEvents.length === 1 ? '' : 's'}
                </p>
            </div>

            <div className="bg-gray-800 rounded-xl p-4 sm:p-6 mb-8 border border-gray-700">
                <div className="relative mb-4">
                    <i className="fa-solid fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"></i>
                    <input type="search" placeholder="Search events..." value={search} aria-label="Search events"
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full bg-gray-900 border border-gray-600 rounded-lg pl-12 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors text-sm sm:text-base" />
                </div>

                <button onClick={() => setFiltersOpen(!filtersOpen)}
                    className="cursor-pointer sm:hidden flex items-center justify-between w-full text-gray-300 text-sm font-medium py-2">
                    <span className="flex items-center gap-2">
                        <i className="fa-solid fa-sliders text-xs"></i>
                        Filters
                        {hasActiveFilters && <span className="w-2 h-2 bg-purple-500 rounded-full"></span>}
                    </span>
                    <i className={`fa-solid fa-chevron-down text-xs transition-transform duration-300 ${filtersOpen ? 'rotate-180' : ''}`}></i>
                </button>

                <div className={`overflow-hidden transition-all duration-300 ease-out sm:max-h-none sm:opacity-100 ${filtersOpen ? 'max-h-80 opacity-100 mt-3' : 'max-h-0 opacity-0 sm:mt-0'}`}>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                        <Filter label="Category" value={category} onChange={setCategory} options={categories} />
                        <Filter label="Location" value={city} onChange={setCity} options={cities} />
                        <Filter label="Price" value={price} onChange={setPrice} options={[ALL, 'Free', 'Paid']} />
                    </div>
                </div>

                {hasActiveFilters && (
                    <button onClick={resetFilters} className="cursor-pointer mt-4 text-purple-400 hover:text-purple-300 text-sm font-semibold transition-colors">
                        <i className="fa-solid fa-rotate-left mr-2"></i>Reset filters
                    </button>
                )}
            </div>

            {filteredEvents.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                    {filteredEvents.map((event) => <EventCard key={event.id} event={event} />)}
                </div>
            ) : (
                <div className="text-center py-20">
                    <i className="fa-solid fa-calendar-xmark text-5xl sm:text-6xl text-gray-600 mb-4 block"></i>
                    <h3 className="text-xl sm:text-2xl font-bold text-gray-400 mb-2">
                        {loadError ? 'Could not load events' : 'No events found'}
                    </h3>
                    <p className="text-gray-500 text-sm sm:text-base">
                        {loadError ? 'Please try again later.' : 'Try changing your search or filters.'}
                    </p>
                </div>
            )}
        </main>
    )
}

function Filter({ label, value, onChange, options }) {
    return (
        <label className="block">
            <span className="block text-xs font-semibold mb-1.5 text-gray-400">{label}</span>
            <select value={value} onChange={(e) => onChange(e.target.value)} className={selectClass}>
                {options.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
            </select>
        </label>
    )
}

export default EventsList
