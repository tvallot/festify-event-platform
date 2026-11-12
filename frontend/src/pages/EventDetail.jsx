import { useState, useEffect, useCallback } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { useFavorites } from '../contexts/useFavorites'
import { fetchEventById, fetchParticipants, joinEvent, leaveEvent, deleteEvent } from '../api/events'
import { selectIsLoggedIn } from '../redux/userSlice'
import { errorMessage, formatDate } from '../utils/format'
import { getAvatar } from '../utils/avatars'
import ConfirmModal from '../components/ConfirmModal'
import Spinner from '../components/Spinner'

function EventDetail() {
    const { id } = useParams()
    const navigate = useNavigate()
    const { userId, role } = useSelector((state) => state.user)
    const isLoggedIn = useSelector(selectIsLoggedIn)
    const { isFavorite, toggleFavorite } = useFavorites()

    const [event, setEvent] = useState(null)
    const [participants, setParticipants] = useState([])
    const [showLeaveModal, setShowLeaveModal] = useState(false)
    const [showDeleteModal, setShowDeleteModal] = useState(false)
    const [busy, setBusy] = useState(false)
    const [error, setError] = useState('')

    const load = useCallback(async () => {
        try {
            const [eventRes, participantsRes] = await Promise.all([fetchEventById(id), fetchParticipants(id)])
            setEvent(eventRes.data)
            setParticipants(participantsRes.data)
        } catch {
            navigate('/events', { replace: true })
        }
    }, [id, navigate])

    useEffect(() => {
        load()
    }, [load])

    if (!event) return <Spinner />

    const myParticipation = isLoggedIn ? participants.find((p) => p.user?.id === userId) : null
    const isRegistered = Boolean(myParticipation)
    const canManage = myParticipation?.creator === true || role === 'ADMIN'
    const participantCount = participants.length
    const spotsLeft = event.capacity ? Math.max(0, event.capacity - participantCount) : null
    const isFull = spotsLeft === 0
    const liked = isFavorite(event.id)

    const runAction = async (action, fallbackError) => {
        setBusy(true)
        setError('')
        try {
            await action()
        } catch (err) {
            setError(errorMessage(err, fallbackError))
        } finally {
            setBusy(false)
        }
    }

    const handleRegister = () => {
        if (!isLoggedIn) return navigate('/login')
        if (isRegistered) return setShowLeaveModal(true)
        runAction(async () => {
            await joinEvent(event.id)
            await load()
        }, 'Could not register for this event.')
    }

    const handleLeave = () => runAction(async () => {
        await leaveEvent(event.id)
        await load()
    }, 'Could not cancel your registration.')

    const handleDelete = () => runAction(async () => {
        await deleteEvent(event.id)
        navigate('/profile')
    }, 'Could not delete the event.')

    const handleLike = () => {
        if (!isLoggedIn) return navigate('/login')
        toggleFavorite(event.id)
    }

    return (
        <main className="bg-gray-950 text-white min-h-screen">
            <div className="relative h-96 w-full mt-20">
                {event.thumbnailUrl ? (
                    <img src={event.thumbnailUrl} alt={event.title} className="w-full h-full object-cover" />
                ) : (
                    <div className="w-full h-full bg-gradient-to-br from-purple-700 via-pink-600 to-blue-700 flex items-center justify-center">
                        <i className="fa-solid fa-calendar-days text-9xl text-white/20"></i>
                    </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/50 to-transparent"></div>

                <Link to="/events" className="absolute top-6 left-6 bg-gray-900/80 backdrop-blur-sm hover:bg-gray-800 transition-colors rounded-full px-4 py-2 flex items-center gap-2">
                    <i className="fa-solid fa-arrow-left"></i> Back
                </Link>

                <div className="absolute top-6 right-6 flex gap-2">
                    {event.category && (
                        <span className="px-4 py-2 bg-purple-600/90 backdrop-blur-sm rounded-full text-sm font-semibold">{event.category}</span>
                    )}
                    <span className={`px-4 py-2 backdrop-blur-sm rounded-full text-sm font-semibold ${event.isFree ? 'bg-green-600/90' : 'bg-blue-600/90'}`}>
                        {event.isFree ? 'Free' : 'Paid'}
                    </span>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-6">
                        <div>
                            <h1 className="text-4xl font-bold mb-4">{event.title}</h1>
                            <div className="flex flex-wrap gap-4 text-gray-300">
                                {event.startDate && (
                                    <span className="flex items-center gap-2">
                                        <i className="fa-solid fa-calendar text-purple-400"></i>
                                        {formatDate(event.startDate, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                                        {event.endDate && event.endDate !== event.startDate && ` to ${formatDate(event.endDate)}`}
                                    </span>
                                )}
                                {event.location && (
                                    <span className="flex items-center gap-2">
                                        <i className="fa-solid fa-location-dot text-purple-400"></i>
                                        {event.location}
                                    </span>
                                )}
                            </div>
                        </div>

                        <section className="bg-gray-800 rounded-xl p-6 border-2 border-gray-700">
                            <h2 className="text-2xl font-bold mb-4">About this event</h2>
                            <p className="text-gray-300 leading-relaxed whitespace-pre-line">
                                {event.description || 'No description yet.'}
                            </p>
                        </section>

                        {participants.length > 0 && (
                            <section className="bg-gray-800 rounded-xl p-6 border-2 border-gray-700">
                                <h2 className="text-2xl font-bold mb-4">Who's going</h2>
                                <ul className="flex flex-wrap gap-4">
                                    {participants.map((p) => (
                                        <li key={p.id} className="flex items-center gap-2">
                                            <img src={getAvatar(Number(p.user?.profilePicture))} alt="" className="w-8 h-8 rounded-full" />
                                            <span className="text-sm text-gray-300">
                                                {p.user?.firstName} {p.user?.lastName?.charAt(0)}.
                                                {p.creator && <span className="ml-1 text-xs text-purple-400">(organizer)</span>}
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            </section>
                        )}
                    </div>

                    <div className="lg:col-span-1">
                        <div className="bg-gray-800 rounded-xl p-6 border-2 border-gray-700 sticky top-24 space-y-6">
                            <div className="space-y-3">
                                <InfoRow icon="fa-users" label="Participants" value={participantCount} />
                                {spotsLeft !== null && (
                                    <InfoRow icon="fa-ticket" label="Spots left"
                                        value={isFull ? 'Full' : `${spotsLeft}/${event.capacity}`}
                                        valueClass={isFull ? 'text-red-400' : spotsLeft < 10 ? 'text-orange-400' : 'text-green-400'} />
                                )}
                            </div>

                            <div className="border-t border-gray-700 pt-6 space-y-3">
                                {error && <p className="p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400 text-sm">{error}</p>}

                                <button onClick={handleRegister} disabled={(isFull && !isRegistered) || busy}
                                    className={`cursor-pointer w-full py-3 px-4 rounded-lg font-semibold text-lg transition-all flex items-center justify-center gap-2 disabled:cursor-not-allowed ${
                                        isFull && !isRegistered
                                            ? 'bg-gray-700 text-gray-400'
                                            : isRegistered
                                                ? 'bg-green-600 hover:bg-green-700'
                                                : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700'
                                    }`}>
                                    <i className={`fa-solid ${isFull && !isRegistered ? 'fa-lock' : isRegistered ? 'fa-check' : 'fa-ticket'}`}></i>
                                    {isFull && !isRegistered ? 'Full' : isRegistered ? "You're going" : 'Register'}
                                </button>

                                <button onClick={handleLike}
                                    className={`cursor-pointer w-full py-3 px-4 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 ${
                                        liked ? 'bg-pink-600 hover:bg-pink-700 text-white' : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                                    }`}>
                                    <i className={`fa-${liked ? 'solid' : 'regular'} fa-heart`}></i>
                                    {liked ? 'Remove from favorites' : 'Add to favorites'}
                                </button>

                                {canManage && (
                                    <>
                                        <Link to={`/events/${event.id}/edit`}
                                            className="w-full py-3 px-4 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white">
                                            <i className="fa-solid fa-pen"></i> Edit event
                                        </Link>
                                        <button onClick={() => setShowDeleteModal(true)}
                                            className="cursor-pointer w-full py-3 px-4 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 bg-red-600/20 border-2 border-red-600 hover:bg-red-600 text-red-500 hover:text-white">
                                            <i className="fa-solid fa-trash"></i> Delete event
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <ConfirmModal isOpen={showLeaveModal} onClose={() => setShowLeaveModal(false)} onConfirm={handleLeave}
                title="Cancel your registration?"
                message={`Do you really want to stop attending "${event.title}"?`}
                confirmText="Yes, cancel" cancelText="Keep my spot" type="warning" />

            <ConfirmModal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)} onConfirm={handleDelete}
                title="Delete this event?"
                message={`"${event.title}" will be permanently deleted, along with its registrations.`}
                confirmText="Delete" type="danger" />
        </main>
    )
}

function InfoRow({ icon, label, value, valueClass = '' }) {
    return (
        <div className="flex items-center justify-between">
            <span className="flex items-center gap-2 text-gray-300">
                <i className={`fa-solid ${icon} text-purple-400`}></i>
                {label}
            </span>
            <span className={`font-semibold ${valueClass}`}>{value}</span>
        </div>
    )
}

export default EventDetail
