import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'

const mockCommunities = [
    {
        id: 1,
        name: "Lyon Tech Meetup",
        description: "Communauté de développeurs et passionnés de tech à Lyon. On organise des meetups, des hackathons et des conférences. Rejoignez-nous pour échanger sur les dernières technologies, partager vos projets et rencontrer d'autres développeurs de la région.",
        category: "Tech",
        members: 1245,
        events: 34,
        image: null,
        isPublic: true,
        createdAt: "2024-03-15",
        organizer: { id: 1, name: "Sophie Martin" },
        upcomingEvents: [
            { id: 4, titre: "Conférence Tech & Innovation", date: "2026-03-30", prix: 15, participants: 89 },
            { id: 9, titre: "Hackathon Spring 2026", date: "2026-04-12", prix: 0, participants: 45 },
        ],
        recentMembers: [1, 2, 3, 4, 5, 6],
        rules: [
            "Respectez les autres membres",
            "Pas de spam ni de publicité",
            "Partagez vos connaissances",
            "Les discussions restent constructives",
        ],
    },
    {
        id: 2,
        name: "Randonneurs des Alpes",
        description: "Explorons ensemble les sentiers alpins. Randonnées tous niveaux, du débutant à l'expert. Chaque semaine, nous organisons des sorties dans les massifs environnants : Chartreuse, Vercors, Belledonne, Mont-Blanc...",
        category: "Sport",
        members: 876,
        events: 56,
        image: null,
        isPublic: true,
        createdAt: "2023-09-01",
        organizer: { id: 3, name: "Marc Leblanc" },
        upcomingEvents: [
            { id: 3, titre: "Randonnée dans les Alpes", date: "2026-04-20", prix: 0, participants: 34 },
        ],
        recentMembers: [2, 3, 5],
        rules: [
            "Équipement adapté obligatoire",
            "Respectez la nature",
            "Prévenez en cas d'annulation",
        ],
    },
    {
        id: 3,
        name: "Foodies Lyon",
        description: "Découverte de restaurants, ateliers cuisine et dégustations dans la capitale de la gastronomie. Partagez vos bonnes adresses, participez à nos événements culinaires et rencontrez d'autres gourmands.",
        category: "Food",
        members: 2340,
        events: 89,
        image: null,
        isPublic: true,
        createdAt: "2023-01-10",
        organizer: { id: 2, name: "Jean Dupont" },
        upcomingEvents: [
            { id: 2, titre: "Atelier Cuisine Japonaise", date: "2026-03-25", prix: 45, participants: 12 },
        ],
        recentMembers: [1, 3, 4, 6],
        rules: [
            "Partagez vos découvertes culinaires",
            "Respectez les restaurateurs",
            "Pas de critique non constructive",
        ],
    },
    {
        id: 4,
        name: "Art & Culture Lyon",
        description: "Sorties musées, expos, spectacles et discussions autour de l'art et la culture lyonnaise.",
        category: "Culture",
        members: 654,
        events: 23,
        image: null,
        isPublic: true,
        createdAt: "2024-06-20",
        organizer: { id: 1, name: "Sophie Martin" },
        upcomingEvents: [
            { id: 6, titre: "Exposition d'Art Contemporain", date: "2026-04-05", prix: 8, participants: 67 },
        ],
        recentMembers: [2, 5],
        rules: [
            "Ouvert à toutes les formes d'art",
            "Respectez les opinions de chacun",
        ],
    },
    {
        id: 5,
        name: "Soirées Jeux de Société",
        description: "On se retrouve chaque semaine pour jouer à des jeux de société dans une ambiance conviviale.",
        category: "Loisirs",
        members: 432,
        events: 112,
        image: null,
        isPublic: true,
        createdAt: "2024-01-05",
        organizer: { id: 2, name: "Jean Dupont" },
        upcomingEvents: [
            { id: 5, titre: "Soirée Jeux de Société", date: "2026-03-22", prix: 0, participants: 23 },
        ],
        recentMembers: [1, 2, 3, 4],
        rules: [
            "Prenez soin du matériel",
            "Ambiance conviviale obligatoire",
            "Nouveaux joueurs bienvenus",
        ],
    },
    {
        id: 6,
        name: "Musique Live Lyon",
        description: "Concerts, jam sessions et découvertes musicales. Tous les genres, tous les styles.",
        category: "Musique",
        members: 1567,
        events: 67,
        image: null,
        isPublic: false,
        createdAt: "2023-05-12",
        organizer: { id: 3, name: "Marc Leblanc" },
        upcomingEvents: [
            { id: 1, titre: "Festival de la Musique Électronique", date: "2026-04-15", prix: 25, participants: 156 },
        ],
        recentMembers: [1, 4, 5, 6],
        rules: [
            "Respectez les artistes",
            "Sur invitation uniquement",
            "Partagez vos découvertes musicales",
        ],
    },
    {
        id: 7,
        name: "Startup & Networking",
        description: "Réseau d'entrepreneurs lyonnais. Pitchs, mentorat et événements networking.",
        category: "Networking",
        members: 987,
        events: 45,
        image: null,
        isPublic: true,
        createdAt: "2023-11-30",
        organizer: { id: 1, name: "Sophie Martin" },
        upcomingEvents: [],
        recentMembers: [2, 3, 6],
        rules: [
            "Pas de démarchage agressif",
            "Entraide et bienveillance",
            "Pitch de 5 min max",
        ],
    },
    {
        id: 8,
        name: "Yoga & Bien-être",
        description: "Sessions de yoga, méditation et ateliers bien-être pour tous les niveaux.",
        category: "Fitness",
        members: 765,
        events: 78,
        image: null,
        isPublic: true,
        createdAt: "2024-02-14",
        organizer: { id: 2, name: "Jean Dupont" },
        upcomingEvents: [],
        recentMembers: [1, 3, 5],
        rules: [
            "Tapis de yoga obligatoire",
            "Arrivez 10 min avant la session",
            "Respectez le silence pendant la méditation",
        ],
    },
]

