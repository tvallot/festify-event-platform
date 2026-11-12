import { Link } from 'react-router-dom'

/** Shown instead of a page that needs an authenticated user. */
function LoginRequired({ message = 'You need to be logged in to see this page.' }) {
    return (
        <main className="min-h-screen bg-gray-900 flex flex-col items-center justify-center px-6 text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-purple-600 to-pink-500 rounded-full flex items-center justify-center mb-6">
                <i className="fa-solid fa-user text-white text-3xl"></i>
            </div>
            <h1 className="text-white text-3xl font-bold mb-3">Log in to continue</h1>
            <p className="text-gray-400 text-base mb-8 max-w-md">{message}</p>
            <div className="flex gap-4">
                <Link to="/login" className="bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 transition-colors rounded-lg px-8 py-3 text-white font-semibold">
                    Log in
                </Link>
                <Link to="/signup" className="bg-gray-800 hover:bg-gray-700 border-2 border-gray-700 transition-colors rounded-lg px-8 py-3 text-white font-semibold">
                    Create an account
                </Link>
            </div>
        </main>
    )
}

export default LoginRequired
