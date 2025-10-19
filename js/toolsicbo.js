// toolsicbo.js - Xử lý Tool Sicbo

let chatState = 'waiting';
let currentDice = [];

document.addEventListener('DOMContentLoaded', function() {
    // Kiểm tra đăng nhập và trạng thái tool
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const tools = JSON.parse(localStorage.getItem('tools'));
    
    if (!currentUser) {
        window.location.href = 'index.html';
        return;
    }
    
    if (!tools.toolsicbo.active || tools.toolsicbo.expiry <= Date.now()) {
        showNotification('Tool Sicbo chưa được kích hoạt hoặc đã hết hạn!', 'error');
        setTimeout(() => {
            window.location.href = 'home.html';
        }, 2000);
        return;
    }
    
    updateHeaderInfo(currentUser);
    initSidebar();
    initChat();
});

// Cập nhật thông tin header
function updateHeaderInfo(user) {
    const usernameEl = document.getElementById('headerUsername');
    const balanceEl = document.getElementById('headerBalance');
    
    if (usernameEl) usernameEl.textContent = user.username;
    if (balanceEl) balanceEl.textContent = formatCurrency(user.balance);
}

// Định dạng tiền tệ
function formatCurrency(amount) {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
    }).format(amount);
}

// Khởi tạo sidebar
function initSidebar() {
    const menuIcon = document.getElementById('menuIcon');
    const sidebar = document.getElementById('sidebar');
    
    if (menuIcon && sidebar) {
        menuIcon.addEventListener('click', function() {
            sidebar.classList.toggle('active');
        });
    }
}

// Khởi tạo chat
function initChat() {
    const chatInput = document.getElementById('chatInput');
    const sendBtn = document.querySelector('.send-btn');
    
    // Auto-resize textarea
    chatInput.addEventListener('input', function() {
        this.style.height = 'auto';
        this.style.height = (this.scrollHeight) + 'px';
    });
    
    // Send message on Enter
    chatInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });
    
    // Send button click
    sendBtn.addEventListener('click', sendMessage);
    
    // Update bot time
    document.getElementById('botTime').textContent = getCurrentTime();
}

// Gửi tin nhắn
function sendMessage() {
    const chatInput = document.getElementById('chatInput');
    const message = chatInput.value.trim();
    
    if (!message) return;
    
    // Thêm tin nhắn user
    addMessage(message, 'user');
    chatInput.value = '';
    chatInput.style.height = 'auto';
    
    // Xử lý tin nhắn
    setTimeout(() => processMessage(message), 500);
}

