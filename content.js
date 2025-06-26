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
      chrome.storage.local.get("webhooks", (data) => {
        const webhooks = data.webhooks;
        if (webhooks && webhooks.length > 0) {
          // If there's only one webhook, send directly
          if (webhooks.length === 1) {
            sendToDiscord(link, button, webhooks[0].url, post).finally(() => {
              isProcessing = false;
            });
          } else {
            // If there are multiple, show the selector
            showWebhookSelector(link, button, webhooks, post);
            isProcessing = false; // Unlock immediately after showing selector
          }
        } else {
          alert("Please set up your Discord webhooks in the extension popup.");
          isProcessing = false;
        }
      });
    } else {
      isProcessing = false;
    }
  };

  return button;
}

function showWebhookSelector(link, button, webhooks, post) {
  // Remove existing selector if any
  const existingSelector = document.getElementById(
    "discord-webhook-context-backdrop"
  );
  if (existingSelector) {
    existingSelector.remove();
  }

  // Create a full-page backdrop to capture clicks
  const backdrop = document.createElement("div");
  backdrop.id = "discord-webhook-context-backdrop";
  Object.assign(backdrop.style, {
    position: "absolute",
    top: "0",
    left: "0",
    width: "100%",
    height: `${document.body.scrollHeight}px`,
    backgroundColor: "transparent",
    zIndex: "9998",
  });

  const rect = button.getBoundingClientRect();
  const selectorContainer = document.createElement("div");
  selectorContainer.id = "discord-webhook-selector";

  // --- Theme detection for the menu ---
  const bodyStyles = getComputedStyle(document.body);
  const backgroundColor = bodyStyles.backgroundColor;

  let menuBackgroundColor, menuBorderColor, textColor, hoverBackgroundColor;

  if (backgroundColor === "rgb(0, 0, 0)") {
    // Lights Out (Black) theme
    menuBackgroundColor = "rgb(0, 0, 0)";
    menuBorderColor = "rgb(47, 51, 54)";
    textColor = "rgb(247, 249, 249)";
    hoverBackgroundColor = "rgba(255, 255, 255, 0.03)";
  } else if (backgroundColor === "rgb(21, 32, 43)") {
    // Dim theme
    menuBackgroundColor = "rgb(21, 32, 43)";
    menuBorderColor = "rgba(255, 255, 255, 0.2)";
    textColor = "#f7f9f9";
    hoverBackgroundColor = "rgba(255, 255, 255, 0.05)";
  } else {
    // Light theme
    menuBackgroundColor = "rgb(255, 255, 255)";
    menuBorderColor = "rgba(0, 0, 0, 0.1)";
    textColor = "#0f1419";
    hoverBackgroundColor = "rgba(0, 0, 0, 0.025)";
  }

  Object.assign(selectorContainer.style, {
    position: "absolute",
    top: `${rect.top + window.scrollY + 82}px`,
    left: `${rect.right + window.scrollX}px`,
    transform: "translate(-100%, -100%)",
    backgroundColor: menuBackgroundColor,
    border: `1px solid ${menuBorderColor}`,
    borderRadius: "12px",
    padding: "0px",
    zIndex: "9999",
    boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
    minWidth: "220px",
  });

  // Clicks on the backdrop will close it.
  backdrop.addEventListener("click", () => {
    document.body.removeChild(backdrop);
  });

  // Clicks on the menu itself shouldn't close it.
  selectorContainer.addEventListener("click", (e) => e.stopPropagation());

  const list = document.createElement("ul");
  Object.assign(list.style, {
    listStyle: "none",
    padding: "0",
    margin: "0",
  });

  webhooks.forEach((webhook) => {
    const item = document.createElement("li");
    const webhookButton = document.createElement("button");
    webhookButton.textContent = webhook.name;
    Object.assign(webhookButton.style, {
      width: "100%",
      padding: "10px 12px",
      border: "none",
      borderRadius: "8px",
      backgroundColor: "transparent",
      cursor: "pointer",
      textAlign: "left",
      color: textColor,
      fontSize: "15px",
      fontWeight: "bold",
    });
    webhookButton.onmouseover = () => {
      webhookButton.style.backgroundColor = hoverBackgroundColor;
    };
    webhookButton.onmouseout = () => {
      webhookButton.style.backgroundColor = "transparent";
    };

    webhookButton.onclick = (e) => {
      e.stopPropagation();
      sendToDiscord(link, button, webhook.url, post);
      document.body.removeChild(backdrop);
    };
    item.appendChild(webhookButton);
    list.appendChild(item);
  });
  selectorContainer.appendChild(list);

  backdrop.appendChild(selectorContainer);
  document.body.appendChild(backdrop);
}

