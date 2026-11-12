import avatar1 from '../assets/avatars/1.png'
import avatar2 from '../assets/avatars/2.png'
import avatar3 from '../assets/avatars/3.png'
import avatar4 from '../assets/avatars/4.png'
import avatar5 from '../assets/avatars/5.png'
import avatar6 from '../assets/avatars/6.png'

export const avatars = { 1: avatar1, 2: avatar2, 3: avatar3, 4: avatar4, 5: avatar5, 6: avatar6 }

export function getAvatar(id) {
    return avatars[id] || avatars[1]
}
