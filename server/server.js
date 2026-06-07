const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

let rooms = {};

function createRoomCode() {
  return Math.random().toString(36).substring(2, 6).toUpperCase();
}

function getAlivePlayers(room) {
  return rooms[room].players.filter(p => p.alive);
}

io.on("connection", (socket) => {

  socket.on("createRoom", ({ name }) => {
    const room = createRoomCode();

    rooms[room] = {
      host: socket.id,
      players: [
        { id: socket.id, name, alive: true }
      ],
      turnIndex: 0,
      started: false
    };

    socket.join(room);
    socket.emit("roomJoined", { room });

    io.to(room).emit("updatePlayers", rooms[room].players);
  });

  socket.on("joinRoom", ({ name, room }) => {
    if (!rooms[room]) return socket.emit("errorMsg", "Room not found");

    rooms[room].players.push({
      id: socket.id,
      name,
      alive: true
    });

    socket.join(room);

    socket.emit("roomJoined", { room });
    io.to(room).emit("updatePlayers", rooms[room].players);
  });

  socket.on("startGame", (room) => {
    if (!rooms[room]) return;

    rooms[room].started = true;
    io.to(room).emit("status", "GAME STARTED!");
    nextTurn(room);
  });

  function nextTurn(room) {
    let roomData = rooms[room];
    let alive = getAlivePlayers(room);

    if (alive.length <= 1) {
      io.to(room).emit("gameOver", alive[0]?.name || "No one");
      return;
    }

    roomData.turnIndex = roomData.turnIndex % alive.length;
    let player = alive[roomData.turnIndex];

    io.to(room).emit("turn", player.name);
  }

  socket.on("playTurn", ({ room }) => {
    let roomData = rooms[room];
    let alive = getAlivePlayers(room);

    let player = alive[roomData.turnIndex];

    if (!player || player.id !== socket.id) return;

    let roll = Math.random();

    let result = "";

    if (roll < 0.25) {
      result = "SAFE";
    } else if (roll < 0.5) {
      result = "RISK PASSED";
    } else if (roll < 0.75) {
      result = "DOUBLE NEXT";
    } else {
      result = "ELIMINATED";
      player.alive = false;
    }

    io.to(room).emit("result", {
      player: player.name,
      result
    });

    roomData.turnIndex++;

    setTimeout(() => nextTurn(room), 1000);
  });

  socket.on("chat", ({ room, msg, name }) => {
    io.to(room).emit("chat", { name, msg });
  });

  socket.on("disconnect", () => {
    for (let r in rooms) {
      rooms[r].players = rooms[r].players.filter(p => p.id !== socket.id);
      io.to(r).emit("updatePlayers", rooms[r].players);
    }
  });

});

server.listen(3000, () => console.log("Server running"));
