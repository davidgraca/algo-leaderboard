const mustache = require("mustache");
const fetch = require("node-fetch");
const fs = require("fs");

let agent = undefined;

if (process.argv.includes("--proxy")) {
  const HttpsProxyAgent = require("https-proxy-agent");
  agent = new HttpsProxyAgent("http://localhost:5000");
}

let callback = (err) => {
  if (err) throw err;
  console.log("source.txt was copied to destination.txt");
};

const allClashes = JSON.parse(fs.readFileSync("./clashes.json", "utf8"));
const ranks = [100, 80, 60, 40, 20];
const ignore = ["djedje72", "Coldk", "J7N__", "Jean-Lou"];
const beatChamp = 75;
const completed = 25;

const computeChamp = (players, champion) => {
  const championEl = players.find(
    ({ codingamerNickname }) => codingamerNickname === champion
  );
  return players
    .filter((e) => e !== championEl && !ignore.includes(e.codingamerNickname))
    .map(({ codingamerNickname, score }, i) => ({
      pseudo: codingamerNickname,
      // "rank": i+1,
      score:
        (ranks[i] || 0) +
        (players.indexOf(championEl) > i ? beatChamp : 0) +
        (score === 100 ? completed : 0),
    }));
};

(async () => {
  const data = fs.readFileSync("./index.html", "utf8");

  const classement = await Promise.all(
    allClashes.map(async (session) => {
      const clashes = await Promise.all(
        session.map(async ({ id, champion }) => {
          const { players } = await fetch(
            "https://www.codingame.com/services/ClashOfCode/findClashReportInfoByHandle",
            {
              agent,
              headers: {
                accept: "application/json, text/plain, */*",
                "content-type": "application/json;charset=UTF-8",
              },
              body: JSON.stringify([id]),
              method: "POST",
            }
          ).then((e) => e.json());
          players.sort((a, b) => a.rank - b.rank);

          return computeChamp(players, champion);
        })
      );

      const globalChamps = Object.entries(
        clashes.flat().reduce(
          (acc, { pseudo, score }) => ({
            ...acc,
            [pseudo]: (acc[pseudo] || 0) + score,
          }),
          {}
        )
      )
        .sort(([, a], [, b]) => b - a)
        .map(([pseudo, score], i) => ({
          pseudo,
          score,
          rank: i + 1,
        }));
      return {
        clashes: session.map(({ id, champion }, i) => ({
          id,
          champion,
          index: i + 1,
        })),
        podium: globalChamps.slice(0, 3),
        players: globalChamps.slice(3),
      };
    })
  );

  const globalClassement = Object.entries(
    classement
      .flatMap(({ podium, players }) => [...podium, ...players])
      .reduce(
        (acc, { pseudo, score }) => ({
          ...acc,
          [pseudo]: (acc[pseudo] || 0) + score,
        }),
        {}
      )
  )
    .sort(([, a], [, b]) => b - a)
    .map(([pseudo, score], i) => ({
      pseudo,
      score,
      rank: i + 1,
    }));
  console.log(globalClassement);

  // .sort((a,b) => b.score-a.score)
  // .map((e,i) => ({
  //   ...e,
  //   rank: i+1
  // }));

  let index = mustache.render(data, {
    classement: classement.map((score, i) => ({ index: i + 1, score })),
    global: {
      podium: globalClassement.slice(0, 3),
      players: globalClassement.slice(3),
    },
  });

  let dir = "./build";

  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
  }

  fs.copyFile("style.css", "build/style.css", callback);
  fs.copyFile("sessions.js", "build/sessions.js", callback);

  fs.writeFile("build/index.html", index, "utf8", (err) => {
    console.log(err);
    process.exit(0);
  });
})();
