import { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { logout, updateProfile, selectIsLoggedIn } from '../redux/userSlice'
import { updateMyProfile, deleteMyAccount, fetchMyProfile } from '../api/users'
import { avatars } from '../utils/avatars'
import { errorMessage } from '../utils/format'
import ConfirmModal from '../components/ConfirmModal'
import LoginRequired from '../components/LoginRequired'

const inputClass = 'w-full bg-gray-900 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors'

function Settings() {
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const email = useSelector((state) => state.user.email)
    const isLoggedIn = useSelector(selectIsLoggedIn)

    const [form, setForm] = useState({ firstName: '', lastName: '', bio: '', location: '', profilePicture: '1' })
    const [saving, setSaving] = useState(false)
    const [status, setStatus] = useState(null)
    const [showDeleteModal, setShowDeleteModal] = useState(false)

    useEffect(() => {
        if (!isLoggedIn) return
        fetchMyProfile()
            .then(({ data }) => setForm({
                firstName: data.firstName || '',
                lastName: data.lastName || '',
                bio: data.bio || '',
                location: data.location || '',
                profilePicture: data.profilePicture || '1',
            }))
            .catch(() => setStatus({ ok: false, message: 'Could not load your profile.' }))
    }, [isLoggedIn])

    if (!isLoggedIn) return <LoginRequired />

    const set = (field) => (e) => setForm({ ...form, [field]: e.target.value })

    const handleSave = async (e) => {
        e.preventDefault()
        setSaving(true)
        setStatus(null)
        try {
            await updateMyProfile(form)
            dispatch(updateProfile({
                firstName: form.firstName,
                lastName: form.lastName,
                username: `${form.firstName} ${form.lastName}`.trim(),
                profilePictureId: Number(form.profilePicture),
            }))
            setStatus({ ok: true, message: 'Profile updated.' })
        } catch (err) {
            setStatus({ ok: false, message: errorMessage(err, 'Could not save your profile.') })
        } finally {
            setSaving(false)
        }
    }

    const handleDeleteAccount = async () => {
        try {
            await deleteMyAccount()
            dispatch(logout())
            navigate('/')
        } catch (err) {
            setStatus({ ok: false, message: errorMessage(err, 'Could not delete your account.') })
        }
    }

    return (
        <main className="min-h-screen bg-gray-900 text-white pt-28 pb-12">
            <div className="max-w-4xl mx-auto px-6">
                <h1 className="text-4xl font-bold mb-8">Account settings</h1>

                <div className="space-y-8">
                    <form onSubmit={handleSave} className="bg-gray-800 rounded-xl p-8 border border-gray-700 space-y-6">
                        <h2 className="text-2xl font-bold">Personal information</h2>

                        <div>
                            <p className="block text-sm font-semibold mb-3 text-gray-300">Avatar</p>
                            <div className="flex flex-wrap gap-3">
                                {Object.entries(avatars).map(([id, src]) => (
                                    <button type="button" key={id} onClick={() => setForm({ ...form, profilePicture: id })}
                                        aria-label={`Avatar ${id}`} aria-pressed={form.profilePicture === id}
                                        className={`cursor-pointer w-14 h-14 rounded-full overflow-hidden ring-2 transition-all ${
                                            form.profilePicture === id ? 'ring-purple-500' : 'ring-transparent hover:ring-gray-500'
                                        }`}>
                                        <img src={src} alt="" className="w-full h-full object-cover" />
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Field label="First name" value={form.firstName} onChange={set('firstName')} />
                            <Field label="Last name" value={form.lastName} onChange={set('lastName')} />
                        </div>

                        <label className="block">
                            <span className="block text-sm font-semibold mb-3 text-gray-300">Bio</span>
                            <textarea value={form.bio} onChange={set('bio')} maxLength={200} rows="4"
                                placeholder="A few words about you..." className={`${inputClass} resize-none`} />
                        </label>

                        <Field label="Location" value={form.location} onChange={set('location')} />

                        {status && (
                            <p className={`text-sm font-semibold ${status.ok ? 'text-green-400' : 'text-red-400'}`}>{status.message}</p>
                        )}

                        <button type="submit" disabled={saving}
                            className="cursor-pointer w-full bg-purple-600 hover:bg-purple-700 py-3 rounded-lg font-semibold transition-colors disabled:opacity-50">
                            {saving ? 'Saving...' : 'Save changes'}
                        </button>
                    </form>

                    <section className="bg-gray-800 rounded-xl p-8 border border-gray-700">
                        <h2 className="text-2xl font-bold mb-6">Account</h2>
                        <label className="block">
                            <span className="block text-sm font-semibold mb-3 text-gray-300">Email</span>
                            <input type="email" value={email} disabled className={`${inputClass} text-gray-400 cursor-not-allowed opacity-60`} />
                        </label>
                        <p className="text-sm text-gray-400 mt-2">Your email address cannot be changed.</p>
                    </section>

                    <div className="flex justify-end">
                        <button onClick={() => setShowDeleteModal(true)}
                            className="cursor-pointer bg-red-600/20 border-2 border-red-600 hover:bg-red-600 text-red-500 hover:text-white py-3 px-8 rounded-lg font-semibold transition-colors flex items-center gap-2">
                            <i className="fa-solid fa-trash"></i> Delete account
                        </button>
                    </div>
                </div>
            </div>

            <ConfirmModal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)} onConfirm={handleDeleteAccount}
                title="Delete your account?"
                message="Your account, registrations and favorites will be permanently deleted."
                confirmText="Delete" type="danger" />
        </main>
    )
}

function Field({ label, ...props }) {
    return (
        <label className="block">
            <span className="block text-sm font-semibold mb-3 text-gray-300">{label}</span>
            <input type="text" className={inputClass} {...props} />
        </label>
    )
}

export default Settings
