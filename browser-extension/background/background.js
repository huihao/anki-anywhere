// 创建右键菜单
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: 'addToAnki',
    title: '添加到Anki',
    contexts: ['selection']
  });
});

// 处理右键菜单点击
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'addToAnki') {
    chrome.action.openPopup();
  }
});

// 监听消息
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'openPopup') {
    chrome.action.openPopup();
  }
  return true;
});
