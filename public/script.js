document.addEventListener("DOMContentLoaded", () => {
  // Dark mode toggle
  const darkModeToggle = document.getElementById("darkModeToggle");

  // Check for saved dark mode preference
  if (localStorage.getItem("darkMode") === "enabled") {
    document.documentElement.classList.add("dark");
    document.body.classList.add("dark");
    darkModeToggle.checked = true;
  }

  darkModeToggle.addEventListener("change", () => {
    if (darkModeToggle.checked) {
      document.documentElement.classList.add("dark");
      document.body.classList.add("dark");
      localStorage.setItem("darkMode", "enabled");
    } else {
      document.documentElement.classList.remove("dark");
      document.body.classList.remove("dark");
      localStorage.setItem("darkMode", "disabled");
    }
  });
});

async function summarize() {
  const urlInput = document.getElementById("urlInput").value;
  const response = await fetch("/.netlify/functions/api", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ url: urlInput }),
  });

  const data = await response.json();
  const summaryContainer = document.getElementById("summaryContainer");

  if (data.error) {
    summaryContainer.innerHTML = `<h2>Error</h2><p>${data.error}</p>`;
  } else {
    summaryContainer.innerHTML = `<h2 class="text-xl font-bold mb-4 pixel-font">Summary</h2>`;
    const formattedSummary = formatSummary(data.summary);
    summaryContainer.appendChild(formattedSummary);
  }
}

function formatSummary(summary) {
  const container = document.createElement("div");
  container.className = "space-y-4";

  const summaryText = document.createElement("p");
  summaryText.className = "text-lg leading-relaxed pixel-font";
  summaryText.style.fontSize = "14px";
  summaryText.textContent = summary;
  container.appendChild(summaryText);

  return container;
}
