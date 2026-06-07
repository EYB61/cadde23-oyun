const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

let rooms = {};

io.on("connection", (socket) => {

  socket.on("joinRoom", ({ name, room }) => {
    socket.join(room);

    if (!rooms[room]) rooms[room] = [];

    rooms[room].push({ id: socket.id, name });

    io.to(room).emit("updatePlayers", rooms[room]);
    io.to(room).emit("status", name + " joined");
  });

  socket.on("playTurn", () => {
    const result = Math.random();

    let msg = "";

    if (result < 0.3) msg = "Skip turn!";
    else if (result < 0.5) msg = "Double points!";
    else if (result < 0.55) msg = "Eliminated!";
    else msg = "Safe move";

    io.emit("status", msg);
  });

  socket.on("disconnect", () => {
    for (let r in rooms) {
      rooms[r] = rooms[r].filter(p => p.id !== socket.id);
      io.to(r).emit("updatePlayers", rooms[r]);
    }
  });

});

server.listen(3000, () => console.log("Server running"));