const categoryColors = {
    'Tech': 'from-blue-500 to-cyan-400',
    'Sport': 'from-green-500 to-emerald-400',
    'Food': 'from-orange-500 to-yellow-400',
    'Culture': 'from-purple-500 to-violet-400',
    'Loisirs': 'from-pink-500 to-rose-400',
    'Musique': 'from-red-500 to-pink-400',
    'Networking': 'from-indigo-500 to-blue-400',
    'Fitness': 'from-teal-500 to-green-400',
}

const categoryEmojis = {
    'Tech': '💻',
    'Sport': '⚡',
    'Food': '🍕',
    'Culture': '🎭',
    'Loisirs': '🎯',
    'Musique': '🎵',
    'Networking': '🤝',
    'Fitness': '🏋️',
}

import pfp1 from '../assets/profils/1.png'
import pfp2 from '../assets/profils/2.png'
import pfp3 from '../assets/profils/3.png'
import pfp4 from '../assets/profils/4.png'
import pfp5 from '../assets/profils/5.png'
import pfp6 from '../assets/profils/6.png'

const profilePictures = { 1: pfp1, 2: pfp2, 3: pfp3, 4: pfp4, 5: pfp5, 6: pfp6 }

function CommunityDetail() {
    const { id } = useParams()
    const navigate = useNavigate()
    const { userId } = useSelector((state) => state.user)
    const [community, setCommunity] = useState(null)
    const [joined, setJoined] = useState(false)
    const [activeTab, setActiveTab] = useState('about')

    useEffect(() => {
        const found = mockCommunities.find(c => c.id === parseInt(id))
        if (found) {
            setCommunity(found)
        } else {
            navigate('/communities')
        }
    }, [id, navigate])

    if (!community) {
        return (
            <div className="min-h-screen bg-gray-950 flex items-center justify-center">
                <i className="fa-solid fa-spinner fa-spin text-4xl text-purple-500"></i>
            </div>
        )
    }

    const gradient = categoryColors[community.category] || 'from-purple-500 to-pink-500'
    const emoji = categoryEmojis[community.category] || '🎉'
    const isOrganizer = userId === community.organizer.id

    return (
        <main className="min-h-screen bg-gray-950 text-white">
            <div className={`relative h-48 sm:h-56 md:h-64 w-full bg-gradient-to-br ${gradient} mt-20`}>
                <div className="absolute inset-0 bg-black/30"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-7xl sm:text-8xl md:text-9xl opacity-20">{emoji}</span>
                </div>

                <Link
                    to="/communities"
                    className="absolute top-4 sm:top-6 left-4 sm:left-6 bg-black/40 backdrop-blur-sm hover:bg-black/60 transition-colors rounded-full px-4 py-2 flex items-center gap-2 text-sm"
                >
                    <i className="fa-solid fa-arrow-left"></i>
                    <span className="hidden sm:inline">Retour</span>
                </Link>

                <div className="absolute top-4 sm:top-6 right-4 sm:right-6 flex gap-2">
                    <span className="px-3 py-1.5 bg-black/40 backdrop-blur-sm rounded-full text-xs font-semibold">
                        {community.category}
                    </span>
                    <span className={`px-3 py-1.5 backdrop-blur-sm rounded-full text-xs font-semibold ${
                        community.isPublic ? 'bg-green-500/30 text-green-300' : 'bg-orange-500/30 text-orange-300'
                    }`}>
                        <i className={`fa-solid ${community.isPublic ? 'fa-globe' : 'fa-lock'} text-[10px] mr-1`}></i>
                        {community.isPublic ? 'Public' : 'Privé'}
                    </span>
                </div>
            </div>

            <div className="max-w-5xl mx-auto px-4 sm:px-6 md:px-8 mt-8">
                <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4 sm:p-6 mb-6">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-bold mb-2">{community.name}</h1>
                            <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-sm text-gray-400">
                                <span className="flex items-center gap-1.5">
                                    <i className="fa-solid fa-users text-purple-400 text-xs"></i>
                                    {community.members.toLocaleString()} membres
                                </span>
                                <span className="flex items-center gap-1.5">
                                    <i className="fa-solid fa-calendar text-pink-400 text-xs"></i>
                                    {community.events} événements
                                </span>
                                <span className="flex items-center gap-1.5">
                                    <i className="fa-regular fa-clock text-gray-500 text-xs"></i>
                                    Créé en {new Date(community.createdAt).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
                                </span>
                            </div>
                        </div>

                        <div className="flex gap-2 shrink-0">
                            {isOrganizer ? (
                                <button className="cursor-pointer bg-gray-800 border border-gray-700 hover:bg-gray-700 transition-colors rounded-lg px-4 sm:px-5 py-2.5 text-sm font-medium flex items-center gap-2">
                                    <i className="fa-solid fa-gear text-xs"></i>
                                    Gérer
                                </button>
                            ) : (
                                <button
                                    onClick={() => setJoined(!joined)}
                                    className={`cursor-pointer rounded-lg px-4 sm:px-5 py-2.5 text-sm font-medium flex items-center gap-2 transition-colors ${
                                        joined
                                            ? 'bg-green-600/20 border border-green-500 text-green-400 hover:bg-red-600/20 hover:border-red-500 hover:text-red-400'
                                            : 'bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 text-white'
                                    }`}
                                >
                                    <i className={`fa-solid ${joined ? 'fa-check' : 'fa-plus'} text-xs`}></i>
                                    {joined ? 'Membre' : 'Rejoindre'}
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex gap-1 bg-gray-900 border border-gray-800 rounded-xl p-1 mb-6 overflow-x-auto">
                    {[
                        { key: 'about', label: 'À propos', icon: 'fa-circle-info' },
                        { key: 'events', label: 'Événements', icon: 'fa-calendar' },
                        { key: 'members', label: 'Membres', icon: 'fa-users' },
                    ].map(tab => (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
                            className={`cursor-pointer flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                                activeTab === tab.key
                                    ? 'bg-purple-600 text-white'
                                    : 'text-gray-400 hover:text-white hover:bg-gray-800'
                            }`}
                        >
                            <i className={`fa-solid ${tab.icon} text-xs`}></i>
                            {tab.label}
                        </button>
                    ))}
                </div>

                <div className="pb-12">
                    {activeTab === 'about' && (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <div className="lg:col-span-2 space-y-6">
                                <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 sm:p-6">
                                    <h2 className="text-lg font-bold mb-3">Description</h2>
                                    <p className="text-gray-300 text-sm leading-relaxed">{community.description}</p>
                                </div>

                                {community.rules && community.rules.length > 0 && (
                                    <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 sm:p-6">
                                        <h2 className="text-lg font-bold mb-3">Règles de la communauté</h2>
                                        <div className="space-y-2.5">
                                            {community.rules.map((rule, i) => (
                                                <div key={i} className="flex items-start gap-3">
                                                    <span className="w-6 h-6 bg-purple-600/20 rounded-full flex items-center justify-center text-purple-400 text-xs font-bold shrink-0 mt-0.5">
                                                        {i + 1}
                                                    </span>
                                                    <p className="text-gray-300 text-sm">{rule}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="space-y-6">
                                <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 sm:p-6">
                                    <h2 className="text-sm font-semibold text-gray-400 mb-3">Organisateur</h2>
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-sm">
                                            {community.organizer.name.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="text-white text-sm font-medium">{community.organizer.name}</p>
                                            <p className="text-gray-500 text-xs">Créateur</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 sm:p-6">
                                    <h2 className="text-sm font-semibold text-gray-400 mb-3">Statistiques</h2>
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <span className="text-gray-400 text-sm">Membres</span>
                                            <span className="text-white font-semibold text-sm">{community.members.toLocaleString()}</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-gray-400 text-sm">Événements</span>
                                            <span className="text-white font-semibold text-sm">{community.events}</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-gray-400 text-sm">À venir</span>
                                            <span className="text-purple-400 font-semibold text-sm">{community.upcomingEvents.length}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'events' && (
                        <div>
                            {community.upcomingEvents.length > 0 ? (
                                <div className="space-y-4">
                                    {community.upcomingEvents.map(event => (
                                        <Link
                                            key={event.id}
                                            to={`/events/${event.id}`}
                                            className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 bg-gray-900 border border-gray-800 hover:border-purple-500/50 rounded-xl p-4 sm:p-5 transition-colors"
                                        >
                                            <div className="flex items-start sm:items-center gap-4">
                                                <div className="bg-purple-600/20 rounded-xl p-3 text-center shrink-0 w-14">
                                                    <p className="text-purple-400 text-xs font-semibold uppercase">
                                                        {new Date(event.date).toLocaleDateString('fr-FR', { month: 'short' })}
                                                    </p>
                                                    <p className="text-white text-xl font-bold leading-none mt-0.5">
                                                        {new Date(event.date).getDate()}
                                                    </p>
                                                </div>

                                                <div>
                                                    <h3 className="text-white font-semibold text-sm sm:text-base">{event.titre}</h3>
                                                    <p className="text-gray-400 text-xs sm:text-sm mt-1">
                                                        {event.participants} participants
                                                    </p>
                                                </div>
                                            </div>

                                            <span className={`self-start sm:self-center px-3 py-1 rounded-full text-xs font-semibold shrink-0 ${
                                                event.prix === 0 ? 'bg-green-500/20 text-green-400' : 'bg-purple-500/20 text-purple-400'
                                            }`}>
                                                {event.prix === 0 ? 'Gratuit' : `${event.prix}€`}
                                            </span>
                                        </Link>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-16">
                                    <i className="fa-regular fa-calendar text-4xl sm:text-5xl text-gray-700 mb-4 block"></i>
                                    <h3 className="text-lg sm:text-xl font-bold text-gray-400 mb-2">Aucun événement à venir</h3>
                                    <p className="text-gray-500 text-sm">Les prochains événements apparaîtront ici.</p>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'members' && (
                        <div>
                            <p className="text-gray-400 text-sm mb-4">{community.members.toLocaleString()} membres</p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                {community.recentMembers.map((pfpId, i) => (
                                    <div key={i} className="flex items-center gap-3 bg-gray-900 border border-gray-800 rounded-xl p-4">
                                        <img
                                            src={profilePictures[pfpId] || profilePictures[1]}
                                            alt="Member"
                                            className="w-10 h-10 rounded-full border-2 border-gray-700"
                                        />
                                        <div>
                                            <p className="text-white text-sm font-medium">Membre #{i + 1}</p>
                                            <p className="text-gray-500 text-xs">
                                                {i === 0 ? 'Organisateur' : 'Membre'}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {community.members > community.recentMembers.length && (
                                <p className="text-center text-gray-500 text-sm mt-6">
                                    Et {(community.members - community.recentMembers.length).toLocaleString()} autres membres
                                </p>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </main>
    )
}

export default CommunityDetail