# X to Discord Share Browser Extension

A Chrome extension that adds a convenient "Share to Discord" button to every post on X (formerly Twitter), allowing you to quickly share posts to your Discord server via webhooks.

## Features

- 🔗 **One-click sharing**: Share any X post directly to Discord with a single click
- 🎯 **Non-intrusive design**: Clean, minimalist Discord-themed button that blends seamlessly with X's interface
- ✅ **Visual feedback**: Success animation with checkmark when posts are shared
- 🔄 **Auto-detection**: Automatically adds share buttons to new posts as you scroll
- 🛡️ **Debounce protection**: Prevents accidental duplicate shares
- ⚙️ **Webhook Management**: Simple popup interface to add, edit, and delete webhooks.
- 🖼️ **Multi-image support**: Automatically detects posts with multiple images and shares the base post URL.
- 📸 **Photo URL handling**: Intelligently sends specific photo URLs when viewing individual images from multi-photo posts.

## Installation

### From Source (Developer Mode)

1. Clone or download this repository
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" in the top right corner
4. Click "Load unpacked" and select the extension folder
5. The extension will be installed and ready to use

### Setup Discord Webhook

1. In your Discord server, go to Server Settings → Integrations → Webhooks
2. Click "New Webhook" or "Create Webhook"
3. Choose the channel where you want posts to be shared
4. Copy the webhook URL
5. Click the extension icon in your browser toolbar
6. Paste the webhook name and URL and click "Add Webhook"

You can add multiple webhooks and they will be listed in the popup. To edit a webhook, click the "Edit" button, make your changes in the form, and click "Save Changes".

## Usage

1. Navigate to [x.com](https://x.com) (or twitter.com)
2. You'll see a Discord icon button on the right side of each post's action bar
3. Click the Discord button to share that post to your configured Discord channel
4. The button will show a green checkmark briefly to confirm successful sharing
5. Posts will appear in Discord with a 📢 emoji prefix

## File Structure

```
x-discord-share/
├── manifest.json      # Extension configuration and permissions
├── content.js         # Main functionality and UI injection
├── popup.html         # Settings popup interface
├── popup.js           # Popup functionality and webhook management
└── README.md          # This file
```

## Technical Details

### Permissions Required

- `storage`: To save your Discord webhook URL locally
- `scripting`: To inject the share buttons into X pages
- `activeTab`: To access the current tab's content

### Browser Compatibility

- Chrome (Manifest V3)
- Compatible with Chromium-based browsers (Edge, Brave, etc.)

### Security

- Webhook URLs are stored locally in Chrome's storage
- No data is sent to external servers except Discord's webhook endpoint
- Extension only runs on X/Twitter domains

## How It Works

1. **Content Script Injection**: The extension injects `content.js` into X pages
2. **Button Creation**: Dynamically creates Discord share buttons for each post
3. **URL Extraction**: Extracts the post URL from X's DOM structure
4. **Discord Integration**: Sends post URLs to Discord via webhook API
5. **Visual Feedback**: Provides immediate feedback with animations

### Multi-Image Post Detection

The extension intelligently detects posts with multiple images and handles them differently:

- **Detection Methods**:
  - Looks for multiple `[data-testid="tweetPhoto"]` containers
  - Checks for multiple photo links with different `/photo/{number}` patterns
  - Identifies multiple image elements from Twitter's CDN
- **URL Extraction**: For multi-image posts, extracts the base post URL by removing the `/photo/{number}` suffix
- **Fallback Handling**: If base URL extraction fails, falls back to the standard post URL
- **Photo URL Handling**: When viewing a specific photo from a multi-photo post (e.g., `/photo/2`), the extension sends the exact photo URL to Discord instead of the base post URL

This ensures that when you share a post with multiple images, Discord receives the main post URL rather than a specific image URL, allowing viewers to see all images in the post. However, when you're viewing a specific photo from that post, the extension will share the direct link to that particular image.

## Customization

### Styling

The share buttons are styled to match X's design language:

- Transparent background with hover effects
- Discord's brand color (#5865F2)
- Smooth transitions and scaling animations
- Responsive design that works on different screen sizes

### Behavior

- Buttons are added every 3 seconds to catch dynamically loaded content
- Debounce mechanism prevents rapid-fire clicking
- Success state persists for 1.5 seconds before reverting

## Troubleshooting

### Button Not Appearing

- Ensure you're on x.com or twitter.com
- Check that the extension is enabled in Chrome extensions
- Try refreshing the page

### Sharing Not Working

- Verify your Discord webhook URL is correct and starts with `https://discord.com/api/webhooks/`
- Check that the webhook's target channel still exists
- Ensure you have permission to post in the target Discord channel

### Posts Not Showing in Discord

- Confirm the webhook is active and properly configured
- Check your Discord server's permissions
- Verify the webhook URL hasn't expired

## Development

### Local Development

1. Make changes to the source files
2. Go to `chrome://extensions/`
3. Click the refresh icon on the extension card
4. Test changes on X

### Adding Features

- Modify `content.js` for UI changes
- Update `popup.html` and `popup.js` for settings
- Adjust `manifest.json` for permissions or configuration

## Privacy

This extension:

- Only accesses X/Twitter pages
- Stores webhook URLs locally on your device
- Does not collect or transmit personal data
- Only sends post URLs to your specified Discord webhook

## Support

If you encounter issues:

1. Check the troubleshooting section above
2. Verify your webhook URL is correct
3. Try disabling and re-enabling the extension
4. Check the browser console for error messages

## License

This project is open source. Feel free to modify and distribute according to your needs.

---

**Note**: This extension is not affiliated with X (Twitter) or Discord. It's a third-party tool created to enhance user experience.

# X-to-Discord-Share-Chrome-extensions
