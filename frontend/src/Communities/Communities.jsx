import { useState } from 'react'
import { Link } from 'react-router-dom'

const mockCommunities = [
    {
        id: 1,
        name: "Lyon Tech Meetup",
        description: "Communauté de développeurs et passionnés de tech à Lyon. On organise des meetups, des hackathons et des conférences.",
        category: "Tech",
        members: 1245,
        events: 34,
        image: null,
        isPublic: true,
    },
    {
        id: 2,
        name: "Randonneurs des Alpes",
        description: "Explorons ensemble les sentiers alpins. Randonnées tous niveaux, du débutant à l'expert.",
        category: "Sport",
        members: 876,
        events: 56,
        image: null,
        isPublic: true,
    },
    {
        id: 3,
        name: "Foodies Lyon",
        description: "Découverte de restaurants, ateliers cuisine et dégustations dans la capitale de la gastronomie.",
        category: "Food",
        members: 2340,
        events: 89,
        image: null,
        isPublic: true,
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

function Communities() {
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedCategory, setSelectedCategory] = useState('Toutes')
    const [filtersOpen, setFiltersOpen] = useState(false)

    const categories = ['Toutes', ...new Set(mockCommunities.map(c => c.category))]

    const hasActiveFilters = searchQuery || selectedCategory !== 'Toutes'

    const filteredCommunities = mockCommunities.filter(community => {
        const matchesSearch = community.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                             community.description.toLowerCase().includes(searchQuery.toLowerCase())
        const matchesCategory = selectedCategory === 'Toutes' || community.category === selectedCategory

        return matchesSearch && matchesCategory
    })

    const resetFilters = () => {
        setSearchQuery('')
        setSelectedCategory('Toutes')
    }

    return (
        <main className="min-h-screen bg-gray-900 text-white px-4 sm:px-6 md:px-12 lg:px-20 pt-28 pb-12">
            <div className="mb-8">
                <h1 className="text-3xl sm:text-4xl font-bold mb-2">
                    Communautés
                </h1>
                <p className="text-gray-400 text-sm sm:text-base">
                    {filteredCommunities.length} communauté{filteredCommunities.length > 1 ? 's' : ''} disponible{filteredCommunities.length > 1 ? 's' : ''}
                </p>
            </div>

            <div className="bg-gray-800 rounded-xl p-4 sm:p-6 mb-8 border border-gray-700">
                <div className="relative mb-4">
                    <i className="fa-solid fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"></i>
                    <input
                        type="text"
                        placeholder="Rechercher une communauté..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-gray-900 border border-gray-600 rounded-lg pl-12 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors text-sm sm:text-base"
                    />
                </div>

                <button
                    onClick={() => setFiltersOpen(!filtersOpen)}
                    className="cursor-pointer sm:hidden flex items-center justify-between w-full text-gray-300 text-sm font-medium py-2"
                >
                    <span className="flex items-center gap-2">
                        <i className="fa-solid fa-sliders text-xs"></i>
                        Filtres
                        {hasActiveFilters && (
                            <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                        )}
                    </span>
                    <i className={`fa-solid fa-chevron-down text-xs transition-transform duration-300 ${filtersOpen ? 'rotate-180' : ''}`}></i>
                </button>

                <div className={`overflow-hidden transition-all duration-300 ease-out sm:max-h-none sm:opacity-100 ${
                    filtersOpen ? 'max-h-40 opacity-100 mt-3' : 'max-h-0 opacity-0 sm:mt-0'
                }`}>
                    <div className="flex flex-wrap gap-2">
                        {categories.map(cat => (
                            <button
                                key={cat}
                                onClick={() => setSelectedCategory(cat)}
                                className={`cursor-pointer flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-sm font-medium transition-colors ${
                                    selectedCategory === cat
                                        ? 'bg-purple-600 text-white'
                                        : 'bg-gray-900 text-gray-300 border border-gray-600 hover:bg-gray-700'
                                }`}
                            >
                                {cat !== 'Toutes' && <span className="text-xs">{categoryEmojis[cat]}</span>}
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>
                {hasActiveFilters && (
                    <button
                        onClick={resetFilters}
                        className="cursor-pointer mt-4 text-purple-400 hover:text-purple-300 text-sm font-semibold transition-colors"
                    >
                        <i className="fa-solid fa-rotate-left mr-2"></i>
                        Réinitialiser les filtres
                    </button>
                )}
            </div>

            {filteredCommunities.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                    {filteredCommunities.map(community => (
                        <CommunityCard key={community.id} community={community} />
                    ))}
                </div>
            ) : (
                <div className="text-center py-20">
                    <i className="fa-solid fa-users-slash text-5xl sm:text-6xl text-gray-600 mb-4 block"></i>
                    <h3 className="text-xl sm:text-2xl font-bold text-gray-400 mb-2">
                        Aucune communauté trouvée
                    </h3>
                    <p className="text-gray-500 text-sm sm:text-base">
                        Essayez de modifier vos filtres de recherche
                    </p>
                </div>
            )}
        </main>
    )
}

function CommunityCard({ community }) {
    const gradient = categoryColors[community.category] || 'from-purple-500 to-pink-500'
    const emoji = categoryEmojis[community.category] || '🎉'

    return (
        <Link
            to={`/communities/${community.id}`}
            className="bg-gray-800 rounded-xl overflow-hidden border border-gray-700 hover:border-purple-500 transition-all hover:shadow-lg hover:shadow-purple-500/20 cursor-pointer group"
        >

            <div className={`relative h-32 bg-gradient-to-br ${gradient} overflow-hidden`}>
                <div className="absolute inset-0 bg-black/20"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-5xl opacity-30 group-hover:scale-110 transition-transform duration-300">{emoji}</span>
                </div>

                <div className="absolute top-3 left-3">
                    <span className="px-3 py-1 bg-black/40 backdrop-blur-sm rounded-full text-xs font-semibold text-white">
                        {community.category}
                    </span>
                </div>
                <div className="absolute top-3 right-3">
                    <span className={`px-3 py-1 backdrop-blur-sm rounded-full text-xs font-semibold ${
                        community.isPublic ? 'bg-green-500/30 text-green-300' : 'bg-orange-500/30 text-orange-300'
                    }`}>
                        <i className={`fa-solid ${community.isPublic ? 'fa-globe' : 'fa-lock'} text-[10px] mr-1`}></i>
                        {community.isPublic ? 'Public' : 'Privé'}
                    </span>
                </div>
            </div>

            <div className="p-4">
                <h3 className="text-lg font-bold text-white mb-2 line-clamp-1">
                    {community.name}
                </h3>

                <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                    {community.description}
                </p>

                <div className="flex items-center justify-between pt-3 border-t border-gray-700">
                    <div className="flex items-center gap-1.5 text-sm text-gray-400">
                        <i className="fa-solid fa-users text-xs"></i>
                        <span>{community.members.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-sm text-gray-400">
                        <i className="fa-solid fa-calendar text-xs"></i>
                        <span>{community.events} événements</span>
                    </div>
                </div>
            </div>
        </Link>
    )
}

export default Communities