import { Link, useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { createEvent } from '../api/events'
import { selectIsLoggedIn } from '../redux/userSlice'
import { errorMessage } from '../utils/format'
import EventForm from '../components/EventForm'
import LoginRequired from '../components/LoginRequired'

function CreateEvent() {
    const navigate = useNavigate()
    const user = useSelector((state) => state.user)
    const isLoggedIn = useSelector(selectIsLoggedIn)

    if (!isLoggedIn) {
        return <LoginRequired message="You need to be logged in to create an event." />
    }

    const handleSubmit = async (eventData) => {
        try {
            const res = await createEvent(eventData)
            navigate(`/events/${res.data.id}`)
        } catch (err) {
            throw new Error(errorMessage(err, 'Could not create the event.'))
        }
    }

    return (
        <main className="min-h-screen bg-gray-950 px-6 md:px-12 lg:px-20 pb-20 pt-28">
            <div className="max-w-[1200px] mx-auto">
                <Link to="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm mb-8">
                    <i className="fa-solid fa-arrow-left text-xs"></i> Back to home
                </Link>
                <div className="mb-10">
                    <h1 className="text-white text-3xl lg:text-4xl font-bold">Create an event</h1>
                    <p className="text-gray-500 mt-2">Fill in the details below. Only the title, category and date are required.</p>
                </div>

                <EventForm onSubmit={handleSubmit} submitLabel="Create event" organizer={user} />
            </div>
        </main>
    )
}

export default CreateEvent
