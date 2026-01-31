// 监听来自popup的消息
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getSelectedText') {
    const selectedText = window.getSelection().toString().trim();
    sendResponse({ text: selectedText });
  }
  return true;
});

// 监听文本选择事件，显示快捷按钮
let quickAddButton = null;

document.addEventListener('mouseup', () => {
  const selectedText = window.getSelection().toString().trim();
  
  if (selectedText) {
    showQuickAddButton(selectedText);
  } else {
    hideQuickAddButton();
  }
});

function showQuickAddButton(text) {
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
    chrome.runtime.sendMessage({ action: 'openPopup', text });
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

// 点击其他地方隐藏按钮
document.addEventListener('mousedown', (e) => {
  if (quickAddButton && !quickAddButton.contains(e.target)) {
    hideQuickAddButton();
  }
});
