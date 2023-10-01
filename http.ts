import express from "express";
import http from "http";
import {Server} from "socket.io"
import dotenv from 'dotenv'

const app = express();

app.use(express.json())

dotenv.config();

const serverHttp = http.createServer(app);

const io = new Server(serverHttp, {
    cors: {
        origin: '*'
    },
    connectionStateRecovery: {
        // the backup duration of the sessions and the packets
        /* maxDisconnectionDuration: 1000, */
        // whether to skip middlewares upon successful recovery
        skipMiddlewares: true,
    }
});

export {serverHttp, io, app};