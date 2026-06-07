let playerName = "";
let room = "lobby1";

function joinGame() {
  playerName = document.getElementById("nameInput").value;

  if (!playerName) return alert("Enter name!");

  document.getElementById("login").style.display = "none";
  document.getElementById("game").style.display = "block";

  connectSocket(playerName, room);
}
