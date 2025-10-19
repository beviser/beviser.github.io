// main.js - Xử lý trang chủ và chức năng chung

let selectedPrices = {
    toolv1: { price: 10000, duration: 1 },
    toolmd5: { price: 10000, duration: 1 },
    toolsicbo: { price: 10000, duration: 1 }
};

document.addEventListener('DOMContentLoaded', function() {
    // Kiểm tra đăng nhập
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) {
        window.location.href = 'index.html';
        return;
    }
    
    // Cập nhật thông tin header
    updateHeaderInfo(currentUser);
    
    // Khởi tạo sidebar
    initSidebar();
    
    // Tải trạng thái tools
    loadToolsStatus();
    
    // Hiển thị/hide admin panel link
    if (currentUser.isAdmin) {
        const adminLink = document.getElementById('adminPanelLink');
        if (adminLink) adminLink.classList.remove('hidden');
    }

    // Khởi tạo sự kiện cho các lựa chọn giá
    initPriceOptions();
});

// Khởi tạo sự kiện cho các lựa chọn giá
function initPriceOptions() {
    document.querySelectorAll('.price-option').forEach(option => {
        option.addEventListener('click', function() {
            const toolCard = this.closest('.tool-card');
            const toolId = toolCard.id.replace('Card', ''); // toolv1, toolmd5, toolsicbo
            const price = parseInt(this.getAttribute('data-price'));
            const duration = parseInt(this.getAttribute('data-duration'));

            // Lưu lựa chọn
            selectedPrices[toolId] = { price, duration };

            // Đổi trạng thái selected
            this.parentElement.querySelectorAll('.price-option').forEach(opt => {
                opt.classList.remove('selected');
            });
            this.classList.add('selected');
        });
    });
}

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

// Tải trạng thái tools
function loadToolsStatus() {
    const tools = JSON.parse(localStorage.getItem('tools')) || {};
    
    Object.keys(tools).forEach(toolName => {
        const tool = tools[toolName];
        const toolCard = document.getElementById(`${toolName}Card`);
        
        if (toolCard) {
            const statusEl = toolCard.querySelector('.tool-status');
            const buyBtn = toolCard.querySelector('.buy-btn');
            const timerEl = toolCard.querySelector('.timer-display');
            const openBtn = toolCard.querySelector('#toolv1OpenBtn, #toolmd5OpenBtn, #toolsicboOpenBtn');
            const keyInput = toolCard.querySelector('.key-input');
            
            if (tool.active && tool.expiry > Date.now()) {
                // Tool đang active
                statusEl.textContent = '✅ Đã kích hoạt';
                statusEl.className = 'tool-status unlocked';
                buyBtn.textContent = 'Đã mua';
                buyBtn.disabled = true;
                if (timerEl) timerEl.classList.remove('hidden');
                if (openBtn) openBtn.classList.remove('hidden');
                if (keyInput) keyInput.value = tool.key; // Hiển thị key đã kích hoạt

                // Cập nhật bộ đếm thời gian
                updateToolTimer(toolName, tool.expiry);
            } else {
                // Tool chưa active
                statusEl.textContent = '🔒 Đã khóa';
                statusEl.className = 'tool-status locked';
                buyBtn.textContent = 'Thuê ngay';
                buyBtn.disabled = false;
                if (timerEl) timerEl.classList.add('hidden');
                if (openBtn) openBtn.classList.add('hidden');
            }
        }
    });
}

// Cập nhật bộ đếm thời gian cho tool
function updateToolTimer(toolName, expiry) {
    const timerElement = document.getElementById(`${toolName}TimeLeft`);
    if (!timerElement) return;

    function update() {
        const now = Date.now();
        const timeLeft = expiry - now;

        if (timeLeft <= 0) {
            timerElement.textContent = 'Hết hạn';
            timerElement.classList.add('timer-expired');
            // Tự động vô hiệu hóa tool khi hết hạn
            const tools = JSON.parse(localStorage.getItem('tools')) || {};
            if (tools[toolName]) {
                tools[toolName].active = false;
                localStorage.setItem('tools', JSON.stringify(tools));
            }
            // Reload để cập nhật trạng thái
            window.location.reload();
            return;
        }

        const hours = Math.floor(timeLeft / (1000 * 60 * 60));
        const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);

        timerElement.textContent = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        setTimeout(update, 1000);
    }

    update();
}

