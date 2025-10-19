// admin.js - Xử lý admin panel (HOÀN TOÀN MỚI)

// Biến toàn cục để theo dõi dữ liệu
let currentUsers = [];

document.addEventListener('DOMContentLoaded', function() {
    console.log('=== ADMIN PANEL INIT ===');
    
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    
    // Kiểm tra quyền admin
    if (!currentUser || !currentUser.isAdmin) {
        alert('Bạn không có quyền truy cập admin panel!');
        window.location.href = 'index.html';
        return;
    }
    
    console.log('Admin user:', currentUser);
    
    updateHeaderInfo(currentUser);
    initSidebar();
    loadAdminData();
    setupEventListeners();
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

// Thiết lập event listeners
function setupEventListeners() {
    // Form chuyển tiền
    const transferForm = document.getElementById('transferForm');
    if (transferForm) {
        transferForm.addEventListener('submit', function(e) {
            e.preventDefault();
            handleTransfer();
        });
    }
    
    // Form ban user
    const banForm = document.getElementById('banForm');
    if (banForm) {
        banForm.addEventListener('submit', function(e) {
            e.preventDefault();
            handleBanUser();
        });
    }
    
    // Form tạo voucher
    const voucherForm = document.getElementById('voucherForm');
    if (voucherForm) {
        voucherForm.addEventListener('submit', function(e) {
            e.preventDefault();
            handleCreateVoucher();
        });
    }
}

// Tải dữ liệu admin
function loadAdminData() {
    console.log('=== LOADING ADMIN DATA ===');
    loadUsersList();
    updateStats();
}

// Tải danh sách user - PHIÊN BẢN MỚI
function loadUsersList() {
    console.log('=== LOADING USERS LIST ===');
    
    // Đọc trực tiếp từ localStorage
    currentUsers = JSON.parse(localStorage.getItem('users')) || [];
    const userList = document.getElementById('userList');
    
    if (!userList) {
        console.error('❌ User list element not found!');
        return;
    }
    
    userList.innerHTML = '';
    
    console.log('📊 Total users found:', currentUsers.length);
    console.log('👥 All users:', currentUsers);
    
    // Lọc chỉ user thường (không phải admin)
    const regularUsers = currentUsers.filter(user => !user.isAdmin);
    
    console.log('👤 Regular users:', regularUsers);
    
    if (regularUsers.length === 0) {
        userList.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">👤</div>
                <div class="empty-title">Chưa có người dùng thường</div>
                <div class="empty-description">
                    Tổng số user trong hệ thống: ${currentUsers.length}<br>
                    Chỉ có tài khoản admin trong hệ thống
                </div>
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
    
    console.log('✅ Users list loaded successfully');
}

// Cập nhật thống kê
function updateStats() {
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const tools = JSON.parse(localStorage.getItem('tools')) || {};
    
    const totalUsers = users.filter(u => !u.isAdmin).length;
    
    let totalRevenue = 0;
    users.forEach(user => {
        if (!user.isAdmin) {
            totalRevenue += user.balance;
        }
    });
    
    const activeTools = Object.values(tools).filter(tool => tool.active && tool.expiry > Date.now()).length;
    
    document.getElementById('totalUsers').textContent = totalUsers;
    document.getElementById('totalRevenue').textContent = formatCurrency(totalRevenue);
    document.getElementById('activeTools').textContent = activeTools;
    document.getElementById('totalVouchers').textContent = '0';
}

// Xử lý chuyển tiền - PHIÊN BẢN MỚI
function handleTransfer() {
    console.log('=== HANDLING TRANSFER ===');
    
    const username = document.getElementById('transferUsername').value.trim();
    const amountInput = document.getElementById('transferAmount').value.trim();
    
    console.log('Transfer details:', { username, amountInput });
    
    if (!username || !amountInput) {
        showNotification('Vui lòng nhập đầy đủ thông tin!', 'error');
        return;
    }
    
    const amount = parseInt(amountInput);
    
    if (isNaN(amount) || amount < 1000) {
        showNotification('Số tiền tối thiểu là 1,000đ!', 'error');
        return;
    }
    
    // Đọc lại dữ liệu mới nhất từ localStorage
    let users = JSON.parse(localStorage.getItem('users')) || [];
    const userIndex = users.findIndex(u => u.username === username);
    
    console.log('User search result:', { userIndex, users });
    
    if (userIndex === -1) {
        showNotification('Không tìm thấy người dùng!', 'error');
        return;
    }
    
    const user = users[userIndex];
    
    if (user.isAdmin) {
        showNotification('Không thể chuyển tiền cho tài khoản admin!', 'error');
        return;
    }
    
    console.log('Before transfer - User balance:', user.balance);
    
    // Cộng tiền cho user
    users[userIndex].balance += amount;
    
    console.log('After transfer - User balance:', users[userIndex].balance);
    
    // LƯU LẠI VÀO LOCALSTORAGE
    localStorage.setItem('users', JSON.stringify(users));
    
    // KIỂM TRA LẠI
    const updatedUsers = JSON.parse(localStorage.getItem('users'));
    console.log('After save - Updated users:', updatedUsers);
    
    showNotification(`✅ Đã chuyển ${formatCurrency(amount)} cho ${username}`);
    
    // Reset form
    document.getElementById('transferForm').reset();
    
    // Cập nhật lại toàn bộ giao diện
    loadAdminData();
    
    // Cập nhật header nếu user đang đăng nhập là user được chuyển tiền
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (currentUser && currentUser.username === username) {
        currentUser.balance += amount;
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        updateHeaderInfo(currentUser);
    }
}

// Xử lý ban user - PHIÊN BẢN MỚI
function handleBanUser() {
    console.log('=== HANDLING BAN USER ===');
    
    const username = document.getElementById('banUsername').value.trim();
    const reason = document.getElementById('banReason').value.trim();
    
    console.log('Ban details:', { username, reason });
    
    if (!username) {
        showNotification('Vui lòng nhập tên người dùng!', 'error');
        return;
    }
    
    // Đọc lại dữ liệu mới nhất từ localStorage
    let users = JSON.parse(localStorage.getItem('users')) || [];
    const userIndex = users.findIndex(u => u.username === username);
    
    console.log('User search result:', { userIndex, users });
    
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
    
    console.log('Before ban - Total users:', users.length);
    
    // Xóa user
    users.splice(userIndex, 1);
    
    console.log('After ban - Total users:', users.length);
    
    // LƯU LẠI VÀO LOCALSTORAGE
    localStorage.setItem('users', JSON.stringify(users));
    
    // KIỂM TRA LẠI
    const updatedUsers = JSON.parse(localStorage.getItem('users'));
    console.log('After save - Updated users:', updatedUsers);
    
    showNotification(`✅ Đã ban user ${username}${reason ? ` với lý do: ${reason}` : ''}`);
    
    // Reset form
    document.getElementById('banForm').reset();
    
    // Cập nhật lại toàn bộ giao diện
    loadAdminData();
}

// Xử lý tạo voucher
function handleCreateVoucher() {
    showNotification('Tính năng voucher đang được phát triển...');
}

// Sửa user
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

// Xóa user
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