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

// Tải danh sách user - FIXED
function loadUsersList() {
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const userList = document.getElementById('userList');
    
    if (!userList) {
        console.error('User list element not found');
        return;
    }
    
    userList.innerHTML = '';
    
    console.log('Total users in storage:', users.length);
    console.log('Users data:', users);
    
    if (users.length === 0) {
        userList.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">👤</div>
                <div class="empty-title">Chưa có người dùng</div>
            </div>
        `;
        return;
    }
    
    let hasRegularUsers = false;
    
    users.forEach(user => {
        // Hiển thị tất cả user, nhưng đánh dấu admin
        if (!user.isAdmin) {
            hasRegularUsers = true;
        }
        
        const userItem = document.createElement('div');
        userItem.className = 'user-item';
        userItem.innerHTML = `
            <div class="user-details">
                <div class="user-name">${user.username} ${user.isAdmin ? '(Admin)' : ''}</div>
                <div class="user-balance">${formatCurrency(user.balance)}</div>
                <div class="user-date">Đăng ký: ${new Date(user.createdAt).toLocaleDateString('vi-VN')}</div>
            </div>
            <div class="user-actions">
                ${!user.isAdmin ? `
                    <button class="action-btn edit" onclick="editUser('${user.username}')">Sửa</button>
                    <button class="action-btn delete" onclick="deleteUser('${user.username}')">Xóa</button>
                ` : '<span style="color: var(--accent-purple);">Quản trị viên</span>'}
            </div>
        `;
        userList.appendChild(userItem);
    });
    
    if (!hasRegularUsers) {
        userList.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">👤</div>
                <div class="empty-title">Chưa có người dùng thường</div>
                <div class="empty-description">Chỉ có tài khoản admin trong hệ thống</div>
            </div>
        `;
    }
}

// Cập nhật thống kê - FIXED
function updateStats() {
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const tools = JSON.parse(localStorage.getItem('tools')) || {};
    
    const totalUsers = users.filter(u => !u.isAdmin).length;
    
    // Tính tổng doanh thu từ tất cả user (trừ admin)
    let totalRevenue = 0;
    users.forEach(user => {
        if (!user.isAdmin) {
            // Giả sử doanh thu là tổng số tiền đã được nạp (balance hiện tại + đã chi tiêu)
            // Trong thực tế, bạn cần lưu lịch sử giao dịch để tính chính xác
            totalRevenue += user.balance;
        }
    });
    
    const activeTools = Object.values(tools).filter(tool => tool.active && tool.expiry > Date.now()).length;
    
    document.getElementById('totalUsers').textContent = totalUsers;
    document.getElementById('totalRevenue').textContent = formatCurrency(totalRevenue);
    document.getElementById('activeTools').textContent = activeTools;
    document.getElementById('totalVouchers').textContent = '0'; // Có thể thêm tính năng voucher sau
}

// Xử lý chuyển tiền - FIXED
function handleTransfer(e) {
    e.preventDefault();
    console.log('Transfer form submitted');
    
    const username = document.getElementById('transferUsername').value;
    const amount = parseInt(document.getElementById('transferAmount').value);
    
    if (!username || !amount) {
        showNotification('Vui lòng nhập đầy đủ thông tin!', 'error');
        return;
    }
    
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const user = users.find(u => u.username === username);
    
    if (!user) {
        showNotification('Không tìm thấy người dùng!', 'error');
        return;
    }
    
    if (user.isAdmin) {
        showNotification('Không thể chuyển tiền cho tài khoản admin!', 'error');
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
    loadAdminData(); // Refresh lại dữ liệu
}

// Xử lý ban user - FIXED
function handleBanUser(e) {
    e.preventDefault();
    console.log('Ban form submitted');
    
    const username = document.getElementById('banUsername').value;
    const reason = document.getElementById('banReason').value;
    
    if (!username) {
        showNotification('Vui lòng nhập tên người dùng!', 'error');
        return;
    }
    
    const users = JSON.parse(localStorage.getItem('users')) || [];
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
    
    if (!confirm(`Bạn có chắc muốn ban user ${username}?`)) {
        return;
    }
    
    // Xóa user
    users.splice(userIndex, 1);
    localStorage.setItem('users', JSON.stringify(users));
    
    showNotification(`Đã ban user ${username}${reason ? ` với lý do: ${reason}` : ''}`);
    document.getElementById('banForm').reset();
    loadAdminData(); // Refresh lại dữ liệu
}

// Xử lý tạo voucher
function handleCreateVoucher(e) {
    e.preventDefault();
    showNotification('Tính năng voucher đang được phát triển...');
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
    if (!notification) return;
    
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