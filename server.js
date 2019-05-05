const express = require("express");
const app = express();
const http = require("http").Server(app);
const io = require("socket.io")(http);

app.use(express.static("public"));

app.get("/", function(req, res) {
  res.sendFile(__dirname + "/index.html");
});

let player_a = {
  user: "A",
  id: undefined,
  connected: false
};
let player_b = {
  user: "B",
  id: undefined,
  connected: false
};

let ball_interval;
io.on("connection", function(socket) {
  if (!player_a.connected || !player_b.connected) {
    const available_player = free_player(socket);
    console.log(`Connected user: ${available_player.user}`);
    if (available_player) io.emit("connected", available_player);
  }
  socket.on("coord", function(event) {
    io.emit("coord", { player: event.player, coord: event.coord });
  });

  if (player_a.connected && player_b.connected) {
    let ball_x = 50;
    let ball_player = player_a;
    console.log("GAME START");
    ball_interval = setInterval(() => {
      let next_coord = (ball_x + 1.25) % 100;
      if (next_coord < ball_x) {
        if (ball_player === player_a) ball_player = player_b;
        else ball_player = player_a;
      }
      ball_x = next_coord;
      io.volatile.emit("ball", { player: ball_player, coord: ball_x });
    }, 50);
  }
  socket.on("end_game", function(loser) {
    console.log(`END GAME`);
    clearInterval(ball_interval);
    io.emit("end_game", loser);
  });

  socket.on("disconnect", function() {
    var player_disconected = disconect_player(socket);
    console.log(`Disconected user: ${player_disconected.user}`);
    clearInterval(ball_interval);
  });
});

function free_player(socket) {
  if (!player_a.connected) {
    player_a.id = socket.id;
    player_a.connected = true;
    return player_a;
  } else if (!player_b.connected) {
    player_b.id = socket.id;
    player_b.connected = true;
    return player_b;
  } else {
  }
}

function disconect_player(socket) {
  if (socket.id === player_a.id) {
    return (player_a = {
      ...player_a,
      id: undefined,
      connected: false
    });
  } else if (socket.id === player_b.id) {
    return (player_b = {
      ...player_b,
      id: undefined,
      connected: false
    });
  }
}
http.listen(process.env.PORT || 3200, function() {
  console.log(`Server up & running on port: ${process.env.PORT || 3200}`);
});
