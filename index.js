let mustache = require("mustache");
let fs = require("fs");

let players = [
  {
    pseudo: "Pursuable",
    rank: 1,
    score: 200,
  },
  {
    pseudo: "Mecadie",
    rank: 2,
    score: 155,
  },
  {
    pseudo: "AikoChikana",
    rank: 3,
    score: 135,
  },
  {
    pseudo: "youf-olivier",
    rank: 4,
    score: 115,
  },
];

let callback = (err) => {
  if (err) throw err;
  console.log("source.txt was copied to destination.txt");
};

let file = fs.readFile("./index.html", "utf8", (err, data) => {
  let view = players.sort((a, b) => a.rank - b.rank);
  let index = mustache.render(data, {
    players: view.slice(3),
    podium: view.slice(0, 3),
  });

  let dir = "./build";

  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
  }

  fs.copyFile("style.css", "build/style.css", callback);
  fs.copyFile("dots.png", "build/dots.png", callback);

  fs.writeFile("build/index.html", index, "utf8", (err) => {
    console.log(err);
  });
});
