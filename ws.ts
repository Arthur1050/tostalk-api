import { io } from "./http";
import { UserStatus } from "./types/userTypes";
import { Message } from "./types/chatTypes";

var msgs:Message[] = []

io.use((socket, next) => {
    const username = socket.handshake.auth.username;
    if (!username) {
        return next(new Error("invalid username"));
    }
    next();
})

io.on('connection', socket => {
    console.log(socket.id)
    console.log(socket.handshake.auth)
    const {username}:{[username:string]: string} = socket.handshake.auth;

    const onlineUsers:UserStatus[] = [];
    for (let [id, socket] of io.of("/").sockets) {
        const {username, status} = socket.handshake.auth;

        onlineUsers.push({ username, status, socketId: id })
    }
    console.log('users: ', onlineUsers)
    socket.emit('user-status', onlineUsers)

    if (socket.recovered) {
        console.log('bem vindo de volta')
    }

    socket.broadcast.emit("online-user", {username, profile: 'https://cdn.icon-icons.com/icons2/2468/PNG/512/user_icon_149329.png'})

    socket.on('send-msg', ({msg, to, receiver, chanel}:{msg:string, to:string, receiver: string, chanel:string}) => {
        const date = new Date();
        console.log(msg)
        const data:Message = {
            msg,
            date,
            sender: socket.handshake.auth.username,
            receiver,
            chanel,
            id: `${socket.id}_${date.getMilliseconds()}`,
        }
        msgs.push(data);
        to && socket.to(to).emit('recept-msg', data)
    })

    socket.on('join-chanel', ({chanel}, callback) => {
        const username = socket.handshake.auth.username;
        const chanelMsgs = msgs.filter(msg => (msg.receiver == username && msg.sender == chanel) || (msg.sender == username && msg.receiver == chanel))
        callback(chanelMsgs)
    })

    socket.on('user-status', ({status}) => {
        socket.handshake.auth.status = status;
        socket.broadcast.emit('user-status', [{username: socket.handshake.auth.username, status,socketId: socket.id } as UserStatus])
    }) 
    
    socket.on('disconnect', () => {
        socket.broadcast.emit('user-status', [{username: socket.handshake.auth.username, status: 'offline',socketId: socket.id } as UserStatus])
    })
})