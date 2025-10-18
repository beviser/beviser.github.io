// admin.js - Xử lý admin panel

document.addEventListener('DOMContentLoaded', function() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    
    // Kiểm tra quyền admin
    if (!currentUser || !currentUser.isAdmin) {
        window.location.href = 'index.html';
        return;
    }
    
    updateHeaderInfo(currentUser);
    initSidebar();
    loadAdminData();
    
    // Xử lý form chuyển tiền
    const transferForm = document.getElementById('transferForm');
    if (transferForm) {
        transferForm.addEventListener('submit', handleTransfer);
    }
    
    // Xử lý form ban user
    const banForm = document.getElementById('banForm');
    if (banForm) {
        banForm.addEventListener('submit', handleBanUser);
    }
    
    // Xử lý form tạo voucher
    const voucherForm = document.getElementById('voucherForm');
    if (voucherForm) {
        voucherForm.addEventListener('submit', handleCreateVoucher);
    }
});

// Cập nhật thông tin header
function updateHeaderInfo(user) {
    const usernameEl = document.getElementById('headerUsername');
    const balanceEl = document.getElementById('headerBalance');
    
    if (usernameEl) usernameEl.textContent = user.username;
    if (balanceEl) balanceEl.textContent = formatCurrency(user.balance);
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

// Tải dữ liệu admin
function loadAdminData() {
    loadUsersList();
    updateStats();
    loadVouchers();
}

// Tải danh sách user
function loadUsersList() {
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const userList = document.getElementById('userList');
    
    userList.innerHTML = '';
    
    if (users.length === 0) {
        userList.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">👤</div>
                <div class="empty-title">Chưa có người dùng</div>
            </div>
        `;
        return;
    }
    
    users.forEach(user => {
        if (!user.isAdmin) { // Không hiển thị admin
            const userItem = document.createElement('div');
            userItem.className = 'user-item';
            userItem.innerHTML = `
                <div class="user-details">
                    <div class="user-name">${user.username}</div>
                    <div class="user-balance">${formatCurrency(user.balance)}</div>
                    <div class="user-date">Đăng ký: ${new Date(user.createdAt).toLocaleDateString('vi-VN')}</div>
                </div>
                <div class="user-actions">
                    <button class="action-btn edit" onclick="editUser('${user.username}')">Sửa</button>
                    <button class="action-btn delete" onclick="deleteUser('${user.username}')">Xóa</button>
                </div>
            `;
            userList.appendChild(userItem);
        }
    });
}

// Cập nhật thống kê
function updateStats() {
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const tools = JSON.parse(localStorage.getItem('tools')) || {};
    const vouchers = JSON.parse(localStorage.getItem('vouchers')) || [];
    
    const totalUsers = users.filter(u => !u.isAdmin).length;
    
    // Tính tổng doanh thu (giả lập)
    let totalRevenue = 0;
    users.forEach(user => {
        if (!user.isAdmin && user.initialBalance) {
            totalRevenue += (user.initialBalance - user.balance);
        }
    });
    
    const activeTools = Object.values(tools).filter(tool => tool.active && tool.expiry > Date.now()).length;
    const totalVouchers = vouchers.length;
    
    document.getElementById('totalUsers').textContent = totalUsers;
    document.getElementById('totalRevenue').textContent = formatCurrency(totalRevenue);
    document.getElementById('activeTools').textContent = activeTools;
    document.getElementById('totalVouchers').textContent = totalVouchers;
}

// Xử lý chuyển tiền
function handleTransfer(e) {
    e.preventDefault();
    
    const username = document.getElementById('transferUsername').value;
    const amount = parseInt(document.getElementById('transferAmount').value);
    
    const users = JSON.parse(localStorage.getItem('users'));
    const user = users.find(u => u.username === username);
    
    if (!user) {
        showNotification('Không tìm thấy người dùng!', 'error');
        return;
    }
    
    if (amount < 1000) {
        showNotification('Số tiền tối thiểu là 1,000đ!', 'error');
        return;
    }
    
    // Cộng tiền cho user
    user.balance += amount;
    localStorage.setItem('users', JSON.stringify(users));
    
    showNotification(`Đã chuyển ${formatCurrency(amount)} cho ${username}`);
    document.getElementById('transferForm').reset();
    loadAdminData();
}

// Xử lý ban user
function handleBanUser(e) {
    e.preventDefault();
    
    const username = document.getElementById('banUsername').value;
    const reason = document.getElementById('banReason').value;
    
    const users = JSON.parse(localStorage.getItem('users'));
    const userIndex = users.findIndex(u => u.username === username);
    
    if (userIndex === -1) {
        showNotification('Không tìm thấy người dùng!', 'error');
        return;
    }
    
    // Xóa user
    users.splice(userIndex, 1);
    localStorage.setItem('users', JSON.stringify(users));
    
    showNotification(`Đã ban user ${username}${reason ? ` với lý do: ${reason}` : ''}`);
    document.getElementById('banForm').reset();
    loadAdminData();
}

// Xử lý tạo voucher
function handleCreateVoucher(e) {
    e.preventDefault();
    
    const tool = document.getElementById('voucherTool').value;
    const discount = parseInt(document.getElementById('voucherDiscount').value);
    const expiry = document.getElementById('voucherExpiry').value;
    const maxUses = parseInt(document.getElementById('voucherMaxUses').value);
    
    const voucher = {
        code: generateVoucherCode(),
        tool: tool,
        discount: discount,
        expiry: new Date(expiry).getTime(),
        maxUses: maxUses,
        usedCount: 0,
        createdAt: Date.now()
    };
    
    const vouchers = JSON.parse(localStorage.getItem('vouchers')) || [];
    vouchers.push(voucher);
    localStorage.setItem('vouchers', JSON.stringify(vouchers));
    
    showNotification(`Đã tạo voucher: ${voucher.code}`);
    document.getElementById('voucherForm').reset();
    loadVouchers();
}

// Tạo mã voucher
function generateVoucherCode() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = 'LDP-';
    for (let i = 0; i < 8; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
}

// Tải danh sách voucher
function loadVouchers() {
    const vouchers = JSON.parse(localStorage.getItem('vouchers')) || [];
    const voucherList = document.getElementById('voucherList');
    
    voucherList.innerHTML = '';
    
    if (vouchers.length === 0) {
        voucherList.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">🎫</div>
                <div class="empty-title">Chưa có voucher nào</div>
            </div>
        `;
        return;
    }
    
    vouchers.forEach((voucher, index) => {
        const voucherItem = document.createElement('div');
        voucherItem.className = 'voucher-item';
        voucherItem.innerHTML = `
            <div class="voucher-code">${voucher.code}</div>
            <div class="voucher-info">
                <span>Tool: ${voucher.tool}</span>
                <span class="voucher-discount">Giảm ${voucher.discount}%</span>
            </div>
            <div class="voucher-info">
                <span>Hết hạn: ${new Date(voucher.expiry).toLocaleDateString('vi-VN')}</span>
                <span class="voucher-expires">${voucher.expiry < Date.now() ? 'Đã hết hạn' : 'Còn hiệu lực'}</span>
            </div>
            <div class="voucher-usage">Đã sử dụng: ${voucher.usedCount}/${voucher.maxUses}</div>
            <button class="delete-voucher-btn" onclick="deleteVoucher(${index})">Xóa voucher</button>
        `;
        voucherList.appendChild(voucherItem);
    });
}

// Xóa voucher
function deleteVoucher(index) {
    const vouchers = JSON.parse(localStorage.getItem('vouchers')) || [];
    vouchers.splice(index, 1);
    localStorage.setItem('vouchers', JSON.stringify(vouchers));
    showNotification('Đã xóa voucher');
    loadVouchers();
}

// Sửa user
function editUser(username) {
    const users = JSON.parse(localStorage.getItem('users'));
    const user = users.find(u => u.username === username);
    
    if (user) {
        const newBalance = prompt(`Nhập số tiền mới cho ${username}:`, user.balance);
        if (newBalance !== null) {
            user.balance = parseInt(newBalance) || 0;
            localStorage.setItem('users', JSON.stringify(users));
            showNotification(`Đã cập nhật số tiền cho ${username}`);
            loadAdminData();
        }
    }
}

// Xóa user
function deleteUser(username) {
    if (confirm(`Bạn có chắc muốn xóa user ${username}?`)) {
        const users = JSON.parse(localStorage.getItem('users'));
        const userIndex = users.findIndex(u => u.username === username);
        
        if (userIndex !== -1) {
            users.splice(userIndex, 1);
            localStorage.setItem('users', JSON.stringify(users));
            showNotification(`Đã xóa user ${username}`);
            loadAdminData();
        }
    }
}

// Định dạng tiền tệ
function formatCurrency(amount) {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
    }).format(amount);
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