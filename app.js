const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const timers = require("timers");
const app = express();

const players = [];
const categories = [];
let numOfRounds = 1;
let gameStatus = "lobby";

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

app.post("/addcat", (req, res) => {
  const newCat = req.body.name;
  if (!categories.find((e) => e === newCat)) {
    categories.push(newCat);
  }
  res.end();
});

app.post("/addplayer", (req, res) => {
  if (players.find((e) => e.nick === req.body.nick)) {
    res.redirect("/");
  } else {
    players.push({
      id: new Date().getTime(),
      nick: req.body.nick,
      points: 0,
      intervalID: setInterval(() => removePlayer(req.body.nick), 5000),
      ready: false,
    });
    res.cookie("nick", req.body.nick);
    res.redirect("/lobby.html");
  }
});

app.post("/removecat", (req, res) => {
  const name = req.body.name;
  const index = categories.findIndex((e) => e === name);
  if (index + 1) categories.splice(index, 1);
  res.end();
});

app.get("/getlobbydata", (req, res) => {
  const player = players.find((e) => e.nick === req.cookies.nick);

  player.intervalID.refresh();

  const playersData = [];
  players.forEach((e) =>
    playersData.push({
      nick: e.nick,
      ready: e.ready,
    })
  );

  const response = {
    players: playersData,
    categories,
    numOfRounds,
  };

  res.json(JSON.stringify(response));
});

app.post("/changerounds", (req, res) => {
  const { num } = req.body;
  if (Number.isInteger(num)) numOfRounds = num;
  res.end();
});

app.get("/setready", (req, res) => {
  const player = players.find((e) => e.nick === req.cookies.nick);
  if (player) player.ready = !player.ready;
  res.end();

  let everyoneReady = true;
  players.forEach((e) => {
    if (!e.ready) everyoneReady = false;
  });

  if (everyoneReady) gameStatus = "game";
});

app.get("/getgamestatus", (req, res) => {
  if (gameStatus === "lobby") res.end();
  else if (gameStatus === "game") res.redirect("/game.html");
});

app.post("/redirect", (req, res) => {
  res.redirect("/");
});

app.use(express.static("./public"));

const removePlayer = (nick) => {
  const index = players.findIndex((e) => e.nick === nick);
  if (index + 1) {
    clearInterval(players[index].intervalID);
    players.splice(index, 1);
  }
};

app.listen(3000, () => {
  console.log("serwer nasłuchuje");
});
