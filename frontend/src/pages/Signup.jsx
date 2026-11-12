import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { login } from '../redux/userSlice'
import { registerUser } from '../api/users'
import { buildSession } from '../utils/session'
import { errorMessage } from '../utils/format'

const MIN_PASSWORD_LENGTH = 8
const inputClass = 'w-full bg-gray-900 border-2 border-gray-600 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors'

function Signup() {
    const [form, setForm] = useState({ firstName: '', lastName: '', email: '', password: '', confirmPassword: '' })
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const navigate = useNavigate()
    const dispatch = useDispatch()

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')

        if (form.password !== form.confirmPassword) {
            setError('Passwords do not match.')
            return
        }

        setLoading(true)
        try {
            const res = await registerUser({
                firstName: form.firstName,
                lastName: form.lastName,
                email: form.email,
                password: form.password,
            })
            dispatch(login(await buildSession(res.data)))
            navigate('/profile')
        } catch (err) {
            setError(errorMessage(err, 'Could not create the account.'))
        } finally {
            setLoading(false)
        }
    }

    return (
        <main className="flex justify-center items-center min-h-screen bg-gray-900 text-white px-4 py-10 pt-32">
            <div className="w-full max-w-md bg-gray-800 rounded-xl shadow-2xl p-8 border-2 border-gray-700">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold mb-2">Create an account</h1>
                    <p className="text-gray-400">Join Festify and start meeting people</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="grid grid-cols-2 gap-3">
                        <Field label="First name" name="firstName" value={form.firstName} onChange={handleChange} placeholder="Jane" autoComplete="given-name" />
                        <Field label="Last name" name="lastName" value={form.lastName} onChange={handleChange} placeholder="Doe" autoComplete="family-name" />
                    </div>

                    <Field label="Email" name="email" type="email" value={form.email} onChange={handleChange} placeholder="you@example.com" autoComplete="email" />

                    <div>
                        <Field label="Password" name="password" type="password" value={form.password} onChange={handleChange}
                            placeholder="••••••••" minLength={MIN_PASSWORD_LENGTH} autoComplete="new-password" />
                        <p className="text-xs text-gray-500 mt-1">At least {MIN_PASSWORD_LENGTH} characters</p>
                    </div>

                    <Field label="Confirm password" name="confirmPassword" type="password" value={form.confirmPassword}
                        onChange={handleChange} placeholder="••••••••" autoComplete="new-password" />

                    {error && <p className="text-red-400 text-sm font-semibold">{error}</p>}

                    <button type="submit" disabled={loading}
                        className="cursor-pointer w-full bg-linear-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 transition-colors rounded-lg px-4 py-3 font-semibold text-lg shadow-lg disabled:opacity-50">
                        {loading ? 'Creating account...' : 'Create account'}
                    </button>
                </form>

                <p className="mt-6 text-center text-gray-400">
                    Already have an account?{' '}
                    <Link to="/login" className="text-purple-400 hover:text-purple-300 font-semibold transition-colors">Log in</Link>
                </p>
            </div>
        </main>
    )
}

function Field({ label, name, type = 'text', ...props }) {
    return (
        <div>
            <label htmlFor={name} className="block text-sm font-semibold mb-2 text-gray-300">{label}</label>
            <input id={name} name={name} type={type} required className={inputClass} {...props} />
        </div>
    )
}

export default Signup
