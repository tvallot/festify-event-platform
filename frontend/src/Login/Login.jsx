import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { login } from '../redux/userSlice'
import { loginUser, fetchMyProfile } from '../api/users'

function Login() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const navigate = useNavigate()
    const dispatch = useDispatch()

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')
        setLoading(true)

        try {
            const res = await loginUser(email, password)
            const { token, userId, email: userEmail, role } = res.data

            localStorage.setItem('festify_user', JSON.stringify({ token, userId }))

            let p = {}
            try {
                const profileRes = await fetchMyProfile()
                p = profileRes.data
            } catch {}

            dispatch(login({
                username: [p.firstName, p.lastName].filter(Boolean).join(' ') || email.split('@')[0],
                nom: p.lastName || '',
                prenom: p.firstName || '',
                email: userEmail,
                userId,
                profilePictureId: p.profilePicture ? parseInt(p.profilePicture) : 1,
                role: role || 'USER',
                token,
            }))

            navigate('/profil')
        } catch (err) {
            localStorage.removeItem('festify_user')
            if (err.response?.status === 401) {
                setError('Email ou mot de passe incorrect')
            } else {
                setError(err.response?.data?.message || 'Erreur de connexion au serveur')
            }
        } finally {
            setLoading(false)
        }
    }

    return (
        <main className="flex justify-center items-center min-h-[calc(100vh-80px)] bg-gray-900 text-white">
            <div className="w-full max-w-md bg-gray-800 rounded-xl shadow-2xl p-8 border-2 border-gray-700">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold mb-2">Connexion</h1>
                    <p className="text-gray-400">Connectez-vous pour découvrir des événements</p>
                </div>

                {error && (
                    <div className="mb-6 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400 text-sm text-center">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="email" className="block text-sm font-semibold mb-2 text-gray-300">
                            Adresse email
                        </label>
                        <div className="relative">
                            <i className="fa-solid fa-envelope absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"></i>
                            <input type="email" id="email" value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="votre@email.com" required
                                className="w-full bg-gray-900 border-2 border-gray-600 rounded-lg px-12 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors"
                            />
                        </div>
                    </div>

                    <div>
                        <label htmlFor="password" className="block text-sm font-semibold mb-2 text-gray-300">
                            Mot de passe
                        </label>
                        <div className="relative">
                            <i className="fa-solid fa-lock absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"></i>
                            <input type="password" id="password" value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••" required
                                className="w-full bg-gray-900 border-2 border-gray-600 rounded-lg px-12 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors"
                            />
                        </div>
                    </div>

                    <div className="flex justify-end">
                        <a href="#" className="text-sm text-purple-400 hover:text-purple-300 transition-colors">
                            Mot de passe oublié ?
                        </a>
                    </div>

                    <button type="submit" disabled={loading}
                        className="w-full bg-linear-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 transition-colors rounded-lg px-4 py-3 font-semibold text-lg shadow-lg disabled:opacity-50"
                    >
                        {loading ? 'Connexion...' : 'Se connecter'}
                    </button>
                </form>

                <div className="mt-6 text-center">
                    <p className="text-gray-400">
                        Pas encore de compte ?{' '}
                        <Link to="/signup" className="text-purple-400 hover:text-purple-300 font-semibold transition-colors">
                            S'inscrire
                        </Link>
                    </p>
                </div>
            </div>
        </main>
    )
}

export default Login