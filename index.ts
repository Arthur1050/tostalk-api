import { app, serverHttp } from "./http"
import jwt from 'jsonwebtoken'

import "./ws"

const Users = [
    {
        user: 'Arthur',
        password: '1234'
    },
    {
        user: 'Lucas',
        password: '1234'
    },
    {
        user: 'Gustavo',
        password: '1234'
    },
    {
        user: 'Samilla',
        password: '1234'
    }
]

app.post('/auth/login/', (req, res) => {
    const key = process.env.JWT_SECRET_KEY;
    const {username, password} = req.body;

    const user = Users.filter(user => user.user === username)[0];

    if (!user || user.password != password) return res.status(401).send({msg:'Credenciais invalidas.'})

    const token = key ? jwt.sign({sub:username}, key, {expiresIn: "8hr"}):'';

    res.send({
        username,
        token,
    })
})

app.get('/auth/validate/', (req, res) => {
    const key = process.env.JWT_SECRET_KEY;
    const token = req.headers.authorization?.split(' ')[1];
    try{
        const decoded = (key&&token) ? jwt.verify(token, key) : false;
    
        res.send({response: decoded});
    } catch(err) {
        res.status(401).send(err);
    }
})

serverHttp.listen(3001, () => {
    console.log("Server iniciado na porta 3001!")
})