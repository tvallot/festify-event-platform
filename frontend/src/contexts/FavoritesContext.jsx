import { useState, useEffect, useCallback, useMemo } from 'react'
import { useSelector } from 'react-redux'
import { likeEvent, unlikeEvent, fetchMyProfile } from '../api/users'
import { selectIsLoggedIn } from '../redux/userSlice'
import { FavoritesContext } from './useFavorites'

/** Keeps the ids of the user's favorite events in sync with the API (optimistic updates). */
export function FavoritesProvider({ children }) {
    const isLoggedIn = useSelector(selectIsLoggedIn)
    const userId = useSelector((state) => state.user.userId)

    // Ids are stored with the user they belong to, so a logout or account switch never shows stale favorites
    const [loaded, setLoaded] = useState({ userId: null, ids: [] })
    const favorites = useMemo(
        () => (isLoggedIn && loaded.userId === userId ? loaded.ids : []),
        [isLoggedIn, loaded, userId]
    )

    useEffect(() => {
        if (!isLoggedIn) return
        fetchMyProfile()
            .then((res) => setLoaded({ userId, ids: (res.data.favorites || []).map((e) => e.id) }))
            .catch(() => setLoaded({ userId, ids: [] }))
    }, [isLoggedIn, userId])

    const toggleFavorite = useCallback(async (eventId) => {
        if (!isLoggedIn) return

        const wasFavorite = favorites.includes(eventId)
        const apply = (add) => setLoaded((prev) => ({
            userId,
            ids: add ? [...prev.ids, eventId] : prev.ids.filter((id) => id !== eventId),
        }))

        apply(!wasFavorite)
        try {
            await (wasFavorite ? unlikeEvent(eventId) : likeEvent(eventId))
        } catch {
            apply(wasFavorite)
        }
    }, [isLoggedIn, userId, favorites])

    const isFavorite = useCallback((eventId) => favorites.includes(eventId), [favorites])

    return (
        <FavoritesContext.Provider value={{ favorites, toggleFavorite, isFavorite }}>
            {children}
        </FavoritesContext.Provider>
    )
}
