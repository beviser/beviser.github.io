// admin.js - Xử lý admin panel

document.addEventListener('DOMContentLoaded', function() {
    console.log('Admin panel loaded');
    
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
        transferForm.addEventListener('submit', function(e) {
            e.preventDefault();
            handleTransfer();
        });
    }
    
    // Xử lý form ban user
    const banForm = document.getElementById('banForm');
    if (banForm) {
        banForm.addEventListener('submit', function(e) {
            e.preventDefault();
            handleBanUser();
        });
    }
    
    // Xử lý form tạo voucher
    const voucherForm = document.getElementById('voucherForm');
    if (voucherForm) {
        voucherForm.addEventListener('submit', function(e) {
            e.preventDefault();
            handleCreateVoucher();
        });
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

// Tải danh sách user - COMPLETELY FIXED
function loadUsersList() {
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const userList = document.getElementById('userList');
    
    if (!userList) {
        console.error('User list element not found');
        return;
    }
    
    userList.innerHTML = '';
    
    console.log('Total users in storage:', users.length);
    console.log('All users:', users);
    
    // Lọc ra chỉ user thường (không phải admin)
    const regularUsers = users.filter(user => !user.isAdmin);
    
    if (regularUsers.length === 0) {
        userList.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">👤</div>
                <div class="empty-title">Chưa có người dùng thường</div>
                <div class="empty-description">Chỉ có tài khoản admin trong hệ thống</div>
            </div>
        `;
        return;
    }
    
    // Hiển thị từng user
    regularUsers.forEach(user => {
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
    });
}

// Cập nhật thống kê - FIXED
function updateStats() {
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const tools = JSON.parse(localStorage.getItem('tools')) || {};
    
    const totalUsers = users.filter(u => !u.isAdmin).length;
    
    // Tính tổng doanh thu (giả lập - tổng số dư của tất cả user)
    let totalRevenue = 0;
    users.forEach(user => {
        if (!user.isAdmin) {
            totalRevenue += user.balance;
        }
    });
    
    const activeTools = Object.values(tools).filter(tool => tool.active && tool.expiry > Date.now()).length;
    const vouchers = JSON.parse(localStorage.getItem('vouchers')) || [];
    const totalVouchers = vouchers.length;
    
    document.getElementById('totalUsers').textContent = totalUsers;
    document.getElementById('totalRevenue').textContent = formatCurrency(totalRevenue);
    document.getElementById('activeTools').textContent = activeTools;
    document.getElementById('totalVouchers').textContent = totalVouchers;
}

// Xử lý chuyển tiền - COMPLETELY FIXED
function handleTransfer() {
    console.log('Transfer form submitted');
    
    const username = document.getElementById('transferUsername').value.trim();
    const amountInput = document.getElementById('transferAmount').value.trim();
    
    if (!username || !amountInput) {
        showNotification('Vui lòng nhập đầy đủ thông tin!', 'error');
        return;
    }
    
    const amount = parseInt(amountInput);
    
    if (isNaN(amount) || amount < 1000) {
        showNotification('Số tiền tối thiểu là 1,000đ!', 'error');
        return;
    }
    
    let users = JSON.parse(localStorage.getItem('users')) || [];
    const userIndex = users.findIndex(u => u.username === username);
    
    if (userIndex === -1) {
        showNotification('Không tìm thấy người dùng!', 'error');
        return;
    }
    
    const user = users[userIndex];
    
    if (user.isAdmin) {
        showNotification('Không thể chuyển tiền cho tài khoản admin!', 'error');
        return;
    }
    
    // Cộng tiền cho user
    users[userIndex].balance += amount;
    localStorage.setItem('users', JSON.stringify(users));
    
    console.log('After transfer - Users:', users);
    
    showNotification(`✅ Đã chuyển ${formatCurrency(amount)} cho ${username}`);
    
    // Reset form và cập nhật lại giao diện
    document.getElementById('transferForm').reset();
    loadAdminData();
    
    // Cập nhật header nếu user đang đăng nhập là user được chuyển tiền
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (currentUser && currentUser.username === username) {
        currentUser.balance += amount;
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        updateHeaderInfo(currentUser);
    }
}

// Xử lý ban user - COMPLETELY FIXED
function handleBanUser() {
    console.log('Ban form submitted');
    
    const username = document.getElementById('banUsername').value.trim();
    const reason = document.getElementById('banReason').value.trim();
    
    if (!username) {
        showNotification('Vui lòng nhập tên người dùng!', 'error');
        return;
    }
    
    let users = JSON.parse(localStorage.getItem('users')) || [];
    const userIndex = users.findIndex(u => u.username === username);
    
    if (userIndex === -1) {
        showNotification('Không tìm thấy người dùng!', 'error');
        return;
    }
    
    const user = users[userIndex];
    
    if (user.isAdmin) {
        showNotification('Không thể ban tài khoản admin!', 'error');
        return;
    }
    
    if (!confirm(`Bạn có chắc muốn BAN user "${username}"? Hành động này không thể hoàn tác!`)) {
        return;
    }
    
    // Xóa user
    users.splice(userIndex, 1);
    localStorage.setItem('users', JSON.stringify(users));
    
    console.log('After ban - Users:', users);
    
    showNotification(`✅ Đã ban user ${username}${reason ? ` với lý do: ${reason}` : ''}`);
    document.getElementById('banForm').reset();
    loadAdminData();
}

// Xử lý tạo voucher
function handleCreateVoucher() {
    showNotification('Tính năng voucher đang được phát triển...');
}

// Tải danh sách voucher
function loadVouchers() {
    const vouchers = JSON.parse(localStorage.getItem('vouchers')) || [];
    const voucherList = document.getElementById('voucherList');
    
    if (!voucherList) return;
    
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

// Sửa user - FIXED
function editUser(username) {
    const users = JSON.parse(localStorage.getItem('users'));
    const userIndex = users.findIndex(u => u.username === username);
    
    if (userIndex !== -1) {
        const newBalance = prompt(`Nhập số tiền mới cho ${username}:`, users[userIndex].balance);
        if (newBalance !== null) {
            const balance = parseInt(newBalance);
            if (!isNaN(balance) && balance >= 0) {
                users[userIndex].balance = balance;
                localStorage.setItem('users', JSON.stringify(users));
                showNotification(`✅ Đã cập nhật số tiền cho ${username}`);
                loadAdminData();
            } else {
                showNotification('Số tiền không hợp lệ!', 'error');
            }
        }
    }
}

// Xóa user - FIXED
function deleteUser(username) {
    if (confirm(`Bạn có chắc muốn XÓA user "${username}"? Hành động này không thể hoàn tác!`)) {
        let users = JSON.parse(localStorage.getItem('users'));
        const userIndex = users.findIndex(u => u.username === username);
        
        if (userIndex !== -1) {
            users.splice(userIndex, 1);
            localStorage.setItem('users', JSON.stringify(users));
            showNotification(`✅ Đã xóa user ${username}`);
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
    if (!notification) {
        console.error('Notification element not found');
        alert(message); // Fallback
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