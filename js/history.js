// history.js - Xử lý trang lịch sử mua hàng

let currentFilter = {
    tool: 'all',
    status: 'all'
};

document.addEventListener('DOMContentLoaded', function() {
    console.log('📜 History page loaded');
    
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
    
    // Tải lịch sử mua hàng
    loadPurchaseHistory(currentUser);
    
    console.log('✅ History page initialized');
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
    
    // Hiển thị admin panel link nếu là admin
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (currentUser && currentUser.isAdmin) {
        const adminLink = document.getElementById('adminPanelLink');
        if (adminLink) adminLink.classList.remove('hidden');
    }
}

// Tải lịch sử mua hàng
function loadPurchaseHistory(user) {
    const purchaseHistory = JSON.parse(localStorage.getItem('purchaseHistory')) || [];
    const userHistory = purchaseHistory.filter(item => item.username === user.username);
    
    // Cập nhật thống kê
    updateHistoryStats(userHistory);
    
    // Áp dụng bộ lọc
    const filteredHistory = applyFilters(userHistory);
    
    // Hiển thị lịch sử
    displayHistory(filteredHistory);
}

// Cập nhật thống kê
function updateHistoryStats(history) {
    const totalPurchases = history.length;
    const totalSpent = history.reduce((sum, item) => sum + item.price, 0);
    const activeTools = history.filter(item => item.expiry > Date.now()).length;
    const expiredTools = history.filter(item => item.expiry <= Date.now()).length;
    
    document.getElementById('totalPurchases').textContent = totalPurchases;
    document.getElementById('totalSpent').textContent = formatCurrency(totalSpent);
    document.getElementById('activeTools').textContent = activeTools;
    document.getElementById('expiredTools').textContent = expiredTools;
}

// Áp dụng bộ lọc
function applyFilters(history) {
    return history.filter(item => {
        // Lọc theo tool
        if (currentFilter.tool !== 'all' && item.toolName !== currentFilter.tool) {
            return false;
        }
        
        // Lọc theo trạng thái
        if (currentFilter.status !== 'all') {
            const isActive = item.expiry > Date.now();
            if (currentFilter.status === 'active' && !isActive) return false;
            if (currentFilter.status === 'expired' && isActive) return false;
        }
        
        return true;
    });
}

// Hiển thị lịch sử
function displayHistory(history) {
    const historyContent = document.getElementById('historyContent');
    
    if (history.length === 0) {
        historyContent.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">📜</div>
                <div class="empty-title">Không tìm thấy giao dịch nào</div>
                <div class="empty-description">Hãy thử thay đổi bộ lọc hoặc mua tool mới</div>
            </div>
        `;
        return;
    }
    
    // Sắp xếp theo thời gian mua mới nhất
    history.sort((a, b) => b.purchaseDate - a.purchaseDate);
    
    historyContent.innerHTML = history.map((item, index) => {
        const isActive = item.expiry > Date.now();
        const timeLeft = item.expiry - Date.now();
        const daysLeft = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
        const hoursLeft = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        
        return `
            <div class="history-card ${isActive ? 'active' : 'expired'}">
                <div class="history-header">
                    <div class="history-tool">
                        <div class="tool-icon">${getToolIcon(item.toolName)}</div>
                        <div class="tool-info">
                            <div class="tool-name">${getToolDisplayName(item.toolName)}</div>
                            <div class="purchase-date">
                                ${new Date(item.purchaseDate).toLocaleDateString('vi-VN')} - 
                                ${new Date(item.purchaseDate).toLocaleTimeString('vi-VN')}
                            </div>
                        </div>
                    </div>
                    <div class="history-price">${formatCurrency(item.price)}</div>
                </div>
                
                <div class="history-details">
                    <div class="detail-item">
                        <span class="detail-label">Key kích hoạt:</span>
                        <span class="detail-value key-value">${item.key}</span>
                        <button class="copy-btn" onclick="copyToClipboard('${item.key}')">📋</button>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Thời gian thuê:</span>
                        <span class="detail-value">${getDurationText(item.duration, item.unit)}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Hết hạn vào:</span>
                        <span class="detail-value">${new Date(item.expiry).toLocaleDateString('vi-VN')}</span>
                    </div>
                </div>
                
                <div class="history-footer">
                    <div class="status-section">
                        <span class="status-badge ${isActive ? 'active' : 'expired'}">
                            ${isActive ? '🟢 Đang hoạt động' : '🔴 Đã hết hạn'}
                        </span>
                    </div>
                    ${isActive ? `
                    <div class="timer-section">
                        <span class="timer-icon">⏱️</span>
                        <span class="timer-text">
                            Còn lại: ${daysLeft > 0 ? daysLeft + ' ngày ' : ''}${hoursLeft} giờ
                        </span>
                    </div>
                    ` : ''}
                </div>
            </div>
        `;
    }).join('');
}

// Lọc lịch sử
function filterHistory() {
    currentFilter.tool = document.getElementById('toolFilter').value;
    currentFilter.status = document.getElementById('statusFilter').value;
    
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const purchaseHistory = JSON.parse(localStorage.getItem('purchaseHistory')) || [];
    const userHistory = purchaseHistory.filter(item => item.username === currentUser.username);
    
    const filteredHistory = applyFilters(userHistory);
    displayHistory(filteredHistory);
}

// Reset bộ lọc
function resetFilters() {
    document.getElementById('toolFilter').value = 'all';
    document.getElementById('statusFilter').value = 'all';
    currentFilter = { tool: 'all', status: 'all' };
    
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    loadPurchaseHistory(currentUser);
}

// Sao chép key
function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        showNotification('Đã sao chép key!');
    });
}

function getToolIcon(toolKey) {
    const icons = {
        'toolv1': '🎲',
        'toolmd5': '🔐',
        'toolsicbo': '⚡'
    };
    return icons[toolKey] || '🛠️';
}

function getToolDisplayName(toolKey) {
    const toolNames = {
        'toolv1': 'Tool V1 - Dự đoán Tài Xỉu',
        'toolmd5': 'Tool MD5 - Giải mã MD5',
        'toolsicbo': 'Tool Sicbo - Phát hiện BÃO'
    };
    return toolNames[toolKey] || toolKey;
}

function getDurationText(duration, unit) {
    switch(unit) {
        case 'hour':
            return duration === 1 ? '1 giờ' : `${duration} giờ`;
        case 'day':
            return duration === 1 ? '1 ngày' : `${duration} ngày`;
        default:
            return `${duration} giờ`;
    }
}

// Đăng xuất
function logout() {
    localStorage.removeItem('currentUser');
    window.location.href = 'index.html';
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
