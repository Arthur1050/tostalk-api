export type User = {
    username: string
    profile: string
    friends: Friend[]
}

export type Friend = {
    username: string
    profile: string
    status: string
}

export type UserStatus = {
    socketId: string
    username: string
    status: string
}