function detectAndStoreTheme() {
  const colorScheme = getComputedStyle(document.documentElement).colorScheme;
  const theme = colorScheme === "dark" ? "dark" : "light";
  chrome.storage.local.set({ theme: theme });
}

function addShareButtons() {
  detectAndStoreTheme(); // Check theme when adding buttons
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
    actionBar.appendChild(button);
  });
}

function hasMultipleImages(post) {
  // Primary method: Check for multiple image containers (most reliable)
  const imageContainers = post.querySelectorAll('[data-testid="tweetPhoto"]');

  if (imageContainers.length > 1) {
    return true;
  }

  // Secondary method: Check for multiple unique photo numbers in links
  const photoLinks = post.querySelectorAll('a[href*="/photo/"]');

  if (photoLinks.length > 1) {
    const photoNumbers = Array.from(photoLinks)
      .map((link) => {
        const match = link.getAttribute("href").match(/\/photo\/(\d+)/);
        return match ? match[1] : null;
      })
      .filter((num) => num !== null);

    const uniqueNumbers = new Set(photoNumbers);

    if (uniqueNumbers.size > 1) {
      return true;
    }
  }

  // Tertiary method: Check for image grid structure
  const imageGrid = post.querySelector('[data-testid="tweetPhoto"]');
  if (imageGrid) {
    const gridImages = imageGrid.querySelectorAll('img[src*="pbs.twimg.com"]');

    if (gridImages.length > 1) {
      return true;
    }
  }

  // Quaternary method: Check for multiple actual post images (most conservative)
  const imageElements = post.querySelectorAll('img[src*="pbs.twimg.com"]');
  const actualImages = Array.from(imageElements).filter((img) => {
    const src = img.src;
    // Only count actual post images, not profile pictures or other small images
    return (
      src.includes("pbs.twimg.com/media/") &&
      (src.includes("large") || src.includes("medium") || src.includes("small"))
    );
  });

  if (actualImages.length > 1) {
    return true;
  }

  return false;
}

function getPostUrl(post) {
  // First, check if this post has multiple images
  if (hasMultipleImages(post)) {
    // Look for photo links to extract the base URL
    const photoLinks = post.querySelectorAll('a[href*="/photo/"]');

    if (photoLinks.length > 0) {
      // Get the first photo link and extract the base URL
      let firstPhotoUrl = photoLinks[0].getAttribute("href");

      // Handle relative URLs
      if (firstPhotoUrl.startsWith("/")) {
        firstPhotoUrl = "https://x.com" + firstPhotoUrl;
      }

      // Extract base URL by removing the /photo/number part
      const baseUrlMatch = firstPhotoUrl.match(
        /^(https?:\/\/[^\/]+)(\/status\/[^\/]+)/
      );

      if (baseUrlMatch) {
        const baseUrl = baseUrlMatch[1] + baseUrlMatch[2];
        return baseUrl;
      }
    }

    // Fallback: try to find any status link in the post
    const statusLink = post.querySelector('a[href*="/status/"]');
    if (statusLink) {
      const fallbackUrl = `https://x.com${statusLink.getAttribute("href")}`;
      return fallbackUrl;
    }
  }

  // Fallback to original behavior for single images or no images
  const anchor = post.querySelector('a[href*="/status/"]');
  const result = anchor ? `https://x.com${anchor.getAttribute("href")}` : null;
  return result;
}

