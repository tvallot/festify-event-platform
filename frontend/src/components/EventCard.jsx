import { Link } from 'react-router-dom'
import { useFavorites } from '../contexts/useFavorites'
import { formatDate, spotsLeft } from '../utils/format'

/** Card for an event as returned by the API. */
function EventCard({ event }) {
    const { isFavorite, toggleFavorite } = useFavorites()
    const liked = isFavorite(event.id)
    const spots = spotsLeft(event)

    const handleLikeClick = (e) => {
        e.preventDefault()
        e.stopPropagation()
        toggleFavorite(event.id)
    }

    return (
        <Link to={`/events/${event.id}`}
            className="bg-gray-800 rounded-xl overflow-hidden border-2 border-gray-700 hover:border-purple-500 transition-all hover:shadow-lg hover:shadow-purple-500/20">
            <div className="relative h-48 bg-gray-700 overflow-hidden">
                {event.thumbnailUrl ? (
                    <img src={event.thumbnailUrl} alt={event.title} className="w-full h-full object-cover" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-700 to-pink-700">
                        <i className="fa-solid fa-calendar-days text-6xl text-white/30"></i>
                    </div>
                )}

                {event.category && (
                    <span className="absolute top-3 left-3 px-3 py-1 bg-purple-600/90 backdrop-blur-sm rounded-full text-xs font-semibold text-white">
                        {event.category}
                    </span>
                )}

                <span className={`absolute top-3 right-3 px-3 py-1 backdrop-blur-sm rounded-full text-xs font-semibold text-white ${
                    event.isFree ? 'bg-green-600/90' : 'bg-blue-600/90'
                }`}>
                    {event.isFree ? 'Free' : 'Paid'}
                </span>

                <button onClick={handleLikeClick}
                    aria-label={liked ? 'Remove from favorites' : 'Add to favorites'}
                    className={`cursor-pointer absolute bottom-3 right-3 w-10 h-10 rounded-full backdrop-blur-sm flex items-center justify-center transition-all hover:scale-110 ${
                        liked ? 'bg-pink-600/90 text-white' : 'bg-gray-900/70 text-gray-300 hover:bg-gray-800/90'
                    }`}>
                    <i className={`fa-${liked ? 'solid' : 'regular'} fa-heart text-lg`}></i>
                </button>
            </div>

            <div className="p-4">
                <div className="flex items-center gap-3 text-sm text-gray-400 mb-3">
                    <span className="flex items-center gap-1">
                        <i className="fa-solid fa-calendar"></i>
                        {formatDate(event.startDate, { day: 'numeric', month: 'short' })}
                    </span>
                    {event.location && (
                        <span className="flex items-center gap-1 truncate">
                            <i className="fa-solid fa-location-dot"></i>
                            {event.location}
                        </span>
                    )}
                </div>

                <h3 className="text-xl font-bold text-white mb-2 line-clamp-2">{event.title}</h3>
                <p className="text-gray-400 text-sm mb-3 line-clamp-2">{event.description}</p>

                <div className="flex items-center justify-between pt-3 border-t border-gray-700">
                    <span className="flex items-center gap-2 text-sm text-gray-400">
                        <i className="fa-solid fa-users"></i>
                        {event.participantCount ?? 0} going
                    </span>
                    {spots !== null && (
                        <span className={`text-sm font-semibold ${spots === 0 ? 'text-red-400' : spots < 10 ? 'text-orange-400' : 'text-green-400'}`}>
                            {spots > 0 ? `${spots} spots left` : 'Full'}
                        </span>
                    )}
                </div>
            </div>
        </Link>
    )
}

export default EventCard
