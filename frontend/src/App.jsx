import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { FavoritesProvider } from './contexts/FavoritesContext'
import Header from './components/Header'
import Footer from './components/Footer'
import Home from './pages/Home'
import Login from './pages/Login'
import Signup from './pages/Signup'
import EventsList from './pages/EventsList'
import EventDetail from './pages/EventDetail'
import CreateEvent from './pages/CreateEvent'
import EditEvent from './pages/EditEvent'
import Profile from './pages/Profile'
import Settings from './pages/Settings'
import Admin from './pages/Admin'
import NotFound from './pages/NotFound'

function App() {
    return (
        <FavoritesProvider>
            <BrowserRouter>
                <Header />
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/events" element={<EventsList />} />
                    <Route path="/events/new" element={<CreateEvent />} />
                    <Route path="/events/:id" element={<EventDetail />} />
                    <Route path="/events/:id/edit" element={<EditEvent />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/settings" element={<Settings />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/signup" element={<Signup />} />
                    <Route path="/admin" element={<Admin />} />
                    <Route path="*" element={<NotFound />} />
                </Routes>
                <Footer />
            </BrowserRouter>
        </FavoritesProvider>
    )
}

export default App
