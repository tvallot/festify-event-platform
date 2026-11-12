import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { logout, selectIsLoggedIn } from '../redux/userSlice'
import { getAvatar } from '../utils/avatars'
import festifyLogo from '../assets/FestifyLogo.png'

function Header() {
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const { username, profilePictureId, email, role } = useSelector((state) => state.user)
    const isLoggedIn = useSelector(selectIsLoggedIn)

    const [scrolled, setScrolled] = useState(false)
    const [menuOpen, setMenuOpen] = useState(false)
    const [mobileOpen, setMobileOpen] = useState(false)
    const [search, setSearch] = useState('')
    const menuRef = useRef(null)

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 40)
        window.addEventListener('scroll', handleScroll)
        handleScroll()
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    useEffect(() => {
        const handleClick = (e) => {
            if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false)
        }
        document.addEventListener('mousedown', handleClick)
        return () => document.removeEventListener('mousedown', handleClick)
    }, [])

    const handleSearch = (e) => {
        e.preventDefault()
        const keyword = search.trim()
        navigate(keyword ? `/events?keyword=${encodeURIComponent(keyword)}` : '/events')
    }

    const handleLogout = () => {
        dispatch(logout())
        setMenuOpen(false)
        navigate('/')
    }

    return (
        <header className={`fixed top-0 left-0 right-0 z-50 transition-all ${scrolled ? 'bg-gray-900/95 backdrop-blur-lg border-b border-gray-800' : 'bg-transparent border-b border-transparent'}`}>
            <div className="flex justify-between items-center gap-4 py-3 px-6 md:px-12 lg:px-20">
                <Link to="/" className="flex items-center gap-2.5 shrink-0">
                    <img src={festifyLogo} width="28" alt="" />
                    <p className="font-bold text-xl text-white">Festify<span className="text-purple-500">.</span></p>
                </Link>

                <form onSubmit={handleSearch} className="hidden md:flex items-center h-11 bg-gray-800/80 border border-gray-700 rounded-lg px-4 flex-1 max-w-lg">
                    <i className="fa-solid fa-magnifying-glass text-gray-400 text-sm"></i>
                    <input value={search} onChange={(e) => setSearch(e.target.value)}
                        className="flex-1 bg-transparent outline-none text-white text-sm placeholder-gray-500 ml-3"
                        type="search" placeholder="Search events..." aria-label="Search events" />
                </form>

                <nav className="hidden lg:flex items-center gap-6 text-sm font-medium">
                    <Link to="/events" className="text-gray-300 hover:text-white transition-colors">Browse</Link>
                    <Link to="/events/new" className="text-gray-300 hover:text-white transition-colors">Create</Link>
                    {role === 'ADMIN' && <Link to="/admin" className="text-gray-300 hover:text-white transition-colors">Admin</Link>}
                </nav>

                <div className="flex items-center gap-3">
                    {isLoggedIn ? (
                        <div className="relative" ref={menuRef}>
                            <button onClick={() => setMenuOpen(!menuOpen)} aria-label="Account menu"
                                className="cursor-pointer w-10 h-10 rounded-full overflow-hidden ring-2 ring-transparent hover:ring-purple-500/50 transition-all">
                                <img src={getAvatar(profilePictureId)} alt="" className="w-full h-full object-cover" />
                            </button>

                            {menuOpen && (
                                <div className="absolute right-0 top-14 w-64 bg-gray-900 border border-gray-700 rounded-xl shadow-2xl shadow-black/50 overflow-hidden">
                                    <div className="px-4 py-4 border-b border-gray-800">
                                        <p className="text-white font-semibold text-sm">{username}</p>
                                        <p className="text-gray-500 text-xs mt-0.5 truncate">{email}</p>
                                    </div>
                                    <div className="py-2">
                                        <DropdownLink icon="fa-regular fa-user" label="My profile" to="/profile" onClick={() => setMenuOpen(false)} />
                                        <DropdownLink icon="fa-solid fa-gear" label="Settings" to="/settings" onClick={() => setMenuOpen(false)} />
                                    </div>
                                    <div className="border-t border-gray-800 py-2">
                                        <button onClick={handleLogout}
                                            className="cursor-pointer w-full flex items-center gap-3 px-4 py-2.5 text-red-400 hover:bg-gray-800 transition-colors text-sm">
                                            <i className="fa-solid fa-arrow-right-from-bracket text-xs w-4 text-center"></i>
                                            Log out
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <>
                            <Link to="/login" className="hidden sm:flex items-center gap-2 text-gray-300 hover:text-white transition-colors text-sm font-medium">
                                <i className="fa-solid fa-arrow-right-to-bracket text-xs"></i> Log in
                            </Link>
                            <Link to="/signup" className="bg-linear-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 rounded-lg px-4 py-2 text-white text-sm font-medium transition-colors">
                                Sign up
                            </Link>
                        </>
                    )}

                    <button onClick={() => setMobileOpen(!mobileOpen)} aria-label="Menu"
                        className="cursor-pointer lg:hidden text-gray-300 hover:text-white transition-colors ml-1">
                        <i className={`fa-solid ${mobileOpen ? 'fa-xmark' : 'fa-bars'} text-lg`}></i>
                    </button>
                </div>
            </div>

            {mobileOpen && (
                <div className="lg:hidden bg-gray-900/95 backdrop-blur-lg border-t border-gray-800 px-6 py-4">
                    <nav className="flex flex-col gap-1">
                        <MobileLink to="/events" label="Browse" onClick={() => setMobileOpen(false)} />
                        <MobileLink to="/events/new" label="Create" onClick={() => setMobileOpen(false)} />
                        {role === 'ADMIN' && <MobileLink to="/admin" label="Admin" onClick={() => setMobileOpen(false)} />}
                        {!isLoggedIn && <MobileLink to="/login" label="Log in" onClick={() => setMobileOpen(false)} />}
                    </nav>
                </div>
            )}
        </header>
    )
}

function DropdownLink({ icon, label, to, onClick }) {
    return (
        <Link to={to} onClick={onClick} className="flex items-center gap-3 px-4 py-2.5 text-gray-300 hover:bg-gray-800 hover:text-white transition-colors text-sm">
            <i className={`${icon} text-xs w-4 text-center`}></i>{label}
        </Link>
    )
}

function MobileLink({ to, label, onClick }) {
    return (
        <Link to={to} onClick={onClick} className="text-gray-300 hover:text-white py-2.5 text-sm font-medium transition-colors">
            {label}
        </Link>
    )
}

export default Header
