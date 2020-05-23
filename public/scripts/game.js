const roundSpan = document.querySelector(".round");
const letterSpan = document.querySelector(".letter");
const timerSpan = document.querySelector(".timer");
const answersDiv = document.querySelector("main>div");
const infoDivTop = document.querySelector(".info").offsetTop;

let refreshIntervalId;
let answered = false;

const generateRound = () => {
  fetch("/generateround")
    .then((res) => res.json())
    .then((res) => {
      const data = JSON.parse(res);
      if (data.redirect) location.href = data.redirect;
      else if (data.gameStatus === "game") {
        answersDiv.textContent = "";
        answered = false;
        roundSpan.textContent = `Runda ${data.currentRound}/${data.numOfRounds}`;
        letterSpan.textContent = `Litera: ${data.currentLetter.toUpperCase()}`;
        timerSpan.textContent = formatTimer(data.timer);
        data.categories.forEach((e) => {
          const div = document.createElement("div");

          const label = document.createElement("label");
          label.setAttribute("for", e);
          label.textContent = e;

          const input = document.createElement("input");
          input.setAttribute("id", e);
          input.setAttribute("autocomplete", "off");

          div.appendChild(label);
          div.appendChild(input);
          answersDiv.appendChild(div);
        });
        const sendAnswersBtn = document.createElement("button");
        sendAnswersBtn.addEventListener("click", sendAnswers);
        sendAnswersBtn.textContent = "Wyślij";
        answersDiv.appendChild(sendAnswersBtn);
      }
      if (refreshIntervalId) clearInterval(refreshIntervalId);
      refreshIntervalId = setInterval(getGameData, 1000);
    });
};

const sendAnswers = () => {
  if (!answered) {
    const answers = [];
    const answerDivs = [...document.querySelectorAll("main > div > div")];
    answerDivs.forEach((e) => {
      answer = {
        name: e.querySelector("label").textContent,
        value: e.querySelector("input").value,
      };
      answers.push(answer);
    });

    roundSpan.textContent = "";
    letterSpan.textContent = "";
    timerSpan.textContent = "";
    answersDiv.textContent = "";
    answered = true;

    fetch("/sendanswers", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(answers),
    });
  }
};

const formatTimer = (sec) => {
  let minutes = Math.floor(sec / 60);
  let seconds = sec % 60;

  minutes < 10 ? (minutes = `0${minutes}`) : null;
  seconds < 10 ? (seconds = `0${seconds}`) : null;

  return `${minutes}:${seconds}`;
};

const getGameData = () => {
  fetch("/getgamedata")
    .then((res) => res.json())
    .then((res) => {
      const data = JSON.parse(res);

      if (data.gameStatus === "game") {
        timerSpan.textContent = formatTimer(data.timer);
        if (data.timer <= 0) sendAnswers();
      } else if (data.gameStatus === "checking") {
        clearInterval(refreshIntervalId);
        refreshIntervalId = setInterval(refreshConnection, 1000);
        generateChecking(data.playersAnswers);
      }
    });
};

const refreshConnection = () => {
  fetch("/refreshconnection")
    .then((res) => res.json())
    .then((res) => {
      const data = JSON.parse(res);
      if (data.gameStatus === "lobby") location.href = "/results.html";
      else if (data.gameStatus === "game") generateRound();
    });
};

