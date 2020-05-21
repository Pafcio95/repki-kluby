const playersBlock = document.querySelector(".players");
const currentCatBlock = document.querySelector(".currentCat");
const addCatBtn = document.querySelector(".newCat button");
const addCatInput = document.querySelector(".newCat input");
const changeRoundsBtn = document.querySelector(".numOfRounds button");
const changeRoundsInput = document.querySelector(".numOfRounds input");
const numOfRoundsSpan = document.querySelector(".currentRounds");
const readyBtn = document.querySelector(".ready button");
const roundTimeBtn = document.querySelector(".roundTime button");
const roundTimeInput = document.querySelector(".roundTime input");
const roundTimeSpan = document.querySelector(".currentRoundTime");
const waitTimeBtn = document.querySelector(".waitTime button");
const waitTimeInput = document.querySelector(".waitTime input");
const waitTimeSpan = document.querySelector(".currentWaitTime");
const showHideSpan = document.querySelector(".setSettings h2 span");
const settingsMenu = document.querySelector(".settingsmenu");

const getData = () => {
  fetch("/getlobbydata")
    .then((res) => res.json())
    .then((res) => {
      const data = JSON.parse(res);

      if (data.redirect) {
        return (location.href = data.redirect);
      }

      currentCatBlock.innerHTML = "";
      playersBlock.innerHTML = "";
      data.players.forEach((e) => {
        const element = document.createElement("p");
        if (e.ready) element.style.color = "green";
        else element.style.color = "red";
        element.textContent = e.nick;
        playersBlock.appendChild(element);
      });

      data.categories.forEach((e) => {
        const element = document.createElement("div");
        const name = document.createElement("p");
        name.textContent = e;
        const remove = document.createElement("button");
        remove.textContent = "X";
        remove.addEventListener("click", removeCat);
        element.appendChild(remove);
        element.appendChild(name);

        currentCatBlock.appendChild(element);
      });

      numOfRoundsSpan.textContent = data.numOfRounds;
      roundTimeSpan.textContent = data.roundTime;
      waitTimeSpan.textContent = data.waitTime;
    });
};

const removeCat = (e) => {
  const name = e.target.parentElement.querySelector("p").textContent;
  fetch("/removecat", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ name }),
  });
};

const addNewCat = () => {
  const catName = { name: addCatInput.value };
  fetch("/addcat", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(catName),
  });
  addCatInput.value = "";
};

const changeRounds = () => {
  const numOfRounds = { num: Number(changeRoundsInput.value) };
  fetch("/changerounds", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(numOfRounds),
  });
  changeRoundsInput.value = "";
};

const setReady = () => {
  fetch("/setready");
};

const setRoundTime = () => {
  const time = { time: Number(roundTimeInput.value) };
  fetch("/setroundtime", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(time),
  });
  roundTimeInput.value = "";
};

const setWaitTime = () => {
  const time = { time: Number(waitTimeInput.value) };
  fetch("/setwaittime", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(time),
  });
  waitTimeInput.value = "";
};

addCatBtn.addEventListener("click", addNewCat);
changeRoundsBtn.addEventListener("click", changeRounds);
readyBtn.addEventListener("click", setReady);
roundTimeBtn.addEventListener("click", setRoundTime);
waitTimeBtn.addEventListener("click", setWaitTime);
showHideSpan.addEventListener("click", () => {
  settingsMenu.classList.toggle("show");
  showHideSpan.textContent = `${
    settingsMenu.classList.contains("show") ? "ukryj" : "pokaż"
  }`;
});

getData();
setInterval(getData, 1000);
