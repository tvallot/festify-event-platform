import { Link } from 'react-router-dom'
import { useFavorites } from '../contexts/FavoritesContext'

function EventCard({ event }) {
    const { isFavorite, toggleFavorite } = useFavorites()
    const isLiked = isFavorite(event.id)

    const handleLikeClick = (e) => {
        e.preventDefault()
        e.stopPropagation()
        toggleFavorite(event.id)
    }

    return (
        <Link to={`/events/${event.id}`} className="bg-gray-800 rounded-xl overflow-hidden border-2 border-gray-700 hover:border-purple-500 transition-all hover:shadow-lg hover:shadow-purple-500/20 cursor-pointer">
            <div className="relative h-48 bg-gray-700 overflow-hidden">
                {event.image ? (
                    <img
                        src={event.image}
                        alt={event.titre}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-700 to-pink-700">
                        <i className="fa-solid fa-calendar-days text-6xl text-white/30"></i>
                    </div>
                )}

                <div className="absolute top-3 left-3">
                    <span className="px-3 py-1 bg-purple-600/90 backdrop-blur-sm rounded-full text-xs font-semibold">
                        {event.categorie}
                    </span>
                </div>

                <div className="absolute top-3 right-3">
                    <span className={`px-3 py-1 backdrop-blur-sm rounded-full text-xs font-semibold ${
                        event.prix === 0 ? 'bg-green-600/90' : 'bg-blue-600/90'
                    }`}>
                        {event.prix === 0 ? 'Gratuit' : `${event.prix}€`}
                    </span>
                </div>

                <button
                    onClick={handleLikeClick}
                    className={`absolute bottom-3 right-3 w-10 h-10 rounded-full backdrop-blur-sm flex items-center justify-center transition-all hover:scale-110 ${
                        isLiked
                            ? 'bg-pink-600/90 text-white'
                            : 'bg-gray-900/70 text-gray-300 hover:bg-gray-800/90'
                    }`}
                    aria-label={isLiked ? 'Retirer des favoris' : 'Ajouter aux favoris'}
                >
                    <i className={`fa-${isLiked ? 'solid' : 'regular'} fa-heart text-lg`}></i>
                </button>
            </div>

            <div className="p-4">
                <div className="flex items-center gap-3 text-sm text-gray-400 mb-3">
                    <div className="flex items-center gap-1">
                        <i className="fa-solid fa-calendar"></i>
                        <span>{new Date(event.date).toLocaleDateString('fr-FR', {
                            day: 'numeric',
                            month: 'short'
                        })}</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <i className="fa-solid fa-location-dot"></i>
                        <span>{event.ville}</span>
                    </div>
                </div>

                <h3 className="text-xl font-bold text-white mb-2 line-clamp-2">
                    {event.titre}
                </h3>

                <p className="text-gray-400 text-sm mb-3 line-clamp-2">
                    {event.description}
                </p>

                <div className="flex items-center justify-between pt-3 border-t border-gray-700">
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                        <i className="fa-solid fa-users"></i>
                        <span>{event.participants} participants</span>
                    </div>

                    {event.placesRestantes !== null && (
                        <div className={`text-sm font-semibold ${
                            event.placesRestantes < 10 ? 'text-orange-400' : 'text-green-400'
                        }`}>
                            {event.placesRestantes > 0
                                ? `${event.placesRestantes} places`
                                : 'Complet'
                            }
                        </div>
                    )}
                </div>
            </div>
        </Link>
    )
}

export default EventCard
