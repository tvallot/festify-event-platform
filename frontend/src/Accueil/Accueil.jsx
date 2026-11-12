import { Link } from 'react-router-dom'
import { useEffect, useRef, useState } from 'react'
import mock from './mock.json'
import pfp1 from '../assets/profils/1.png'
import pfp2 from '../assets/profils/2.png'
import pfp3 from '../assets/profils/3.png'
import pfp4 from '../assets/profils/4.png'
import pfp5 from '../assets/profils/5.png'
import pfp6 from '../assets/profils/6.png'

const profilePictures = { 1: pfp1, 2: pfp2, 3: pfp3, 4: pfp4, 5: pfp5, 6: pfp6 }
const { categories, events, steps } = mock

function useScrollReveal(options = {}) {
    const ref = useRef(null)
    const [isVisible, setIsVisible] = useState(false)

    useEffect(() => {
        const el = ref.current
        if (!el) return

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true)
                    observer.unobserve(el)
                }
            },
            { threshold: 0.15, ...options }
        )

        observer.observe(el)
        return () => observer.disconnect()
    }, [])

    return [ref, isVisible]
}

function AnimationScroll({ children, className = '', delay = 0 }) {
    const [ref, isVisible] = useScrollReveal()

    return (
        <section ref={ref} className={`transition-all duration-700 ease-out ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
            } ${className}`}
        style={{ transitionDelay: `${delay}ms` }}>
            {children}
        </section>
    )
}

function EventCard({ event, delay }) {
    const [ref, isVisible] = useScrollReveal()

    return (
        <div ref={ref} className={`bg-gray-900/60 border border-gray-800 rounded-2xl overflow-hidden hover:border-gray-700 transition-all duration-700 ease-out cursor-pointer group ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
            style={{ transitionDelay: `${delay}ms` }}>
            <div className="relative h-48 overflow-hidden">
                <img src={event.image} alt={event.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"/>
                <div className="absolute top-3 left-3 flex gap-2">
                    {event.tags.map((tag) => (
                        <span key={tag}
                            className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                                tag === 'Gratuit'
                                    ? 'bg-green-500/90 text-white'
                                    : tag === 'Complet'
                                    ? 'bg-red-500/90 text-white'
                                    : tag.includes('places')
                                    ? 'bg-orange-500/90 text-white'
                                    : 'bg-purple-500/90 text-white'
                        }`}>
                            {tag}
                        </span>
                    ))}
                </div>
                <button className="absolute top-3 right-3 w-8 h-8 bg-black/40 backdrop-blur-sm rounded-full flex items-center justify-center text-gray-300 hover:text-white transition-colors">
                    <i className="fa-regular fa-bookmark text-sm"></i>
                </button>
            </div>

            <div className="p-4">
                <h3 className="text-white font-semibold text-base mb-3 truncate">{event.title}</h3>
                <div className="flex items-center gap-2 text-gray-400 text-sm mb-1.5">
                    <i className="fa-regular fa-calendar text-purple-400 text-xs"></i>
                    {event.date}
                </div>
                <div className="flex items-center gap-2 text-gray-400 text-sm mb-4">
                    <i className="fa-solid fa-location-dot text-pink-400 text-xs"></i>
                    {event.location}
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-gray-800">
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-linear-to-br from-purple-500 to-pink-500"></div>
                        <span className="text-gray-400 text-sm">par {event.author}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-gray-500 text-sm">
                        <span>👥</span>
                        {event.attendees}
                    </div>
                </div>
            </div>
        </div>
    )
}

