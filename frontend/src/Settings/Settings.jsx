import { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { logout, updateProfile } from '../redux/userSlice'
import { updateMyProfile, deleteMyAccount, fetchMyProfile } from '../api/users'
import ConfirmModal from '../components/ConfirmModal'

function Settings() {
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const { email, token, userId } = useSelector((state) => state.user)
    const isLoggedIn = userId > 0 && token

    const [firstName, setFirstName] = useState('')
    const [lastName, setLastName] = useState('')
    const [bio, setBio] = useState('')
    const [location, setLocation] = useState('')
    const [saving, setSaving] = useState(false)
    const [saveMsg, setSaveMsg] = useState('')

    const [showDeleteModal, setShowDeleteModal] = useState(false)

    useEffect(() => {
        if (!isLoggedIn) return

        fetchMyProfile()
            .then((res) => {
                const p = res.data
                setFirstName(p.firstName || '')
                setLastName(p.lastName || '')
                setBio(p.bio || '')
                setLocation(p.location || '')
            })
            .catch(() => {})
    }, [isLoggedIn])

    const handleSaveProfile = async () => {
        setSaving(true)
        setSaveMsg('')
        try {
            await updateMyProfile({
                firstName,
                lastName,
                bio,
                location,
            })
            dispatch(updateProfile({
                username: `${firstName} ${lastName}`,
            }))
            setSaveMsg('Profil mis à jour !')
        } 
        
        catch (err) {
            setSaveMsg(err.response?.data?.message || 'Erreur lors de la sauvegarde')
        } 
        
        finally {
            setSaving(false)
        }
    }

    const handleDeleteAccount = async () => {
        try {
            await deleteMyAccount()
            dispatch(logout())
            navigate('/')
        } catch (err) {
            alert(err.response?.data?.message || 'Erreur lors de la suppression')
        }
    }

    if (!isLoggedIn) {
        navigate('/login')
        return null
    }

    return (
        <main className="min-h-screen bg-gray-900 text-white pt-20 pb-12">
            <div className="max-w-4xl mx-auto px-6">
                <h1 className="text-4xl font-bold mb-8">Paramètres du compte</h1>

                <div className="space-y-8">
                    <div className="bg-gray-800 rounded-xl p-8 border border-gray-700">
                        <h2 className="text-2xl font-bold mb-6">Informations personnelles</h2>
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-semibold mb-3 text-gray-300">Prénom</label>
                                    <input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)}
                                        className="w-full bg-gray-900 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500 transition-colors" />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold mb-3 text-gray-300">Nom</label>
                                    <input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)}
                                        className="w-full bg-gray-900 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500 transition-colors" />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold mb-3 text-gray-300">Bio</label>
                                <textarea value={bio} onChange={(e) => setBio(e.target.value)}
                                    placeholder="Parlez-nous un peu sur vous..." rows="4"
                                    className="w-full bg-gray-900 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors resize-none" />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold mb-3 text-gray-300">Localisation</label>
                                <input type="text" value={location} onChange={(e) => setLocation(e.target.value)}
                                    className="w-full bg-gray-900 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500 transition-colors" />
                            </div>

                            {saveMsg && (
                                <p className={`text-sm font-semibold ${saveMsg.includes('Erreur') ? 'text-red-400' : 'text-green-400'}`}>
                                    {saveMsg}
                                </p>
                            )}

                            <button onClick={handleSaveProfile} disabled={saving}
                                className="w-full bg-purple-600 hover:bg-purple-700 py-3 rounded-lg font-semibold transition-colors disabled:opacity-50">
                                {saving ? 'Enregistrement...' : 'Enregistrer les modifications'}
                            </button>
                        </div>
                    </div>

                    <div className="bg-gray-800 rounded-xl p-8 border border-gray-700">
                        <h2 className="text-2xl font-bold mb-6">Sécurité</h2>
                        <div>
                            <label className="block text-sm font-semibold mb-3 text-gray-300">Adresse e-mail</label>
                            <input type="email" value={email} disabled
                                className="w-full bg-gray-900 border border-gray-600 rounded-lg px-4 py-3 text-gray-400 cursor-not-allowed opacity-60" />
                            <p className="text-sm text-gray-400 mt-2">Votre adresse e-mail ne peut pas être modifiée</p>
                        </div>
                    </div>

                    <div className="flex justify-end">
                        <button onClick={() => setShowDeleteModal(true)}
                            className="bg-red-600/20 border-2 border-red-600 hover:bg-red-600 text-red-500 hover:text-white py-3 px-8 rounded-lg font-semibold transition-colors flex items-center gap-2">
                            <i className="fa-solid fa-trash"></i> Supprimer le compte
                        </button>
                    </div>
                </div>
            </div>

            <ConfirmModal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)}
                onConfirm={handleDeleteAccount}
                title="Supprimer le compte ?"
                message="Êtes-vous sûr de vouloir supprimer votre compte ? Cette action est irréversible."
                confirmText="Oui, supprimer" cancelText="Annuler" type="danger" />
        </main>
    )
}

export default Settings