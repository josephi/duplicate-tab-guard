const params = new URLSearchParams(location.search);
const targetUrl = params.get('url');
const existingTabId = Number(params.get('existing'));

const switchButton = document.getElementById('switch');
const openButton = document.getElementById('open');
const cancelButton = document.getElementById('cancel');

document.getElementById('url').textContent = targetUrl;

async function closeThisTab() {
  const current = await chrome.tabs.getCurrent();
  await chrome.tabs.remove(current.id);
}

async function switchToExisting() {
  const existing = await chrome.tabs.update(existingTabId, { active: true });
  await chrome.windows.update(existing.windowId, { focused: true });
  await closeThisTab();
}

function openAnyway() {
  location.replace(targetUrl);
}

async function showExistingTab() {
  try {
    const existing = await chrome.tabs.get(existingTabId);
    document.getElementById('existing-title').textContent = existing.title || existing.url;
    document.getElementById('existing').hidden = false;
    switchButton.focus();
  } catch {
    switchButton.hidden = true;
    openButton.classList.add('primary');
    openButton.focus();
  }
}

switchButton.addEventListener('click', switchToExisting);
openButton.addEventListener('click', openAnyway);
cancelButton.addEventListener('click', closeThisTab);
document.addEventListener('keydown', event => {
  if (event.key === 'Escape') closeThisTab();
});

showExistingTab();
