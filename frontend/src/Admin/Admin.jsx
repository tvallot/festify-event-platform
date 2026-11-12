import { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import NotFound from '../NotFound/NotFound'
import { fetchAllUsers } from '../api/users'
import { fetchEvents, fetchParticipants, deleteEvent } from '../api/events'
import api from '../api/axios'

function Admin() {
    const { role } = useSelector((state) => state.user)
    const [activeTab, setActiveTab] = useState('overview')
    const [userSearch, setUserSearch] = useState('')
    const [eventSearch, setEventSearch] = useState('')
    const [users, setUsers] = useState([])
    const [events, setEvents] = useState([])
    const [loading, setLoading] = useState(true)

    if (role !== 'ADMIN') return <NotFound />

    useEffect(() => {
        loadData()
    }, [])

    const loadData = async () => {
        setLoading(true)
        try {
            const usersRes = await fetchAllUsers()
            setUsers(usersRes.data.map(u => ({
                id: u.id,
                username: [u.firstName, u.lastName].filter(Boolean).join(' ') || u.email,
                email: u.email,
                role: u.role || 'USER',
                profilePicture: u.profilePicture,
            })))

            const eventsRes = await fetchEvents()
            const eventsWithParticipants = await Promise.all(
                eventsRes.data.map(async (e) => {
                    let participantCount = 0
                    try {
                        const pRes = await fetchParticipants(e.id)
                        participantCount = pRes.data.length
                    } catch {  }
                    return {
                        id: e.id,
                        titre: e.title,
                        category: e.category || 'Autre',
                        date: e.startDate,
                        participants: participantCount,
                        location: e.location || '',
                    }
                })
            )
            setEvents(eventsWithParticipants)
        } 
        
        catch (err) {
            console.error('Admin data load failed:', err)
        } 
        
        finally {
            setLoading(false)
        }
    }

    const handleDeleteUser = async (userId) => {
        if (!confirm('Supprimer cet utilisateur ?')) return
        try {
            await api.delete(`/users/${userId}`)
            setUsers(prev => prev.filter(u => u.id !== userId))
        } 
        
        catch (err) {
            alert(err.response?.data?.message || err.response?.data || 'Erreur lors de la suppression')
        }
    }

    const handleDeleteEvent = async (eventId) => {
        if (!confirm('Supprimer cet événement ?')) return
        try {
            await deleteEvent(eventId)
            setEvents(prev => prev.filter(e => e.id !== eventId))
        } 
        
        catch (err) {
            alert(err.response?.data?.message || err.response?.data || 'Erreur lors de la suppression')
        }
    }

    const filteredUsers = users.filter(u =>
        u.username.toLowerCase().includes(userSearch.toLowerCase()) ||
        u.email.toLowerCase().includes(userSearch.toLowerCase())
    )

    const filteredEvents = events.filter(e =>
        e.titre.toLowerCase().includes(eventSearch.toLowerCase()) ||
        e.category.toLowerCase().includes(eventSearch.toLowerCase())
    )

    const totalUsers = users.length
    const totalEvents = events.length
    const totalParticipants = events.reduce((sum, e) => sum + e.participants, 0)

    const tabs = [
        { key: 'overview', label: 'Vue d\'ensemble', icon: 'fa-chart-simple' },
        { key: 'users', label: 'Utilisateurs', icon: 'fa-users' },
        { key: 'events', label: 'Événements', icon: 'fa-calendar' },
    ]

    if (loading) {
        return (
            <main className="min-h-screen bg-gray-950 flex items-center justify-center">
                <i className="fa-solid fa-spinner fa-spin text-4xl text-purple-500"></i>
            </main>
        )
    }

    return (
        <main className="min-h-screen bg-gray-950 text-white px-4 sm:px-6 md:px-12 lg:px-20 pt-28 pb-12">
            <div className="max-w-[1400px] mx-auto">
                <div className="mb-8">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 bg-red-500/20 rounded-xl flex items-center justify-center">
                            <i className="fa-solid fa-shield-halved text-red-400"></i>
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-bold">Administration</h1>
                    </div>
                    <p className="text-gray-400 text-sm sm:text-base">Gérez les utilisateurs et événements.</p>
                </div>

                <div className="flex gap-1 bg-gray-900 border border-gray-800 rounded-xl p-1 mb-8 overflow-x-auto">
                    {tabs.map(tab => (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
                            className={`cursor-pointer flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                                activeTab === tab.key
                                    ? 'bg-purple-600 text-white'
                                    : 'text-gray-400 hover:text-white hover:bg-gray-800'
                            }`}
                        >
                            <i className={`fa-solid ${tab.icon} text-xs`}></i>
                            <span className="hidden sm:inline">{tab.label}</span>
                        </button>
                    ))}
                </div>

                {activeTab === 'overview' && (
                    <div>
                        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-8">
                            <StatCard icon="fa-users" iconColor="text-blue-400" iconBg="bg-blue-500/20" label="Utilisateurs" value={totalUsers} />
                            <StatCard icon="fa-calendar" iconColor="text-purple-400" iconBg="bg-purple-500/20" label="Événements" value={totalEvents} />
                            <StatCard icon="fa-user-group" iconColor="text-green-400" iconBg="bg-green-500/20" label="Participations" value={totalParticipants} />
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 sm:p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="font-semibold">Utilisateurs</h2>
                                    <button onClick={() => setActiveTab('users')} className="cursor-pointer text-purple-400 text-sm hover:text-purple-300 transition-colors">
                                        Voir tout
                                    </button>
                                </div>
                                <div className="space-y-3">
                                    {users.slice(0, 5).map(user => (
                                        <div key={user.id} className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-xs font-bold">
                                                    {user.username.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className="text-white text-sm font-medium">{user.username}</p>
                                                    <p className="text-gray-500 text-xs">{user.email}</p>
                                                </div>
                                            </div>
                                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                                                user.role === 'ADMIN' ? 'bg-red-500/20 text-red-400' : 'bg-gray-700 text-gray-400'
                                            }`}>
                                                {user.role === 'ADMIN' ? 'Admin' : 'User'}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 sm:p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="font-semibold">Événements récents</h2>
                                    <button onClick={() => setActiveTab('events')} className="cursor-pointer text-purple-400 text-sm hover:text-purple-300 transition-colors">
                                        Voir tout
                                    </button>
                                </div>
                                {events.length > 0 ? (
                                    <div className="space-y-3">
                                        {events.slice(0, 5).map(event => (
                                            <div key={event.id} className="flex items-center justify-between">
                                                <div>
                                                    <p className="text-white text-sm font-medium">{event.titre}</p>
                                                    <p className="text-gray-500 text-xs">{event.participants} participants</p>
                                                </div>
                                                <span className="text-gray-400 text-xs">
                                                    {event.date ? new Date(event.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }) : ''}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-gray-500 text-sm text-center py-4">Aucun événement</p>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'users' && (
                    <div>
                        <div className="relative mb-6">
                            <i className="fa-solid fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm"></i>
                            <input
                                type="text"
                                placeholder="Rechercher un utilisateur..."
                                value={userSearch}
                                onChange={(e) => setUserSearch(e.target.value)}
                                className="w-full bg-gray-900 border border-gray-700 rounded-lg pl-11 pr-4 py-3 text-sm text-white placeholder-gray-500 outline-none focus:border-purple-500 transition-colors"
                            />
                        </div>

                        <div className="hidden md:block bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-gray-800">
                                        <th className="text-left text-xs font-semibold text-gray-400 px-5 py-3">Utilisateur</th>
                                        <th className="text-left text-xs font-semibold text-gray-400 px-5 py-3">Rôle</th>
                                        <th className="text-right text-xs font-semibold text-gray-400 px-5 py-3">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredUsers.map(user => (
                                        <tr key={user.id} className="border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors">
                                            <td className="px-5 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-xs font-bold shrink-0">
                                                        {user.username.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <p className="text-white text-sm font-medium">{user.username}</p>
                                                        <p className="text-gray-500 text-xs">{user.email}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-5 py-4">
                                                <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                                                    user.role === 'ADMIN' ? 'bg-red-500/20 text-red-400' : 'bg-gray-700 text-gray-300'
                                                }`}>
                                                    {user.role === 'ADMIN' ? 'Admin' : 'Utilisateur'}
                                                </span>
                                            </td>
                                            <td className="px-5 py-4 text-right">
                                                {user.role !== 'admin' && (
                                                    <button onClick={() => handleDeleteUser(user.id)}
                                                        className="cursor-pointer w-8 h-8 rounded-lg bg-gray-800 hover:bg-red-600/20 flex items-center justify-center text-gray-400 hover:text-red-400 transition-colors ml-auto">
                                                        <i className="fa-solid fa-trash text-xs"></i>
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="md:hidden space-y-3">
                            {filteredUsers.map(user => (
                                <div key={user.id} className="bg-gray-900 border border-gray-800 rounded-xl p-4">
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-xs font-bold">
                                                {user.username.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <p className="text-white text-sm font-medium">{user.username}</p>
                                                <p className="text-gray-500 text-xs">{user.email}</p>
                                            </div>
                                        </div>
                                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-semibold ${
                                            user.role === 'ADMIN' ? 'bg-red-500/20 text-red-400' : 'bg-gray-700 text-gray-300'
                                        }`}>
                                            {user.role === 'ADMIN' ? 'Admin' : 'User'}
                                        </span>
                                    </div>
                                    {user.role !== 'ADMIN' && (
                                        <button onClick={() => handleDeleteUser(user.id)}
                                            className="cursor-pointer w-full py-2 bg-gray-800 hover:bg-red-600/20 rounded-lg text-xs text-gray-300 hover:text-red-400 transition-colors">
                                            <i className="fa-solid fa-trash mr-1.5"></i> Supprimer
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === 'events' && (
                    <div>
                        <div className="relative mb-6">
                            <i className="fa-solid fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm"></i>
                            <input
                                type="text"
                                placeholder="Rechercher un événement..."
                                value={eventSearch}
                                onChange={(e) => setEventSearch(e.target.value)}
                                className="w-full bg-gray-900 border border-gray-700 rounded-lg pl-11 pr-4 py-3 text-sm text-white placeholder-gray-500 outline-none focus:border-purple-500 transition-colors"
                            />
                        </div>

                        <div className="hidden md:block bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-gray-800">
                                        <th className="text-left text-xs font-semibold text-gray-400 px-5 py-3">Événement</th>
                                        <th className="text-left text-xs font-semibold text-gray-400 px-5 py-3">Catégorie</th>
                                        <th className="text-left text-xs font-semibold text-gray-400 px-5 py-3">Date</th>
                                        <th className="text-left text-xs font-semibold text-gray-400 px-5 py-3">Participants</th>
                                        <th className="text-right text-xs font-semibold text-gray-400 px-5 py-3">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredEvents.map(event => (
                                        <tr key={event.id} className="border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors">
                                            <td className="px-5 py-4 text-white text-sm font-medium">{event.titre}</td>
                                            <td className="px-5 py-4 text-gray-300 text-sm">{event.category}</td>
                                            <td className="px-5 py-4 text-gray-400 text-sm">
                                                {event.date ? new Date(event.date).toLocaleDateString('fr-FR') : '-'}
                                            </td>
                                            <td className="px-5 py-4 text-gray-300 text-sm">{event.participants}</td>
                                            <td className="px-5 py-4 text-right">
                                                <button onClick={() => handleDeleteEvent(event.id)}
                                                    className="cursor-pointer w-8 h-8 rounded-lg bg-gray-800 hover:bg-red-600/20 flex items-center justify-center text-gray-400 hover:text-red-400 transition-colors ml-auto">
                                                    <i className="fa-solid fa-trash text-xs"></i>
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="md:hidden space-y-3">
                            {filteredEvents.map(event => (
                                <div key={event.id} className="bg-gray-900 border border-gray-800 rounded-xl p-4">
                                    <h3 className="text-white text-sm font-medium mb-2">{event.titre}</h3>
                                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-400 mb-3">
                                        <span><i className="fa-solid fa-tag mr-1"></i>{event.category}</span>
                                        <span><i className="fa-solid fa-calendar mr-1"></i>{event.date ? new Date(event.date).toLocaleDateString('fr-FR') : '-'}</span>
                                        <span><i className="fa-solid fa-users mr-1"></i>{event.participants}</span>
                                    </div>
                                    <button onClick={() => handleDeleteEvent(event.id)}
                                        className="cursor-pointer w-full py-2 bg-gray-800 hover:bg-red-600/20 rounded-lg text-xs text-gray-300 hover:text-red-400 transition-colors">
                                        <i className="fa-solid fa-trash mr-1.5"></i> Supprimer
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </main>
    )
}

function StatCard({ icon, iconColor, iconBg, label, value }) {
    return (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 sm:p-5">
            <div className={`w-10 h-10 ${iconBg} rounded-xl flex items-center justify-center mb-3`}>
                <i className={`fa-solid ${icon} ${iconColor}`}></i>
            </div>
            <p className="text-2xl sm:text-3xl font-bold text-white">{value.toLocaleString()}</p>
            <p className="text-gray-500 text-xs sm:text-sm mt-0.5">{label}</p>
        </div>
    )
}

export default Admin