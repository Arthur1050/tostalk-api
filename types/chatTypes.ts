export type Message = {
    msg: string,
    date: Date,
    sender: string,
    receiver: string
    id: string
    chanel: string
}

export type Chanel = {
    type: "GROUP"|"FRIEND"
    title: string
    profile: string
    socketId: string
}