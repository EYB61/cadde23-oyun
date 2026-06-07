let socket;

function connectSocket(name, room) {
  socket = io("https://YOUR-SERVER-URL"); // backend buraya

  socket.emit("joinRoom", { name, room });

  socket.on("updatePlayers", (players) => {
    document.getElementById("players").innerText =
      players.map(p => p.name).join(", ");
  });

  socket.on("status", (msg) => {
    document.getElementById("status").innerText = msg;
  });
}
