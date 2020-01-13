const IO = require("socket.io");
const io = IO();

const rooms = {};

const createRoom = (roomId, ...players) => {
  let turn = 0;
  for (let i = 0; i < players.length; i++) {
    const player = players[i];
    player.emit("match_found", i);
    player.on("move", ({ x, y }) => {
      if (i !== turn) {
        player.emit("warning", "Not ur turn!");
        return;
      }
      io.to(roomId).emit("move", {
        player: i,
        x,
        y
      });
      turn += 1;
      turn %= 2;
    });
  }
};

let waiting;

io.on("connection", socket => {
  if (waiting) {
    const roomId = `room#${Date.now()}_${Math.floor(Math.random() * 10000)}`;
    waiting.join(roomId);
    socket.join(roomId);
    rooms[roomId] = createRoom(roomId, socket, waiting);
    waiting = undefined;
  } else {
    waiting = socket;
  }
});

io.listen(3000);
