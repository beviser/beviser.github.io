// admin.js - Xử lý Admin Panel (ĐÃ SỬA)

document.addEventListener('DOMContentLoaded', function() {
    console.log('⚙️ Admin Panel loaded');
    
    // Kiểm tra đăng nhập và quyền admin
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser || !currentUser.isAdmin) {
        alert('⚠️ Bạn không có quyền truy cập admin panel!');
        window.location.href = 'index.html';
        return;
    }
    
    console.log('✅ Admin user authenticated:', currentUser.username);
    
    // Cập nhật giao diện
    updateHeaderInfo(currentUser);
    initSidebar();
    loadAdminData();
    setupEventListeners();
    
    console.log('🎯 Admin Panel ready');
});

// Cập nhật header
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
        // Set min date to today
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('voucherExpiry').min = today;
        
        voucherForm.addEventListener('submit', function(e) {
            e.preventDefault();
            handleCreateVoucher();
        });
    }
}

// Tải dữ liệu admin
function loadAdminData() {
    console.log('📊 Loading admin data...');
    loadUsersList();
    loadVouchers();
    updateStats();
}

// Tải danh sách user
function loadUsersList() {
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const userList = document.getElementById('userList');
    
    if (!userList) return;
    
    userList.innerHTML = '';
    
    // Lọc chỉ user thường (không phải admin)
    const regularUsers = users.filter(user => !user.isAdmin);
    
    if (regularUsers.length === 0) {
        userList.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">👤</div>
                <div class="empty-title">Chưa có người dùng thường</div>
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

// Xử lý chuyển tiền
function handleTransfer() {
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
    
    // Đọc và cập nhật dữ liệu
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
    
    // Lưu vào localStorage
    localStorage.setItem('users', JSON.stringify(users));
    
    showNotification(`✅ Đã chuyển ${formatCurrency(amount)} cho ${username}`);
    
    // Reset form và cập nhật giao diện
    document.getElementById('transferForm').reset();
    loadAdminData();
}

// Xử lý ban user
function handleBanUser() {
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
    
    showNotification(`✅ Đã ban user ${username}${reason ? ` với lý do: ${reason}` : ''}`);
    document.getElementById('banForm').reset();
    loadAdminData();
}

// Xử lý tạo voucher
function handleCreateVoucher() {
    const tool = document.getElementById('voucherTool').value;
    const discount = parseInt(document.getElementById('voucherDiscount').value);
    const expiry = document.getElementById('voucherExpiry').value;
    const maxUses = parseInt(document.getElementById('voucherMaxUses').value);
    
    if (!tool || !discount || !expiry || !maxUses) {
        showNotification('Vui lòng nhập đầy đủ thông tin!', 'error');
        return;
    }
    
    if (discount < 1 || discount > 100) {
        showNotification('Phần trăm giảm giá phải từ 1-100%!', 'error');
        return;
    }
    
    if (maxUses < 1) {
        showNotification('Số lượt sử dụng phải lớn hơn 0!', 'error');
        return;
    }
    
    const expiryDate = new Date(expiry);
    if (expiryDate < new Date()) {
        showNotification('Ngày hết hạn phải lớn hơn ngày hiện tại!', 'error');
        return;
    }
    
    const voucher = {
        code: generateVoucherCode(),
        tool: tool,
        discount: discount,
        expiry: expiryDate.getTime(),
        maxUses: maxUses,
        usedCount: 0,
        createdAt: Date.now()
    };
    
    let vouchers = JSON.parse(localStorage.getItem('vouchers')) || [];
    vouchers.push(voucher);
    localStorage.setItem('vouchers', JSON.stringify(vouchers));
    
    showNotification(`✅ Đã tạo voucher: ${voucher.code} - Giảm ${discount}%`);
    document.getElementById('voucherForm').reset();
    loadVouchers();
    updateStats();
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
        const isExpired = new Date(voucher.expiry) < new Date();
        const voucherItem = document.createElement('div');
        voucherItem.className = 'voucher-item';
        voucherItem.style.border = isExpired ? '1px solid var(--error-red)' : '1px solid var(--glass-border)';
        voucherItem.innerHTML = `
            <div class="voucher-code">${voucher.code}</div>
            <div class="voucher-info">
                <span>Tool: ${voucher.tool}</span>
                <span class="voucher-discount">Giảm ${voucher.discount}%</span>
            </div>
            <div class="voucher-info">
                <span>Hết hạn: ${new Date(voucher.expiry).toLocaleDateString('vi-VN')}</span>
                <span class="voucher-expires" style="color: ${isExpired ? 'var(--error-red)' : 'var(--success-green)'}">
                    ${isExpired ? 'Đã hết hạn' : 'Còn hiệu lực'}
                </span>
            </div>
            <div class="voucher-usage">Đã sử dụng: ${voucher.usedCount}/${voucher.maxUses}</div>
            <button class="delete-voucher-btn" onclick="deleteVoucher(${index})">Xóa voucher</button>
        `;
        voucherList.appendChild(voucherItem);
    });
}

// Xóa voucher
function deleteVoucher(index) {
    if (confirm('Bạn có chắc muốn xóa voucher này?')) {
        let vouchers = JSON.parse(localStorage.getItem('vouchers')) || [];
        vouchers.splice(index, 1);
        localStorage.setItem('vouchers', JSON.stringify(vouchers));
        showNotification('✅ Đã xóa voucher');
        loadVouchers();
        updateStats();
    }
}

// Cập nhật thống kê
function updateStats() {
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const tools = JSON.parse(localStorage.getItem('tools')) || {};
    const vouchers = JSON.parse(localStorage.getItem('vouchers')) || [];
    
    const totalUsers = users.filter(u => !u.isAdmin).length;
    
    let totalRevenue = 0;
    users.forEach(user => {
        if (!user.isAdmin) {
            totalRevenue += user.balance;
        }
    });
    
    const activeTools = Object.values(tools).filter(tool => tool.active && tool.expiry > Date.now()).length;
    const totalVouchers = vouchers.length;
    
    document.getElementById('totalUsers').textContent = totalUsers;
    document.getElementById('totalRevenue').textContent = formatCurrency(totalRevenue);
    document.getElementById('activeTools').textContent = activeTools;
    document.getElementById('totalVouchers').textContent = totalVouchers;
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
    if (confirm(`Bạn có chắc muốn XÓA user "${username}"?`)) {
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
    }, 4000);
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
