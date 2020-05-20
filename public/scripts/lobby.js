const playersBlock = document.querySelector(".players");
const currentCatBlock = document.querySelector(".currentCat");
const addCatBtn = document.querySelector(".newCat button");
const addCatInput = document.querySelector(".newCat input");
const changeRoundsBtn = document.querySelector(".numOfRounds button");
const changeRoundsInput = document.querySelector(".numOfRounds input");
const numOfRoundsSpan = document.querySelector(".rounds span");
const readyBtn = document.querySelector(".ready button");

const getData = () => {
  fetch("/getlobbydata")
    .then((res) => res.json())
    .then((res) => {
      const data = JSON.parse(res);

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
        element.appendChild(name);
        element.appendChild(remove);
        currentCatBlock.appendChild(element);
      });

      numOfRoundsSpan.textContent = data.numOfRounds;
    });
};

const getGameStatus = () => {
  fetch("/getgamestatus");
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
};

const setReady = () => {
  fetch("/setready");
};

addCatBtn.addEventListener("click", addNewCat);
changeRoundsBtn.addEventListener("click", changeRounds);
readyBtn.addEventListener("click", setReady);

getData();
setInterval(getData, 1000);
