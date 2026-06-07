const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

let rooms = {};

function generateRoomCode() {
  return Math.random().toString(36).substring(2, 6).toUpperCase();
}

io.on("connection", (socket) => {

  socket.on("createRoom", ({ name }) => {
    const room = generateRoomCode();

    rooms[room] = {
      host: socket.id,
      players: [{ id: socket.id, name }]
    };

    socket.join(room);

    socket.emit("roomJoined", { room });
    io.to(room).emit("updatePlayers", rooms[room].players);
  });

  socket.on("joinRoom", ({ name, room }) => {
    if (!rooms[room]) {
      socket.emit("errorMsg", "Room not found");
      return;
    }

    rooms[room].players.push({ id: socket.id, name });
    socket.join(room);

    socket.emit("roomJoined", { room });
    io.to(room).emit("updatePlayers", rooms[room].players);
  });

  socket.on("chat", ({ room, msg, name }) => {
    io.to(room).emit("chat", { name, msg });
  });

  socket.on("startGame", (room) => {
    io.to(room).emit("status", "Game Started!");
  });

  socket.on("disconnect", () => {
    for (let r in rooms) {
      rooms[r].players = rooms[r].players.filter(p => p.id !== socket.id);
      io.to(r).emit("updatePlayers", rooms[r].players);
    }
  });

});

server.listen(3000, () => console.log("Server running"));
