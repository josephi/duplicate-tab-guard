const DUPLICATE_COMMAND = 'duplicate-without-prompt';
const OPEN_LINK_MENU = 'open-link-without-prompt';
const PENDING_PREFIX = 'pending:';
const BYPASS_PREFIX = 'bypass:';
const BYPASS_TTL_MS = 5000;
const SESSION_RESTORE_GRACE_MS = 5000;

const pendingTabs = new Set();
let ignoreNewTabsUntil = 0;

function normalizeUrl(url) {
  try {
    const parsed = new URL(url);
    parsed.hash = '';
    return parsed.href.replace(/\/$/, '');
  } catch {
    return url;
  }
}

function isWebUrl(url) {
  return /^(https?|file|ftp):/i.test(url);
}

async function markPending(tabId) {
  pendingTabs.add(tabId);
  await chrome.storage.session.set({ [PENDING_PREFIX + tabId]: true });
}

async function takePending(tabId) {
  const key = PENDING_PREFIX + tabId;
  const stored = await chrome.storage.session.get(key);
  const wasPending = pendingTabs.has(tabId) || Boolean(stored[key]);
  pendingTabs.delete(tabId);
  await chrome.storage.session.remove(key);
  return wasPending;
}

async function consumeBypass(url) {
  const key = BYPASS_PREFIX + normalizeUrl(url);
  const stored = await chrome.storage.session.get(key);
  if (!stored[key]) return false;
  await chrome.storage.session.remove(key);
  return stored[key] > Date.now();
}

async function findOtherTabWithUrl(tabId, url) {
  const target = normalizeUrl(url);
  const tabs = await chrome.tabs.query({});
  return tabs.find(tab => tab.id !== tabId && normalizeUrl(tab.url || tab.pendingUrl || '') === target);
}

async function allowNextOpen(url) {
  await chrome.storage.session.set({ [BYPASS_PREFIX + normalizeUrl(url)]: Date.now() + BYPASS_TTL_MS });
}

async function duplicateWithoutPrompt(tab) {
  if (!tab?.id || !tab.url) return;
  await allowNextOpen(tab.url);
  await chrome.tabs.duplicate(tab.id);
}

async function openLinkWithoutPrompt(url, sourceTab) {
  if (!url) return;
  await allowNextOpen(url);
  await chrome.tabs.create({
    url,
    active: false,
    index: sourceTab ? sourceTab.index + 1 : undefined,
    openerTabId: sourceTab?.id
  });
}

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: DUPLICATE_COMMAND,
    title: 'Duplicate tab (no prompt)',
    contexts: ['page', 'action']
  });
  chrome.contextMenus.create({
    id: OPEN_LINK_MENU,
    title: 'Open link in new tab (no prompt)',
    contexts: ['link']
  });
});

chrome.runtime.onStartup.addListener(() => {
  ignoreNewTabsUntil = Date.now() + SESSION_RESTORE_GRACE_MS;
});

chrome.tabs.onCreated.addListener(tab => {
  if (Date.now() < ignoreNewTabsUntil) return;
  markPending(tab.id);
});

chrome.tabs.onRemoved.addListener(tabId => {
  takePending(tabId);
});

chrome.webNavigation.onBeforeNavigate.addListener(async ({ tabId, frameId, url }) => {
  if (frameId !== 0 || !isWebUrl(url)) return;
  if (!(await takePending(tabId))) return;
  if (await consumeBypass(url)) return;

  const existing = await findOtherTabWithUrl(tabId, url);
  if (!existing) return;

  const params = new URLSearchParams({ url, existing: String(existing.id) });
  await chrome.tabs.update(tabId, { url: `${chrome.runtime.getURL('confirm.html')}?${params}` });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === DUPLICATE_COMMAND) duplicateWithoutPrompt(tab);
  if (info.menuItemId === OPEN_LINK_MENU) openLinkWithoutPrompt(info.linkUrl, tab);
});

chrome.action.onClicked.addListener(duplicateWithoutPrompt);

chrome.commands.onCommand.addListener((command, tab) => {
  if (command === DUPLICATE_COMMAND) duplicateWithoutPrompt(tab);
});