// Mua tool
// main.js - Xử lý trang chủ và chức năng chung

let selectedPrices = {
    toolv1: { price: 10000, duration: 1 },
    toolmd5: { price: 10000, duration: 1 },
    toolsicbo: { price: 10000, duration: 1 }
};

document.addEventListener('DOMContentLoaded', function() {
    // Kiểm tra đăng nhập
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) {
        window.location.href = 'index.html';
        return;
    }
    
    // Cập nhật thông tin header
    updateHeaderInfo(currentUser);
    
    // Khởi tạo sidebar
    initSidebar();
    
    // Tải trạng thái tools
    loadToolsStatus();
    
    // Hiển thị/hide admin panel link
    if (currentUser.isAdmin) {
        const adminLink = document.getElementById('adminPanelLink');
        if (adminLink) adminLink.classList.remove('hidden');
    }

    // Khởi tạo sự kiện cho các lựa chọn giá
    initPriceOptions();
});

// Khởi tạo sự kiện cho các lựa chọn giá
function initPriceOptions() {
    document.querySelectorAll('.price-option').forEach(option => {
        option.addEventListener('click', function() {
            const toolCard = this.closest('.tool-card');
            const toolId = toolCard.id.replace('Card', ''); // toolv1, toolmd5, toolsicbo
            const price = parseInt(this.getAttribute('data-price'));
            const duration = parseInt(this.getAttribute('data-duration'));

            // Lưu lựa chọn
            selectedPrices[toolId] = { price, duration };

            // Đổi trạng thái selected
            this.parentElement.querySelectorAll('.price-option').forEach(opt => {
                opt.classList.remove('selected');
            });
            this.classList.add('selected');
        });
    });
}

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

// Tải trạng thái tools
function loadToolsStatus() {
    const tools = JSON.parse(localStorage.getItem('tools')) || {};
    
    Object.keys(tools).forEach(toolName => {
        const tool = tools[toolName];
        const toolCard = document.getElementById(`${toolName}Card`);
        
        if (toolCard) {
            const statusEl = toolCard.querySelector('.tool-status');
            const buyBtn = toolCard.querySelector('.buy-btn');
            const timerEl = toolCard.querySelector('.timer-display');
            const openBtn = toolCard.querySelector('#toolv1OpenBtn, #toolmd5OpenBtn, #toolsicboOpenBtn');
            const keyInput = toolCard.querySelector('.key-input');
            
            if (tool.active && tool.expiry > Date.now()) {
                // Tool đang active
                statusEl.textContent = '✅ Đã kích hoạt';
                statusEl.className = 'tool-status unlocked';
                buyBtn.textContent = 'Đã mua';
                buyBtn.disabled = true;
                if (timerEl) timerEl.classList.remove('hidden');
                if (openBtn) openBtn.classList.remove('hidden');
                if (keyInput) keyInput.value = tool.key; // Hiển thị key đã kích hoạt

                // Cập nhật bộ đếm thời gian
                updateToolTimer(toolName, tool.expiry);
            } else {
                // Tool chưa active
                statusEl.textContent = '🔒 Đã khóa';
                statusEl.className = 'tool-status locked';
                buyBtn.textContent = 'Thuê ngay';
                buyBtn.disabled = false;
                if (timerEl) timerEl.classList.add('hidden');
                if (openBtn) openBtn.classList.add('hidden');
            }
        }
    });
}

