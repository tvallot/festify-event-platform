import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { fetchEvents } from '../api/events'
import { avatars } from '../utils/avatars'
import EventCard from '../components/EventCard'

const FEATURED_COUNT = 6

const STEPS = [
    {
        icon: 'fa-magnifying-glass',
        title: 'Find something to do',
        description: 'Browse upcoming events and filter them by category, location or price.',
        color: 'from-purple-500 to-purple-700',
    },
    {
        icon: 'fa-ticket',
        title: 'Join in one click',
        description: 'Register to an event, save it to your favorites and see who else is going.',
        color: 'from-pink-500 to-purple-600',
    },
    {
        icon: 'fa-wand-magic-sparkles',
        title: 'Host your own',
        description: 'Create an event in a minute, set a capacity and manage it from your profile.',
        color: 'from-teal-400 to-cyan-500',
    },
]

/** Fades children in the first time they scroll into view. */
function Reveal({ children, className = '', delay = 0 }) {
    const ref = useRef(null)
    const [visible, setVisible] = useState(false)

    useEffect(() => {
        const el = ref.current
        if (!el) return
        const observer = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting) {
                setVisible(true)
                observer.disconnect()
            }
        }, { threshold: 0.15 })
        observer.observe(el)
        return () => observer.disconnect()
    }, [])

    return (
        <div ref={ref} style={{ transitionDelay: `${delay}ms` }}
            className={`transition-all duration-700 ease-out ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'} ${className}`}>
            {children}
        </div>
    )
}

function Home() {
    const [events, setEvents] = useState([])

    useEffect(() => {
        const today = new Date().toISOString().slice(0, 10)
        fetchEvents()
            .then((res) => setEvents(res.data.filter((e) => !e.startDate || e.startDate >= today).slice(0, FEATURED_COUNT)))
            .catch(() => setEvents([]))
    }, [])

    return (
        <main className="min-h-screen bg-gray-950/80 px-8 md:px-20 lg:px-32 pt-36">
            <section className="max-w-[1500px] m-auto flex flex-col lg:flex-row justify-between items-center gap-16">
                <div className="flex flex-col lg:w-[50%]">
                    <h1 className="font-bold text-5xl lg:text-6xl text-white leading-tight">
                        Meet people who share{' '}
                        <span className="bg-linear-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">your interests</span>.
                    </h1>
                    <p className="text-gray-400 text-lg mt-6 mb-8 leading-relaxed">
                        Find events near you, sign up in one click, or host your own and see who's coming.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4">
                        <Link to="/events/new" className="flex justify-center items-center gap-2 bg-linear-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 transition-colors rounded-lg px-6 py-3 text-white font-medium">
                            Create an event <i className="fa-solid fa-arrow-right text-xs"></i>
                        </Link>
                        <Link to="/events" className="text-center bg-white/5 border border-white/10 hover:bg-white/10 transition-colors rounded-lg px-6 py-3 text-white font-medium">
                            Browse events
                        </Link>
                    </div>
                </div>

                <PhoneMockup />
            </section>

            <Reveal className="max-w-[1500px] m-auto mt-32">
                <h2 className="text-4xl lg:text-5xl font-bold text-white mb-3">Upcoming events</h2>
                <p className="text-gray-400 text-lg mb-10">What's happening next on Festify</p>

                {events.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {events.map((event) => <EventCard key={event.id} event={event} />)}
                    </div>
                ) : (
                    <div className="text-center py-16 bg-gray-900/60 border border-gray-800 rounded-2xl">
                        <p className="text-gray-400 mb-4">No upcoming events yet.</p>
                        <Link to="/events/new" className="text-purple-400 hover:text-purple-300 font-semibold">Be the first to create one</Link>
                    </div>
                )}

                <div className="flex justify-center mt-12">
                    <Link to="/events" className="flex items-center gap-3 px-6 py-3 bg-gray-800 border border-gray-700 rounded-full text-white font-medium hover:bg-gray-700 transition-colors">
                        See all events <i className="fa-solid fa-arrow-right text-xs"></i>
                    </Link>
                </div>
            </Reveal>

            <section className="max-w-[1500px] m-auto mt-32 pb-20">
                <Reveal className="text-center mb-12">
                    <h2 className="text-4xl lg:text-5xl font-bold text-white mb-4">How it works</h2>
                    <p className="text-gray-400 text-lg max-w-lg mx-auto">Three steps from browsing to hosting.</p>
                </Reveal>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {STEPS.map((step, i) => (
                        <Reveal key={step.title} delay={i * 150} className="bg-gray-900/60 border border-gray-800 rounded-2xl p-6">
                            <div className={`w-12 h-12 rounded-xl bg-linear-to-br ${step.color} flex items-center justify-center text-white mb-5`}>
                                <i className={`fa-solid ${step.icon}`}></i>
                            </div>
                            <h3 className="text-white font-semibold text-lg mb-2">
                                <span className="text-gray-500 mr-2">{String(i + 1).padStart(2, '0')}</span>{step.title}
                            </h3>
                            <p className="text-gray-400 text-sm leading-relaxed">{step.description}</p>
                        </Reveal>
                    ))}
                </div>
            </section>
        </main>
    )
}

