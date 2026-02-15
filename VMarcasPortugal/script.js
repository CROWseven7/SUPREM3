// Feather Icons
feather.replace();

// Funções para horário de Brasília
function getBrasiliaNow() {
    const now = new Date();
    const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
    return new Date(utc - (3 * 60 * 60 * 1000)); // GMT-3
}

function nextDate(dayOffset, hour) {
    const d = getBrasiliaNow();
    d.setDate(d.getDate() + dayOffset);
    d.setHours(hour, 0, 0, 0);
    return d;
}

// Timer
function updateTimer() {
    const now = getBrasiliaNow();
    const day = now.getDay(); // 0 = domingo

    let target, title = "", subtitle = "", round = "—";

    if (day === 0 || (day === 1 && now.getHours() < 12)) {
        target = nextDate(day === 0 ? 1 : 0, 12);
        title = "Para o início das rondas";
        round = "Aguardando";
    } else if ((day === 1 && now.getHours() >= 12) || (day === 2 && now.getHours() < 18)) {
        target = day === 1 ? nextDate(1, 18) : nextDate(0, 18);
        title = "Para o fim da primeira ronda";
        round = "1";
    } else if ((day === 2 && now.getHours() >= 18) || day === 3 || (day === 4 && now.getHours() < 18)) {
        target = nextDate(day === 4 ? 0 : (4 - day), 18);
        title = "Para o fim da segunda ronda";
        round = "2";
    } else {
        target = nextDate(day === 6 ? 0 : (6 - day), 18);
        title = "Para o fim da terceira ronda";
        round = "3";
    }

    const diff = target - now;
    const totalSeconds = Math.max(0, Math.floor(diff / 1000));
    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    document.getElementById("timerTitle").textContent = title;
    document.getElementById("timerSubtitle").textContent = subtitle;
    document.getElementById("days").textContent = String(days).padStart(2, "0");
    document.getElementById("hours").textContent = String(hours).padStart(2, "0");
    document.getElementById("minutes").textContent = String(minutes).padStart(2, "0");
    document.getElementById("seconds").textContent = String(seconds).padStart(2, "0");
    document.getElementById("roundValue").textContent = round;
}

updateTimer();
setInterval(updateTimer, 1000);

// Fetch dados da planilha
async function carregarDados() {
    const url = "https://script.google.com/macros/s/AKfycbz0w2oRztQI2qo-TrR2R87cCnaHtu5sq5RkNaheL3Z21nQogHjn7dYcvlsv7ZfXSRa1Ow/exec?json=true";

    const bar = document.getElementById('weeklyBar');
    const text = document.getElementById('weeklyText');
    const goalText = document.getElementById('goalText');
    const goalLine = document.getElementById('goalLine');

    try {
        const response = await fetch(url);
        const data = await response.json();

        const membersFromJson = Number(data.members) || 0;
        document.getElementById('members').textContent = membersFromJson;
        document.getElementById('donations').textContent = `$${data.donations ?? 0}`;
        document.getElementById('bosses').textContent = data.bosses ?? 0;

        const weekly = data.bossesSemana ?? 0;
        const maxWeekly = 40;
        const goalWeekly = 30;
        const goalOffsetPx = 16;

        const percentage = Math.min((weekly / maxWeekly) * 100, 100);
        const goalPercentage = (goalWeekly / maxWeekly) * 100;

        const barWidth = bar.offsetWidth;
        const offset = goalOffsetPx;
        goalLine.style.left = `calc(${goalPercentage}% - ${offset}px)`;
        goalLine.style.transition = "opacity 1s ease-in-out";
        goalLine.style.boxShadow = "0 0 8px #ffdd00, 0 0 16px #ffdd00, 0 0 32px #ffdd00";
        setTimeout(() => { goalLine.style.opacity = "1"; }, 100);

        bar.style.opacity = "1";
        bar.style.width = percentage + "%";

        const progressForColor = (weekly / goalWeekly) * 100;
        if (progressForColor < 25) {
            bar.style.backgroundColor = "#ff0000";
            bar.style.boxShadow = "0 0 8px #ff0000, 0 0 16px #ff0000, 0 0 32px #ff0000";
        } else if (progressForColor < 50) {
            bar.style.backgroundColor = "#ff7f00";
            bar.style.boxShadow = "0 0 8px #ff7f00, 0 0 16px #ff7f00, 0 0 32px #ff7f00";
        } else if (progressForColor < 75) {
            bar.style.backgroundColor = "#edff00";
            bar.style.boxShadow = "0 0 8px #edff00, 0 0 16px #edff00, 0 0 32px #edff00";
        } else {
            bar.style.backgroundColor = "#00d105";
            bar.style.boxShadow = "0 0 8px #00d105, 0 0 16px #00d105, 0 0 32px #00d105";
        }

        text.textContent = `${weekly}/${maxWeekly} Bosses concluídos`;
        goalText.textContent = `Meta ${goalWeekly}/${maxWeekly}`;
    } catch (err) {
        console.error("Erro geral:", err);
    }
}

document.addEventListener("DOMContentLoaded", carregarDados);

// Scroll show/hide do botão
let lastScroll = 0;
const gearBtn = document.getElementById("gearBtn");

gearBtn.onclick = () => {
    window.open("https://script.google.com/macros/s/AKfycbz0w2oRztQI2qo-TrR2R87cCnaHtu5sq5RkNaheL3Z21nQogHjn7dYcvlsv7ZfXSRa1Ow/exec", "_blank");
};

window.addEventListener("scroll", () => {
    const current = window.scrollY;
    if (current > lastScroll) {
        gearBtn.style.opacity = "0";
        gearBtn.style.pointerEvents = "none";
    } else {
        gearBtn.style.opacity = "1";
        gearBtn.style.pointerEvents = "auto";
    }
    lastScroll = current;
});














