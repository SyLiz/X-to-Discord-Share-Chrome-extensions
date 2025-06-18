const smallCheckmarkSVG = `
<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" style="vertical-align: middle;">
  <rect width="24" height="24" fill="#3BA55D" rx="4" ry="4"/>
  <path fill="white" d="M9 16.17l-3.88-3.88L4 13.41 9 18.41l12-12-1.41-1.41z"/>
</svg>
`;

document.addEventListener("DOMContentLoaded", () => {
  const input = document.getElementById("webhook");
  const saveBtn = document.getElementById("save");

  // Load stored webhook URL
  chrome.storage.local.get("webhookUrl", (data) => {
    if (data.webhookUrl) {
      input.value = data.webhookUrl;
    }
  });

  saveBtn.addEventListener("click", () => {
    const url = input.value.trim();
    if (url.startsWith("https://discord.com/api/webhooks/")) {
      chrome.storage.local.set({ webhookUrl: url }, () => {
        saveBtn.innerHTML = `${smallCheckmarkSVG} <span style="margin-left: 4px;">Saved!</span>`;
        setTimeout(() => (saveBtn.textContent = "Save"), 1500);
      });
    } else {
      alert("Please enter a valid Discord webhook URL.");
    }
  });
});