/** Decorative phone showing what an event looks like in the app. */
function PhoneMockup() {
    return (
        <div className="lg:w-[45%] flex justify-center" aria-hidden="true">
            <div className="relative w-72 h-145 bg-gray-900 rounded-[3rem] border-2 border-gray-700/50 shadow-2xl shadow-purple-500/10 p-3">
                <div className="w-full h-full bg-gray-800 rounded-[2.4rem] flex flex-col overflow-hidden">
                    <div className="relative h-1/2 flex justify-center items-center bg-linear-to-br from-purple-700 to-pink-600">
                        <div className="flex flex-col items-center gap-3 text-white">
                            <p className="text-7xl">🎲</p>
                            <p className="text-3xl font-bold">Board game night</p>
                            <p className="text-white/70 font-semibold">Lyon</p>
                        </div>
                    </div>

                    <div className="flex-1 flex flex-col justify-center gap-3 px-6">
                        <MockRow color="bg-purple-400" icon="fa-regular fa-calendar">Thu 26 Mar, 7 pm</MockRow>
                        <MockRow color="bg-pink-400" icon="fa-solid fa-location-pin">Cordeliers, Lyon</MockRow>
                        <MockRow color="bg-blue-400" icon="fa-solid fa-users">15 going</MockRow>

                        <div className="flex">
                            {Object.values(avatars).slice(0, 5).map((src, i) => (
                                <img key={src} src={src} alt="" width="30" className={`rounded-full border-2 border-gray-500 ${i > 0 ? '-ml-2.5' : ''}`} />
                            ))}
                        </div>

                        <span className="self-center bg-linear-to-r from-purple-500 to-pink-500 text-white font-bold px-6 py-1.5 rounded-lg text-xl">
                            I'm in!
                        </span>
                    </div>
                </div>

                <span className="absolute bg-orange-400 shadow-lg shadow-orange-400 -top-8 -right-8 w-16 h-16 rounded-lg flex justify-center items-center text-3xl">🎈</span>
                <span className="absolute bg-pink-400 shadow-lg shadow-pink-400 -bottom-8 -left-8 w-16 h-16 rounded-lg flex justify-center items-center text-3xl">
                    <i className="text-white fa-solid fa-music"></i>
                </span>
            </div>
        </div>
    )
}

function MockRow({ color, icon, children }) {
    return (
        <div className="flex items-center gap-3">
            <span className={`${color} p-3 rounded-lg text-white`}><i className={icon}></i></span>
            <p className="text-gray-400 font-bold">{children}</p>
        </div>
    )
}

export default Home
