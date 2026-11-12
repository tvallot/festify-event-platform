function ConfirmModal({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText,
    cancelText = 'Cancel',
    type = 'warning',
}) {
    if (!isOpen) return null

    const danger = type === 'danger'

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" role="dialog" aria-modal="true">
            <div className="bg-gray-800 rounded-2xl border border-gray-700 p-8 max-w-md w-full mx-4 relative">
                <button onClick={onClose} aria-label="Close"
                    className="cursor-pointer absolute top-4 right-4 text-gray-400 hover:text-white transition-colors">
                    <i className="fa-solid fa-xmark text-xl"></i>
                </button>

                <div className={`w-16 h-16 ${danger ? 'bg-red-900/50' : 'bg-orange-900/50'} rounded-2xl flex items-center justify-center mx-auto mb-6`}>
                    <i className={`fa-solid ${danger ? 'fa-triangle-exclamation text-red-500' : 'fa-users text-orange-500'} text-2xl`}></i>
                </div>

                <h2 className="text-2xl font-bold text-white text-center mb-4">{title}</h2>
                <p className="text-gray-300 text-center mb-8 leading-relaxed">{message}</p>

                <div className="flex gap-3">
                    <button onClick={onClose}
                        className="cursor-pointer flex-1 px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded-lg transition-colors">
                        {cancelText}
                    </button>
                    <button
                        onClick={() => {
                            onConfirm()
                            onClose()
                        }}
                        className={`cursor-pointer flex-1 px-6 py-3 font-semibold rounded-lg transition-colors text-white ${
                            danger ? 'bg-red-600 hover:bg-red-700' : 'bg-orange-600 hover:bg-orange-700'
                        }`}>
                        <i className={`fa-solid ${danger ? 'fa-trash' : 'fa-check'} mr-2`}></i>
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    )
}

export default ConfirmModal