// Thêm tin nhắn vào chat
function addMessage(content, sender) {
    const chatMessages = document.getElementById('chatMessages');
    const messageDiv = document.createElement('div');
    
    messageDiv.className = `message ${sender}`;
    messageDiv.innerHTML = `
        <div>${content}</div>
        <div class="message-time">${getCurrentTime()}</div>
    `;
    
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Xử lý tin nhắn
function processMessage(message) {
    const lowerMessage = message.toLowerCase();
    
    switch (chatState) {
        case 'waiting':
            if (lowerMessage === 'start') {
                chatState = 'awaiting_dice';
                addMessage('Vui lòng nhập 3 số xúc xắc vừa ra (ví dụ: 2 4 6)', 'bot');
            } else {
                addMessage('Vui lòng gõ START để bắt đầu ⚡', 'bot');
            }
            break;
            
        case 'awaiting_dice':
            const dice = message.split(' ').map(Number).filter(n => !isNaN(n) && n >= 1 && n <= 6);
            if (dice.length === 3) {
                currentDice = dice;
                makePrediction(dice);
                chatState = 'awaiting_result';
            } else {
                addMessage('Vui lòng nhập 3 số hợp lệ từ 1 đến 6 (ví dụ: 2 4 6)', 'bot');
            }
            break;
            
        case 'awaiting_result':
            if (lowerMessage === 't' || lowerMessage === 'x') {
                const result = lowerMessage === 't' ? 'TÀI' : 'XỈU';
                const prediction = calculatePrediction(currentDice);
                const isCorrect = (result === 'TÀI' && prediction.prediction === 'TÀI') || 
                                (result === 'XỈU' && prediction.prediction === 'XỈU');
                
                addMessage(`Kết quả: ${result} - ${isCorrect ? '✅ Dự đoán đúng!' : '❌ Dự đoán sai!'}`, 'bot');
                
                if (!isCorrect) {
                    addMessage('Xin lỗi! Tôi sẽ điều chỉnh công thức tính toán.', 'bot');
                }
                
                addMessage('Vui lòng nhập 3 số xúc xắc mới để tiếp tục dự đoán...', 'bot');
                chatState = 'awaiting_dice';
            } else {
                addMessage('Vui lòng nhập "t" cho TÀI hoặc "x" cho XỈU', 'bot');
            }
            break;
    }
}

// Dự đoán kết quả Sicbo
function makePrediction(dice) {
    const prediction = calculatePrediction(dice);
    
    let response = `
        <strong>DỰ ĐOÁN SICBO:</strong><br>
        Phiên này bạn hãy chọn: <strong style="color: ${prediction.prediction === 'TÀI' ? '#EF4444' : '#3B82F6'}">${prediction.prediction}</strong><br><br>
        
        <div class="prediction-box">
            <div class="prediction-label">Dự đoán vị:</div>
            <div class="prediction-value ${prediction.prediction.toLowerCase()}">
                ${prediction.prediction === 'TÀI' ? prediction.taiNumbers.join(', ') : prediction.xiuNumbers.join(', ')}
            </div>
        </div>
        
        <div class="dice-prediction">
            ${prediction.diceProbabilities.map((prob, index) => `
                <div class="dice-item">
                    <div class="dice-number">X${index + 1}</div>
                    <div class="dice-label">${prob.number}</div>
                    <div class="probability-bar">
                        <div class="probability-fill" style="width: ${prob.percentage}%"></div>
                    </div>
                    <div class="dice-label">${prob.percentage}%</div>
                </div>
            `).join('')}
        </div>
        
        <div class="storm-indicator">
            <div class="storm-icon">🌪️</div>
            <div class="storm-label">BÃO (3 số giống nhau)</div>
            <div class="storm-percentage">${prediction.stormChance}%</div>
            <div class="probability-bar">
                <div class="probability-fill" style="width: ${prediction.stormChance}%"></div>
            </div>
        </div>
        
        <div style="margin-top: 15px;">
            <div class="prediction-label">Tỉ lệ thắng: <span class="percentage-text">${prediction.winRate}%</span></div>
            <div class="probability-bar">
                <div class="probability-fill" style="width: ${prediction.winRate}%"></div>
            </div>
        </div>
        
        <div style="margin-top: 15px;">
            Vui lòng nhập kết quả thực tế (gõ "t" cho TÀI, "x" cho XỈU):
        </div>
    `;
    
    addMessage(response, 'bot');
}

// Tính toán dự đoán Sicbo (giả lập)
function calculatePrediction(dice) {
    const sum = dice.reduce((a, b) => a + b, 0);
    const isTai = sum >= 11;
    
    // Tạo dữ liệu giả lập
    const taiNumbers = [11, 12, 13, 14, 15, 16, 17, 18].sort(() => Math.random() - 0.5).slice(0, 3);
    const xiuNumbers = [3, 4, 5, 6, 7, 8, 9, 10].sort(() => Math.random() - 0.5).slice(0, 3);
    
    const diceProbabilities = [
        { number: Math.floor(Math.random() * 6) + 1, percentage: Math.floor(Math.random() * 30) + 60 },
        { number: Math.floor(Math.random() * 6) + 1, percentage: Math.floor(Math.random() * 30) + 60 },
        { number: Math.floor(Math.random() * 6) + 1, percentage: Math.floor(Math.random() * 30) + 60 }
    ];
    
    const stormChance = Math.floor(Math.random() * 10) + 5; // 5-15%
    const winRate = Math.floor(Math.random() * 15) + 75; // 75-90%
    
    return {
        prediction: isTai ? 'TÀI' : 'XỈU',
        winRate: winRate,
        taiNumbers: taiNumbers,
        xiuNumbers: xiuNumbers,
        diceProbabilities: diceProbabilities,
        stormChance: stormChance
    };
}

// Lấy thời gian hiện tại
function getCurrentTime() {
    return new Date().toLocaleTimeString('vi-VN', { 
        hour: '2-digit', 
        minute: '2-digit' 
    });
}

// Hiển thị thông báo
function showNotification(message, type = 'success') {
    const notification = document.getElementById('notification');
    const messageEl = notification.querySelector('.notification-message');
    
    messageEl.textContent = message;
    notification.className = `notification ${type}`;
    notification.classList.add('show');
    
    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}

// Đăng xuất
function logout() {
    localStorage.removeItem('currentUser');
    window.location.href = 'index.html';
}

// Hiển thị lịch sử
function showHistory() {
    showNotification('Tính năng đang được phát triển...');
}

// Tùy chỉnh chat
function customizeChat() {
    const modal = document.getElementById('customizeModal');
    if (modal) {
        modal.classList.add('show');
    }
}

function resetChat() {
    if (confirm('Bạn có chắc muốn reset cuộc trò chuyện?')) {
        window.location.reload();
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('show');
    }
}

function applyCustomize() {
    const themeColor = document.getElementById('themeColor').value;
    const chatStyle = document.getElementById('chatStyle').value;
    
    // Áp dụng tùy chỉnh
    document.documentElement.style.setProperty('--primary-purple', getColorValue(themeColor));
    document.body.setAttribute('data-chat-style', chatStyle);
    
    showNotification('Đã áp dụng tùy chỉnh!');
    closeModal('customizeModal');
}

function getColorValue(color) {
    const colors = {
        purple: '#6B46C1',
        blue: '#3B82F6',
        green: '#10B981',
        red: '#EF4444',
        orange: '#F59E0B'
    };
    return colors[color] || colors.purple;

}
