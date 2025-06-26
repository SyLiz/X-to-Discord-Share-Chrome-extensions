document.addEventListener("DOMContentLoaded", () => {
  const nameInput = document.getElementById("webhook-name");
  const urlInput = document.getElementById("webhook-url");
  const addBtn = document.getElementById("add-webhook-btn");
  const cancelBtn = document.getElementById("cancel-edit-btn");
  const webhooksList = document.getElementById("webhooks-list");

  let editIndex = null;

  const smallCheckmarkSVG = `
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" style="vertical-align: middle;">
    <path fill="white" d="M9 16.17l-3.88-3.88L4 13.41 9 18.41l12-12-1.41-1.41z"/>
  </svg>
  `;

  // Function to reset the form
  function resetForm() {
    nameInput.value = "";
    urlInput.value = "";
    addBtn.textContent = "Add Webhook";
    cancelBtn.style.display = "none";
    addBtn.style.flexGrow = "0";
    editIndex = null;
  }

  // Function to render webhooks
  function renderWebhooks(webhooks) {
    webhooksList.innerHTML = ""; // Clear existing list
    if (webhooks && webhooks.length > 0) {
      webhooks.forEach((webhook, index) => {
        const li = document.createElement("li");
        li.innerHTML = `
          <div class="webhook-info">
            <span class="webhook-name">${webhook.name}</span>
          </div>
          <div class="webhook-actions">
            <button class="edit-btn" data-index="${index}">Edit</button>
            <button class="delete-btn" data-index="${index}">Delete</button>
          </div>
        `;
        webhooksList.appendChild(li);
      });
    } else {
      webhooksList.innerHTML =
        '<li class="empty-state">No webhooks saved yet.</li>';
    }
  }

  // Load and render webhooks on startup
  chrome.storage.local.get("webhooks", (data) => {
    // Basic migration from old format
    if (!data.webhooks) {
      chrome.storage.local.get("webhookUrl", (oldData) => {
        if (oldData.webhookUrl) {
          const migratedWebhooks = [
            { name: "Default", url: oldData.webhookUrl },
          ];
          chrome.storage.local.set({ webhooks: migratedWebhooks }, () => {
            chrome.storage.local.remove("webhookUrl");
            renderWebhooks(migratedWebhooks);
          });
        } else {
          renderWebhooks([]);
        }
      });
    } else {
      renderWebhooks(data.webhooks);
    }
  });

  // Add or Update webhook
  addBtn.addEventListener("click", () => {
    const name = nameInput.value.trim();
    const url = urlInput.value.trim();

    if (!name || !url) {
      alert("Please provide both a name and a URL.");
      return;
    }
    if (
      !url.startsWith("https://discord.com/api/webhooks/") &&
      !url.startsWith("https://discordapp.com/api/webhooks/")
    ) {
      alert("Please enter a valid Discord webhook URL.");
      return;
    }

    chrome.storage.local.get("webhooks", (data) => {
      const webhooks = data.webhooks || [];
      if (editIndex !== null) {
        // Update existing webhook
        webhooks[editIndex] = { name, url };
      } else {
        // Add new webhook
        webhooks.push({ name, url });
      }

      chrome.storage.local.set({ webhooks }, () => {
        if (editIndex !== null) {
          addBtn.innerHTML = `${smallCheckmarkSVG} <span>Saved!</span>`;
          setTimeout(resetForm, 1500);
        } else {
          addBtn.innerHTML = `${smallCheckmarkSVG} <span>Added!</span>`;
          setTimeout(() => {
            addBtn.textContent = "Add Webhook";
            nameInput.value = "";
            urlInput.value = "";
          }, 1500);
        }
        renderWebhooks(webhooks);
      });
    });
  });

  // Cancel Edit
  cancelBtn.addEventListener("click", resetForm);

  // Edit/Delete webhook (using event delegation)
  webhooksList.addEventListener("click", (e) => {
    const target = e.target;
    if (target) {
      if (target.classList.contains("delete-btn")) {
        const indexToDelete = parseInt(target.dataset.index, 10);
        chrome.storage.local.get("webhooks", (data) => {
          let webhooks = data.webhooks || [];
          webhooks.splice(indexToDelete, 1); // Remove the item
          chrome.storage.local.set({ webhooks }, () => {
            renderWebhooks(webhooks);
          });
        });
      } else if (target.classList.contains("edit-btn")) {
        const indexToEdit = parseInt(target.dataset.index, 10);
        chrome.storage.local.get("webhooks", (data) => {
          const webhooks = data.webhooks || [];
          const webhookToEdit = webhooks[indexToEdit];
          if (webhookToEdit) {
            nameInput.value = webhookToEdit.name;
            urlInput.value = webhookToEdit.url;
            addBtn.textContent = "Save Changes";
            cancelBtn.style.display = "block";
            addBtn.style.flexGrow = "1";
            editIndex = indexToEdit;
            nameInput.focus();
          }
        });
      }
    }
  });
});
