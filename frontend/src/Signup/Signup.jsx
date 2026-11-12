import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { login } from '../redux/userSlice'
import { registerUser, fetchMyProfile } from '../api/users'

function Signup() {
    const [formData, setFormData] = useState({
        nom: '',
        prenom: '',
        email: '',
        password: '',
        confirmPassword: ''
    })
    const [isError, setError] = useState(false)
    const [errorMsg, setErrorMsg] = useState('')

    const navigate = useNavigate()
    const dispatch = useDispatch()

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        })
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError(false)
        setErrorMsg('')

        if (formData.password !== formData.confirmPassword) {
            setError(true)
            setErrorMsg('Les mots de passe ne correspondent pas')
            return
        }

        try {
            const res = await registerUser({
                firstName: formData.prenom,
                lastName: formData.nom,
                email: formData.email,
                password: formData.password,
            })

            const { token, userId, email, role } = res.data

            localStorage.setItem('festify_user', JSON.stringify({ token, userId }))

            let profilePictureId = 1
            try {
                const profileRes = await fetchMyProfile()
                profilePictureId = profileRes.data.profilePicture
                    ? parseInt(profileRes.data.profilePicture)
                    : 1
            } catch {

            }

            dispatch(login({
                username: `${formData.prenom} ${formData.nom}`,
                nom: formData.nom,
                prenom: formData.prenom,
                email,
                userId,
                profilePictureId,
                role: role || 'USER',
                token,
            }))

            navigate('/profil')
        } catch (err) {
            setError(true)
            setErrorMsg(err.response?.data?.message || 'Un utilisateur avec ces informations existe déjà.')
        }
    }

    return (
        <main className="flex justify-center items-center min-h-[calc(100vh-80px)] bg-gray-900 text-white py-10 pt-40">
            <div className="w-full max-w-md bg-gray-800 rounded-xl shadow-2xl p-8 border-2 border-gray-700">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold mb-2">Créer un compte</h1>
                    <p className="text-gray-400">Rejoignez Festify et découvrez des événements incroyables</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label htmlFor="prenom" className="block text-sm font-semibold mb-2 text-gray-300">Prénom</label>
                            <input type="text" id="prenom" name="prenom" value={formData.prenom}
                                onChange={handleChange} placeholder="Jean" required
                                className="w-full bg-gray-900 border-2 border-gray-600 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors"
                            />
                        </div>
                        <div>
                            <label htmlFor="nom" className="block text-sm font-semibold mb-2 text-gray-300">Nom</label>
                            <input type="text" id="nom" name="nom" value={formData.nom}
                                onChange={handleChange} placeholder="Dupont" required
                                className="w-full bg-gray-900 border-2 border-gray-600 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors"
                            />
                        </div>
                    </div>

                    <div>
                        <label htmlFor="email" className="block text-sm font-semibold mb-2 text-gray-300">Adresse email</label>
                        <div className="relative">
                            <i className="fa-solid fa-envelope absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"></i>
                            <input type="email" id="email" name="email" value={formData.email}
                                onChange={handleChange} placeholder="votre@email.com" required
                                className="w-full bg-gray-900 border-2 border-gray-600 rounded-lg px-12 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors"
                            />
                        </div>
                    </div>

                    <div>
                        <label htmlFor="password" className="block text-sm font-semibold mb-2 text-gray-300">Mot de passe</label>
                        <div className="relative">
                            <i className="fa-solid fa-lock absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"></i>
                            <input type="password" id="password" name="password" value={formData.password}
                                onChange={handleChange} placeholder="••••••••" required minLength="8"
                                className="w-full bg-gray-900 border-2 border-gray-600 rounded-lg px-12 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors"
                            />
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Minimum 8 caractères</p>
                    </div>

                    <div>
                        <label htmlFor="confirmPassword" className="block text-sm font-semibold mb-2 text-gray-300">Confirmer le mot de passe</label>
                        <div className="relative">
                            <i className="fa-solid fa-lock absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"></i>
                            <input type="password" id="confirmPassword" name="confirmPassword"
                                value={formData.confirmPassword} onChange={handleChange}
                                placeholder="••••••••" required
                                className="w-full bg-gray-900 border-2 border-gray-600 rounded-lg px-12 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors"
                            />
                        </div>
                    </div>

                    {isError && (
                        <p className="text-red-500 font-semibold">{errorMsg}</p>
                    )}

                    <div className="flex items-start gap-2">
                        <input type="checkbox" id="terms" required className="mt-1 w-4 h-4 accent-purple-600" />
                        <label htmlFor="terms" className="text-sm text-gray-400">
                            J'accepte les{' '}
                            <a href="#" className="text-purple-400 hover:text-purple-300">conditions d'utilisation</a>
                            {' '}et la{' '}
                            <a href="#" className="text-purple-400 hover:text-purple-300">politique de confidentialité</a>
                        </label>
                    </div>

                    <button type="submit"
                        className="w-full bg-linear-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 transition-colors rounded-lg px-4 py-3 font-semibold text-lg shadow-lg"
                    >
                        Créer mon compte
                    </button>
                </form>

                <div className="mt-6 text-center">
                    <p className="text-gray-400">
                        Vous avez déjà un compte ?{' '}
                        <Link to="/login" className="text-purple-400 hover:text-purple-300 font-semibold transition-colors">Se connecter</Link>
                    </p>
                </div>
            </div>
        </main>
    )
}

export default Signup