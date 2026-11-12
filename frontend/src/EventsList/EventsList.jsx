import { useState, useEffect } from 'react'
import { fetchEvents, fetchParticipants } from '../api/events'
import EventCard from '../components/EventCard'

function EventsList() {
    const [events, setEvents] = useState([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedCategory, setSelectedCategory] = useState('Toutes')
    const [selectedCity, setSelectedCity] = useState('Toutes')
    const [priceFilter, setPriceFilter] = useState('Tous')
    const [filtersOpen, setFiltersOpen] = useState(false)

    useEffect(() => {
        loadEvents()
    }, [])

    const loadEvents = async () => {
        setLoading(true)
        try {
            const res = await fetchEvents()
            const transformed = await Promise.all(
                res.data.map(async (e) => {
                    let participantCount = 0
                    try {
                        const pRes = await fetchParticipants(e.id)
                        participantCount = pRes.data.length
                    } catch { }

                    return {
                        id: e.id,
                        titre: e.title,
                        description: e.description || '',
                        categorie: e.category || 'Autre',
                        ville: e.location || 'Non précisé',
                        date: e.startDate,
                        prix: e.isFree ? 0 : 1,
                        participants: participantCount,
                        placesRestantes: e.capacity ? Math.max(0, e.capacity - participantCount) : null,
                        image: e.thumbnailUrl || null,
                    }
                })
            )
            setEvents(transformed)
        } 
        
        catch (err) {
            console.error('Failed to fetch events:', err)
        } 
        
        finally {
            setLoading(false)
        }
    }

    const categories = ['Toutes', ...new Set(events.map((e) => e.categorie).filter(Boolean))]
    const cities = ['Toutes', ...new Set(events.map((e) => e.ville).filter(Boolean))]

    const hasActiveFilters = searchQuery || selectedCategory !== 'Toutes' || selectedCity !== 'Toutes' || priceFilter !== 'Tous'

    const filteredEvents = events.filter((event) => {
        const matchesSearch =
            event.titre.toLowerCase().includes(searchQuery.toLowerCase()) ||
            event.description.toLowerCase().includes(searchQuery.toLowerCase())
        const matchesCategory = selectedCategory === 'Toutes' || event.categorie === selectedCategory
        const matchesCity = selectedCity === 'Toutes' || event.ville === selectedCity
        const matchesPrice =
            priceFilter === 'Tous' ||
            (priceFilter === 'Gratuit' && event.prix === 0) ||
            (priceFilter === 'Payant' && event.prix > 0)

        return matchesSearch && matchesCategory && matchesCity && matchesPrice
    })

    const resetFilters = () => {
        setSearchQuery('')
        setSelectedCategory('Toutes')
        setSelectedCity('Toutes')
        setPriceFilter('Tous')
    }

    if (loading) {
        return (
            <main className="min-h-screen bg-gray-900 flex items-center justify-center">
                <i className="fa-solid fa-spinner fa-spin text-4xl text-purple-500"></i>
            </main>
        )
    }

    return (
        <main className="min-h-screen bg-gray-900 text-white px-4 sm:px-6 md:px-12 lg:px-20 pt-28 pb-12">
            <div className="mb-8">
                <h1 className="text-3xl sm:text-4xl font-bold mb-2">Découvrir les événements</h1>
                <p className="text-gray-400 text-sm sm:text-base">
                    {filteredEvents.length} événement{filteredEvents.length > 1 ? 's' : ''} disponible{filteredEvents.length > 1 ? 's' : ''}
                </p>
            </div>

            <div className="bg-gray-800 rounded-xl p-4 sm:p-6 mb-8 border border-gray-700">
                <div className="relative mb-4">
                    <i className="fa-solid fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"></i>
                    <input
                        type="text"
                        placeholder="Rechercher un événement..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-gray-900 border border-gray-600 rounded-lg pl-12 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors text-sm sm:text-base"
                    />
                </div>

                <button
                    onClick={() => setFiltersOpen(!filtersOpen)}
                    className="cursor-pointer sm:hidden flex items-center justify-between w-full text-gray-300 text-sm font-medium py-2"
                >
                    <span className="flex items-center gap-2">
                        <i className="fa-solid fa-sliders text-xs"></i>
                        Filtres avancés
                        {hasActiveFilters && <span className="w-2 h-2 bg-purple-500 rounded-full"></span>}
                    </span>
                    <i className={`fa-solid fa-chevron-down text-xs transition-transform duration-300 ${filtersOpen ? 'rotate-180' : ''}`}></i>
                </button>

                <div className={`overflow-hidden transition-all duration-300 ease-out sm:max-h-none sm:opacity-100 ${
                    filtersOpen ? 'max-h-80 opacity-100 mt-3' : 'max-h-0 opacity-0 sm:mt-0'
                }`}>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                        <div>
                            <label className="block text-xs font-semibold mb-1.5 text-gray-400">Catégorie</label>
                            <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}
                                className="w-full bg-gray-900 border border-gray-600 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-purple-500 transition-colors">
                                {categories.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-semibold mb-1.5 text-gray-400">Ville</label>
                            <select value={selectedCity} onChange={(e) => setSelectedCity(e.target.value)}
                                className="w-full bg-gray-900 border border-gray-600 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-purple-500 transition-colors">
                                {cities.map((city) => <option key={city} value={city}>{city}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-semibold mb-1.5 text-gray-400">Prix</label>
                            <select value={priceFilter} onChange={(e) => setPriceFilter(e.target.value)}
                                className="w-full bg-gray-900 border border-gray-600 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-purple-500 transition-colors">
                                <option value="Tous">Tous</option>
                                <option value="Gratuit">Gratuit</option>
                                <option value="Payant">Payant</option>
                            </select>
                        </div>
                    </div>
                </div>

                {hasActiveFilters && (
                    <button onClick={resetFilters}
                        className="cursor-pointer mt-4 text-purple-400 hover:text-purple-300 text-sm font-semibold transition-colors">
                        <i className="fa-solid fa-rotate-left mr-2"></i>Réinitialiser les filtres
                    </button>
                )}
            </div>

            {filteredEvents.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                    {filteredEvents.map((event) => (
                        <EventCard key={event.id} event={event} />
                    ))}
                </div>
            ) : (
                <div className="text-center py-20">
                    <i className="fa-solid fa-calendar-xmark text-5xl sm:text-6xl text-gray-600 mb-4 block"></i>
                    <h3 className="text-xl sm:text-2xl font-bold text-gray-400 mb-2">Aucun événement trouvé</h3>
                    <p className="text-gray-500 text-sm sm:text-base">Essayez de modifier vos filtres de recherche</p>
                </div>
            )}
        </main>
    )
}

export default EventsList