// toolmd5.js - Xử lý Tool MD5

let chatState = 'waiting';
let currentMD5 = '';

document.addEventListener('DOMContentLoaded', function() {
    // Kiểm tra đăng nhập và trạng thái tool
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const tools = JSON.parse(localStorage.getItem('tools'));
    
    if (!currentUser) {
        window.location.href = 'index.html';
        return;
    }
    
    if (!tools.toolmd5.active || tools.toolmd5.expiry <= Date.now()) {
        showNotification('Tool MD5 chưa được kích hoạt hoặc đã hết hạn!', 'error');
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
                chatState = 'awaiting_md5';
                addMessage('Vui lòng nhập mã MD5 của phiên này:', 'bot');
            } else {
                addMessage('Vui lòng gõ START để bắt đầu 🔓', 'bot');
            }
            break;
            
        case 'awaiting_md5':
            // Giả sử mã MD5 có độ dài 32 ký tự hex
            if (message.length === 32 && /^[0-9a-fA-F]+$/.test(message)) {
                currentMD5 = message;
                makePrediction(message);
                chatState = 'awaiting_result';
            } else {
                addMessage('Mã MD5 không hợp lệ! Vui lòng nhập mã MD5 32 ký tự.', 'bot');
            }
            break;
            
        case 'awaiting_result':
            if (lowerMessage === 't' || lowerMessage === 'x') {
                const result = lowerMessage === 't' ? 'TÀI' : 'XỈU';
                const prediction = calculatePrediction(currentMD5);
                const isCorrect = (result === 'TÀI' && prediction.prediction === 'TÀI') || 
                                (result === 'XỈU' && prediction.prediction === 'XỈU');
                
                addMessage(`Kết quả: ${result} - ${isCorrect ? '✅ Dự đoán đúng!' : '❌ Dự đoán sai!'}`, 'bot');
                
                if (!isCorrect) {
                    addMessage('Xin lỗi! Tôi sẽ điều chỉnh công thức giải mã.', 'bot');
                }
                
                addMessage('Vui lòng nhập mã MD5 mới để tiếp tục giải mã...', 'bot');
                chatState = 'awaiting_md5';
            } else {
                addMessage('Vui lòng nhập "t" cho TÀI hoặc "x" cho XỈU', 'bot');
            }
            break;
    }
}

// Dự đoán kết quả từ MD5
function makePrediction(md5) {
    const prediction = calculatePrediction(md5);
    
    let response = `
        <strong>DỰ ĐOÁN TỪ MD5:</strong><br>
        Mã MD5: <span style="font-family: monospace; color: var(--accent-purple);">${md5}</span><br><br>
        
        Phiên này bạn hãy chọn: <strong style="color: ${prediction.prediction === 'TÀI' ? '#EF4444' : '#3B82F6'}">${prediction.prediction}</strong><br><br>
        
        <div class="prediction-box">
            <div class="prediction-label">Xác suất AI:</div>
            <div class="prediction-value">${prediction.accuracy}%</div>
        </div>
        
        <div class="formula-section">
            <div class="formula-title">Công thức giải mã sử dụng:</div>
            <ul class="formula-list">
                ${prediction.formulas.map(formula => `<li class="formula-item">${formula}</li>`).join('')}
            </ul>
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

// Tính toán dự đoán từ MD5 (giả lập)
function calculatePrediction(md5) {
    // Giả lập: chuyển đổi MD5 thành số và dựa vào đó để dự đoán
    let hashNumber = 0;
    for (let i = 0; i < md5.length; i++) {
        hashNumber += md5.charCodeAt(i);
    }
    
    const isTai = hashNumber % 2 === 0;
    const accuracy = Math.floor(Math.random() * 15) + 75; // 75-90%
    const winRate = Math.floor(Math.random() * 10) + 80; // 80-90%
    
    const formulas = [
        "MD5 to Binary Conversion",
        "Hash Probability Distribution",
        "Neural Network Analysis",
        "Pattern Recognition Algorithm",
        "Statistical Prediction Model"
    ];
    
    return {
        prediction: isTai ? 'TÀI' : 'XỈU',
        accuracy: accuracy,
        winRate: winRate,
        formulas: formulas.sort(() => Math.random() - 0.5).slice(0, 3)
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
    showNotification('Tính năng đang được phát triển...');
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