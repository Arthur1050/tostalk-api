import { app, serverHttp } from "./http"
import jwt from 'jsonwebtoken'

import "./ws"

app.get('/token/generate/', (req, res) => {
    const key = process.env.JWT_SECRET_KEY;
    const data = {
        username: 'Arthur Tosta',
        exp: 30
    };

    const token = key ? jwt.sign(data, key):'';

    res.send({
        token
    })
})

app.get('/token/validate/', (req, res) => {
    const key = process.env.JWT_SECRET_KEY;
    try{
        const decoded = key ? jwt.verify('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6IkFydGh1ciBUb3N0YSIsImV4cCI6MzAsImlhdCI6MTY5NTc5MzI4NX0.UCbofp2_9FyoptdPtx9RAPnpIw2TlSZGbgl7SpCWKk8', key) : false;
    
        res.send({decoded});
    } catch(err) {
        res.status(401).send(err);
    }
})

serverHttp.listen(3001, () => {
    console.log("Server iniciado na porta 3001!")
})