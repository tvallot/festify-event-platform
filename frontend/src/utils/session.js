import { fetchMyProfile } from '../api/users'

/** Turns a login/sign-up response into the user object stored in Redux. */
export async function buildSession({ token, userId, email, role }) {
    let profile = {}
    try {
        profile = (await fetchMyProfile(token)).data
    } catch {
        // The profile only adds display info, the session is still valid without it
    }

    return {
        userId,
        email,
        token,
        role: role || 'USER',
        firstName: profile.firstName || '',
        lastName: profile.lastName || '',
        username: [profile.firstName, profile.lastName].filter(Boolean).join(' ') || email.split('@')[0],
        profilePictureId: Number(profile.profilePicture) || 1,
    }
}
