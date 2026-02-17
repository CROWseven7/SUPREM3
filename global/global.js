document.addEventListener("DOMContentLoaded", () => {
    const container = document.querySelector('.wind-container');
    if (!container) return;

    const totalLines = 25;

    for (let i = 0; i < totalLines; i++) {
        const line = document.createElement('span');
        line.classList.add('wind-line');

        line.style.top = Math.random() * 100 + 'vh';
        line.style.left = Math.random() * 100 + 'vw';

        line.style.width = (80 + Math.random() * 120) + 'px';
        line.style.animationDuration = (6 + Math.random() * 10) + 's';
        line.style.animationDelay = (-Math.random() * 15) + 's';

        const gray = 180 + Math.random() * 50;
        const opacity = 0.03 + Math.random() * 0.07;

        line.style.background = `rgba(${gray}, ${gray}, ${gray}, ${opacity})`;

        container.appendChild(line);
    }
});

// Navegação entre páginas de equipe
function goToTeam(page) {
    window.location.href = page;
}