const generateChecking = (answers) => {
  timerSpan.textContent = "";

  answers.forEach((category) => {
    const mainDiv = document.createElement("div");
    mainDiv.classList.add("category");

    const header = document.createElement("h2");
    header.textContent = category.category;
    header.classList.add("categoryName");
    mainDiv.appendChild(header);

    const descriptionDiv = document.createElement("div");
    descriptionDiv.classList.add("description");

    const playerElement = document.createElement("div");
    playerElement.classList.add("nick");
    playerElement.textContent = "Nick";
    descriptionDiv.appendChild(playerElement);

    const answerElement = document.createElement("div");
    answerElement.classList.add("answer");
    answerElement.textContent = "Odpowiedź";
    descriptionDiv.appendChild(answerElement);

    const optionElement = document.createElement("div");
    optionElement.classList.add("option");
    optionElement.textContent = "Opcje";
    descriptionDiv.appendChild(optionElement);

    mainDiv.appendChild(descriptionDiv);

    category.answers.forEach((answer) => {
      const div = document.createElement("div");
      div.classList.add("answers");

      const playerSpan = document.createElement("div");
      playerSpan.textContent = answer.nick;
      playerSpan.classList.add("nick");
      div.appendChild(playerSpan);

      const answerSpan = document.createElement("div");
      answerSpan.textContent = answer.answer;
      answerSpan.classList.add("answer");
      div.appendChild(answerSpan);

      const optionDiv = document.createElement("div");
      optionDiv.classList.add("option");

      const spanUnique = document.createElement("span");
      const inputUnique = document.createElement("input");
      inputUnique.setAttribute("type", "radio");
      inputUnique.setAttribute("name", `${answer.nick}-${category.category}`);
      inputUnique.setAttribute("id", `${answer.nick}-${category.category}2`);
      inputUnique.setAttribute("value", "2");
      inputUnique.checked = "true";
      const labelUnique = document.createElement("label");
      labelUnique.setAttribute("for", `${answer.nick}-${category.category}2`);
      labelUnique.textContent = "Nie powtarza się";
      spanUnique.appendChild(inputUnique);
      spanUnique.appendChild(labelUnique);

      const spanRepeat = document.createElement("span");
      const inputRepeat = document.createElement("input");
      inputRepeat.setAttribute("type", "radio");
      inputRepeat.setAttribute("name", `${answer.nick}-${category.category}`);
      inputRepeat.setAttribute("id", `${answer.nick}-${category.category}1`);
      inputRepeat.setAttribute("value", "1");
      const labelRepeat = document.createElement("label");
      labelRepeat.setAttribute("for", `${answer.nick}-${category.category}1`);
      labelRepeat.textContent = "Powtarza się";
      spanRepeat.appendChild(inputRepeat);
      spanRepeat.appendChild(labelRepeat);

      const spanWrong = document.createElement("span");
      const inputWrong = document.createElement("input");
      inputWrong.setAttribute("type", "radio");
      inputWrong.setAttribute("name", `${answer.nick}-${category.category}`);
      inputWrong.setAttribute("id", `${answer.nick}-${category.category}0`);
      inputWrong.setAttribute("value", "0");
      const labelWrong = document.createElement("label");
      labelWrong.setAttribute("for", `${answer.nick}-${category.category}0`);
      labelWrong.textContent = "Błędna odpowiedź";
      spanWrong.appendChild(inputWrong);
      spanWrong.appendChild(labelWrong);

      optionDiv.appendChild(spanUnique);
      optionDiv.appendChild(spanRepeat);
      optionDiv.appendChild(spanWrong);
      div.appendChild(optionDiv);

      mainDiv.appendChild(div);
    });

    answersDiv.appendChild(mainDiv);
  });

  const sendCheckedBtn = document.createElement("button");
  sendCheckedBtn.addEventListener("click", sendChecked);
  sendCheckedBtn.textContent = "Wyślij";
  answersDiv.appendChild(sendCheckedBtn);
};

const sendChecked = () => {
  const radios = [...document.querySelectorAll('input[type="radio"]')];
  const response = [];
  radios.forEach((radio) => {
    if (radio.checked) {
      const answer = {};
      answer.value = Number(radio.value);
      answer.nick = radio.name.split("-")[0];
      answer.category = radio.name.split("-")[1];

      response.push(answer);
    }
  });
  console.log(response);
  answersDiv.textContent =
    "Kolejna runda rozpocznie się jak wszyscy sprawdzą odpowiedzi";
  fetch("/sendchecked", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(response),
  });
};

window.addEventListener("scroll", () => {
  if (window.pageYOffset >= infoDivTop)
    document.querySelector(".info").classList.add("fixed");
  else document.querySelector(".info").classList.remove("fixed");
});

generateRound();
