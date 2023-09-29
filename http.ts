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
    }
});

export {serverHttp, io, app};