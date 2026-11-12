import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { useFavorites } from '../contexts/useFavorites'
import { fetchMyEvents, fetchMyProfile } from '../api/users'
import { selectIsLoggedIn } from '../redux/userSlice'
import { getAvatar } from '../utils/avatars'
import EventCard from '../components/EventCard'
import LoginRequired from '../components/LoginRequired'
import Spinner from '../components/Spinner'

const TABS = [
    { key: 'upcoming', label: 'Upcoming' },
    { key: 'past', label: 'Past' },
    { key: 'created', label: 'Created by me' },
    { key: 'favorites', label: 'Favorites' },
]

function Profile() {
    const { username, profilePictureId, email } = useSelector((state) => state.user)
    const isLoggedIn = useSelector(selectIsLoggedIn)
    const { favorites: favoriteIds } = useFavorites()
    const [tab, setTab] = useState('upcoming')
    const [loading, setLoading] = useState(true)
    const [lists, setLists] = useState({ upcoming: [], past: [], created: [], favorites: [] })

    useEffect(() => {
        if (!isLoggedIn) return

        Promise.all([fetchMyEvents(), fetchMyProfile()])
            .then(([eventsRes, profileRes]) => setLists({
                upcoming: eventsRes.data.upcomingEvents || [],
                past: eventsRes.data.pastEvents || [],
                created: eventsRes.data.createdEvents || [],
                favorites: profileRes.data.favorites || [],
            }))
            .finally(() => setLoading(false))
    }, [isLoggedIn])

    if (!isLoggedIn) return <LoginRequired message="You need to be logged in to see your profile." />

    // Unliking a card from the favorites tab removes it right away
    const visibleLists = { ...lists, favorites: lists.favorites.filter((e) => favoriteIds.includes(e.id)) }
    const displayedEvents = visibleLists[tab]

    return (
        <main className="min-h-screen bg-gray-900 text-white pb-12 px-6 md:px-12 lg:px-20 pt-32">
            <div className="max-w-6xl mx-auto">
                <section className="bg-gray-800 rounded-2xl border border-gray-700 overflow-hidden mb-6">
                    <div className="h-32 bg-gradient-to-br from-purple-600 via-pink-500 to-blue-500"></div>
                    <div className="px-8 pb-8">
                        <div className="flex flex-col md:flex-row items-start md:items-end gap-6 -mt-16 mb-6">
                            <img src={getAvatar(profilePictureId)} alt="" className="w-32 h-32 rounded-full object-cover border-4 border-gray-800" />
                            <div className="flex-1">
                                <h1 className="text-3xl font-bold mb-1">{username}</h1>
                                <p className="text-gray-400 text-sm"><i className="fa-solid fa-envelope mr-2"></i>{email}</p>
                            </div>
                            <Link to="/settings" className="bg-gray-700 hover:bg-gray-600 transition-colors rounded-lg px-6 py-2.5 text-white text-sm font-semibold">
                                <i className="fa-solid fa-pen mr-2"></i>Edit profile
                            </Link>
                        </div>
                        <div className="flex gap-8 pt-4 border-t border-gray-700">
                            <Stat value={visibleLists.created.length} label="Created" />
                            <Stat value={visibleLists.upcoming.length} label="Upcoming" />
                            <Stat value={visibleLists.favorites.length} label="Favorites" />
                        </div>
                    </div>
                </section>

                <section className="bg-gray-800 rounded-xl border border-gray-700 p-6">
                    <div className="flex gap-3 mb-6 flex-wrap" role="tablist">
                        {TABS.map((t) => (
                            <button key={t.key} role="tab" aria-selected={tab === t.key} onClick={() => setTab(t.key)}
                                className={`cursor-pointer px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                                    tab === t.key ? 'bg-purple-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                }`}>
                                {t.label} {visibleLists[t.key].length}
                            </button>
                        ))}
                    </div>

                    {loading ? (
                        <Spinner fullPage={false} />
                    ) : displayedEvents.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {displayedEvents.map((event) => <EventCard key={event.id} event={event} />)}
                        </div>
                    ) : (
                        <div className="text-center py-20">
                            <i className="fa-solid fa-calendar-xmark text-6xl text-gray-600 mb-4"></i>
                            <h3 className="text-xl font-bold text-gray-400 mb-6">Nothing here yet</h3>
                            <Link to="/events" className="inline-block bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 transition-colors rounded-lg px-6 py-3 text-white font-semibold">
                                Browse events
                            </Link>
                        </div>
                    )}
                </section>
            </div>
        </main>
    )
}

function Stat({ value, label }) {
    return (
        <div className="text-center">
            <p className="text-2xl font-bold">{value}</p>
            <p className="text-sm text-gray-400">{label}</p>
        </div>
    )
}

export default Profile
