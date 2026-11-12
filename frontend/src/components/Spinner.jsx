function Spinner({ fullPage = true }) {
    const icon = <i className="fa-solid fa-spinner fa-spin text-4xl text-purple-500" aria-label="Loading"></i>
    if (!fullPage) return <div className="flex justify-center py-20">{icon}</div>
    return <main className="min-h-screen bg-gray-900 flex items-center justify-center">{icon}</main>
}

export default Spinner
