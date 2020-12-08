function calculate() {
    const res = JSON.parse(document.getElementById("result").value);
    const podium = document.getElementById("podium");
    podium.innerHTML="";
    const winners = res.slice(0, 3);
    winners.forEach(winner => {
        const div = document.createElement("div");
        const h2 = document.createElement("h2");
        h2.innerText = `${winner.pseudo}\n(${winner.score} points)`;
        div.appendChild(h2);
        podium.appendChild(div);
    });
}