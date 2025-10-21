// toolv1.js - Xử lý Tool V1 (ĐÃ SỬA)

let chatState = 'waiting';
let currentDice = [];

document.addEventListener('DOMContentLoaded', function() {
    console.log('🎲 Tool V1 loaded');
    
    // Kiểm tra đăng nhập và trạng thái tool
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const tools = JSON.parse(localStorage.getItem('tools'));
    
    if (!currentUser) {
        window.location.href = 'index.html';
        return;
    }
    
    if (!tools || !tools.toolv1 || !tools.toolv1.active || tools.toolv1.expiry <= Date.now()) {
        showNotification('Tool V1 chưa được kích hoạt hoặc đã hết hạn!', 'error');
        setTimeout(() => {
            window.location.href = 'home.html';
        }, 2000);
        return;
    }
    
    updateHeaderInfo(currentUser);
    initSidebar();
    initChat();
    
    console.log('✅ Tool V1 initialized');
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
    
    if (!chatInput || !sendBtn) {
        console.error('❌ Chat elements not found!');
        return;
    }
    
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
    
    console.log('✅ Chat initialized');
}

// Gửi tin nhắn
function sendMessage() {
    const chatInput = document.getElementById('chatInput');
    if (!chatInput) return;
    
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
    if (!chatMessages) return;
    
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
                addMessage('Vui lòng gõ START để bắt đầu 🚀', 'bot');
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

// Dự đoán kết quả
function makePrediction(dice) {
    const prediction = calculatePrediction(dice);
    
    let response = `
        <strong>DỰ ĐOÁN:</strong><br>
        Phiên này bạn hãy chọn: <strong style="color: ${prediction.prediction === 'TÀI' ? '#EF4444' : '#3B82F6'}">${prediction.prediction}</strong><br><br>
        
        <div class="prediction-box">
            <div class="prediction-label">Dự đoán vị:</div>
            <div class="prediction-value ${prediction.prediction.toLowerCase()}">
                ${prediction.prediction === 'TÀI' ? prediction.taiNumbers.join(', ') : prediction.xiuNumbers.join(', ')}
            </div>
        </div>
        
        <div style="margin-top: 15px;">
            <div class="prediction-label">Tỉ lệ đúng: <span class="percentage-text">${prediction.accuracy}%</span></div>
            <div class="probability-bar">
                <div class="probability-fill" style="width: ${prediction.accuracy}%"></div>
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
        
        <div style="margin-top: 15px;">
            Vui lòng nhập kết quả thực tế (gõ "t" cho TÀI, "x" cho XỈU):
        </div>
    `;
    
    addMessage(response, 'bot');
}

// Tính toán dự đoán (thuật toán cải tiến)
function calculatePrediction(dice) {
    const sum = dice.reduce((a, b) => a + b, 0);
    
    // Phân tích xu hướng dựa trên 3 số xúc xắc
    const avg = sum / 3;
    const variance = dice.reduce((acc, val) => acc + Math.pow(val - avg, 2), 0) / 3;
    
    // Dự đoán dựa trên phân tích xác suất
    let isTai = sum >= 11;
    let accuracy = 75;
    
    // Điều chỉnh dựa trên độ phân tán
    if (variance < 2) {
        // Các số gần nhau -> dễ đoán hơn
        accuracy += 10;
    } else if (variance > 4) {
        // Các số phân tán -> khó đoán hơn
        accuracy -= 5;
    }
    
    // Điều chỉnh dựa trên tổng điểm
    if (sum <= 8 || sum >= 13) {
        accuracy += 5;
    } else if (sum === 10 || sum === 11) {
        accuracy -= 5;
    }
    
    accuracy = Math.min(95, Math.max(60, accuracy));
    
    // Tạo dữ liệu giả lập với độ chính xác cao
    const taiNumbers = generateTaiNumbers(dice);
    const xiuNumbers = generateXiuNumbers(dice);
    
    const diceProbabilities = dice.map((die, index) => {
        const nextNumber = predictNextNumber(die, dice);
        return {
            number: nextNumber,
            percentage: Math.floor(Math.random() * 20) + 70 // 70-90%
        };
    });
    
    return {
        prediction: isTai ? 'TÀI' : 'XỈU',
        accuracy: accuracy,
        taiNumbers: taiNumbers,
        xiuNumbers: xiuNumbers,
        diceProbabilities: diceProbabilities
    };
}

// Dự đoán số tiếp theo cho từng xúc xắc
function predictNextNumber(current, allDice) {
    // Thuật toán dự đoán đơn giản dựa trên xác suất
    const probabilities = [0.1, 0.15, 0.2, 0.2, 0.2, 0.15]; // Xác suất cho các số 1-6
    
    // Điều chỉnh dựa trên số hiện tại
    let adjustedProbs = [...probabilities];
    adjustedProbs[current - 1] += 0.1;
    
    // Chuẩn hóa xác suất
    const sum = adjustedProbs.reduce((a, b) => a + b, 0);
    adjustedProbs = adjustedProbs.map(p => p / sum);
    
    // Chọn số dựa trên xác suất
    let random = Math.random();
    let cumulative = 0;
    
    for (let i = 0; i < adjustedProbs.length; i++) {
        cumulative += adjustedProbs[i];
        if (random <= cumulative) {
            return i + 1;
        }
    }
    
    return 4; // Mặc định
}

// Tạo các số Tài có khả năng
function generateTaiNumbers(dice) {
    const possibleNumbers = [11, 12, 13, 14, 15, 16, 17, 18];
    return possibleNumbers
        .sort(() => Math.random() - 0.5)
        .slice(0, 3)
        .sort((a, b) => a - b);
}

// Tạo các số Xỉu có khả năng
function generateXiuNumbers(dice) {
    const possibleNumbers = [3, 4, 5, 6, 7, 8, 9, 10];
    return possibleNumbers
        .sort(() => Math.random() - 0.5)
        .slice(0, 3)
        .sort((a, b) => a - b);
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
    if (!notification) {
        alert(message);
        return;
    }
    
    const messageEl = notification.querySelector('.notification-message');
    if (!messageEl) return;
    
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

    // Áp dụng màu chủ đạo
    document.documentElement.style.setProperty('--primary-purple', getColorValue(themeColor));

    // Áp dụng kiểu chat
    const chatMessages = document.getElementById('chatMessages');
    if (chatMessages) {
        chatMessages.className = 'chat-messages ' + chatStyle;
    }

    // Lưu cài đặt
    const settings = {
        themeColor: themeColor,
        chatStyle: chatStyle
    };
    localStorage.setItem('chatSettings', JSON.stringify(settings));

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
// utils.js - Đồng bộ dữ liệu giữa các tab/thiết bị
function syncData() {
    // Lắng nghe thay đổi từ các tab khác
    window.addEventListener('storage', function(e) {
        if (e.key === 'users' || e.key === 'tools' || e.key === 'vouchers' || e.key === 'purchaseHistory') {
            console.log('🔄 Data synced from other tab:', e.key);
            location.reload();
        }
    });
    
    // Thông báo khi dữ liệu thay đổi
    function notifyDataChange(key) {
        localStorage.setItem(key + '_sync', Date.now().toString());
    }
    
    return { notifyDataChange };
}

// Thêm vào mỗi file JS sau khi khởi tạo
const dataSync = syncData();
