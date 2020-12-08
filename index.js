const mustache = require("mustache");
const fetch = require("node-fetch");
const fs = require("fs");

const HttpsProxyAgent = require("https-proxy-agent");

// const agent = new HttpsProxyAgent("http://localhost:5000");

let callback = (err) => {
  if (err) throw err;
  console.log("source.txt was copied to destination.txt");
};

const idClash = "1427616e3b02df57113addab9155f675ab25569";
const challenger = "djedje72";
const ranks = [100,80,60,40,20];
const ignore = ["djedje72", "Coldk", "J7N__", "Jean-Lou"];
const beatChamp = 75;
const completed = 25;

const computeChamp = (players) => {
  const champion = players.find(({codingamerNickname}) => codingamerNickname === challenger);
  return players
      .filter(e => e !== champion && !ignore.includes(e.codingamerNickname))
      .map(({codingamerNickname, score},i) => ({
          "pseudo": codingamerNickname,
          "rank": i+1,
          "score": (ranks[i] || 0) + (players.indexOf(champion) > i ? beatChamp : 0) + (score === 100 ? completed : 0)
      }))
}

(async() => {
  const data = fs.readFileSync("./index.html", "utf8");

  const {players} = await fetch("https://www.codingame.com/services/ClashOfCode/findClashReportInfoByHandle", {
    // agent,
    "headers": {
      "accept": "application/json, text/plain, */*",
      "content-type": "application/json;charset=UTF-8",
    },
    "body": JSON.stringify([idClash]),
    "method": "POST"
  }).then(e=>e.json());
  players.sort((a,b) => a.rank - b.rank);

  const computedPlayers = computeChamp(players);
  let index = mustache.render(data, {
    idClash,
    podium: computedPlayers.slice(0,3),
    players: computedPlayers.slice(3),
  });

  let dir = "./build";

  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
  }

  fs.copyFile("style.css", "build/style.css", callback);
  fs.copyFile("dots.png", "build/dots.png", callback);

  fs.writeFile("build/index.html", index, "utf8", (err) => {
    console.log(err);
    process.exit(0);
  });
})();


