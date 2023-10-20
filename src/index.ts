import { app, serverHttp } from "./http"
import jwt from 'jsonwebtoken'
import { Friend, User } from "../types/userTypes"
import multer from 'multer'
import fs from 'fs';

import "./ws"
import { Chanel } from "../types/chatTypes"

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

const Friends:Friend[] = [
    {
        username: 'Arthur',
        profile: '',
        status: ''
    },
    {
        username: 'Lucas',
        profile: '',
        status: ''
    },
    {
        username: 'Gustavo',
        profile: '',
        status: ''
    },
    {
        username: 'Samilla',
        profile: '',
        status: ''
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
                profile: `${req.protocol}://${req.headers.host}/data/profile/${decoded.sub}`,
                friends: Friends.filter(friend => friend.username != decoded.sub)
                    .map(f => {
                        f.profile = `${req.protocol}://${req.headers.host}/data/profile/${f.username}`;
                        return f;
                    })
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
            const {id} = req.body;

            //ROTINA PARA IDENTIFICAR SE O ID E DE ALGUM GRUPO DO USUARIO REQUSITANTE
            const isGroup = false;

            res.send({
                type: isGroup ? "GROUP" : "FRIEND",
                title: id,
                profile: `${req.protocol}://${req.headers.host}/data/profile/${id}`,
                socketId: ''
            } as Chanel)
        }

    } catch(err) {
        res.status(401).send(err);
    }
})

app.get('/data/profile/:user', (req, res) => {
    const {user} = req.params;
    const pathImage = `profiles/${user}_profile.png`;

    var stream = fs.createReadStream(fs.existsSync(pathImage) ? pathImage : `profiles/default_profile.png`);

    stream.pipe(res)
})


/* const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, __dirname + '/profiles')
    },
    filename: (req, file, cb) => {
        try {
            const {username} = req.body
            var ext = file.originalname.split('.');

            cb(null, `profile_${username}.${ext[ext.length - 1]}`)
        } catch(err) {
            cb(new Error('Erro na atualiza de perfil: '+err), '')
        }
    }
}) */

//const upload = multer({storage: storage,limits: {fileSize: 1024 * 1024 * 1 /*1Mb*/}}).any()

const uploadProfile = multer({limits: {fileSize: 1024 * 1024 * 1 /* 1Mb */}, });

app.post('/update/userdata/', uploadProfile.none(), (req, res) => {
    
    console.log(req.body)
    const token = req.headers.authorization?.split(' ')[1];

    const decoded = tokenValid(token);
    const {oldUsername, username, profile} = req.body;
    
    if (decoded && decoded.sub == oldUsername) {
        const path = `profiles/${oldUsername}_profile.png`;
        const data64 = profile.replace(/^data:image\/png;base64,/, "");

        fs.writeFile(path, data64, {encoding: "base64"}, (err => {
            if (err) {
                res.status(500).send({res:'Erro ao salvar imagem.'})
                throw new Error('Error ao salvar a imagem: '+err)
            }
        }))
        res.status(200).send({res:'Perfil atualizado com sucesso!'})
    } else {
        res.status(401).send({res:'Credenciais invalidas.'})
    }
})

function tokenValid(token:string|undefined) {
    const key = process.env.JWT_SECRET_KEY;
    return (key&&token) ? jwt.verify(token, key) : false;
}

serverHttp.listen(3001, () => {
    console.log("Server iniciado na porta 3001!")
})