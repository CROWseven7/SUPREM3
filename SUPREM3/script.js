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
    const projectId = "supreme-group-829cf";
    const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/equipes/supreme%201`;

    const bar = document.getElementById('weeklyBar');
    const text = document.getElementById('weeklyText');
    const goalText = document.getElementById('goalText');
    const goalLine = document.getElementById('goalLine');
    const modal = document.getElementById('historyModal');
    const modalContent = document.getElementById('modalContent');

    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error("Erro ao acessar Firestore");

        const rawData = await response.json();
        const fields = rawData.fields;

        // 1. Extração de dados
        const members = Number(fields.membros?.integerValue || 0);
        const donations = Number(fields.doacao?.integerValue || 0);
        const bossesTotalGeral = Number(fields.bossesConcluidos?.integerValue || 0);
        const weekly = Number(fields.bossesSemana?.integerValue || 0);

        // 2. Atualização dos cards
        document.getElementById('members').textContent = members + 1;
        document.getElementById('donations').textContent = `$${donations}`;
        document.getElementById('bosses').textContent = bossesTotalGeral.toLocaleString();

        // 3. Montagem do Histórico
        let historico = [];
        for (const key in fields) {
            if (key.startsWith('bosses') && key !== 'bossesSemana' && key !== 'bossesConcluidos') {
                const valor = Number(fields[key].integerValue || 0);
                const ano = key.replace('bosses', '');
                historico.push({ ano, valor });
            }
        }
        historico.sort((a, b) => b.ano - a.ano);

        modalContent.innerHTML = historico.map(item => `
<div class="flex justify-between items-center p-4 bg-[#0f0f0f] rounded-xl border border-gray-800 transition-all duration-300 hover:bg-[#141414] hover:border-gray-500 hover:scale-[1.02] group">
        <div>
            <p class="text-[10px] text-gray-500 uppercase font-bold tracking-widest group-hover:text-gray-300 transition-colors">Ano</p>
            <p class="text-white font-bold">${item.ano}</p>
        </div>
        <div class="text-right">
            <p class="text-[10px] text-gray-500 uppercase font-bold tracking-widest group-hover:text-gray-300 transition-colors">Bosses</p>
            <p class="text-white font-black text-xl drop-shadow-[0_0_8px_rgba(237,255,0,0.2)]">${item.valor.toLocaleString()}</p>
        </div>
    </div>
`).join('');

        const toggleModal = (show) => {
            if (show) {
                modal.classList.remove('hidden');
                modal.classList.add('flex');
                document.body.classList.add('overflow-hidden'); // Trava o scroll da página
            } else {
                modal.classList.add('hidden');
                modal.classList.remove('flex');
                document.body.classList.remove('overflow-hidden');
            }
        };

        document.getElementById('openModal').onclick = (e) => { e.preventDefault(); toggleModal(true); };
        document.getElementById('closeModal').onclick = () => toggleModal(false);
        document.getElementById('closeModalBtn').onclick = () => toggleModal(false);

        // Fecha ao clicar no fundo escuro
        modal.onclick = (e) => { if (e.target === modal) toggleModal(false); };

        // 5. Barra Semanal
        const maxWeekly = 40;
        const goalWeekly = 30;
        const percentage = Math.min((weekly / maxWeekly) * 100, 100);
        const goalPercentage = (goalWeekly / maxWeekly) * 100;

        goalLine.style.left = `${goalPercentage}%`;
        goalLine.style.transform = "translateX(-50%)";
        goalLine.style.opacity = "1";

        bar.style.transformOrigin = "left";
        bar.style.width = "100%";
        requestAnimationFrame(() => {
            bar.style.transition = "transform 1.5s cubic-bezier(0.34, 1.56, 0.64, 1)";
            bar.style.transform = `scaleX(${percentage / 100})`;
            bar.style.opacity = "1";
        });

        const progressForColor = (weekly / goalWeekly) * 100;
        const color = progressForColor < 50 ? "#ff7f00" : progressForColor < 75 ? "#edff00" : "#00d105";
        bar.style.backgroundColor = color;
        bar.style.boxShadow = `0 0 12px ${color}44`;

        text.textContent = `${weekly}/${maxWeekly} Bosses concluídos`;
        goalText.textContent = `Meta ${goalWeekly}/${maxWeekly}`;

        feather.replace();

    } catch (err) {
        console.error("Erro no Firestore:", err);
    }
}

const promessaDados = carregarDadosFirestore();

document.addEventListener("DOMContentLoaded", () => {
    promessaDados;
});

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
