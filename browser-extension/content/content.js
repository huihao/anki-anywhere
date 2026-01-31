const MAX_CONTEXT_LENGTH = 200;
const MAX_HTML_LENGTH = 1000;

// 监听来自popup的消息
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getSelectionInfo') {
    sendResponse({ selection: buildSelectionInfo() });
  }
  if (request.action === 'getSelectedText') {
    const selectionInfo = buildSelectionInfo();
    sendResponse({ text: selectionInfo?.text || '', selection: selectionInfo });
  }
  return true;
});

// 监听文本选择事件，显示快捷按钮
let quickAddButton = null;
let lastSelectionSignature = '';
let selectionTimer = null;

function handleSelectionCapture() {
  if (selectionTimer) {
    clearTimeout(selectionTimer);
  }
  selectionTimer = setTimeout(() => {
    selectionTimer = null;
    handleSelectionCaptureNow();
  }, 120);
}

function handleSelectionCaptureNow() {
  const selectionInfo = buildSelectionInfo();
  
  if (selectionInfo?.text) {
    showQuickAddButton(selectionInfo);
    updateSelectionStore(selectionInfo);
  } else {
    hideQuickAddButton();
  }
}

document.addEventListener('mouseup', handleSelectionCapture);
document.addEventListener('keyup', handleSelectionCapture);

function showQuickAddButton(selectionInfo) {
  hideQuickAddButton();
  
  const selection = window.getSelection();
  if (!selection.rangeCount) return;
  
  const range = selection.getRangeAt(0);
  const rect = range.getBoundingClientRect();
  
  quickAddButton = document.createElement('div');
  quickAddButton.className = 'anki-anywhere-quick-add';
  quickAddButton.innerHTML = '➕ 添加到Anki';
  quickAddButton.style.position = 'fixed';
  quickAddButton.style.top = `${rect.bottom + window.scrollY + 5}px`;
  quickAddButton.style.left = `${rect.left + window.scrollX}px`;
  
  quickAddButton.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    chrome.runtime.sendMessage({ action: 'openPopup', selection: selectionInfo });
    hideQuickAddButton();
  });
  
  document.body.appendChild(quickAddButton);
}

function hideQuickAddButton() {
  if (quickAddButton) {
    quickAddButton.remove();
    quickAddButton = null;
  }
}

function buildSelectionInfo() {
  const selection = window.getSelection();
  if (!selection || !selection.rangeCount) return null;
  
  const text = selection.toString().trim();
  if (!text) return null;
  
  const range = selection.getRangeAt(0);
  const container = range.commonAncestorContainer.nodeType === Node.ELEMENT_NODE
    ? range.commonAncestorContainer
    : range.commonAncestorContainer.parentElement;
  const context = extractSelectionContext(text, container || document.body);
  const html = extractSelectionHtml(range);

  return {
    text,
    context,
    html,
    title: document.title,
    url: window.location.href
  };
}

function normalizeText(value) {
  return value.replace(/\s+/g, ' ').trim();
}

function extractSelectionContext(selectedText, container) {
  if (!container?.textContent) return '';
  
  const normalizedContainerText = normalizeText(container.textContent);
  const normalizedSelectedText = normalizeText(selectedText);
  if (!normalizedContainerText || !normalizedSelectedText) return '';
  
  const index = normalizedContainerText.indexOf(normalizedSelectedText);
  if (index === -1) {
    return normalizedContainerText.slice(0, MAX_CONTEXT_LENGTH);
  }
  
  const start = Math.max(0, index - 80);
  const end = Math.min(
    normalizedContainerText.length,
    index + normalizedSelectedText.length + 80
  );
  return normalizedContainerText.slice(start, end);
}

function extractSelectionHtml(range) {
  const wrapper = document.createElement('div');
  wrapper.appendChild(range.cloneContents());
  const html = wrapper.innerHTML.trim();
  if (!html) return '';
  return html.length > MAX_HTML_LENGTH ? html.slice(0, MAX_HTML_LENGTH) : html;
}

function updateSelectionStore(selectionInfo) {
  const signature = `${selectionInfo.url || ''}:${selectionInfo.text}:${selectionInfo.context || ''}`;
  if (signature === lastSelectionSignature) return;
  lastSelectionSignature = signature;
  chrome.runtime.sendMessage({ action: 'updateSelectionInfo', selection: selectionInfo });
}

// 点击其他地方隐藏按钮
document.addEventListener('mousedown', (e) => {
  if (quickAddButton && !quickAddButton.contains(e.target)) {
    hideQuickAddButton();
  }
});
