document.addEventListener('DOMContentLoaded', () => {
  loadPreviousLinks();

  // Add click event listener for toggling the previous links container
  const previousLinksTitle = document.getElementById('previousLinksTitle');
  const previousLinksContainer = document.getElementById('previousLinksContainer');

  previousLinksTitle.addEventListener('click', () => {
    previousLinksContainer.classList.toggle('expanded');
  });
});

async function summarize() {
  const urlInput = document.getElementById('urlInput').value;

  const response = await fetch('http://localhost:3000/api/summarize', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ url: urlInput }),
  });

  const data = await response.json();
  const summaryContainer = document.getElementById('summaryContainer');

  if (data.error) {
    summaryContainer.innerHTML = `<h2>Error</h2><p>${data.error}</p>`;
  } else {
    summaryContainer.innerHTML = `<h2>Summary</h2>`;
    const formattedSummary = formatSummary(data.summary);
    summaryContainer.appendChild(formattedSummary);
  }

  loadPreviousLinks();
}

function formatSummary(summary) {
  const lines = summary.split('\n').map(line => line.trim()).filter(line => line.length > 0);
  const ul = document.createElement('ul');
  lines.forEach(line => {
    const li = document.createElement('li');
    li.textContent = line;
    ul.appendChild(li);
  });
  return ul;
}

async function loadPreviousLinks() {
  const response = await fetch('http://localhost:3000/api/links');
  const links = await response.json();
  const previousLinks = document.getElementById('previousLinks');
  previousLinks.innerHTML = links.map(link => `<li>${link.url}</li>`).join('');
}