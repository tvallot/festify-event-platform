import { Link } from 'react-router-dom'
import festifyLogo from '../assets/FestifyLogo.png'

function Footer() {
    return (
        <footer className="bg-gray-950 border-t border-gray-800/60 px-8 md:px-20 lg:px-32">
            <div className="max-w-[1500px] m-auto flex flex-col md:flex-row justify-between items-center gap-4 py-8">
                <Link to="/" className="flex items-center gap-2">
                    <img src={festifyLogo} width="28" alt="" />
                    <span className="text-white font-bold">
                        Festify<span className="text-purple-500">.</span>
                    </span>
                </Link>

                <nav className="flex gap-6 text-sm">
                    <Link to="/events" className="text-gray-500 hover:text-white transition-colors">Browse events</Link>
                    <Link to="/events/new" className="text-gray-500 hover:text-white transition-colors">Create an event</Link>
                    <Link to="/profile" className="text-gray-500 hover:text-white transition-colors">My profile</Link>
                </nav>

                <p className="text-gray-500 text-sm">Student project, Université Lyon 1</p>
            </div>
        </footer>
    )
}

export default Footer
