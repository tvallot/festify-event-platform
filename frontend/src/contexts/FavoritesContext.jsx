import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { useSelector } from 'react-redux'
import { likeEvent, unlikeEvent, fetchMyProfile } from '../api/users'

const FavoritesContext = createContext()

export function useFavorites() {
    const context = useContext(FavoritesContext)
    if (!context) {
        throw new Error('useFavorites must be used within FavoritesProvider')
    }
    return context
}

export function FavoritesProvider({ children }) {
    const { userId, token } = useSelector((state) => state.user)
    const isLoggedIn = userId > 0 && token

    const [favorites, setFavorites] = useState([])

    useEffect(() => {
        if (!isLoggedIn) {
            setFavorites([])
            return
        }

        fetchMyProfile()
            .then((res) => {
                const favIds = (res.data.favorites || []).map((e) => e.id)
                setFavorites(favIds)
            })
            .catch((error) => {

            })
    }, [isLoggedIn, userId])

    const toggleFavorite = useCallback(async (eventId) => {
        if (!isLoggedIn) return

        const alreadyFav = favorites.includes(eventId)

        setFavorites((prev) =>
            alreadyFav ? prev.filter((id) => id !== eventId) : [...prev, eventId]
        )

        try {
            if (alreadyFav) {
                await unlikeEvent(eventId)
            } else {
                await likeEvent(eventId)
            }
        } catch {
            setFavorites((prev) =>
                alreadyFav ? [...prev, eventId] : prev.filter((id) => id !== eventId)
            )
        }
    }, [isLoggedIn, favorites])

    const isFavorite = (eventId) => favorites.includes(eventId)
    const getFavoritesCount = () => favorites.length

    return (
        <FavoritesContext.Provider value={{ favorites, toggleFavorite, isFavorite, getFavoritesCount }}>
            {children}
        </FavoritesContext.Provider>
    )
}