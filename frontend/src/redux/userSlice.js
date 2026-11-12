import { createSlice } from '@reduxjs/toolkit'

const savedUser = JSON.parse(localStorage.getItem('festify_user'))

const initialState = savedUser || {
    username: '',
    nom: '',
    prenom: '',
    userId: 0,
    profilePictureId: 1,
    email: '',
    role: '',
    token: null,
}

export const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
        login: (state, action) => {
            state.username = action.payload.username
            state.nom = action.payload.nom || ''
            state.prenom = action.payload.prenom || ''
            state.userId = action.payload.userId
            state.profilePictureId = action.payload.profilePictureId || 1
            state.email = action.payload.email || ''
            state.role = action.payload.role || 'USER'
            state.token = action.payload.token || null

            localStorage.setItem('festify_user', JSON.stringify({
                username: state.username,
                nom: state.nom,
                prenom: state.prenom,
                userId: state.userId,
                profilePictureId: state.profilePictureId,
                email: state.email,
                role: state.role,
                token: state.token,
            }))
        },
        logout: (state) => {
            state.username = ''
            state.nom = ''
            state.prenom = ''
            state.userId = 0
            state.profilePictureId = 1
            state.email = ''
            state.role = ''
            state.token = null
            localStorage.removeItem('festify_user')
        },
        updateProfile: (state, action) => {
            if (action.payload.username) state.username = action.payload.username
            if (action.payload.profilePictureId) state.profilePictureId = action.payload.profilePictureId
            if (action.payload.email) state.email = action.payload.email
            if (action.payload.role) state.role = action.payload.role
            localStorage.setItem('festify_user', JSON.stringify({ ...state }))
        },
    },
})

export const { login, logout, updateProfile } = userSlice.actions
export default userSlice.reducer