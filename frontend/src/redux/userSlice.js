import { createSlice } from '@reduxjs/toolkit'

const STORAGE_KEY = 'festify_user'

const emptyUser = {
    userId: 0,
    username: '',
    firstName: '',
    lastName: '',
    email: '',
    role: '',
    profilePictureId: 1,
    token: null,
}

function loadUser() {
    try {
        return { ...emptyUser, ...JSON.parse(localStorage.getItem(STORAGE_KEY)) }
    } catch {
        return emptyUser
    }
}

function saveUser(state) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
}

export const userSlice = createSlice({
    name: 'user',
    initialState: loadUser(),
    reducers: {
        login: (state, action) => {
            Object.assign(state, emptyUser, action.payload)
            saveUser(state)
        },
        logout: () => {
            localStorage.removeItem(STORAGE_KEY)
            return emptyUser
        },
        updateProfile: (state, action) => {
            Object.assign(state, action.payload)
            saveUser(state)
        },
    },
})

export const selectIsLoggedIn = (state) => state.user.userId > 0 && Boolean(state.user.token)

export const { login, logout, updateProfile } = userSlice.actions
export default userSlice.reducer
