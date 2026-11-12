function ConfirmModal({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText,
    cancelText = "Annuler",
    type = "warning"
}) {
    if (!isOpen) return null

    const iconClass = type === "danger" ? "fa-triangle-exclamation" : "fa-users"
    const iconBg = type === "danger" ? "bg-red-900/50" : "bg-orange-900/50"
    const iconColor = type === "danger" ? "text-red-500" : "text-orange-500"
    const confirmBtnClass = type === "danger"
        ? "bg-red-600 hover:bg-red-700 text-white"
        : "bg-orange-600 hover:bg-orange-700 text-white"

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div className="bg-gray-800 rounded-2xl border border-gray-700 p-8 max-w-md w-full mx-4 relative animate-in fade-in zoom-in duration-200">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
                >
                    <i className="fa-solid fa-xmark text-xl"></i>
                </button>

                <div className={`w-16 h-16 ${iconBg} rounded-2xl flex items-center justify-center mx-auto mb-6`}>
                    <i className={`fa-solid ${iconClass} text-2xl ${iconColor}`}></i>
                </div>

                <h2 className="text-2xl font-bold text-white text-center mb-4">
                    {title}
                </h2>

                <p className="text-gray-300 text-center mb-8 leading-relaxed">
                    {message}
                </p>

                <div className="flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded-lg transition-colors"
                    >
                        {cancelText}
                    </button>
                    <button
                        onClick={() => {
                            onConfirm()
                            onClose()
                        }}
                        className={`flex-1 px-6 py-3 font-semibold rounded-lg transition-colors ${confirmBtnClass}`}
                    >
                        <i className={`fa-solid ${type === "danger" ? "fa-trash" : "fa-check"} mr-2`}></i>
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    )
}

export default ConfirmModal
