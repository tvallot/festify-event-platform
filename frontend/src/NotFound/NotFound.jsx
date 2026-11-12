import { Link } from 'react-router-dom'

function NotFound() {
    return (
        <main className="min-h-screen bg-gray-950 flex items-center justify-center px-6">
            <div className="text-center max-w-md">
                <p className="text-8xl sm:text-9xl font-bold bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent mb-4">
                    404
                </p>
                <h1 className="text-2xl sm:text-3xl font-bold text-white mb-3">
                    Page introuvable
                </h1>
                <p className="text-gray-400 text-sm sm:text-base mb-8">
                    Oups, la page que vous cherchez n'existe pas ou a été déplacée.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                    <Link
                        to="/"
                        className="w-full sm:w-auto bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 transition-colors rounded-lg px-6 py-3 text-white font-medium text-center"
                    >
                        <i className="fa-solid fa-house text-xs mr-2"></i>
                        Retour à l'accueil
                    </Link>
                    <Link
                        to="/events"
                        className="w-full sm:w-auto bg-white/5 border border-white/10 hover:bg-white/10 transition-colors rounded-lg px-6 py-3 text-white font-medium text-center"
                    >
                        Découvrir les événements
                    </Link>
                </div>
            </div>
        </main>
    )
}

export default NotFound