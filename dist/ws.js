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
