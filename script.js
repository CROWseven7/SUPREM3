async function fetchHTML(url) {
  const res = await fetch(url);
  const text = await res.text();
  // cria um DOM virtual para parsear a tabela
  const parser = new DOMParser();
  const doc = parser.parseFromString(text, 'text/html');
  return doc;
}

async function updateStats() {
  const membersURL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vS0zkxpWDSATx1QE5EQjaosgTKJJMlMg3HoXTS7zHs3k6KXredtvO-psKB4tHxi1g6ashf5k2BSvS0G/pubhtml?gid=1797724220&single=true';
  const bossesURL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vS0zkxpWDSATx1QE5EQjaosgTKJJMlMg3HoXTS7zHs3k6KXredtvO-psKB4tHxi1g6ashf5k2BSvS0G/pubhtml?gid=1132147204&single=true';

  // Membros ativos (aba 1, célula H2)
  const membersDoc = await fetchHTML(membersURL);
  const membersCell = membersDoc.querySelector('table tr:nth-child(2) td:nth-child(8)');
  document.getElementById('members').textContent = membersCell.textContent;

  // Bosses concluídos (aba 2, célula A56)
  const bossesDoc = await fetchHTML(bossesURL);
  const bossesCell = bossesDoc.querySelector('table tr:nth-child(56) td:nth-child(1)');
  document.getElementById('bosses').textContent = bossesCell.textContent;
}

updateStats();
