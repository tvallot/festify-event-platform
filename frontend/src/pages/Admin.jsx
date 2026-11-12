import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { fetchAllUsers, deleteUser } from '../api/users'
import { fetchEvents, deleteEvent } from '../api/events'
import { errorMessage, formatDate } from '../utils/format'
import ConfirmModal from '../components/ConfirmModal'
import NotFound from './NotFound'
import Spinner from '../components/Spinner'

const TABS = [
    { key: 'overview', label: 'Overview', icon: 'fa-chart-simple' },
    { key: 'users', label: 'Users', icon: 'fa-users' },
    { key: 'events', label: 'Events', icon: 'fa-calendar' },
]

const searchClass = 'w-full bg-gray-900 border border-gray-700 rounded-lg pl-11 pr-4 py-3 text-sm text-white placeholder-gray-500 outline-none focus:border-purple-500 transition-colors mb-6'

/** The API protects admin routes; hiding the page is only for UX. */
function Admin() {
    const role = useSelector((state) => state.user.role)
    return role === 'ADMIN' ? <AdminDashboard /> : <NotFound />
}

function AdminDashboard() {
    const [tab, setTab] = useState('overview')
    const [users, setUsers] = useState([])
    const [events, setEvents] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [userSearch, setUserSearch] = useState('')
    const [eventSearch, setEventSearch] = useState('')
    const [pendingDelete, setPendingDelete] = useState(null)

    useEffect(() => {
        Promise.all([fetchAllUsers(), fetchEvents()])
            .then(([usersRes, eventsRes]) => {
                setUsers(usersRes.data.map((u) => ({ ...u, name: [u.firstName, u.lastName].filter(Boolean).join(' ') || u.email })))
                setEvents(eventsRes.data)
            })
            .catch((err) => setError(errorMessage(err, 'Could not load admin data.')))
            .finally(() => setLoading(false))
    }, [])

    const confirmDelete = async () => {
        const { kind, item } = pendingDelete
        try {
            if (kind === 'user') {
                await deleteUser(item.id)
                setUsers((prev) => prev.filter((u) => u.id !== item.id))
            } else {
                await deleteEvent(item.id)
                setEvents((prev) => prev.filter((e) => e.id !== item.id))
            }
        } catch (err) {
            setError(errorMessage(err, 'Could not delete this item.'))
        }
    }

    if (loading) return <Spinner />

    const userQuery = userSearch.toLowerCase()
    const eventQuery = eventSearch.toLowerCase()
    const filteredUsers = users.filter((u) => u.name.toLowerCase().includes(userQuery) || u.email.toLowerCase().includes(userQuery))
    const filteredEvents = events.filter((e) => e.title?.toLowerCase().includes(eventQuery) || e.category?.toLowerCase().includes(eventQuery))
    const totalParticipations = events.reduce((sum, e) => sum + (e.participantCount || 0), 0)

    return (
        <main className="min-h-screen bg-gray-950 text-white px-4 sm:px-6 md:px-12 lg:px-20 pt-28 pb-12">
            <div className="max-w-[1400px] mx-auto">
                <div className="mb-8">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 bg-red-500/20 rounded-xl flex items-center justify-center">
                            <i className="fa-solid fa-shield-halved text-red-400"></i>
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-bold">Admin</h1>
                    </div>
                    <p className="text-gray-400 text-sm sm:text-base">Manage users and events.</p>
                </div>

                {error && <p className="mb-6 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400 text-sm">{error}</p>}

                <div className="flex gap-1 bg-gray-900 border border-gray-800 rounded-xl p-1 mb-8" role="tablist">
                    {TABS.map((t) => (
                        <button key={t.key} role="tab" aria-selected={tab === t.key} onClick={() => setTab(t.key)}
                            className={`cursor-pointer flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-sm font-medium transition-colors ${
                                tab === t.key ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-800'
                            }`}>
                            <i className={`fa-solid ${t.icon} text-xs`}></i>
                            <span className="hidden sm:inline">{t.label}</span>
                        </button>
                    ))}
                </div>

                {tab === 'overview' && (
                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                        <StatCard icon="fa-users text-blue-400" bg="bg-blue-500/20" label="Users" value={users.length} />
                        <StatCard icon="fa-calendar text-purple-400" bg="bg-purple-500/20" label="Events" value={events.length} />
                        <StatCard icon="fa-user-group text-green-400" bg="bg-green-500/20" label="Registrations" value={totalParticipations} />
                    </div>
                )}

                {tab === 'users' && (
                    <>
                        <SearchInput value={userSearch} onChange={setUserSearch} placeholder="Search users..." />
                        <Table headers={['User', 'Role', '']}>
                            {filteredUsers.map((user) => (
                                <tr key={user.id} className="border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors">
                                    <td className="px-5 py-4">
                                        <p className="text-white text-sm font-medium">{user.name}</p>
                                        <p className="text-gray-500 text-xs">{user.email}</p>
                                    </td>
                                    <td className="px-5 py-4"><RoleBadge role={user.role} /></td>
                                    <td className="px-5 py-4 text-right">
                                        {user.role !== 'ADMIN' && (
                                            <DeleteButton label={`Delete ${user.name}`} onClick={() => setPendingDelete({ kind: 'user', item: user })} />
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </Table>
                    </>
                )}

                {tab === 'events' && (
                    <>
                        <SearchInput value={eventSearch} onChange={setEventSearch} placeholder="Search events..." />
                        <Table headers={['Event', 'Category', 'Date', 'Participants', '']}>
                            {filteredEvents.map((event) => (
                                <tr key={event.id} className="border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors">
                                    <td className="px-5 py-4 text-sm font-medium">
                                        <Link to={`/events/${event.id}`} className="text-white hover:text-purple-400">{event.title}</Link>
                                    </td>
                                    <td className="px-5 py-4 text-gray-300 text-sm">{event.category || '-'}</td>
                                    <td className="px-5 py-4 text-gray-400 text-sm">{formatDate(event.startDate) || '-'}</td>
                                    <td className="px-5 py-4 text-gray-300 text-sm">{event.participantCount ?? 0}</td>
                                    <td className="px-5 py-4 text-right">
                                        <DeleteButton label={`Delete ${event.title}`} onClick={() => setPendingDelete({ kind: 'event', item: event })} />
                                    </td>
                                </tr>
                            ))}
                        </Table>
                    </>
                )}
            </div>

            <ConfirmModal isOpen={Boolean(pendingDelete)} onClose={() => setPendingDelete(null)} onConfirm={confirmDelete}
                title={pendingDelete?.kind === 'user' ? 'Delete this user?' : 'Delete this event?'}
                message={`"${pendingDelete?.item.name || pendingDelete?.item.title}" will be permanently deleted.`}
                confirmText="Delete" type="danger" />
        </main>
    )
}

function StatCard({ icon, bg, label, value }) {
    return (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 sm:p-5">
            <div className={`w-10 h-10 ${bg} rounded-xl flex items-center justify-center mb-3`}>
                <i className={`fa-solid ${icon}`}></i>
            </div>
            <p className="text-2xl sm:text-3xl font-bold text-white">{value.toLocaleString()}</p>
            <p className="text-gray-500 text-xs sm:text-sm mt-0.5">{label}</p>
        </div>
    )
}

function SearchInput({ value, onChange, placeholder }) {
    return (
        <div className="relative">
            <i className="fa-solid fa-magnifying-glass absolute left-4 top-[1.4rem] -translate-y-1/2 text-gray-400 text-sm"></i>
            <input type="search" value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} aria-label={placeholder} className={searchClass} />
        </div>
    )
}

function Table({ headers, children }) {
    return (
        <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-x-auto">
            <table className="w-full min-w-[560px]">
                <thead>
                    <tr className="border-b border-gray-800">
                        {headers.map((h, i) => (
                            <th key={i} className="text-left text-xs font-semibold text-gray-400 px-5 py-3">{h}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>{children}</tbody>
            </table>
        </div>
    )
}

function RoleBadge({ role }) {
    const admin = role === 'ADMIN'
    return (
        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${admin ? 'bg-red-500/20 text-red-400' : 'bg-gray-700 text-gray-300'}`}>
            {admin ? 'Admin' : 'User'}
        </span>
    )
}

function DeleteButton({ label, onClick }) {
    return (
        <button onClick={onClick} aria-label={label}
            className="cursor-pointer w-8 h-8 rounded-lg bg-gray-800 hover:bg-red-600/20 flex items-center justify-center text-gray-400 hover:text-red-400 transition-colors ml-auto">
            <i className="fa-solid fa-trash text-xs"></i>
        </button>
    )
}

export default Admin