// Cập nhật bộ đếm thời gian cho tool
function updateToolTimer(toolName, expiry) {
    const timerElement = document.getElementById(`${toolName}TimeLeft`);
    if (!timerElement) return;

    function update() {
        const now = Date.now();
        const timeLeft = expiry - now;

        if (timeLeft <= 0) {
            timerElement.textContent = 'Hết hạn';
            timerElement.classList.add('timer-expired');
            // Tự động vô hiệu hóa tool khi hết hạn
            const tools = JSON.parse(localStorage.getItem('tools')) || {};
            if (tools[toolName]) {
                tools[toolName].active = false;
                localStorage.setItem('tools', JSON.stringify(tools));
            }
            // Reload để cập nhật trạng thái
            window.location.reload();
            return;
        }

        const hours = Math.floor(timeLeft / (1000 * 60 * 60));
        const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);

        timerElement.textContent = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        setTimeout(update, 1000);
    }

    update();
}

// Mua tool
function buyTool(toolName) {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const users = JSON.parse(localStorage.getItem('users'));
    const tools = JSON.parse(localStorage.getItem('tools')) || {};

    const selectedPrice = selectedPrices[toolName];
    const quantityInput = document.getElementById(`${toolName}Quantity`);
    const quantity = quantityInput ? parseInt(quantityInput.value) || 1 : 1;

    // Tính tổng thời gian (đơn vị: giờ)
    const totalDuration = selectedPrice.duration * quantity;
    const totalPrice = selectedPrice.price * quantity;

    if (currentUser.balance < totalPrice) {
        showNotification('Số dư không đủ! Vui lòng nạp thêm tiền.', 'error');
        setTimeout(() => {
            window.location.href = 'deposit.html';
        }, 2000);
        return;
    }

    // Trừ tiền
    currentUser.balance -= totalPrice;

    // Tạo key và thời gian hết hạn (chuyển đổi giờ sang milliseconds)
    const key = generateKey();
    const expiry = Date.now() + (totalDuration * 60 * 60 * 1000); // totalDuration tính bằng giờ

    // Cập nhật tool
    tools[toolName] = {
        active: true,
        expiry: expiry,
        key: key
    };

    // Cập nhật dữ liệu
    const userIndex = users.findIndex(u => u.username === currentUser.username);
    users[userIndex] = currentUser;

    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    localStorage.setItem('users', JSON.stringify(users));
    localStorage.setItem('tools', JSON.stringify(tools));

    // Lưu lịch sử mua hàng
    const purchaseHistory = JSON.parse(localStorage.getItem('purchaseHistory')) || [];
    purchaseHistory.push({
        toolName: toolName,
        username: currentUser.username,
        key: key,
        price: totalPrice,
        duration: totalDuration,
        expiry: expiry,
        purchaseDate: new Date().toISOString()
    });
    localStorage.setItem('purchaseHistory', JSON.stringify(purchaseHistory));

    // Hiển thị key trong modal
    document.getElementById('generatedKey').textContent = key;
    showModal('keyModal');

    showNotification(`Mua thành công! Key: ${key}`);

    // Reload để cập nhật trạng thái
    setTimeout(() => {
        window.location.reload();
    }, 2000);
}

// Tạo key ngẫu nhiên
function generateKey() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let key = '';
    for (let i = 0; i < 16; i++) {
        key += chars.charAt(Math.floor(Math.random() * chars.length));
        if ((i + 1) % 4 === 0 && i !== 15) {
            key += '-';
        }
    }
    return key;
}

// Kích hoạt tool bằng key
function activateKey(toolName) {
    const keyInput = document.getElementById(`${toolName}Key`);
    const key = keyInput.value.trim();

    if (!key) {
        showNotification('Vui lòng nhập key!', 'error');
        return;
    }

    const tools = JSON.parse(localStorage.getItem('tools')) || {};
    const tool = tools[toolName];

    if (tool && tool.key === key) {
        if (tool.expiry > Date.now()) {
            tool.active = true;
            localStorage.setItem('tools', JSON.stringify(tools));
            showNotification('Kích hoạt thành công!');
            setTimeout(() => {
                window.location.reload();
            }, 1500);
        } else {
            showNotification('Key đã hết hạn!', 'error');
        }
    } else {
        showNotification('Key không hợp lệ!', 'error');
    }
}

