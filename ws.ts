import { io } from "./http";
import { UserStatus } from "./types/userTypes";

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

    const onlineUsers:UserStatus[] = [];
    for (let [id, socket] of io.of("/").sockets) {
        const {username, status} = socket.handshake.auth;

        onlineUsers.push({ username, status })
    }
    console.log('users: ', onlineUsers)
    socket.emit('user-status', onlineUsers)

    if (socket.recovered) {
        console.log('bem vindo de volta')
    }

    socket.on('send-msg', ({msg, sender}) => {
        const date = new Date();

        const data = {
            msg,
            date,
            sender,
            receiver: 'Destinario',
            id: `${socket.id}_${date.getMilliseconds()}`,
        }

        io.emit('recept-msg', data);
    })

    socket.on('user-status', ({status}) => {
        socket.handshake.auth.status = status;
        socket.broadcast.emit('user-status', [{username: socket.handshake.auth.username, status}])
    }) 
})