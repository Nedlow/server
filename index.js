const path = require("path");
const cors = require("cors");

const express = require("express");
const app = express();
const io = require("socket.io")(3002, {
  cors: {
    origin: "*",
  },
});

const maps = [
  {
    id: 1,
    name: "Lijiang Tower",
  },
  {
    id: 2,
    name: "Busan",
  },
  {
    id: 3,
    name: "Nepal",
  },
  {
    id: 4,
    name: "Ilios",
  },
  {
    id: 5,
    name: "Oasis",
  },
  {
    id: 6,
    name: "Blizzard World",
  },
  {
    id: 7,
    name: "Eichenwalde",
  },
  {
    id: 8,
    name: "Hollywood",
  },
  {
    id: 9,
    name: "Kings Row",
  },
  {
    id: 10,
    name: "Numbani",
  },
  {
    id: 11,
    name: "Dorado",
  },
  {
    id: 12,
    name: "Junkertown",
  },
  {
    id: 13,
    name: "Havana",
  },
  {
    id: 14,
    name: "Rialto",
  },
  {
    id: 15,
    name: "Route 66",
  },
  {
    id: 16,
    name: "Watchpoint: Gibraltar",
  },
];

var gameData = {
  activeScene: 1,
  mapcount: 5,
  maps: [
    {
      mapID: 1,
      enabled: true,
      completed: true,
      winner: 2,
    },
    {
      mapID: 2,
      enabled: true,
      completed: false,
      winner: null,
    },
    {
      mapID: 3,
      enabled: true,
      completed: false,
      winner: null,
    },
    {
      mapID: 4,
      enabled: true,
      completed: false,
      winner: null,
    },
    {
      mapID: null,
      enabled: true,
      completed: false,
      winner: null,
    },
  ],
  team1: {
    id: 1,
    name: "Disguised Puppies",
    icon: 0,
    roster: {
      tank: ["CCA", "Junggan"],
      dps: ["Crillknubbsal", "Lia"],
      support: ["DrTomat", "Zeldaplayer"],
    },
  },
  team2: {
    id: 2,
    name: "Strikers",
    icon: 1,
    roster: {
      tank: ["Xord", "Ora"],
      dps: ["Toraho", "Kaos"],
      support: ["Irebugz", "Warded"],
    },
  },
};

// SOCKET
io.on("connection", (socket) => {
  console.log("Client connected from" + socket.handshake.address); // DEBUG

  socket.on("refreshIngame", (cb) => {
    cb(gameData);
  });

  socket.on("updateGameStats", (data, cb) => {
    console.log(data);
    gameData.maps[data.mid - 1].completed = data.completed;
    gameData.maps[data.mid - 1].winner = data.winner;
    cb("Updated scores");
    socket.emit("refreshIngame");
  });

  socket.on("updateRoster", (data, cb) => {
    console.log(data);
    if (data.teamID == 1) {
      gameData.team1.name = data.name;
      gameData.team1.icon = data.icon;
      gameData.team1.roster = data.roster;
    } else {
      gameData.team2.name = data.name;
      gameData.team2.icon = data.icon;
      gameData.team2.roster = data.roster;
    }
    io.emit("refreshScreen");
  });
});

app.get("/maps/", (req, res) => {
  res.type("json").end(JSON.stringify(maps, null, 2));
});

app.get("/maps/:id/img", (req, res) => {
  const id = req.params.id;
  res.sendFile(path.join(__dirname, `/img/maps/${id}.jpg`));
});

app.get("/projector/changeScene/:id", (req, res) => {
  const id = req.params.id;
  gameData.activeScene = id;
  io.emit("changeScene", `${id}`);
  res.status(200).end("Scene changed to " + id);
  console.log("Scene changed to " + id);
});

app.get("/gamedata/", (req, res) => {
  res.type("json").end(JSON.stringify(gameData, null, 2));
});

app.get("/gamedata/setmap/:index/:id", (req, res) => {
  const index = req.params.index;
  let id = parseInt(req.params.id);
  if (id == 403) {
    gameData.maps[index - 1].mapID = null;
    gameData.maps[index - 1].enabled = true;
  } else if (id == 404) {
    gameData.maps[index - 1].enabled = false;
  } else {
    gameData.maps[index - 1].mapID = id;
    gameData.maps[index - 1].enabled = true;
  }

  io.emit("refreshScreen");
  res.status(200).end("Success");
});

app.get("/gamedata/update", (req, res) => {
  io.emit("refreshScreen");
  res.end("Sending update to projectors.");
});

app.use(express.static("public"));

app.use((req, res, next) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.set("json spaces", 2);
app.use(cors());

app.listen(3001, () => {
  console.log("Listening on port 3001");
});
