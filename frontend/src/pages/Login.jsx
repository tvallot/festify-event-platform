import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { login } from '../redux/userSlice'
import { loginUser } from '../api/users'
import { buildSession } from '../utils/session'
import { errorMessage } from '../utils/format'

const inputClass = 'w-full bg-gray-900 border-2 border-gray-600 rounded-lg px-12 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors'

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
            dispatch(login(await buildSession(res.data)))
            navigate('/profile')
        } catch (err) {
            setError(err.response?.status === 401 ? 'Wrong email or password.' : errorMessage(err, 'Could not reach the server.'))
        } finally {
            setLoading(false)
        }
    }

    return (
        <main className="flex justify-center items-center min-h-screen bg-gray-900 text-white px-4 pt-20">
            <div className="w-full max-w-md bg-gray-800 rounded-xl shadow-2xl p-8 border-2 border-gray-700">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold mb-2">Log in</h1>
                    <p className="text-gray-400">Welcome back to Festify</p>
                </div>

                {error && (
                    <div className="mb-6 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400 text-sm text-center">{error}</div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="email" className="block text-sm font-semibold mb-2 text-gray-300">Email</label>
                        <div className="relative">
                            <i className="fa-solid fa-envelope absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"></i>
                            <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)}
                                placeholder="you@example.com" required autoComplete="email" className={inputClass} />
                        </div>
                    </div>

                    <div>
                        <label htmlFor="password" className="block text-sm font-semibold mb-2 text-gray-300">Password</label>
                        <div className="relative">
                            <i className="fa-solid fa-lock absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"></i>
                            <input type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••" required autoComplete="current-password" className={inputClass} />
                        </div>
                    </div>

                    <button type="submit" disabled={loading}
                        className="cursor-pointer w-full bg-linear-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 transition-colors rounded-lg px-4 py-3 font-semibold text-lg shadow-lg disabled:opacity-50">
                        {loading ? 'Logging in...' : 'Log in'}
                    </button>
                </form>

                <p className="mt-6 text-center text-gray-400">
                    No account yet?{' '}
                    <Link to="/signup" className="text-purple-400 hover:text-purple-300 font-semibold transition-colors">Sign up</Link>
                </p>
            </div>
        </main>
    )
}

export default Login
