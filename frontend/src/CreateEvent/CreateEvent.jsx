import { useState, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { createEvent } from '../api/events'

import pfp1 from '../assets/profils/1.png'
import pfp2 from '../assets/profils/2.png'
import pfp3 from '../assets/profils/3.png'
import pfp4 from '../assets/profils/4.png'
import pfp5 from '../assets/profils/5.png'
import pfp6 from '../assets/profils/6.png'

const profilePictures = { 1: pfp1, 2: pfp2, 3: pfp3, 4: pfp4, 5: pfp5, 6: pfp6 }

const categoriesList = [
    { label: 'Tech', emoji: '💻' },
    { label: 'Musique', emoji: '🎵' },
    { label: 'Arts', emoji: '🎨' },
    { label: 'Sport', emoji: '⚡' },
    { label: 'Culture', emoji: '🎭' },
    { label: 'Loisirs', emoji: '🎯' },
    { label: 'Food', emoji: '🍕' },
    { label: 'Networking', emoji: '🤝' },
]

function CreateEvent() {
    const navigate = useNavigate()
    const { username, userId, profilePictureId, token } = useSelector((state) => state.user)
    const isLoggedIn = userId > 0 && token

    if (!isLoggedIn) {
        return (
            <main className="min-h-screen bg-gray-950 flex flex-col items-center justify-center px-6">
                <div className="flex flex-col items-center text-center">
                    <div className="w-14 h-14 bg-purple-600 rounded-xl flex items-center justify-center mb-6">
                        <i className="fa-solid fa-sparkles text-white text-xl"></i>
                    </div>
                    <h1 className="text-white text-2xl font-bold mb-3">Connectez-vous pour créer</h1>
                    <p className="text-gray-500 text-sm mb-6">Vous devez être connecté pour créer un événement.</p>
                    <Link to="/login" className="bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 transition-colors rounded-lg px-8 py-3 text-white font-medium">
                        Se connecter
                    </Link>
                </div>
            </main>
        )
    }

    return <CreerForm username={username} profilePictureId={profilePictureId} navigate={navigate} />
}

function CreerForm({ username, profilePictureId, navigate }) {
    const [title, setTitle] = useState('')
    const [category, setCategory] = useState('')
    const [date, setDate] = useState('')
    const [time, setTime] = useState('')
    const [showEndTime, setShowEndTime] = useState(false)
    const [endTime, setEndTime] = useState('')
    const [locationType, setLocationType] = useState('physical')
    const [address, setAddress] = useState('')
    const [virtualLink, setVirtualLink] = useState('')
    const [description, setDescription] = useState('')
    const [pricing, setPricing] = useState('free')
    const [price, setPrice] = useState('')
    const [limitParticipants, setLimitParticipants] = useState(false)
    const [maxParticipants, setMaxParticipants] = useState('')
    const [coverImage, setCoverImage] = useState(null)
    const [coverPreview, setCoverPreview] = useState(null)
    const [submitting, setSubmitting] = useState(false)
    const fileInputRef = useRef(null)

    const handleImageUpload = (e) => {
        const file = e.target.files[0]
        if (file) {
            setCoverImage(file)
            const reader = new FileReader()
            reader.onloadend = () => setCoverPreview(reader.result)
            reader.readAsDataURL(file)
        }
    }

    const handleSubmit = async () => {
        if (!title || !category || !date) {
            alert('Veuillez remplir au moins le titre, la catégorie et la date.')
            return
        }

        setSubmitting(true)
        try {
            const eventData = {
                title,
                description,
                startDate: date,
                endDate: date,
                location: locationType === 'physical' ? address : virtualLink,
                category,
                isFree: pricing === 'free',
                price: pricing === 'paid' && price ? parseFloat(price) : null,
                capacity: limitParticipants && maxParticipants ? parseInt(maxParticipants) : null,
                thumbnailUrl: coverPreview || null,
            }

            const res = await createEvent(eventData)
            navigate(`/events/${res.data.id}`)
        } 
        
        catch (err) {
            alert(err.response?.data?.message || "Erreur lors de la création de l'événement")
        } 
        
        finally {
            setSubmitting(false)
        }
    }

    const displayName = title || "Nom de l'événement"
    const displayDate = date
        ? new Date(date + 'T00:00').toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })
        : 'Date à définir'
    const displayTime = time ? time.replace(':', 'h') : ''
    const displayAddress = address || virtualLink || 'Adresse à définir'
    const displayPrice = pricing === 'free' ? 'Gratuit' : price ? `${price}€` : 'Gratuit'
    const shortName = username.split(' ').map((n, i) => (i === 0 ? n : n.charAt(0) + '.')).join(' ')

    return (
        <main className="min-h-screen bg-gray-950 px-6 md:px-12 lg:px-20 pb-20 pt-50">
            <div className="max-w-[1200px] mx-auto">
                <Link to="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm mb-8">
                    <i className="fa-solid fa-arrow-left text-xs"></i> Retour à l'accueil
                </Link>
                <div className="flex justify-between items-start mb-10">
                    <div>
                        <h1 className="text-white text-3xl lg:text-4xl font-bold flex items-center gap-3">
                            Créons votre événement <span className="text-2xl">🚀</span>
                        </h1>
                        <p className="text-gray-500 mt-2">Remplissez les informations ci-dessous pour créer un événement mémorable.</p>
                    </div>
                    <p className="hidden lg:block text-gray-500 text-xs font-semibold tracking-widest uppercase">Aperçu en direct</p>
                </div>

                <div className="flex gap-12 items-start">
                    <div className="flex-1 min-w-0">
                        <div className="mb-10">
                            <p className="text-white font-semibold text-sm mb-3">Visuel de couverture</p>
                            <div onClick={() => fileInputRef.current?.click()}
                                className="cursor-pointer border-2 border-dashed border-gray-700 rounded-2xl h-52 flex flex-col items-center justify-center hover:border-purple-500/50 transition-colors overflow-hidden">
                                {coverPreview ? (
                                    <img src={coverPreview} alt="Cover" className="w-full h-full object-cover" />
                                ) : (
                                    <>
                                        <div className="w-12 h-12 bg-gray-800 rounded-xl flex items-center justify-center mb-3">
                                            <i className="fa-regular fa-image text-gray-500 text-lg"></i>
                                        </div>
                                        <p className="text-gray-400 text-sm font-medium">Cliquez pour télécharger une image</p>
                                        <p className="text-gray-600 text-xs mt-1">PNG, JPG jusqu'à 10 Mo</p>
                                    </>
                                )}
                            </div>
                            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                        </div>

                        <div className="mb-10">
                            <h2 className="text-white font-semibold mb-4">Les bases</h2>
                            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)}
                                placeholder="Ex : Soirée Ciné..."
                                className="w-full bg-transparent text-purple-400 text-2xl font-bold placeholder-purple-400/40 outline-none mb-6" />

                            <p className="text-gray-400 text-xs mb-2">Catégorie</p>
                            <div className="flex flex-wrap gap-2 mb-6">
                                {categoriesList.map((cat) => (
                                    <button key={cat.label} onClick={() => setCategory(cat.label)}
                                        className={`cursor-pointer flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-sm font-medium transition-colors ${
                                            category === cat.label ? 'bg-purple-600 text-white' : 'bg-gray-800/80 text-gray-300 border border-gray-700 hover:bg-gray-700'
                                        }`}>
                                        <span className="text-xs">{cat.emoji}</span>{cat.label}
                                    </button>
                                ))}
                            </div>

                            <p className="text-gray-400 text-xs mb-2">Date et heure</p>
                            <div className="flex gap-3 mb-2">
                                <div className="relative flex-1">
                                    <i className="fa-regular fa-calendar absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm"></i>
                                    <input type="date" value={date} onChange={(e) => setDate(e.target.value)}
                                        className="w-full bg-gray-800/80 border border-gray-700 rounded-lg pl-10 pr-4 py-3 text-sm text-white outline-none focus:border-purple-500 transition-colors [color-scheme:dark]" />
                                </div>
                                <div className="relative flex-1">
                                    <i className="fa-regular fa-clock absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm"></i>
                                    <input type="time" value={time} onChange={(e) => setTime(e.target.value)}
                                        className="w-full bg-gray-800/80 border border-gray-700 rounded-lg pl-10 pr-4 py-3 text-sm text-white outline-none focus:border-purple-500 transition-colors [color-scheme:dark]" />
                                </div>
                            </div>

                            {!showEndTime ? (
                                <button onClick={() => setShowEndTime(true)} className="cursor-pointer text-purple-400 text-sm hover:text-purple-300 transition-colors mb-6">
                                    + Ajouter une heure de fin
                                </button>
                            ) : (
                                <div className="relative w-1/2 mb-6 mt-2">
                                    <i className="fa-regular fa-clock absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm"></i>
                                    <input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)}
                                        className="w-full bg-gray-800/80 border border-gray-700 rounded-lg pl-10 pr-4 py-3 text-sm text-white outline-none focus:border-purple-500 transition-colors [color-scheme:dark]" />
                                </div>
                            )}
                        </div>

                        <div className="mb-10">
                            <h2 className="text-white font-semibold mb-4">Lieu & accessibilité</h2>
                            <div className="flex bg-gray-800/80 border border-gray-700 rounded-lg p-1 mb-4">
                                <button onClick={() => setLocationType('physical')}
                                    className={`cursor-pointer flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium rounded-md transition-colors ${locationType === 'physical' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-white'}`}>
                                    <i className="fa-solid fa-location-dot text-xs"></i> Lieu physique
                                </button>
                                <button onClick={() => setLocationType('virtual')}
                                    className={`cursor-pointer flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium rounded-md transition-colors ${locationType === 'virtual' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-white'}`}>
                                    <i className="fa-solid fa-video text-xs"></i> Lien virtuel
                                </button>
                            </div>
                            {locationType === 'physical' ? (
                                <div className="relative">
                                    <i className="fa-solid fa-location-dot absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm"></i>
                                    <input type="text" value={address} onChange={(e) => setAddress(e.target.value)}
                                        placeholder="Rechercher une adresse..."
                                        className="w-full bg-gray-800/80 border border-gray-700 rounded-lg pl-10 pr-4 py-3 text-sm text-white placeholder-gray-500 outline-none focus:border-purple-500 transition-colors" />
                                </div>
                            ) : (
                                <div className="relative">
                                    <i className="fa-solid fa-link absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm"></i>
                                    <input type="url" value={virtualLink} onChange={(e) => setVirtualLink(e.target.value)}
                                        placeholder="https://meet.google.com/..."
                                        className="w-full bg-gray-800/80 border border-gray-700 rounded-lg pl-10 pr-4 py-3 text-sm text-white placeholder-gray-500 outline-none focus:border-purple-500 transition-colors" />
                                </div>
                            )}
                        </div>

                        <div className="mb-10">
                            <h2 className="text-white font-semibold mb-4">Description</h2>
                            <textarea value={description} onChange={(e) => setDescription(e.target.value)}
                                placeholder="Décrivez votre événement en détail..."
                                rows={6}
                                className="w-full bg-gray-800/80 border border-gray-700 rounded-lg px-4 py-3 text-sm text-white placeholder-gray-500 outline-none focus:border-purple-500 transition-colors resize-none" />
                        </div>

                        <div className="mb-10">
                            <h2 className="text-white font-semibold mb-4">Paramètres</h2>

                            <p className="text-gray-400 text-xs mb-2">Billetterie</p>
                            <div className="flex bg-gray-800/80 border border-gray-700 rounded-lg p-1 mb-4">
                                <button onClick={() => setPricing('free')}
                                    className={`cursor-pointer flex-1 py-2.5 text-sm font-medium rounded-md transition-colors ${pricing === 'free' ? 'bg-green-600 text-white' : 'text-gray-400 hover:text-white'}`}>
                                    Gratuit
                                </button>
                                <button onClick={() => setPricing('paid')}
                                    className={`cursor-pointer flex-1 py-2.5 text-sm font-medium rounded-md transition-colors ${pricing === 'paid' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-white'}`}>
                                    Payant
                                </button>
                            </div>

                            {pricing === 'paid' && (
                                <div className="relative mb-4">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium">€</span>
                                    <input
                                        type="number"
                                        value={price}
                                        onChange={(e) => setPrice(e.target.value)}
                                        min="0.01"
                                        step="0.01"
                                        placeholder="Prix en euros"
                                        className="w-full bg-gray-800/80 border border-gray-700 rounded-lg pl-8 pr-4 py-3 text-sm text-white placeholder-gray-500 outline-none focus:border-purple-500 transition-colors"
                                    />
                                </div>
                            )}

                            <div className="flex items-center justify-between py-3">
                                <span className="text-gray-300 text-sm">Limiter le nombre de participants</span>
                                <button onClick={() => setLimitParticipants(!limitParticipants)}
                                    className={`cursor-pointer w-11 h-6 rounded-full transition-colors relative ${limitParticipants ? 'bg-purple-600' : 'bg-gray-700'}`}>
                                    <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform ${limitParticipants ? 'translate-x-5.5' : 'translate-x-0.5'}`} />
                                </button>
                            </div>
                            {limitParticipants && (
                                <input type="number" value={maxParticipants} onChange={(e) => setMaxParticipants(e.target.value)}
                                    placeholder="Nombre max de participants" min="1"
                                    className="w-full bg-gray-800/80 border border-gray-700 rounded-lg px-4 py-3 text-sm text-white placeholder-gray-500 outline-none focus:border-purple-500 transition-colors mt-2" />
                            )}
                        </div>

                        <button onClick={handleSubmit} disabled={submitting}
                            className="cursor-pointer w-full sm:w-auto bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 transition-colors rounded-xl px-10 py-3.5 text-white font-semibold text-base disabled:opacity-50">
                            {submitting ? 'Création...' : "Créer l'événement"}
                        </button>
                    </div>

                    <div className="hidden lg:block sticky top-28 shrink-0">
                        <div className="relative w-72 bg-gray-900 rounded-[2rem] border-2 border-gray-700/50 shadow-2xl shadow-purple-500/10 overflow-hidden">
                            <div className="absolute top-4 right-4 z-10">
                                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${displayPrice === 'Gratuit' ? 'bg-green-500/90 text-white' : 'bg-purple-500/90 text-white'}`}>
                                    {displayPrice}
                                </span>
                            </div>
                            <div className="relative h-44 bg-gray-800 overflow-hidden">
                                {coverPreview ? (
                                    <>
                                        <div className="absolute inset-0 bg-black/50 z-[1]" />
                                        <img src={coverPreview} alt="Cover" className="w-full h-full object-cover" />
                                    </>
                                ) : (
                                    <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
                                        <i className="fa-regular fa-image text-gray-700 text-3xl"></i>
                                    </div>
                                )}
                                <div className="absolute inset-0 z-[2] flex flex-col items-center justify-center text-center px-4">
                                    <p className="text-white text-xl font-bold leading-tight drop-shadow-lg">{displayName}</p>
                                </div>
                            </div>
                            <div className="p-5 flex flex-col gap-3">
                                <div className="flex items-center gap-3">
                                    <div className="bg-purple-500/20 p-2.5 rounded-lg"><i className="fa-regular fa-calendar text-purple-400 text-sm"></i></div>
                                    <p className="text-gray-400 text-sm font-medium">{displayDate}{displayTime ? ` • ${displayTime}` : ''}</p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="bg-pink-500/20 p-2.5 rounded-lg"><i className="fa-solid fa-location-dot text-pink-400 text-sm"></i></div>
                                    <p className="text-gray-400 text-sm font-medium">{displayAddress}</p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <img src={profilePictures[profilePictureId] || profilePictures[1]} alt={username} className="w-9 h-9 rounded-full border-2 border-gray-700" />
                                    <div>
                                        <p className="text-white text-sm font-medium">{shortName}</p>
                                        <p className="text-gray-500 text-xs">Organisateur</p>
                                    </div>
                                </div>
                                <button className="cursor-pointer mt-2 w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold py-2.5 rounded-xl text-sm">Participer</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    )
}

export default CreateEvent