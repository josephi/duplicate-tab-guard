# Duplicate Tab Guard

A Chrome extension that stops you from opening the same page twice. When a link opens in a new tab and that URL is already open somewhere else, the new tab asks first:

- **Take me there** switches to the tab you already have and closes the new one
- **Open anyway** loads the link
- **Cancel** closes the new tab

URLs are compared without their `#fragment` and trailing slash.

## Opening a duplicate on purpose

- Click the toolbar icon to duplicate the current tab
- Press `Alt+Shift+D` (change it at `chrome://extensions/shortcuts`)
- Right-click a page and pick **Duplicate tab (no prompt)**
- Right-click a link and pick **Open link in new tab (no prompt)**

Chrome doesn't let extensions add items to the tab strip's right-click menu, so the page menu, the toolbar icon and the shortcut are the closest options. Chrome's own **Duplicate** on a tab still shows the prompt.

## Install from source

1. Open `chrome://extensions`
2. Turn on **Developer mode**
3. Click **Load unpacked** and pick this folder

After pulling changes, click the reload arrow on the extension's card.

## Permissions

| Permission | Used for |
|---|---|
| `tabs` | Reading the URLs of open tabs to find duplicates |
| `webNavigation` | Catching a new tab's first navigation before it loads |
| `storage` | Remembering which tabs are new while the service worker sleeps |
| `contextMenus` | The right-click menu items |

Nothing leaves your browser. The extension makes no network requests.