function StepCard({ step, delay }) {
    const [ref, isVisible] = useScrollReveal()

    return (
        <div ref={ref} className={`bg-gray-900/60 border border-gray-800 rounded-2xl overflow-hidden transition-all duration-700 ease-out ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
            style={{ transitionDelay: `${delay}ms` }}>
            <div className="relative h-52 overflow-hidden">
                <img src={step.image} alt={step.title} className="w-full h-full object-cover" />
                <div className={`absolute top-4 left-4 w-9 h-9 rounded-full bg-linear-to-br ${step.color} flex items-center justify-center text-white text-sm font-bold shadow-lg`}>
                    {String(step.id).padStart(2, '0')}
                </div>
            </div>

            <div className="p-5">
                <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg">{step.emoji}</span>
                    <h3 className="text-white font-semibold text-base">{step.title}</h3>
                </div>
                <p className="text-gray-400 text-sm leading-relaxed">{step.description}</p>
            </div>
        </div>
    )
}

function Accueil() {
    const [activeCategory, setActiveCategory] = useState('Tous')
    const [filtersOpen, setFiltersOpen] = useState(false)
    const [priceFilter, setPriceFilter] = useState('Tous')
    const [sortPrice, setSortPrice] = useState('Aucun')

    return (
        <>
            <main className="min-h-screen bg-gray-950/80 px-8 md:px-20 lg:px-32 pt-50">
                <p className="inline-flex items-center gap-2 px-4 py-2 bg-purple-900/30 border border-purple-800/60 text-purple-300 text-sm font-medium rounded-full">
                    <i className="fa-regular fa-star text-yellow-400"></i>
                    Nouvelle plateforme d'événements
                </p>

                <section className="max-w-[1500px] m-auto flex flex-col lg:flex-row justify-between items-center gap-16">
                    <div className="flex flex-col lg:w-[50%]">
                        <h1 className="font-bold text-5xl lg:text-6xl text-white leading-tight">
                            Connectez-vous à{' '}
                            <span className="bg-linear-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
                                votre communauté
                            </span>{' '}
                            en un clic.
                        </h1>
                        <p className="text-gray-400 text-lg mt-6 mb-8 leading-relaxed">
                            Découvrez les meilleurs événements autour de vous,
                            rencontrez des personnes partageant vos passions et créez
                            des souvenirs inoubliables.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4">
                            <Link to='/create' className="cursor-pointer flex justify-center items-center gap-2 bg-linear-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 transition-colors rounded-lg px-6 py-3 text-white font-medium">
                                Créer votre événement
                                <i className="fa-solid fa-arrow-right text-xs"></i>
                            </Link>
                            
                            <Link to='/events' className="cursor-pointer bg-white/5 border border-white/10 hover:bg-white/10 transition-colors rounded-lg px-6 py-3 text-white font-medium">
                                Découvrir les événements
                            </Link>
                        </div>
                        <div className="flex gap-10 mt-14">
                            <div>
                                <p className="text-white text-3xl font-bold">12K+</p>
                                <p className="text-gray-500 text-sm">Événements</p>
                            </div>
                            <div>
                                <p className="text-white text-3xl font-bold">85K+</p>
                                <p className="text-gray-500 text-sm">Membres</p>
                            </div>
                            <div>
                                <p className="text-white text-3xl font-bold">200+</p>
                                <p className="text-gray-500 text-sm">Villes</p>
                            </div>
                        </div>
                    </div>
                    <div className="lg:w-[45%] flex justify-center">
                        <div className="relative w-72 h-145 bg-gray-900 rounded-[3rem] border-2 border-gray-700/50 shadow-2xl shadow-purple-500/10 p-3 cursor-default">
                            <div className="w-full h-full bg-gray-800 rounded-[2.4rem] flex flex-col items-center justify-start text-gray-500 text-sm overflow-hidden">
                                <div className='relative w-full h-[50%] flex justify-center items-center'>
                                    <div className='absolute w-full h-full bg-black/70' />
                                    <img className='w-full h-full object-cover' src='https://img.freepik.com/premium-photo/audio-speaker-music-column-subwoofer-tropic-forest-concept-online-music-radio-disco-party-mobile-music-app-song-copy-space_536572-2643.jpg' />
                                    <div className='absolute flex justify-center items-center flex-col gap-3 top-[50%] left-[50%] translate-[-50%] text-white'>
                                        <p className='text-8xl'>
                                            🎉
                                        </p>
                                        <p className='text-3xl font-bold text-center text-nowrap w-full '>
                                            Soirée Jeux
                                        </p>
                                        <p className='text-gray-400 font-semibold'>
                                            à Lyon
                                        </p>
                                    </div>
                                </div>

                                <div className='flex-1 flex flex-col justify-center items-center gap-3 bg-gray-800 w-full h-full ml-10'>
                                    <div className='flex justify-start items-center gap-3 w-full'>
                                        <div className='bg-purple-400 p-3 rounded-lg text-white'>
                                            <i className="fa-regular fa-calendar"></i>
                                        </div>
                                        <p className='text-gray-400 font-bold'>
                                            26 Mars 2026 - 19h00
                                        </p>
                                    </div>

                                    <div className='flex justify-start items-center gap-3 w-full'>
                                        <div className='bg-pink-400 p-3 rounded-lg text-white'>
                                            <i className="fa-solid fa-location-pin"></i>
                                        </div>
                                        <p className='text-gray-400 font-bold'>
                                            Cordeliers, Lyon
                                        </p>
                                    </div>

                                    <div className='flex justify-start items-center gap-3 w-full'>
                                        <div className='bg-blue-400 p-3 rounded-lg text-white'>
                                            <i className="fa-solid fa-users"></i>
                                        </div>
                                        <p className='text-gray-400 font-bold'>
                                            15 participants
                                        </p>
                                    </div>

                                    <div className='w-full flex justify-start items-center'>
                                        <img src={pfp1} className='rounded-full border-2 border-gray-500' width='30px' />
                                        <img src={pfp2} className='-ml-2.5 rounded-full border-2 border-gray-500' width='30px' />
                                        <img src={pfp3} className='-ml-2.5 rounded-full border-2 border-gray-500' width='30px' />
                                        <img src={pfp4} className='-ml-2.5 rounded-full border-2 border-gray-500' width='30px' />
                                        <img src={pfp5} className='-ml-2.5 rounded-full border-2 border-gray-500' width='30px' />
                                        <div className='-ml-2.5 flex justify-center items-center bg-gray-700 text-gray-500 font-bold w-7.5 h-7.5 rounded-full border-2 border-gray-500'>
                                            +9
                                        </div>
                                    </div>

                                    <button className='bg-linear-to-r from-purple-500 to-pink-500 text-white font-bold px-4 py-1.5 rounded-lg text-xl'>
                                        J'y vais!
                                    </button>
                                </div>
                            </div>

                            <div className='absolute bg-orange-400 shadow-lg shadow-orange-400 -top-8 -right-8 w-16 h-16 rounded-lg flex justify-center items-center'>
                                <p className='text-3xl'>
                                    🎈
                                </p>
                            </div>

                            <div className='absolute bg-pink-400 shadow-lg shadow-pink-400 -bottom-8 -left-8 w-16 h-16 rounded-lg flex justify-center items-center'>
                                <p className='text-3xl'>
                                    <i className="text-white fa-solid fa-music"></i>
                                </p>
                            </div>

                            <div className='absolute bg-cyan-400 shadow-lg shadow-cyan-400 top-60 -right-16 w-16 h-16 rounded-lg flex justify-center items-center'>
                                <p className='text-3xl'>
                                    <i className="text-white fa-regular fa-heart"></i>
                                </p>
                            </div>
                            
                        </div>
                    </div>
                </section>

                <AnimationScroll className="max-w-[1500px] m-auto mt-32">
                    <h2 className="text-4xl lg:text-5xl font-bold text-white mb-3">
                        Événements populaires à{' '}
                        <span className="bg-linear-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">Lyon</span>
                    </h2>
                    <p className="text-gray-400 text-lg mb-8">Découvrez ce qui se passe autour de vous</p>

                    <div className="flex flex-wrap gap-3 mb-10">
                        {categories.map((cat) => (
                            <button
                                key={cat.label}
                                onClick={() => setActiveCategory(cat.label)}
                                className={`cursor-pointer flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                                    activeCategory === cat.label
                                        ? 'bg-purple-600 text-white'
                                        : 'bg-gray-800/80 text-gray-300 border border-gray-700 hover:bg-gray-700'
                                }`}
                            >
                                <span>{cat.emoji}</span>
                                {cat.label}
                            </button>
                        ))}
                        <button onClick={() => setFiltersOpen(!filtersOpen)} className={`cursor-pointer flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                                filtersOpen
                                    ? 'bg-purple-600 text-white'
                                    : 'bg-gray-800/80 text-gray-300 border border-gray-700 hover:bg-gray-700'
                        }`}>
                            <i className="fa-solid fa-sliders text-xs"></i>
                            Filtres
                            <i className={`fa-solid fa-chevron-up text-xs transition-transform duration-300 ${filtersOpen ? '' : 'rotate-180'}`}></i>
                        </button>
                    </div>

                    <div className={`overflow-hidden transition-all duration-400 ease-out ${
                            filtersOpen ? 'max-h-60 opacity-100 mt-4' : 'max-h-0 opacity-0'
                    }`}>
                        <div className="bg-gray-900/60 border border-gray-800 rounded-2xl p-6">
                            <p className="text-white font-semibold text-sm mb-4">
                                Filtres avancés
                            </p>

                            <div className="flex flex-col md:flex-row gap-8">
                                <div className="flex-1">
                                    <p className="text-gray-400 text-xs mb-2">Date</p>
                                    <div className="relative">
                                        <i className="fa-regular fa-calendar absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm"></i>
                                        <input
                                            type="date"
                                            className="w-full bg-gray-800/80 border border-gray-700 rounded-lg pl-10 pr-4 py-2.5 text-sm text-white outline-none focus:border-purple-500 transition-colors [color-scheme:dark]"
                                        />
                                    </div>
                                </div>

                                <div className="flex-1">
                                    <p className="text-gray-400 text-xs mb-2">Prix</p>
                                    <div className="flex bg-gray-800/80 border border-gray-700 rounded-lg p-1">
                                        {['Tous', 'Gratuit', 'Payant'].map((opt) => (
                                            <button  key={opt} onClick={() => setPriceFilter(opt)} className={`cursor-pointer flex-1 py-2 text-sm font-medium rounded-md transition-colors ${
                                                    priceFilter === opt
                                                        ? 'bg-purple-600 text-white'
                                                        : 'text-gray-400 hover:text-white'
                                            }`}>
                                                {opt}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="flex-1">
                                    <p className="text-gray-400 text-xs mb-2">Tri par prix</p>
                                    <div className="flex bg-gray-800/80 border border-gray-700 rounded-lg p-1">
                                        {['Aucun', 'Croissant', 'Décroissant'].map((opt) => (
                                            <button key={opt} onClick={() => setSortPrice(opt)}
                                                className={`cursor-pointer flex-1 py-2 text-sm font-medium rounded-md transition-colors ${
                                                    sortPrice === opt
                                                        ? 'bg-purple-600 text-white'
                                                        : 'text-gray-400 hover:text-white'
                                            }`}>
                                                {opt}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {events.map((event, i) => (
                            <EventCard key={event.id} event={event} delay={i * 100} />
                        ))}
                    </div>

                    <div className="flex flex-col items-center mt-12 gap-3">
                        <Link to="/events" className="cursor-pointer flex items-center gap-3 px-6 py-3 bg-gray-800 border border-gray-700 rounded-full text-white font-medium hover:bg-gray-700 transition-colors">
                            Découvrez les événements autour de vous
                            <i className="fa-solid fa-arrow-right text-xs"></i>
                        </Link>
                    </div>
                </AnimationScroll>

                <AnimationScroll className="max-w-[1500px] m-auto mt-32 pb-20">
                    <div className="text-center mb-12">
                        <p className="text-purple-400 text-sm font-semibold tracking-widest uppercase mb-3">
                            Simple et rapide
                        </p>
                        <h2 className="text-4xl lg:text-5xl font-bold text-white mb-4">
                            Comment ça marche
                        </h2>
                        <p className="text-gray-400 text-lg max-w-lg mx-auto">
                            Trois étapes simples pour commencer votre aventure communautaire
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {steps.map((step, i) => (
                            <StepCard key={step.id} step={step} delay={i * 150} />
                        ))}
                    </div>

                    <div className="flex justify-center mt-12">
                        <Link to="/create" className="cursor-pointer px-8 py-3 bg-linear-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 transition-colors rounded-lg text-white font-medium">
                            Commencer maintenant
                        </Link>
                    </div>
                </AnimationScroll>
            </main>
        </>
    )
}

export default Accueil