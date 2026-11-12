import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { useFavorites } from '../contexts/FavoritesContext'
import ConfirmModal from '../components/ConfirmModal'
import { fetchEventById, fetchParticipants, joinEvent, leaveEvent, deleteEvent } from '../api/events'

function EventDetail() {
    const { id } = useParams()
    const navigate = useNavigate()

    const { userId, token, role } = useSelector((state) => state.user)
    const { isFavorite, toggleFavorite } = useFavorites()
    const isLoggedIn = userId > 0 && token

    const [event, setEvent] = useState(null)
    const [participants, setParticipants] = useState([])
    const [isRegistered, setIsRegistered] = useState(false)
    const [isCreator, setIsCreator] = useState(false)
    const [showCancelModal, setShowCancelModal] = useState(false)
    const [showDeleteModal, setShowDeleteModal] = useState(false)
    const [actionLoading, setActionLoading] = useState(false)

    useEffect(() => {
        loadEvent()
    }, [id])

    const loadEvent = async () => {
        try {
            const eventRes = await fetchEventById(id)
            setEvent(eventRes.data)

            const partRes = await fetchParticipants(id)
            setParticipants(partRes.data)

            if (isLoggedIn) {
                const myParticipation = partRes.data.find((p) => p.user?.id === userId)
                setIsRegistered(!!myParticipation)
                setIsCreator(myParticipation?.creator === true)
            }
        } 
        
        catch {
            navigate('/events')
        }
    }

    const isLiked = event ? isFavorite(event.id) : false

    const handleLike = () => {
        if (event && isLoggedIn) toggleFavorite(event.id)
    }

    const handleRegister = async () => {
        if (!isLoggedIn) { navigate('/login'); return }

        if (isRegistered) {
            setShowCancelModal(true)
            return
        }

        setActionLoading(true)
        try {
            await joinEvent(event.id)
            setIsRegistered(true)
            loadEvent() 
        } catch (err) {
            alert(err.response?.data?.message || err.response?.data || "Impossible de s'inscrire")
        } finally {
            setActionLoading(false)
        }
    }

    const handleCancelRegistration = async () => {
        setActionLoading(true)
        try {
            await leaveEvent(event.id)
            setIsRegistered(false)
            loadEvent()
        } catch (err) {
            alert(err.response?.data?.message || err.response?.data || "Impossible de se désinscrire")
        } finally {
            setActionLoading(false)
        }
    }

    const handleDeleteEvent = async () => {
        setActionLoading(true)
        try {
            await deleteEvent(event.id)
            navigate('/profil')
        } catch (err) {
            alert(err.response?.data?.message || err.response?.data || "Impossible de supprimer l'événement")
        } finally {
            setActionLoading(false)
        }
    }

    if (!event) {
        return (
            <div className="min-h-screen bg-gray-900 flex items-center justify-center">
                <i className="fa-solid fa-spinner fa-spin text-4xl text-purple-500"></i>
            </div>
        )
    }

    const participantCount = participants.length
    const placesRestantes = event.capacity ? Math.max(0, event.capacity - participantCount) : null
    const isEventFull = event.capacity && participantCount >= event.capacity

    const eventDate = event.startDate ? new Date(event.startDate) : null

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

                <Link to="/events"
                    className="absolute top-6 left-6 bg-gray-900/80 backdrop-blur-sm hover:bg-gray-800 transition-colors rounded-full px-4 py-2 flex items-center gap-2">
                    <i className="fa-solid fa-arrow-left"></i> Retour
                </Link>

                <div className="absolute top-6 right-6 flex gap-2">
                    {event.category && (
                        <span className="px-4 py-2 bg-purple-600/90 backdrop-blur-sm rounded-full text-sm font-semibold">
                            {event.category}
                        </span>
                    )}
                    <span className={`px-4 py-2 backdrop-blur-sm rounded-full text-sm font-semibold ${
                        event.isFree ? 'bg-green-600/90' : 'bg-blue-600/90'
                    }`}>
                        {event.isFree ? 'Gratuit' : 'Payant'}
                    </span>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-6">
                        <div>
                            <h1 className="text-4xl font-bold mb-4">{event.title}</h1>
                            <div className="flex flex-wrap gap-4 text-gray-300">
                                {eventDate && (
                                    <div className="flex items-center gap-2">
                                        <i className="fa-solid fa-calendar text-purple-400"></i>
                                        <span>{eventDate.toLocaleDateString('fr-FR', {
                                            weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
                                        })}</span>
                                    </div>
                                )}
                                {event.location && (
                                    <div className="flex items-center gap-2">
                                        <i className="fa-solid fa-location-dot text-purple-400"></i>
                                        <span>{event.location}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="bg-gray-800 rounded-xl p-6 border-2 border-gray-700">
                            <h2 className="text-2xl font-bold mb-4">À propos de l'événement</h2>
                            <p className="text-gray-300 leading-relaxed whitespace-pre-line">
                                {event.description || 'Aucune description disponible.'}
                            </p>
                        </div>
                    </div>

                    <div className="lg:col-span-1">
                        <div className="bg-gray-800 rounded-xl p-6 border-2 border-gray-700 sticky top-6 space-y-6">
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2 text-gray-300">
                                        <i className="fa-solid fa-users text-purple-400"></i>
                                        <span>Participants</span>
                                    </div>
                                    <span className="font-semibold">{participantCount}</span>
                                </div>

                                {placesRestantes !== null && (
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2 text-gray-300">
                                            <i className="fa-solid fa-ticket text-purple-400"></i>
                                            <span>Places restantes</span>
                                        </div>
                                        <span className={`font-semibold ${
                                            isEventFull ? 'text-red-400' :
                                            placesRestantes < 10 ? 'text-orange-400' : 'text-green-400'
                                        }`}>
                                            {isEventFull ? 'Complet' : `${placesRestantes}/${event.capacity}`}
                                        </span>
                                    </div>
                                )}
                            </div>

                            <div className="border-t border-gray-700 pt-6"></div>

                            <div className="space-y-3">
                                <button
                                    onClick={handleRegister}
                                    disabled={isEventFull && !isRegistered || actionLoading}
                                    className={`w-full py-3 px-4 rounded-lg font-semibold text-lg transition-all flex items-center justify-center gap-2 ${
                                        isEventFull && !isRegistered
                                            ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                                            : isRegistered
                                            ? 'bg-green-600 hover:bg-green-700'
                                            : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700'
                                    }`}>
                                    <i className={`fa-solid ${isEventFull && !isRegistered ? 'fa-lock' : isRegistered ? 'fa-check' : 'fa-ticket'}`}></i>
                                    {isEventFull && !isRegistered ? 'Complet' : isRegistered ? 'Inscrit' : "S'inscrire"}
                                </button>

                                <button
                                    onClick={handleLike}
                                    className={`w-full py-3 px-4 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 ${
                                        isLiked ? 'bg-pink-600 hover:bg-pink-700 text-white' : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                                    }`}>
                                    <i className={`fa-${isLiked ? 'solid' : 'regular'} fa-heart`}></i>
                                    {isLiked ? 'Retirer des favoris' : 'Ajouter aux favoris'}
                                </button>

                                {(isCreator || role === 'ADMIN') && (
                                    <Link to={`/events/${event.id}/edit`}
                                        className="w-full py-3 px-4 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white">
                                        <i className="fa-solid fa-pen"></i> Modifier l'événement
                                    </Link>
                                )}

                                {(isCreator || role === 'ADMIN') && (
                                    <button onClick={() => setShowDeleteModal(true)}
                                        className="w-full py-3 px-4 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 bg-red-600/20 border-2 border-red-600 hover:bg-red-600 text-red-500 hover:text-white">
                                        <i className="fa-solid fa-trash"></i> Supprimer l'événement
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <ConfirmModal isOpen={showCancelModal} onClose={() => setShowCancelModal(false)}
                onConfirm={handleCancelRegistration}
                title="Annuler votre participation ?"
                message={`Voulez-vous vraiment annuler votre participation à "${event?.title}" ?`}
                confirmText="Oui, annuler" cancelText="Garder ma place" type="warning" />

            <ConfirmModal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)}
                onConfirm={handleDeleteEvent}
                title="Supprimer cet événement ?"
                message={`Êtes-vous sûr de vouloir supprimer "${event?.title}" ? Cette action est irréversible.`}
                confirmText="Oui, supprimer" cancelText="Annuler" type="danger" />
        </main>
    )
}

export default EventDetail