import { useRef, useState } from 'react'
import { getAvatar } from '../utils/avatars'
import { formatDate } from '../utils/format'

const CATEGORIES = [
    { label: 'Tech', emoji: '💻' },
    { label: 'Music', emoji: '🎵' },
    { label: 'Arts', emoji: '🎨' },
    { label: 'Sport', emoji: '⚡' },
    { label: 'Culture', emoji: '🎭' },
    { label: 'Leisure', emoji: '🎯' },
    { label: 'Food', emoji: '🍕' },
    { label: 'Networking', emoji: '🤝' },
]

const MAX_IMAGE_SIZE = 2 * 1024 * 1024

const EMPTY_EVENT = {
    title: '',
    category: '',
    startDate: '',
    endDate: '',
    location: '',
    description: '',
    isFree: true,
    capacity: null,
    thumbnailUrl: null,
}

const inputClass = 'w-full bg-gray-800/80 border border-gray-700 rounded-lg px-4 py-3 text-sm text-white placeholder-gray-500 outline-none focus:border-purple-500 transition-colors'

/** Form used to create and edit an event, with a live preview card on large screens. */
function EventForm({ initialEvent, onSubmit, submitLabel, organizer }) {
    const [form, setForm] = useState({ ...EMPTY_EVENT, ...initialEvent })
    const [limitCapacity, setLimitCapacity] = useState(Boolean(initialEvent?.capacity))
    const [error, setError] = useState('')
    const [submitting, setSubmitting] = useState(false)
    const fileInputRef = useRef(null)

    const set = (field) => (value) => setForm((prev) => ({ ...prev, [field]: value }))

    const handleImageUpload = (e) => {
        const file = e.target.files[0]
        if (!file) return
        if (file.size > MAX_IMAGE_SIZE) {
            setError('The cover image must be smaller than 2 MB.')
            return
        }
        const reader = new FileReader()
        reader.onloadend = () => set('thumbnailUrl')(reader.result)
        reader.readAsDataURL(file)
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')

        if (!form.title || !form.category || !form.startDate) {
            setError('Please fill in at least the title, category and start date.')
            return
        }
        if (form.endDate && form.endDate < form.startDate) {
            setError('The end date cannot be before the start date.')
            return
        }

        setSubmitting(true)
        try {
            await onSubmit({
                ...form,
                endDate: form.endDate || form.startDate,
                capacity: limitCapacity && form.capacity ? Number(form.capacity) : null,
            })
        } catch (err) {
            setError(err.message)
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <div className="flex gap-12 items-start">
            <form onSubmit={handleSubmit} className="flex-1 min-w-0">
                <Section title="Cover image">
                    <button type="button" onClick={() => fileInputRef.current?.click()}
                        className="cursor-pointer w-full border-2 border-dashed border-gray-700 rounded-2xl h-52 flex flex-col items-center justify-center hover:border-purple-500/50 transition-colors overflow-hidden">
                        {form.thumbnailUrl ? (
                            <img src={form.thumbnailUrl} alt="Cover preview" className="w-full h-full object-cover" />
                        ) : (
                            <>
                                <span className="w-12 h-12 bg-gray-800 rounded-xl flex items-center justify-center mb-3">
                                    <i className="fa-regular fa-image text-gray-500 text-lg"></i>
                                </span>
                                <span className="text-gray-400 text-sm font-medium">Click to upload an image</span>
                                <span className="text-gray-600 text-xs mt-1">PNG or JPG, up to 2 MB</span>
                            </>
                        )}
                    </button>
                    <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                </Section>

                <Section title="Basics">
                    <input type="text" value={form.title} onChange={(e) => set('title')(e.target.value)}
                        placeholder="Event name, e.g. Movie night" aria-label="Event name"
                        className="w-full bg-transparent text-purple-400 text-2xl font-bold placeholder-purple-400/40 outline-none mb-6" />

                    <Label>Category</Label>
                    <div className="flex flex-wrap gap-2 mb-6">
                        {CATEGORIES.map((cat) => (
                            <button type="button" key={cat.label} onClick={() => set('category')(cat.label)}
                                className={`cursor-pointer flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-sm font-medium transition-colors ${
                                    form.category === cat.label ? 'bg-purple-600 text-white' : 'bg-gray-800/80 text-gray-300 border border-gray-700 hover:bg-gray-700'
                                }`}>
                                <span className="text-xs">{cat.emoji}</span>{cat.label}
                            </button>
                        ))}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                            <Label>Start date</Label>
                            <input type="date" value={form.startDate} onChange={(e) => set('startDate')(e.target.value)}
                                className={`${inputClass} [color-scheme:dark]`} />
                        </div>
                        <div>
                            <Label>End date (optional)</Label>
                            <input type="date" value={form.endDate || ''} min={form.startDate} onChange={(e) => set('endDate')(e.target.value)}
                                className={`${inputClass} [color-scheme:dark]`} />
                        </div>
                    </div>
                </Section>

                <Section title="Location">
                    <div className="relative">
                        <i className="fa-solid fa-location-dot absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm"></i>
                        <input type="text" value={form.location || ''} onChange={(e) => set('location')(e.target.value)}
                            placeholder="Address, city or meeting link" aria-label="Location"
                            className={`${inputClass} pl-10`} />
                    </div>
                </Section>

                <Section title="Description">
                    <textarea value={form.description || ''} onChange={(e) => set('description')(e.target.value)}
                        placeholder="Tell people what to expect..." rows={6} aria-label="Description"
                        className={`${inputClass} resize-none`} />
                </Section>

                <Section title="Tickets">
                    <div className="flex bg-gray-800/80 border border-gray-700 rounded-lg p-1 mb-4">
                        {[{ value: true, label: 'Free' }, { value: false, label: 'Paid' }].map((opt) => (
                            <button type="button" key={opt.label} onClick={() => set('isFree')(opt.value)}
                                className={`cursor-pointer flex-1 py-2.5 text-sm font-medium rounded-md transition-colors ${
                                    form.isFree === opt.value ? (opt.value ? 'bg-green-600' : 'bg-purple-600') + ' text-white' : 'text-gray-400 hover:text-white'
                                }`}>
                                {opt.label}
                            </button>
                        ))}
                    </div>

                    <div className="flex items-center justify-between py-3">
                        <span className="text-gray-300 text-sm">Limit the number of participants</span>
                        <button type="button" role="switch" aria-checked={limitCapacity} onClick={() => setLimitCapacity(!limitCapacity)}
                            className={`cursor-pointer w-11 h-6 rounded-full transition-colors relative ${limitCapacity ? 'bg-purple-600' : 'bg-gray-700'}`}>
                            <span className={`absolute top-0.5 left-0 w-5 h-5 bg-white rounded-full transition-transform ${limitCapacity ? 'translate-x-5.5' : 'translate-x-0.5'}`} />
                        </button>
                    </div>
                    {limitCapacity && (
                        <input type="number" value={form.capacity || ''} onChange={(e) => set('capacity')(e.target.value)}
                            placeholder="Maximum number of participants" min="1" aria-label="Capacity"
                            className={`${inputClass} mt-2`} />
                    )}
                </Section>

                {error && (
                    <p className="mb-6 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400 text-sm">{error}</p>
                )}

                <button type="submit" disabled={submitting}
                    className="cursor-pointer w-full sm:w-auto bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 transition-colors rounded-xl px-10 py-3.5 text-white font-semibold text-base disabled:opacity-50">
                    {submitting ? 'Saving...' : submitLabel}
                </button>
            </form>

            <PreviewCard event={form} organizer={organizer} />
        </div>
    )
}

function Section({ title, children }) {
    return (
        <div className="mb-10">
            <h2 className="text-white font-semibold mb-4">{title}</h2>
            {children}
        </div>
    )
}

function Label({ children }) {
    return <p className="text-gray-400 text-xs mb-2">{children}</p>
}

function PreviewCard({ event, organizer }) {
    const shortName = organizer.username
        .split(' ')
        .map((part, i) => (i === 0 ? part : `${part.charAt(0)}.`))
        .join(' ')

    return (
        <aside className="hidden lg:block sticky top-28 shrink-0">
            <p className="text-gray-500 text-xs font-semibold tracking-widest uppercase mb-3">Live preview</p>
            <div className="relative w-72 bg-gray-900 rounded-[2rem] border-2 border-gray-700/50 shadow-2xl shadow-purple-500/10 overflow-hidden">
                <span className={`absolute top-4 right-4 z-10 text-xs font-semibold px-2.5 py-1 rounded-full text-white ${event.isFree ? 'bg-green-500/90' : 'bg-purple-500/90'}`}>
                    {event.isFree ? 'Free' : 'Paid'}
                </span>
                <div className="relative h-44 bg-gray-800 overflow-hidden">
                    {event.thumbnailUrl ? (
                        <>
                            <div className="absolute inset-0 bg-black/50 z-[1]" />
                            <img src={event.thumbnailUrl} alt="" className="w-full h-full object-cover" />
                        </>
                    ) : (
                        <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
                            <i className="fa-regular fa-image text-gray-700 text-3xl"></i>
                        </div>
                    )}
                    <p className="absolute inset-0 z-[2] flex items-center justify-center text-center px-4 text-white text-xl font-bold leading-tight drop-shadow-lg">
                        {event.title || 'Event name'}
                    </p>
                </div>
                <div className="p-5 flex flex-col gap-3">
                    <PreviewRow icon="fa-regular fa-calendar text-purple-400" bg="bg-purple-500/20">
                        {event.startDate ? formatDate(event.startDate, { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }) : 'Date to be announced'}
                    </PreviewRow>
                    <PreviewRow icon="fa-solid fa-location-dot text-pink-400" bg="bg-pink-500/20">
                        {event.location || 'Location to be announced'}
                    </PreviewRow>
                    <div className="flex items-center gap-3">
                        <img src={getAvatar(organizer.profilePictureId)} alt="" className="w-9 h-9 rounded-full border-2 border-gray-700" />
                        <div>
                            <p className="text-white text-sm font-medium">{shortName}</p>
                            <p className="text-gray-500 text-xs">Organizer</p>
                        </div>
                    </div>
                </div>
            </div>
        </aside>
    )
}

function PreviewRow({ icon, bg, children }) {
    return (
        <div className="flex items-center gap-3">
            <div className={`${bg} p-2.5 rounded-lg`}><i className={`${icon} text-sm`}></i></div>
            <p className="text-gray-400 text-sm font-medium">{children}</p>
        </div>
    )
}

export default EventForm
