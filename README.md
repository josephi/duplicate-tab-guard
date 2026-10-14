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

## Install

1. Download `duplicate-tab-guard-<version>.zip` from the [latest release](https://github.com/josephi/duplicate-tab-guard/releases/latest) and unzip it
2. Open `chrome://extensions`
3. Turn on **Developer mode** (top-right switch)
4. Click **Load unpacked** and pick the unzipped folder

Keep the folder where it is: Chrome loads the extension from it on every start. To upgrade, unzip the new release over the old folder and click the reload arrow on the extension's card.

Chrome won't install the zip directly, and it blocks packaged `.crx` files that aren't from the Web Store, so unzipping is the only way for now.

## Install from source

Clone the repo and use **Load unpacked** on the repo folder. After pulling changes, click the reload arrow on the extension's card.

## Permissions

| Permission | Used for |
|---|---|
| `tabs` | Reading the URLs of open tabs to find duplicates |
| `webNavigation` | Catching a new tab's first navigation before it loads |
| `storage` | Remembering which tabs are new while the service worker sleeps |
| `contextMenus` | The right-click menu items |

Nothing leaves your browser. The extension makes no network requests.