function sendToDiscord(postUrl, button, webhookUrl, post) {
  // Check if current DOM URL has photo/{number} and is the same post
  let finalUrl = postUrl;
  const currentUrl = window.location.href;

  // Check if current URL contains photo/{number}
  const photoMatch = currentUrl.match(/\/photo\/(\d+)/);

  if (photoMatch) {
    // Extract the base URL by removing the photo/{number} part from current URL
    const currentBaseUrl = currentUrl.replace(/\/photo\/\d+.*$/, "");
    const postBaseUrl = postUrl.replace(/\/photo\/\d+.*$/, "");

    // Check if the base URLs match (same post)
    // Also check if postUrl is already the base URL (no photo/ in it)
    if (currentBaseUrl === postBaseUrl || currentBaseUrl === postUrl) {
      // Use the DOM URL with photo/{number} instead
      finalUrl = currentUrl;
    }
  }

  // Legacy logic for multiple image posts (keeping for backward compatibility)
  if (post && hasMultipleImages(post) && finalUrl === postUrl) {
    // For multiple image posts, remove photo/{num} from the URL to get base URL
    const cleanedUrl = postUrl.replace(/\/photo\/\d+.*$/, "");
    if (cleanedUrl !== postUrl) {
      finalUrl = cleanedUrl;
    }
  }

  return fetch(webhookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ content: `📢 ${finalUrl}` }),
  })
    .then((res) => {
      if (res.ok) {
        showSuccess(button);
      } else {
        // Handle Discord API rate limits or other errors
        res
          .json()
          .then((body) => {
            alert(
              `Failed to send to Discord: ${body.message || "Unknown error"}`
            );
          })
          .catch(() => {
            alert(
              "Failed to send to Discord and could not parse error response."
            );
          });
      }
    })
    .catch((err) => {
      console.error("Error sending to Discord:", err);
      alert(`An error occurred: ${err.message}`);
    });
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

// Improved approach using MutationObserver instead of setInterval
function initializeShareButtons() {
  // Add buttons to existing posts
  addShareButtons();

  // Set up MutationObserver to watch for new posts
  const observer = new MutationObserver((mutations) => {
    let shouldCheckForNewPosts = false;

    mutations.forEach((mutation) => {
      // Check if new nodes were added
      if (mutation.type === "childList" && mutation.addedNodes.length > 0) {
        mutation.addedNodes.forEach((node) => {
          // Check if the added node is an article (post) or contains articles
          if (node.nodeType === Node.ELEMENT_NODE) {
            if (node.tagName === "ARTICLE" || node.querySelector("article")) {
              shouldCheckForNewPosts = true;
            }
          }
        });
      }
    });

    // Only run addShareButtons if we detected new posts
    if (shouldCheckForNewPosts) {
      // Use requestAnimationFrame to batch multiple rapid changes
      requestAnimationFrame(() => {
        addShareButtons();
      });
    }
  });

  // Start observing the document body for changes
  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });

  // Also handle dynamic content loading (for infinite scroll, etc.)
  // Listen for scroll events to handle lazy-loaded content
  let scrollTimeout;
  window.addEventListener("scroll", () => {
    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(() => {
      addShareButtons();
    }, 100); // Small delay to batch scroll events
  });

  // Handle URL changes (for SPA navigation)
  let currentUrl = window.location.href;

  // Use a more reliable method to detect URL changes
  const checkForUrlChange = () => {
    if (window.location.href !== currentUrl) {
      currentUrl = window.location.href;
      // Small delay to let the page content load
      setTimeout(() => {
        addShareButtons();
        detectAndStoreTheme(); // Also check on navigation
      }, 500);
    }
  };

  // Watch for URL changes using multiple methods
  const titleElement = document.querySelector("title");
  if (titleElement) {
    const urlObserver = new MutationObserver(checkForUrlChange);
    urlObserver.observe(titleElement, {
      childList: true,
      subtree: true,
    });
  }

  // Also listen for popstate events (back/forward navigation)
  window.addEventListener("popstate", checkForUrlChange);

  // Listen for pushstate/replacestate events
  const originalPushState = history.pushState;
  const originalReplaceState = history.replaceState;

  history.pushState = function (...args) {
    originalPushState.apply(history, args);
    setTimeout(checkForUrlChange, 100);
  };

  history.replaceState = function (...args) {
    originalReplaceState.apply(history, args);
    setTimeout(checkForUrlChange, 100);
  };
}

// Initialize when the page is ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initializeShareButtons);
} else {
  initializeShareButtons();
}

// Observe for theme changes on the body
const themeObserver = new MutationObserver((mutations) => {
  mutations.forEach((mutation) => {
    if (mutation.attributeName === "style") {
      detectAndStoreTheme();
    }
  });
});

themeObserver.observe(document.documentElement, {
  attributes: true,
  attributeFilter: ["style"],
});
