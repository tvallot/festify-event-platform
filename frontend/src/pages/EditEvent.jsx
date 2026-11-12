import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { fetchEventById, fetchParticipants, updateEvent } from '../api/events'
import { selectIsLoggedIn } from '../redux/userSlice'
import { errorMessage } from '../utils/format'
import EventForm from '../components/EventForm'
import LoginRequired from '../components/LoginRequired'
import Spinner from '../components/Spinner'

function EditEvent() {
    const { id } = useParams()
    const navigate = useNavigate()
    const user = useSelector((state) => state.user)
    const isLoggedIn = useSelector(selectIsLoggedIn)
    const [event, setEvent] = useState(null)

    useEffect(() => {
        if (!isLoggedIn) return

        const load = async () => {
            try {
                const [eventRes, participantsRes] = await Promise.all([fetchEventById(id), fetchParticipants(id)])
                const mine = participantsRes.data.find((p) => p.user?.id === user.userId)

                // The API enforces this too, the check here only avoids showing a form that would be rejected
                if (!mine?.creator && user.role !== 'ADMIN') {
                    navigate(`/events/${id}`, { replace: true })
                    return
                }
                setEvent(eventRes.data)
            } catch {
                navigate('/events', { replace: true })
            }
        }

        load()
    }, [id, isLoggedIn, user.userId, user.role, navigate])

    if (!isLoggedIn) {
        return <LoginRequired message="You need to be logged in to edit an event." />
    }
    if (!event) return <Spinner />

    const handleSubmit = async (eventData) => {
        try {
            await updateEvent(id, eventData)
            navigate(`/events/${id}`)
        } catch (err) {
            throw new Error(errorMessage(err, 'Could not save the changes.'))
        }
    }

    return (
        <main className="min-h-screen bg-gray-950 px-6 md:px-12 lg:px-20 pb-20 pt-28">
            <div className="max-w-[1200px] mx-auto">
                <Link to={`/events/${id}`} className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm mb-8">
                    <i className="fa-solid fa-arrow-left text-xs"></i> Back to event
                </Link>
                <div className="mb-10">
                    <h1 className="text-white text-3xl lg:text-4xl font-bold">Edit event</h1>
                    <p className="text-gray-500 mt-2">Update the details of your event.</p>
                </div>

                <EventForm initialEvent={event} onSubmit={handleSubmit} submitLabel="Save changes" organizer={user} />
            </div>
        </main>
    )
}

export default EditEvent
