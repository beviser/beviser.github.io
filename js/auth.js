// auth.js - Xử lý đăng nhập và đăng ký (ĐÃ SỬA)

// Khởi tạo dữ liệu mẫu
function initializeData() {
    if (!localStorage.getItem('users')) {
        const users = [
            {
                username: 'bevis',
                password: 'leduc',
                balance: 100000000,
                isAdmin: true,
                createdAt: new Date().toISOString()
            }
        ];
        localStorage.setItem('users', JSON.stringify(users));
        console.log('✅ Initialized default admin user');
    }
    
    if (!localStorage.getItem('tools')) {
        const tools = {
            'toolv1': { active: false, expiry: null, key: null },
            'toolmd5': { active: false, expiry: null, key: null },
            'toolsicbo': { active: false, expiry: null, key: null }
        };
        localStorage.setItem('tools', JSON.stringify(tools));
    }
    
    if (!localStorage.getItem('vouchers')) {
        localStorage.setItem('vouchers', JSON.stringify([]));
    }
    
    if (!localStorage.getItem('purchaseHistory')) {
        localStorage.setItem('purchaseHistory', JSON.stringify([]));
    }
}

// Hiển thị thông báo
function showNotification(message, type = 'success') {
    const notification = document.getElementById('notification');
    if (!notification) {
        // Tạo notification nếu chưa có
        const notificationHTML = `
            <div id="notification" class="notification">
                <div class="notification-icon">✓</div>
                <div class="notification-content">
                    <div class="notification-title">Thông báo</div>
                    <div class="notification-message">${message}</div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', notificationHTML);
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

// Xử lý đăng ký
function handleRegister(e) {
    e.preventDefault();
    console.log('📝 Register form submitted');
    
    const username = document.getElementById('regUsername').value.trim();
    const password = document.getElementById('regPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    // Kiểm tra mật khẩu xác nhận
    if (password !== confirmPassword) {
        showNotification('Mật khẩu xác nhận không khớp!', 'error');
        return;
    }
    
    // Kiểm tra độ dài mật khẩu
    if (password.length < 6) {
        showNotification('Mật khẩu phải có ít nhất 6 ký tự!', 'error');
        return;
    }
    
    // Kiểm tra độ dài tên đăng nhập
    if (username.length < 4) {
        showNotification('Tên đăng nhập phải có ít nhất 4 ký tự!', 'error');
        return;
    }
    
    let users = JSON.parse(localStorage.getItem('users')) || [];
    
    // Kiểm tra tên đăng nhập đã tồn tại
    if (users.find(u => u.username === username)) {
        showNotification('Tên đăng nhập đã tồn tại!', 'error');
        return;
    }
    
    // Thêm người dùng mới
    const newUser = {
        username: username,
        password: password,
        balance: 0,
        isAdmin: false,
        createdAt: new Date().toISOString()
    };
    
    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));
    
    console.log('✅ New user registered:', newUser);
    
    showNotification('Đăng ký thành công! Đang chuyển hướng...');
    
    setTimeout(() => {
        window.location.href = 'index.html';
    }, 2000);
}

// Xử lý đăng nhập
function handleLogin(e) {
    e.preventDefault();
    console.log('🔐 Login form submitted');
    
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;
    
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const user = users.find(u => u.username === username && u.password === password);
    
    if (user) {
        // Lưu thông tin người dùng hiện tại
        localStorage.setItem('currentUser', JSON.stringify(user));
        console.log('✅ User logged in:', user.username);
        showNotification('Đăng nhập thành công!');
        
        setTimeout(() => {
            window.location.href = 'home.html';
        }, 1500);
    } else {
        showNotification('Tên đăng nhập hoặc mật khẩu không đúng!', 'error');
    }
}

// Khởi tạo sự kiện khi DOM loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 DOM loaded - Initializing auth system');
    
    // Khởi tạo dữ liệu
    initializeData();
    
    // Đăng ký form
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        console.log('✅ Register form found');
        registerForm.addEventListener('submit', handleRegister);
    }
    
    // Đăng nhập form
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        console.log('✅ Login form found');
        loginForm.addEventListener('submit', handleLogin);
    }
});

// Đăng xuất
function logout() {
    localStorage.removeItem('currentUser');
    window.location.href = 'index.html';
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
