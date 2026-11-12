import './App.css'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { FavoritesProvider } from './contexts/FavoritesContext'
import Header from './Header/Header'
import Footer from './Footer/Footer'
import Accueil from './Accueil/Accueil'
import Login from './Login/Login'
import Signup from './Signup/Signup'
import EventsList from './EventsList/EventsList'
import EventDetail from './EventDetail/EventDetail'
import CreateEvent from './CreateEvent/CreateEvent'
import Profil from './Profil/Profil'
import Settings from './Settings/Settings'
import EditEvent from './EditEvent/EditEvent'
import NotFound from './NotFound/NotFound'
import Admin from './Admin/Admin'


function App() {
	return (
		<FavoritesProvider>
			<Router>
				<Header />
				<Routes>
					<Route path="/" element={<Accueil />} />
					<Route path="/create" element={<CreateEvent />} />
					<Route path="/profil" element={<Profil />} />
					<Route path="/settings" element={<Settings />} />
					<Route path="/events" element={<EventsList />} />
					<Route path="/events/:id" element={<EventDetail />} />
					<Route path="/events/:id/edit" element={<EditEvent />} />
					<Route path="/login" element={<Login />} />
					<Route path="/signup" element={<Signup />} />
					<Route path="/admin" element={<Admin />} />
					<Route path="*" element={<NotFound />} />
				</Routes>
				<Footer />
			</Router>
		</FavoritesProvider>
	)
}

export default App