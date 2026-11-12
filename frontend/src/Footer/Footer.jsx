import festifyLogo from '../assets/FestifyLogo.png'
import { Link } from 'react-router-dom'

const liensFooter = {
    'DÉCOUVRIR': [
        'Événements populaires',
        'Événements gratuits',
        'Événements en ligne',
        'Catégories',
    ],
    'CRÉER': [
        'Créer un événement',
        'Créer un groupe',
        'Ressources',
        'Guide organisateur',
    ],
    'COMMUNAUTÉ': [
        'Blog',
        'Histoires',
        'Forum',
        'Ambassadeurs',
    ],
    'ENTREPRISE': [
        'À propos',
        'Carrières',
        'Presse',
        'Contact',
    ],
}

const reseaux = ['Facebook', 'Instagram', 'LinkedIn', 'Twitter']

function Footer() {
    return (
        <footer className="bg-gray-950 border-t border-gray-800/60 px-8 md:px-20 lg:px-32">
            <div className="max-w-[1500px] m-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-6 py-10 border-b border-gray-800/60">
                <div>
                    <h3 className="text-white font-semibold text-lg">
                        Restez informé des meilleurs événements
                    </h3>
                    <p className="text-gray-400 text-sm mt-1">
                        Recevez les événements populaires dans votre boîte mail.
                    </p>
                </div>
                <div className="flex gap-3">
                    <input
                        type="email"
                        placeholder="Votre email"
                        className="px-4 py-2.5 bg-gray-800/60 border border-gray-700 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors w-56"
                    />
                    <button className="cursor-pointer px-5 py-2.5 bg-purple-600 hover:bg-purple-700 transition-colors rounded-lg text-white text-sm font-medium">
                        S'abonner
                    </button>
                </div>
            </div>

            <div className="max-w-[1500px] m-auto grid grid-cols-2 md:grid-cols-4 gap-8 py-12">
                {Object.entries(liensFooter).map(([title, links]) => (
                    <div key={title}>
                        <h4 className="text-gray-400 text-xs font-semibold tracking-wider mb-4">{title}</h4>
                        <ul className="flex flex-col gap-2.5">
                            {links.map((link) => (
                                <li key={link}>
                                    <Link to='/events' className="text-gray-500 text-sm hover:text-white transition-colors">
                                        {link}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}
            </div>

            <div className="max-w-[1500px] m-auto flex flex-col md:flex-row justify-between items-center gap-4 py-6 border-t border-gray-800/60">
                <div className="flex items-center gap-2">
                    <img src={festifyLogo} width='30px' />
                    <span className="text-white font-bold">
                        Festify
                        <span className='text-purple-500'>.</span>
                    </span>
                </div>
                <p className="text-gray-500 text-sm">© 2026 Festify. Tous droits réservés.</p>
                <div className="flex gap-5">
                    {reseaux.map((s) => (
                        <Link key={s} to="#" className="text-gray-500 text-sm hover:text-white transition-colors">
                            {s}
                        </Link>
                    ))}
                </div>
            </div>
        </footer>
    )
}

export default Footer