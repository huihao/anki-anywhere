const API_URL_KEY = 'apiUrl';
const TOKEN_KEY = 'authToken';

let apiUrl = '';
let authToken = '';

// 加载设置
async function loadSettings() {
  const result = await chrome.storage.sync.get([API_URL_KEY, TOKEN_KEY]);
  apiUrl = result[API_URL_KEY] || 'http://localhost:3000/api';
  authToken = result[TOKEN_KEY] || '';
  
  document.getElementById('apiUrl').value = apiUrl;
  document.getElementById('token').value = authToken;
}

// 保存设置
document.getElementById('saveSettings').addEventListener('click', async () => {
  const newApiUrl = document.getElementById('apiUrl').value;
  const newToken = document.getElementById('token').value;
  
  await chrome.storage.sync.set({
    [API_URL_KEY]: newApiUrl,
    [TOKEN_KEY]: newToken
  });
  
  apiUrl = newApiUrl;
  authToken = newToken;
  
  showStatus('设置已保存', 'success');
  loadDecks();
});

// 显示状态消息
function showStatus(message, type) {
  const status = document.getElementById('status');
  status.textContent = message;
  status.className = `status ${type}`;
  
  setTimeout(() => {
    status.className = 'status';
  }, 3000);
}

// 加载卡牌组列表
async function loadDecks() {
  if (!authToken) {
    const deckSelect = document.getElementById('deck');
    deckSelect.innerHTML = '<option value="">请先设置访问令牌</option>';
    return;
  }
  
  try {
    const response = await fetch(`${apiUrl}/decks`, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });
    
    if (!response.ok) {
      throw new Error('获取卡牌组失败');
    }
    
    const decks = await response.json();
    const deckSelect = document.getElementById('deck');
    
    deckSelect.innerHTML = decks.length > 0
      ? decks.map(deck => `<option value="${deck.id}">${deck.name}</option>`).join('')
      : '<option value="">没有可用的卡牌组</option>';
      
  } catch (error) {
    console.error('Error loading decks:', error);
    showStatus('加载卡牌组失败', 'error');
  }
}

// 获取选中的文本
async function getSelectedText() {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    const result = await chrome.tabs.sendMessage(tab.id, { action: 'getSelectedText' });
    return result?.text || '';
  } catch (error) {
    console.error('Error getting selected text:', error);
    return '';
  }
}

// 保存卡片
document.getElementById('saveCard').addEventListener('click', async () => {
  const front = document.getElementById('front').value.trim();
  const back = document.getElementById('back').value.trim();
  const deckId = document.getElementById('deck').value;
  
  if (!front || !back) {
    showStatus('请填写卡片正面和背面', 'error');
    return;
  }
  
  if (!deckId) {
    showStatus('请选择卡牌组', 'error');
    return;
  }
  
  if (!authToken) {
    showStatus('请先设置访问令牌', 'error');
    return;
  }
  
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    const response = await fetch(`${apiUrl}/cards`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({
        deckId: parseInt(deckId),
        front,
        back,
        sourceUrl: tab.url
      })
    });
    
    if (!response.ok) {
      throw new Error('保存卡片失败');
    }
    
    showStatus('卡片保存成功！', 'success');
    document.getElementById('front').value = '';
    document.getElementById('back').value = '';
  } catch (error) {
    console.error('Error saving card:', error);
    showStatus('保存卡片失败', 'error');
  }
});

// 初始化
(async () => {
  await loadSettings();
  await loadDecks();
  
  // 自动填充选中的文本
  const selectedText = await getSelectedText();
  if (selectedText) {
    document.getElementById('front').value = selectedText;
  }
})();
