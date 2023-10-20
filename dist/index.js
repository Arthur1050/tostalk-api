"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// src/http.ts
var import_express = __toESM(require("express"));
var import_http = __toESM(require("http"));
var import_socket = require("socket.io");
var import_dotenv = __toESM(require("dotenv"));
var app = (0, import_express.default)();
app.use(import_express.default.json());
import_dotenv.default.config();
var serverHttp = import_http.default.createServer(app);
var io = new import_socket.Server(serverHttp, {
  cors: {
    origin: "*"
  },
  connectionStateRecovery: {
    // the backup duration of the sessions and the packets
    /* maxDisconnectionDuration: 1000, */
    // whether to skip middlewares upon successful recovery
    skipMiddlewares: true
  }
});

// src/index.ts
var import_jsonwebtoken = __toESM(require("jsonwebtoken"));
var import_multer = __toESM(require("multer"));
var import_fs = __toESM(require("fs"));

// src/ws.ts
var msgs = [];
io.use((socket, next) => {
  const username = socket.handshake.auth.username;
  if (!username) {
    return next(new Error("invalid username"));
  }
  next();
});
io.on("connection", (socket) => {
  console.log(socket.id);
  console.log(socket.handshake.auth);
  const { username } = socket.handshake.auth;
  const onlineUsers = [];
  for (let [id, socket2] of io.of("/").sockets) {
    const { username: username2, status } = socket2.handshake.auth;
    onlineUsers.push({ username: username2, status, socketId: id });
  }
  console.table(onlineUsers);
  socket.emit("user-status", onlineUsers);
  if (socket.recovered) {
    console.log("bem vindo de volta");
  }
  socket.broadcast.emit("online-user", { username, profile: "https://cdn.icon-icons.com/icons2/2468/PNG/512/user_icon_149329.png" });
  socket.on("send-msg", ({ msg, to, receiver, chanel }) => {
    const date = /* @__PURE__ */ new Date();
    console.log(msg);
    const data = {
      msg,
      date,
      sender: socket.handshake.auth.username,
      receiver,
      chanel,
      id: `${socket.id}_${date.getMilliseconds()}`
    };
    msgs.push(data);
    to && socket.to(to).emit("recept-msg", data);
  });
  socket.on("join-chanel", ({ chanel }, callback) => {
    const username2 = socket.handshake.auth.username;
    const chanelMsgs = msgs.filter((msg) => msg.receiver == username2 && msg.sender == chanel || msg.sender == username2 && msg.receiver == chanel);
    callback(chanelMsgs);
  });
  socket.on("user-status", ({ status }) => {
    socket.handshake.auth.status = status;
    socket.broadcast.emit("user-status", [{ username: socket.handshake.auth.username, status, socketId: socket.id }]);
  });
  socket.on("disconnect", () => {
    socket.broadcast.emit("user-status", [{ username: socket.handshake.auth.username, status: "offline", socketId: socket.id }]);
  });
});

// src/index.ts
var Users = [
  {
    user: "Arthur",
    password: "1234"
  },
  {
    user: "Lucas",
    password: "1234"
  },
  {
    user: "Gustavo",
    password: "1234"
  },
  {
    user: "Samilla",
    password: "1234"
  }
];
var Friends = [
  {
    username: "Arthur",
    profile: "",
    status: ""
  },
  {
    username: "Lucas",
    profile: "",
    status: ""
  },
  {
    username: "Gustavo",
    profile: "",
    status: ""
  },
  {
    username: "Samilla",
    profile: "",
    status: ""
  }
];
app.post("/auth/login/", (req, res) => {
  const key = process.env.JWT_SECRET_KEY;
  const { username, password } = req.body;
  const user = Users.filter((user2) => user2.user === username)[0];
  if (!user || user.password != password)
    return res.status(401).send({ msg: "Credenciais invalidas." });
  const token = key ? import_jsonwebtoken.default.sign({ sub: username }, key, { expiresIn: "8hr" }) : "";
  res.send({
    username,
    token
  });
});
app.get("/auth/validate/", (req, res) => {
  const key = process.env.JWT_SECRET_KEY;
  const token = req.headers.authorization?.split(" ")[1];
  try {
    const decoded = key && token ? import_jsonwebtoken.default.verify(token, key) : false;
    res.send({ response: decoded });
  } catch (err) {
    res.status(401).send(err);
  }
});
app.get("/data/user/", (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  try {
    const decoded = tokenValid(token);
    if (decoded) {
      res.send({
        username: decoded.sub,
        profile: `${req.protocol}://${req.headers.host}/data/profile/${decoded.sub}`,
        friends: Friends.filter((friend) => friend.username != decoded.sub).map((f) => {
          f.profile = `${req.protocol}://${req.headers.host}/data/profile/${f.username}`;
          return f;
        })
      });
    }
  } catch (err) {
    res.status(401).send(err);
  }
});
app.post("/data/chanel/", (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  try {
    const decoded = tokenValid(token);
    if (decoded) {
      const { id } = req.body;
      const isGroup = false;
      res.send({
        type: isGroup ? "GROUP" : "FRIEND",
        title: id,
        profile: `${req.protocol}://${req.headers.host}/data/profile/${id}`,
        socketId: ""
      });
    }
  } catch (err) {
    res.status(401).send(err);
  }
});
app.get("/data/profile/:user", (req, res) => {
  const { user } = req.params;
  const pathImage = `profiles/${user}_profile.png`;
  var stream = import_fs.default.createReadStream(import_fs.default.existsSync(pathImage) ? pathImage : `profiles/default_profile.png`);
  stream.pipe(res);
});
var uploadProfile = (0, import_multer.default)({ limits: {
  fileSize: 1024 * 1024 * 1
  /* 1Mb */
} });
app.post("/update/userdata/", uploadProfile.none(), (req, res) => {
  console.log(req.body);
  const token = req.headers.authorization?.split(" ")[1];
  const decoded = tokenValid(token);
  const { oldUsername, username, profile } = req.body;
  if (decoded && decoded.sub == oldUsername) {
    const path = `profiles/${oldUsername}_profile.png`;
    const data64 = profile.replace(/^data:image\/png;base64,/, "");
    import_fs.default.writeFile(path, data64, { encoding: "base64" }, (err) => {
      if (err) {
        res.status(500).send({ res: "Erro ao salvar imagem." });
        throw new Error("Error ao salvar a imagem: " + err);
      }
    });
    res.status(200).send({ res: "Perfil atualizado com sucesso!" });
  } else {
    res.status(401).send({ res: "Credenciais invalidas." });
  }
});
function tokenValid(token) {
  const key = process.env.JWT_SECRET_KEY;
  return key && token ? import_jsonwebtoken.default.verify(token, key) : false;
}
serverHttp.listen(3001, () => {
  console.log("Server iniciado na porta 3001!");
});
