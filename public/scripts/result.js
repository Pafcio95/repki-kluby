const resultsDiv = document.querySelector(".results");

fetch("/getresults")
  .then((res) => res.json())
  .then((res) => {
    const data = JSON.parse(res).sort((a, b) => b.points - a.points);

    data.forEach((player, index) => {
      const position = document.createElement("p");
      position.classList.add("position");
      position.textContent = `${index + 1}.`;

      const nick = document.createElement("p");
      nick.classList.add("nick");
      nick.textContent = player.nick;

      const points = document.createElement("p");
      points.classList.add("points");
      points.textContent = player.points;

      resultsDiv.appendChild(position);
      resultsDiv.appendChild(nick);
      resultsDiv.appendChild(points);
    });
  });
