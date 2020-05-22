const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const port = process.env.PORT || 3000;
const app = express();

const letters = [
  "a",
  "b",
  "c",
  "d",
  "e",
  "f",
  "g",
  "h",
  "i",
  "j",
  "k",
  "l",
  "m",
  "n",
  "o",
  "p",
  "r",
  "s",
  "t",
  "u",
  "w",
  "z",
];
const players = [];
const categories = [];
let lastGameResults = [];
let timer;
let timerInterval;
let numOfRounds = 3;
let gameStatus = "lobby";
let currentRound = 0;
let currentLetter = "";
let roundTime = 120;
let waitTime = 10;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

app.post("/addcat", (req, res) => {
  const newCat = req.body.name;
  if (!categories.find((e) => e === newCat) && newCat) {
    categories.push(newCat);
  }
  res.end();
});

app.post("/addplayer", (req, res) => {
  if (
    players.find((e) => e.nick === req.body.nick) ||
    gameStatus === "game" ||
    gameStatus === "checking"
  ) {
    res.redirect("/");
  } else {
    players.push({
      id: new Date().getTime(),
      nick: req.body.nick,
      points: 0,
      intervalID: setInterval(() => removePlayer(req.body.nick), 5000),
      ready: false,
      checked: null,
      answers: null,
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
  if (!player) res.json(JSON.stringify({ redirect: "/" }));
  else if (gameStatus === "lobby") {
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
      roundTime,
      waitTime,
    };

    res.json(JSON.stringify(response));
  } else if (gameStatus === "game" || gameStatus === "checking")
    res.json(JSON.stringify({ redirect: "game.html" }));
});

app.get("/getgamedata", (req, res) => {
  const player = players.find((e) => e.nick === req.cookies.nick);
  if (player) player.intervalID.refresh();

  if (gameStatus === "game") {
    const response = {
      timer,
      gameStatus,
    };

    res.json(JSON.stringify(response));
  } else if (gameStatus === "checking") {
    const playersAnswers = [];
    categories.forEach((category) => {
      const answers = [];

      players.forEach((player) => {
        const answer = {};
        answer["nick"] = player.nick;
        answer["answer"] = player.answers.find(
          (e) => e.name === category
        ).value;
        answers.push(answer);
      });

      playersAnswers.push({
        category,
        answers,
      });
    });

    const response = {
      gameStatus,
      playersAnswers,
    };
    res.json(JSON.stringify(response));
  }
  res.end();
});

app.get("/generateround", (req, res) => {
  const player = players.find((e) => e.nick === req.cookies.nick);

  if (gameStatus === "game" || gameStatus === "checking") {
    player.intervalID.refresh();
    const response = {
      currentLetter,
      timer,
      currentRound,
      categories,
      numOfRounds,
      gameStatus: player.answers ? "checking" : gameStatus,
    };
    res.json(JSON.stringify(response));
  } else {
    res.json(JSON.stringify({ redirect: "/" }));
  }
});

app.post("/changerounds", (req, res) => {
  const { num } = req.body;
  if (Number.isInteger(num) && num > 0) numOfRounds = num;
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

  if (everyoneReady) startRound();
});

app.post("/setroundtime", (req, res) => {
  const { time } = req.body;
  if (Number.isInteger(time) && time > 0) roundTime = time;
  res.end();
});

app.post("/setwaittime", (req, res) => {
  const { time } = req.body;
  if (Number.isInteger(time) && time > -1) waitTime = time;
  res.end();
});

app.post("/sendanswers", (req, res) => {
  const player = players.find((e) => e.nick === req.cookies.nick);
  player.answers = req.body;
  stopTimer();
  res.end();
});

app.get("/refreshconnection", (req, res) => {
  const player = players.find((e) => e.nick === req.cookies.nick);
  if (player) player.intervalID.refresh();

  res.json(JSON.stringify({ gameStatus }));
});

app.get("/getresults", (req, res) => {
  res.json(JSON.stringify(lastGameResults));
});

app.post("/sendchecked", (req, res) => {
  const player = players.find((player) => player.nick === req.cookies.nick);
  if (player) {
    player.checked = req.body;
  }
  if (checkIsEveryoneChecks()) endRound();
});

app.use(express.static("./public"));

const removePlayer = (nick) => {
  console.log("usuwam", nick);
  const index = players.findIndex((e) => e.nick === nick);
  if (index + 1) {
    clearInterval(players[index].intervalID);
    players.splice(index, 1);
  }
};

const startRound = () => {
  gameStatus = "game";
  currentLetter = letters[Math.floor(Math.random() * letters.length)];
  currentRound++;
  timer = roundTime;
  timerInterval = setInterval(() => {
    timer--;
    if (timer <= 0) {
      checkIsEveryoneAnswers();
      clearInterval(timerInterval);
    }
  }, 1000);
};

const stopTimer = () => {
  if (timer > waitTime) timer = waitTime;
};

const checkIsEveryoneAnswers = () => {
  let everyoneAnswers = true;
  players.forEach((e) => {
    if (!e.answers) {
      everyoneAnswers = false;
    }
  });

  if (everyoneAnswers) gameStatus = "checking";
  else setTimeout(checkIsEveryoneAnswers, 500);
};

const checkIsEveryoneChecks = () => {
  let everyoneChecks = true;
  players.forEach((e) => {
    if (!e.checked) {
      everyoneChecks = false;
    }
  });

  return everyoneChecks;
};

const countPoints = () => {
  const checkedAnswers = [];
  players.forEach((player) => checkedAnswers.push(...player.checked));

  categories.forEach((category) => {
    playersAnswersRatio = [];

    players.forEach((player) => {
      const answerValues = checkedAnswers
        .filter(
          (answer) =>
            answer.category === category && answer.nick === player.nick
        )
        .map((e) => e.value);
      const answerIsUnique = answerValues.filter((value) => value === 2).length;
      const answerIsRepeat = answerValues.filter((value) => value === 1).length;
      const answerIsWrong = answerValues.filter((value) => value === 0).length;

      let playerPointsRatio;

      switch (Math.max(answerIsUnique, answerIsWrong, answerIsRepeat)) {
        case answerIsUnique:
          playerPointsRatio = 2;
          break;
        case answerIsRepeat:
          playerPointsRatio = 1;
          break;
        case answerIsWrong:
          playerPointsRatio = 0;
          break;
      }

      playersAnswersRatio.push({ nick: player.nick, ratio: playerPointsRatio });
    });

    let sumOfRatio = 0;
    playersAnswersRatio.forEach((ratio) => (sumOfRatio += ratio.ratio));

    pointValue = (players.length * 10) / sumOfRatio;

    playersAnswersRatio.forEach((ratio) => {
      const player = players.find((player) => player.nick === ratio.nick);
      player.points += ratio.ratio * pointValue;
    });
  });
};

const endRound = () => {
  countPoints();
  players.forEach((player) => {
    player.checked = null;
    player.answers = null;
  });
  if (currentRound + 1 > numOfRounds) endGame();
  else startRound();
};

const endGame = () => {
  lastGameResults = [];
  players.forEach((player) => {
    lastGameResults.push({ nick: player.nick, points: player.points });
    clearTimeout(player.intervalID);
  });
  numOfRounds = 1;
  gameStatus = "lobby";
  currentRound = 0;
  currentLetter = "";
  roundTime = 120;
  waitTime = 10;
  players.splice(0, players.length);
  categories.splice(0, categories.length);
};

app.listen(port, () => {
  console.log("serwer nasłuchuje");
});