// Hiển thị modal
function showModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('show');
    }
}

// Đóng modal
function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('show');
    }
}

// Sao chép key
function copyKey() {
    const keyText = document.getElementById('generatedKey').textContent;
    navigator.clipboard.writeText(keyText).then(() => {
        showNotification('Đã sao chép key!');
    });
}

// Hiển thị lịch sử
// main.js - SỬA LỊCH SỬ MUA HÀNG
function showHistory() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const purchaseHistory = JSON.parse(localStorage.getItem('purchaseHistory')) || [];
    
    // Lọc lịch sử của user hiện tại
    const userHistory = purchaseHistory.filter(item => item.username === currentUser.username);
    
    const historyContent = document.getElementById('historyContent');
    if (!historyContent) {
        showNotification('Không tìm thấy phần tử lịch sử!', 'error');
        return;
    }
    
    historyContent.innerHTML = '';
    
    if (userHistory.length === 0) {
        historyContent.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">📜</div>
                <div class="empty-title">Chưa có lịch sử mua hàng</div>
                <div class="empty-description">Bạn chưa mua tool nào</div>
            </div>
        `;
    } else {
        userHistory.forEach((item, index) => {
            const isActive = item.expiry > Date.now();
            const historyCard = document.createElement('div');
            historyCard.className = 'history-card';
            historyCard.innerHTML = `
                <div class="history-header">
                    <div class="history-tool-name">${getToolName(item.toolName)}</div>
                    <div class="history-date">${new Date(item.purchaseDate).toLocaleDateString('vi-VN')}</div>
                </div>
                <div class="history-details">
                    <div class="history-detail-item">
                        <div class="detail-label">Key</div>
                        <div class="detail-value">${item.key}</div>
                    </div>
                    <div class="history-detail-item">
                        <div class="detail-label">Thời gian</div>
                        <div class="detail-value">${formatDuration(item.duration)}</div>
                    </div>
                    <div class="history-detail-item">
                        <div class="detail-label">Giá</div>
                        <div class="detail-value">${formatCurrency(item.price)}</div>
                    </div>
                    <div class="history-detail-item">
                        <div class="detail-label">Trạng thái</div>
                        <div class="status-badge ${isActive ? 'active' : 'expired'}">
                            ${isActive ? 'Đang hoạt động' : 'Hết hạn'}
                        </div>
                    </div>
                </div>
                ${isActive ? `
                <div class="timer-display">
                    <span class="timer-icon">⏱️</span>
                    <span class="timer-text">Thời gian còn lại: 
                        <span class="timer-value" id="historyTimer${index}">--:--:--</span>
                    </span>
                </div>
                ` : ''}
            `;
            historyContent.appendChild(historyCard);
            
            // Cập nhật bộ đếm thời gian nếu còn active
            if (isActive) {
                updateHistoryTimer(`historyTimer${index}`, item.expiry);
            }
        });
    }
    
    showModal('historyModal');
}

function getToolName(toolKey) {
    const toolNames = {
        'toolv1': 'Tool V1 - Dự đoán Tài Xỉu',
        'toolmd5': 'Tool MD5 - Giải mã MD5',
        'toolsicbo': 'Tool Sicbo - Phát hiện BÃO'
    };
    return toolNames[toolKey] || toolKey;
}

function formatDuration(duration) {
    if (duration < 24) {
        return `${duration} giờ`;
    } else if (duration === 24) {
        return '1 ngày';
    } else if (duration === 168) {
        return '1 tuần';
    } else {
        return `${duration} giờ`;
    }
}

function updateHistoryTimer(elementId, expiry) {
    const timerElement = document.getElementById(elementId);
    if (!timerElement) return;

    function update() {
        const now = Date.now();
        const timeLeft = expiry - now;

        if (timeLeft <= 0) {
            timerElement.textContent = 'Hết hạn';
            timerElement.classList.add('timer-expired');
            return;
        }

        const hours = Math.floor(timeLeft / (1000 * 60 * 60));
        const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);

        timerElement.textContent = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        setTimeout(update, 1000);
    }

    update();
}

// Đăng xuất
function logout() {
    localStorage.removeItem('currentUser');
    window.location.href = 'index.html';
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

// Cho deposit.html
function copyText(elementId) {
    const element = document.getElementById(elementId);
    const text = element.textContent;
    navigator.clipboard.writeText(text).then(() => {
        showNotification('Đã sao chép!');
    });
}

function applyVoucher() {
    showNotification('Mã giảm giá không hợp lệ hoặc đã hết hạn!', 'error');
}

// Tạo key ngẫu nhiên
function generateKey() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let key = '';
    for (let i = 0; i < 16; i++) {
        key += chars.charAt(Math.floor(Math.random() * chars.length));
        if ((i + 1) % 4 === 0 && i !== 15) {
            key += '-';
        }
    }
    return key;
}

// Kích hoạt tool bằng key
function activateKey(toolName) {
    const keyInput = document.getElementById(`${toolName}Key`);
    const key = keyInput.value.trim();

    if (!key) {
        showNotification('Vui lòng nhập key!', 'error');
        return;
    }

    const tools = JSON.parse(localStorage.getItem('tools')) || {};
    const tool = tools[toolName];

    if (tool && tool.key === key) {
        if (tool.expiry > Date.now()) {
            tool.active = true;
            localStorage.setItem('tools', JSON.stringify(tools));
            showNotification('Kích hoạt thành công!');
            setTimeout(() => {
                window.location.reload();
            }, 1500);
        } else {
            showNotification('Key đã hết hạn!', 'error');
        }
    } else {
        showNotification('Key không hợp lệ!', 'error');
    }
}

// Hiển thị modal
function showModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('show');
    }
}

// Đóng modal
function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('show');
    }
}

// Sao chép key
function copyKey() {
    const keyText = document.getElementById('generatedKey').textContent;
    navigator.clipboard.writeText(keyText).then(() => {
        showNotification('Đã sao chép key!');
    });
}

// Hiển thị lịch sử
function showHistory() {
    // Tải lịch sử từ localStorage (giả lập)
    const history = JSON.parse(localStorage.getItem('purchaseHistory')) || [];
    const historyContent = document.getElementById('historyContent');
    
    if (history.length === 0) {
        historyContent.innerHTML = '<div class="empty-state"><div class="empty-icon">📜</div><div class="empty-title">Chưa có lịch sử mua hàng</div></div>';
    } else {
        historyContent.innerHTML = history.map(item => `
            <div class="history-card">
                <div class="history-header">
                    <div class="history-tool-name">${item.toolName}</div>
                    <div class="history-date">${new Date(item.date).toLocaleDateString('vi-VN')}</div>
                </div>
                <div class="history-details">
                    <div class="history-detail-item">
                        <div class="detail-label">Key</div>
                        <div class="detail-value">${item.key}</div>
                    </div>
                    <div class="history-detail-item">
                        <div class="detail-label">Thời gian</div>
                        <div class="detail-value">${item.duration} giờ</div>
                    </div>
                    <div class="history-detail-item">
                        <div class="detail-label">Giá</div>
                        <div class="detail-value">${formatCurrency(item.price)}</div>
                    </div>
                    <div class="history-detail-item">
                        <div class="detail-label">Trạng thái</div>
                        <div class="status-badge ${item.expiry > Date.now() ? 'active' : 'expired'}">${item.expiry > Date.now() ? 'Đang hoạt động' : 'Hết hạn'}</div>
                    </div>
                </div>
            </div>
        `).join('');
    }
    
    showModal('historyModal');
}

// Đăng xuất
function logout() {
    localStorage.removeItem('currentUser');
    window.location.href = 'index.html';
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

// Cho deposit.html
function copyText(elementId) {
    const element = document.getElementById(elementId);
    const text = element.textContent;
    navigator.clipboard.writeText(text).then(() => {
        showNotification('Đã sao chép!');
    });
}

function applyVoucher() {
    showNotification('Mã giảm giá không hợp lệ hoặc đã hết hạn!', 'error');

}

