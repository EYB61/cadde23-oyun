let socket;
let room;
let name;

function connect() {
  name = document.getElementById("name").value;

  socket = io("https://YOUR-SERVER-URL");

  socket.on("roomJoined", (data) => {
    room = data.room;

    document.getElementById("menu").style.display = "none";
    document.getElementById("game").style.display = "block";

    document.getElementById("room").innerText = room;
  });

  socket.on("updatePlayers", (players) => {
    document.getElementById("players").innerHTML =
      players.map(p => `${p.name} ${p.alive ? "" : "(DEAD)"}`).join("<br>");
  });

  socket.on("status", (msg) => {
    document.getElementById("status").innerText = msg;
  });

  socket.on("turn", (player) => {
    document.getElementById("status").innerText = "Turn: " + player;
  });

  socket.on("result", (data) => {
    let div = document.createElement("div");
    div.innerText = `${data.player} -> ${data.result}`;
    document.getElementById("chat").appendChild(div);
  });

  socket.on("gameOver", (winner) => {
    alert("Winner: " + winner);
  });
}

function createRoom() {
  connect();
  socket.emit("createRoom", { name });
}

function joinRoom() {
  connect();
  let r = document.getElementById("roomInput").value;
  socket.emit("joinRoom", { name, room: r });
}

function startGame() {
  socket.emit("startGame", room);
}

function playTurn() {
  socket.emit("playTurn", { room });
}

function sendMsg() {
  socket.emit("chat", {
    room,
    msg: document.getElementById("msg").value,
    name
  });
}
