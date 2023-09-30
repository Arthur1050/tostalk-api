import { app, serverHttp } from "./http"
import jwt, { Jwt, JwtPayload } from 'jsonwebtoken'
import { Chanel, User } from "./types/userTypes"

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

const Friends = [
    {
        username: 'Arthur',
        profile: 'https://cdn.icon-icons.com/icons2/2468/PNG/512/user_icon_149329.png',
    },
    {
        username: 'Lucas',
        profile: 'https://cdn.icon-icons.com/icons2/2468/PNG/512/user_icon_149329.png',
    },
    {
        username: 'Gustavo',
        profile: 'https://cdn.icon-icons.com/icons2/2468/PNG/512/user_icon_149329.png',
    },
    {
        username: 'Samilla',
        profile: 'https://cdn.icon-icons.com/icons2/2468/PNG/512/user_icon_149329.png',
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

app.get('/data/user/', (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];
    try {
        const decoded = tokenValid(token);

        if (decoded) {
            res.send({
                username: decoded.sub,
                profile: 'https://cdn.icon-icons.com/icons2/2468/PNG/512/user_icon_149329.png',
                friends: Friends.filter(friend => friend.username != decoded.sub)
            } as User)
        }

    } catch(err) {
        res.status(401).send(err);
    }
})

app.post('/data/chanel/', (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];
    try {
        const decoded = tokenValid(token);

        if (decoded) {
            res.send({
                type: "FRIEND",
                title: req.body.id,
                profile: 'https://cdn.icon-icons.com/icons2/2468/PNG/512/user_icon_149329.png',
            } as Chanel)
        }

    } catch(err) {
        res.status(401).send(err);
    }
})

function tokenValid(token:string|undefined) {
    const key = process.env.JWT_SECRET_KEY;
    return (key&&token) ? jwt.verify(token, key) : false;
}

serverHttp.listen(3001, () => {
    console.log("Server iniciado na porta 3001!")
})