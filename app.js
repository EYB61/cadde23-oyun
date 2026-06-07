let socket;
let roomCode = "";
let playerName = "";

function connect() {
  playerName = document.getElementById("name").value;
  socket = io("https://YOUR-SERVER-URL");

  socket.on("roomJoined", (data) => {
    roomCode = data.room;

    document.getElementById("menu").style.display = "none";
    document.getElementById("game").style.display = "block";

    document.getElementById("room").innerText = roomCode;
  });

  socket.on("updatePlayers", (players) => {
    document.getElementById("players").innerText =
      players.map(p => p.name).join(", ");
  });

  socket.on("chat", (data) => {
    let div = document.createElement("div");
    div.innerText = `${data.name}: ${data.msg}`;
    document.getElementById("chat").appendChild(div);
  });

  socket.on("status", (msg) => {
    alert(msg);
  });
}

function createRoom() {
  connect();
  socket.emit("createRoom", { name: playerName });
}

function joinRoom() {
  connect();
  let room = document.getElementById("roomCode").value;
  socket.emit("joinRoom", { name: playerName, room });
}

function sendMsg() {
  let msg = document.getElementById("msg").value;

  socket.emit("chat", {
    room: roomCode,
    msg,
    name: playerName
  });
}

function startGame() {
  socket.emit("startGame", roomCode);
}
