const discordIconSVG = `
  <svg xmlns="http://www.w3.org/2000/svg" fill="#5865F2" viewBox="0 0 24 24" width="20" height="20">
<path d="M20.317 4.369a19.791 19.791 0 00-4.885-1.515.07.07 0 00-.075.035c-.211.375-.444.864-.608 1.249a18.225 18.225 0 00-5.487 0 12.51 12.51 0 00-.617-1.25.07.07 0 00-.075-.035A19.736 19.736 0 003.683 4.37a.064.064 0 00-.03.027C.533 9.046-.32 13.579.099 18.057a.076.076 0 00.028.051 19.9 19.9 0 005.993 3.04.07.07 0 00.076-.027c.46-.63.873-1.295 1.226-1.994a.07.07 0 00-.038-.098 12.69 12.69 0 01-1.792-.858.07.07 0 01.007-.124c.12-.09.24-.18.355-.272a.07.07 0 01.073-.01c3.748 1.714 7.791 1.714 11.504 0a.07.07 0 01.075.01c.116.091.236.182.357.272a.07.07 0 01.007.124c-.57.334-1.169.623-1.79.857a.07.07 0 00-.04.1c.36.698.773 1.363 1.225 1.993a.07.07 0 00.076.028 19.888 19.888 0 006.001-3.04.07.07 0 00.028-.05c.5-5.177-.838-9.664-3.548-13.66a.061.061 0 00-.03-.03zM8.02 15.331c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.418 2.157-2.418 1.21 0 2.174 1.094 2.157 2.418 0 1.334-.955 2.419-2.157 2.419zm7.974 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.418 2.157-2.418 1.21 0 2.174 1.094 2.157 2.418 0 1.334-.947 2.419-2.157 2.419z"/>  </svg>
`;

const checkmarkSVG = `
<svg xmlns="http://www.w3.org/2000/svg" fill="#3BA55D" viewBox="0 0 24 24" width="20" height="20">
  <path d="M9 16.17l-3.88-3.88L4 13.41 9 18.41l12-12-1.41-1.41z"/>
</svg>
`;

// When creating the button
function createShareButton() {
  const button = document.createElement("button");
  button.className = "share-to-discord";
  button.innerHTML = discordIconSVG;
  button.title = "Share to Discord";

  Object.assign(button.style, {
    width: "32px",
    height: "32px",
    padding: "0",
    margin: "0",
    marginLeft: "8px",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "transparent",
    border: "none",
    cursor: "pointer",
    transition: "all 0.2s ease",
    boxSizing: "border-box",
    position: "absolute",
    top: "50%",
    transform: "translateY(-50%)",
    right: "0px",
    zIndex: "10",
    flexShrink: "0",
  });

  // Debounce flag
  let isProcessing = false;

  button.onmouseover = () => {
    if (!button.dataset.shared) {
      button.style.background = "#e3e6f8";
      button.style.transform = "translateY(-50%) scale(1.1)";
    }
  };

  button.onmouseout = () => {
    if (!button.dataset.shared) {
      button.style.background = "transparent";
      button.style.transform = "translateY(-50%) scale(1)";
    }
  };

  button.onclick = () => {
    if (isProcessing) return; // ignore if debounce active

    isProcessing = true; // lock debounce

    const post = button.closest("article");
    const link = getPostUrl(post);
    if (link) {
      chrome.storage.local.get("webhookUrl", (data) => {
        if (data.webhookUrl) {
          sendToDiscord(link, button, data.webhookUrl).finally(() => {
            // Unlock debounce after request completes (success or error)
            isProcessing = false;
          });
        } else {
          alert("Please set your Discord webhook URL in the extension popup.");
          isProcessing = false;
        }
      });
    } else {
      isProcessing = false;
    }
  };

  return button;
}

function addShareButtons() {
  const posts = document.querySelectorAll("article");

  posts.forEach((post) => {
    if (post.querySelector(".share-to-discord")) return;

    const actionBar = post.querySelector('[role="group"]');
    if (!actionBar) return;

    // Make the action bar relative positioned and add padding for the button space
    actionBar.style.position = "relative";
    actionBar.style.paddingRight = "48px"; // More space for better spacing
    actionBar.style.boxSizing = "border-box";

    const button = createShareButton();

    button.onclick = () => {
      const link = getPostUrl(post);
      if (link) {
        chrome.storage.local.get("webhookUrl", (data) => {
          if (data.webhookUrl) {
            sendToDiscord(link, button, data.webhookUrl);
          } else {
            alert(
              "Please set your Discord webhook URL in the extension popup."
            );
          }
        });
      }
    };

    actionBar.appendChild(button);
  });
}

function getPostUrl(post) {
  const anchor = post.querySelector('a[href*="/status/"]');
  return anchor ? `https://x.com${anchor.getAttribute("href")}` : null;
}

function sendToDiscord(postUrl, button, webhookUrl) {
  return fetch(webhookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ content: `📢 ${postUrl}` }),
  })
    .then((res) => {
      if (res.ok) {
        showSuccess(button);
      }
    })
    .catch(console.error);
}

function showSuccess(button) {
  button.dataset.shared = "true";
  button.innerHTML = checkmarkSVG;
  button.style.background = "#d4f8df";
  button.style.transform = "translateY(-50%) scale(1.15)"; // Keep centering on success
  button.style.transition = "all 0.2s ease";

  setTimeout(() => {
    button.innerHTML = discordIconSVG;
    button.style.background = "transparent";
    button.style.transform = "translateY(-50%) scale(1)"; // Keep centering
    button.dataset.shared = "";
  }, 1500);
}

setInterval(addShareButtons, 3000);
