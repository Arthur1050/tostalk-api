import { io } from "./http";

io.on('connection', socket => {
    console.log(socket.id)

    socket.on('send-msg', ({msg}) => {
        const date = new Date();

        const data = {
            msg,
            date,
            sender: 'Remetente',
            receiver: 'Destinario',
            id: `${socket.id}_${date.getMilliseconds()}`,
        }

        io.emit('recept-msg', data);
    })
})