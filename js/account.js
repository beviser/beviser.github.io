// account.js - Xử lý trang tài khoản

document.addEventListener('DOMContentLoaded', function() {
    console.log('👤 Account page loaded');
    
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
    
    // Tải thông tin tài khoản
    loadAccountInfo(currentUser);
    
    // Tải tools đang hoạt động
    loadActiveTools(currentUser);
    
    // Tải giao dịch gần đây
    loadRecentTransactions(currentUser);
    
    console.log('✅ Account page initialized');
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

// Tải thông tin tài khoản
function loadAccountInfo(user) {
    // Thông tin cơ bản
    document.getElementById('infoUsername').textContent = user.username;
    document.getElementById('infoType').textContent = user.isAdmin ? 'Quản trị viên' : 'Người dùng thường';
    document.getElementById('infoCreatedAt').textContent = new Date(user.createdAt).toLocaleDateString('vi-VN');
    document.getElementById('infoStatus').textContent = 'Đang hoạt động';
    
    // Số dư
    document.getElementById('balanceAmount').textContent = formatCurrency(user.balance);
    
    // Thống kê
    calculateUserStats(user);
}

// Tính toán thống kê người dùng
function calculateUserStats(user) {
    const purchaseHistory = JSON.parse(localStorage.getItem('purchaseHistory')) || [];
    const userHistory = purchaseHistory.filter(item => item.username === user.username);
    
    // Tổng chi tiêu
    const totalSpent = userHistory.reduce((sum, item) => sum + item.price, 0);
    document.getElementById('totalSpent').textContent = formatCurrency(totalSpent);
    
    // Số tool đã mua
    document.getElementById('toolsBought').textContent = userHistory.length;
    
    // Số tool đang hoạt động
    const activeToolsCount = userHistory.filter(item => item.expiry > Date.now()).length;
    document.getElementById('activeTools').textContent = activeToolsCount;
}

// Tải tools đang hoạt động
function loadActiveTools(user) {
    const purchaseHistory = JSON.parse(localStorage.getItem('purchaseHistory')) || [];
    const activeTools = purchaseHistory.filter(item => 
        item.username === user.username && item.expiry > Date.now()
    );
    
    const activeToolsList = document.getElementById('activeToolsList');
    
    if (activeTools.length === 0) {
        activeToolsList.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">⚡</div>
                <div class="empty-title">Không có tool nào đang hoạt động</div>
                <div class="empty-description">Hãy mua tool để bắt đầu sử dụng</div>
            </div>
        `;
        return;
    }
    
    // Sắp xếp theo thời gian hết hạn
    activeTools.sort((a, b) => a.expiry - b.expiry);
    
    activeToolsList.innerHTML = activeTools.map(tool => {
        const timeLeft = tool.expiry - Date.now();
        const hoursLeft = Math.floor(timeLeft / (1000 * 60 * 60));
        const minutesLeft = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
        
        return `
            <div class="active-tool-item">
                <div class="tool-info">
                    <div class="tool-name">${getToolDisplayName(tool.toolName)}</div>
                    <div class="tool-key">Key: ${tool.key}</div>
                </div>
                <div class="tool-timer">
                    <div class="timer-icon">⏱️</div>
                    <div class="timer-text">
                        Còn lại: ${hoursLeft > 0 ? hoursLeft + 'h ' : ''}${minutesLeft}p
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

// Tải giao dịch gần đây
function loadRecentTransactions(user) {
    const purchaseHistory = JSON.parse(localStorage.getItem('purchaseHistory')) || [];
    const userHistory = purchaseHistory.filter(item => item.username === user.username);
    
    const recentTransactions = document.getElementById('recentTransactions');
    
    if (userHistory.length === 0) {
        recentTransactions.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">📊</div>
                <div class="empty-title">Chưa có giao dịch nào</div>
                <div class="empty-description">Lịch sử giao dịch sẽ hiển thị tại đây</div>
            </div>
        `;
        return;
    }
    
    // Sắp xếp theo thời gian mua mới nhất
    userHistory.sort((a, b) => b.purchaseDate - a.purchaseDate);
    
    // Chỉ lấy 5 giao dịch gần nhất
    const recent = userHistory.slice(0, 5);
    
    recentTransactions.innerHTML = recent.map(transaction => {
        const isActive = transaction.expiry > Date.now();
        
        return `
            <div class="transaction-item">
                <div class="transaction-header">
                    <div class="transaction-tool">${getToolDisplayName(transaction.toolName)}</div>
                    <div class="transaction-amount ${isActive ? 'success' : 'expired'}">
                        ${formatCurrency(transaction.price)}
                    </div>
                </div>
                <div class="transaction-details">
                    <div class="transaction-date">
                        ${new Date(transaction.purchaseDate).toLocaleDateString('vi-VN')}
                    </div>
                    <div class="transaction-status ${isActive ? 'active' : 'expired'}">
                        ${isActive ? 'Đang hoạt động' : 'Đã hết hạn'}
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

function getToolDisplayName(toolKey) {
    const toolNames = {
        'toolv1': 'Tool V1 - Dự đoán Tài Xỉu',
        'toolmd5': 'Tool MD5 - Giải mã MD5',
        'toolsicbo': 'Tool Sicbo - Phát hiện BÃO'
    };
    return toolNames[toolKey] || toolKey;
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
