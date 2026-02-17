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
async function carregarDadosFirestore() {
    // 1. Configurações do seu Firebase
    const projectId = "supreme-group-829cf";
    const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/equipes/supreme%201`;

    const bar = document.getElementById('weeklyBar');
    const text = document.getElementById('weeklyText');
    const goalText = document.getElementById('goalText');
    const goalLine = document.getElementById('goalLine');

    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error("Erro ao acessar Firestore");
        
        const rawData = await response.json();
        const fields = rawData.fields;
        
        const members = Number(fields.membros?.integerValue || 0);
        const donations = Number(fields.doacao?.integerValue || 0);
        const bossesTotal = Number(fields.bosses2026?.integerValue || 0);
        const weekly = Number(fields.bossesSemana?.integerValue || 0);

        // 2. Atualização dos contadores
        document.getElementById('members').textContent = members + 1;
        document.getElementById('donations').textContent = `$${donations}`;
        document.getElementById('bosses').textContent = bossesTotal;

        // 3. Configurações da barra e meta
        const maxWeekly = 40;
        const goalWeekly = 30;
        const percentage = Math.min((weekly / maxWeekly) * 100, 100);
        const goalPercentage = (goalWeekly / maxWeekly) * 100;

        // 4. Animação da Linha da Meta (Goal Line)
        // Usamos translateX(-50%) para centralizar a linha exatamente no ponto da meta
        goalLine.style.left = `${goalPercentage}%`;
        goalLine.style.transform = "translateX(-50%)"; 
        goalLine.style.boxShadow = "0 0 8px #ffdd00, 0 0 16px #ffdd00, 0 0 32px #ffdd00";
        setTimeout(() => { goalLine.style.opacity = "1"; }, 100);

        // 5. Animação da Barra de Progresso (ScaleX)
        // Resetamos o estado inicial para garantir que a animação ocorra
        bar.style.transformOrigin = "left";
        bar.style.width = "100%"; // Ocupa o container, mas o scaleX controla o visual
        
        // O requestAnimationFrame força o navegador a processar o scaleX(0) antes de animar
        requestAnimationFrame(() => {
            bar.style.transition = "transform 1.5s cubic-bezier(0.34, 1.56, 0.64, 1), background-color 0.5s";
            bar.style.transform = `scaleX(${percentage / 100})`;
            bar.style.opacity = "1";
        });

        // 6. Lógica de cores baseada no progresso
        const progressForColor = (weekly / goalWeekly) * 100;
        let color = "";
        if (progressForColor < 25) color = "#ff0000";
        else if (progressForColor < 50) color = "#ff7f00";
        else if (progressForColor < 75) color = "#edff00";
        else color = "#00d105";

        bar.style.background = `linear-gradient(90deg, ${color} 0%, #ffffffc8 200%)`;
        bar.style.boxShadow = `0 0 8px ${color}, 0 0 16px ${color}`;

        // 7. Atualização de textos
        text.textContent = `${weekly}/${maxWeekly} Bosses concluídos`;
        goalText.textContent = `Meta ${goalWeekly}/${maxWeekly}`;

    } catch (err) {
        console.error("Erro ao carregar dados do Firestore:", err);
    }
}

// Inicia a busca IMEDIATAMENTE ao carregar o arquivo JS
const promessaDados = carregarDadosFirestore();

// O listener de DOMContentLoaded agora apenas garante que o HTML 
// existe antes de aplicarmos os dados recebidos
document.addEventListener("DOMContentLoaded", () => {
    // Se a promessa já resolveu, os dados serão aplicados. 
    // Se não, ela aguardará o fim do fetch.
    promessaDados; 
});

// Scroll show/hide do botão
let lastScroll = 0;
const gearBtn = document.getElementById("gearBtn");

gearBtn.onclick = () => {
    window.open("https://script.google.com/macros/s/AKfycbwcMEM38XsTfhmwBYYzX2nfgovM95tt82VrOPxt_UT8V6sgG9aHdIvu6Xw22Rw9ZCVL/exec", "_blank");
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
