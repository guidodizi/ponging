const app = require("express")();
const http = require("http").Server(app);
const io = require("socket.io")(http);

app.get("/", function(req, res) {
  res.sendFile(__dirname + "/index.html");
});
let players = 0;
io.on("connection", function(socket) {
  if (++players <= 2) {
    console.log(`Connected users: ${players}`);
    io.emit("connected", { eid: socket.id, eplayer: players });
  }
  socket.on("coord", function(event) {
    const { id, coord } = event;
    io.emit("coord", { id: id, coord });
  });
  socket.on("disconnect", function() {
    console.log(`Connected users: ${--players}`);
  });
});

let ball_x = 50;
setInterval(() => {
  ball_x = (ball_x + 1.25) % 100;
  io.emit("ball", ball_x);
}, 25);

http.listen(process.env.PORT || 3200, function() {
  console.log(`Server up & running on port: ${process.env.PORT || 3200}`);
});
