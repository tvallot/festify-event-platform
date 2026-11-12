import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { useFavorites } from '../contexts/FavoritesContext'
import { fetchMyEvents } from '../api/users'
import { fetchEvents, fetchParticipants } from '../api/events'
import EventCard from '../components/EventCard'

import pfp1 from '../assets/profils/1.png'
import pfp2 from '../assets/profils/2.png'
import pfp3 from '../assets/profils/3.png'
import pfp4 from '../assets/profils/4.png'
import pfp5 from '../assets/profils/5.png'
import pfp6 from '../assets/profils/6.png'

const profilePictures = { 1: pfp1, 2: pfp2, 3: pfp3, 4: pfp4, 5: pfp5, 6: pfp6 }

function Profil() {
    const { username, userId, profilePictureId, email, token } = useSelector((state) => state.user)
    const { favorites } = useFavorites()
    const [eventsFilter, setEventsFilter] = useState('upcoming')
    const [loading, setLoading] = useState(true)

    const [createdEvents, setCreatedEvents] = useState([])
    const [upcomingEvents, setUpcomingEvents] = useState([])
    const [pastEvents, setPastEvents] = useState([])
    const [allEvents, setAllEvents] = useState([])
    const [favoriteEvents, setFavoriteEvents] = useState([])

    const isLoggedIn = userId > 0 && token

    useEffect(() => {
        if (!isLoggedIn) return

        const load = async () => {
            setLoading(true)
            try {
                const profileRes = await fetchMyEvents()
                const data = profileRes.data

                const transform = async (events) =>
                    Promise.all(events.map(async (e) => {
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
                    }))

                setCreatedEvents(await transform(data.createdEvents || []))
                setUpcomingEvents(await transform(data.upcomingEvents || []))
                setPastEvents(await transform(data.pastEvents || []))

                const allRes = await fetchEvents()
                const transformedAll = await transform(allRes.data)
                setAllEvents(transformedAll)
                setFavoriteEvents(transformedAll.filter((e) => favorites.includes(e.id)))
            } catch (err) {
                console.error('Failed to load profile events:', err)
            } finally {
                setLoading(false)
            }
        }

        load()
    }, [isLoggedIn, favorites])

    if (!isLoggedIn) {
        return (
            <main className="min-h-screen bg-gray-900 flex flex-col items-center justify-center px-6">
                <div className="flex flex-col items-center text-center">
                    <div className="w-20 h-20 bg-gradient-to-br from-purple-600 to-pink-500 rounded-full flex items-center justify-center mb-6">
                        <i className="fa-solid fa-user text-white text-3xl"></i>
                    </div>
                    <h1 className="text-white text-3xl font-bold mb-3">Connectez-vous</h1>
                    <p className="text-gray-400 text-base mb-8 max-w-md">Vous devez être connecté pour accéder à votre profil.</p>
                    <div className="flex gap-4">
                        <Link to="/login" className="bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 transition-colors rounded-lg px-8 py-3 text-white font-semibold">Se connecter</Link>
                        <Link to="/signup" className="bg-gray-800 hover:bg-gray-700 border-2 border-gray-700 transition-colors rounded-lg px-8 py-3 text-white font-semibold">Créer un compte</Link>
                    </div>
                </div>
            </main>
        )
    }

    let displayedEvents = upcomingEvents
    if (eventsFilter === 'past') displayedEvents = pastEvents
    else if (eventsFilter === 'created') displayedEvents = createdEvents
    else if (eventsFilter === 'favorites') displayedEvents = favoriteEvents

    const profilePhoto = profilePictureId && profilePictures[profilePictureId] ? profilePictures[profilePictureId] : null

    return (
        <main className="min-h-screen bg-gray-900 text-white pb-12 px-6 md:px-12 lg:px-20 pt-50">
            <div className="max-w-6xl mx-auto">
                <div className="bg-gray-800 rounded-2xl border border-gray-700 overflow-hidden mb-6">
                    <div className="relative h-32 bg-gradient-to-br from-purple-600 via-pink-500 to-blue-500"></div>
                    <div className="px-8 pb-8">
                        <div className="flex flex-col md:flex-row items-start md:items-end gap-6 -mt-16 mb-6">
                            <div className="relative">
                                {profilePhoto ? (
                                    <img src={profilePhoto} alt={username} className="w-32 h-32 rounded-full object-cover border-4 border-gray-800" />
                                ) : (
                                    <div className="w-32 h-32 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center border-4 border-gray-800">
                                        <i className="fa-solid fa-user text-5xl text-white"></i>
                                    </div>
                                )}
                            </div>
                            <div className="flex-1 pt-20">
                                <h1 className="text-3xl font-bold mb-1">{username}</h1>
                                <p className="text-gray-400 text-sm mb-1"><i className="fa-solid fa-envelope mr-2"></i>{email}</p>
                            </div>
                            <Link to="/settings" className="bg-gray-700 hover:bg-gray-600 transition-colors rounded-lg px-6 py-2.5 text-white text-sm font-semibold">
                                <i className="fa-solid fa-pen mr-2"></i>Modifier le profil
                            </Link>
                        </div>
                        <div className="flex gap-8 pt-4 border-t border-gray-700">
                            <div className="text-center">
                                <p className="text-2xl font-bold">{createdEvents.length}</p>
                                <p className="text-sm text-gray-400">Créés</p>
                            </div>
                            <div className="text-center">
                                <p className="text-2xl font-bold">{upcomingEvents.length}</p>
                                <p className="text-sm text-gray-400">À venir</p>
                            </div>
                            <div className="text-center">
                                <p className="text-2xl font-bold">{favoriteEvents.length}</p>
                                <p className="text-sm text-gray-400">Favoris</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-gray-800 rounded-xl border border-gray-700">
                    <div className="p-6">
                        <div className="flex gap-3 mb-6 flex-wrap">
                            {[
                                { key: 'upcoming', label: 'À venir', count: upcomingEvents.length },
                                { key: 'past', label: 'Passés', count: pastEvents.length },
                                { key: 'created', label: 'Créés par moi', count: createdEvents.length },
                                { key: 'favorites', label: 'Favoris', count: favoriteEvents.length },
                            ].map((f) => (
                                <button key={f.key} onClick={() => setEventsFilter(f.key)}
                                    className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                                        eventsFilter === f.key ? 'bg-purple-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                    }`}>
                                    {f.label} {f.count}
                                </button>
                            ))}
                        </div>

                        {loading ? (
                            <div className="flex justify-center py-20">
                                <i className="fa-solid fa-spinner fa-spin text-3xl text-purple-500"></i>
                            </div>
                        ) : displayedEvents.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {displayedEvents.map((event) => (
                                    <EventCard key={event.id} event={event} />
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-20">
                                <i className="fa-solid fa-calendar-xmark text-6xl text-gray-600 mb-4"></i>
                                <h3 className="text-xl font-bold text-gray-400 mb-2">Aucun événement</h3>
                                <p className="text-gray-500 mb-6">Aucun événement dans cette catégorie</p>
                                <Link to="/events" className="inline-block bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 transition-colors rounded-lg px-6 py-3 text-white font-semibold">
                                    Découvrir des événements
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </main>
    )
}

export default Profil