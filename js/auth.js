// auth.js - Xử lý đăng nhập và đăng ký

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
        console.log('Initialized default admin user');
    }
    
    if (!localStorage.getItem('tools')) {
        const tools = {
            'toolv1': { active: false, expiry: null, key: null },
            'toolmd5': { active: false, expiry: null, key: null },
            'toolsicbo': { active: false, expiry: null, key: null }
        };
        localStorage.setItem('tools', JSON.stringify(tools));
    }
}

// Hiển thị thông báo
function showNotification(message, type = 'success') {
    const notification = document.getElementById('notification');
    const messageEl = notification.querySelector('.notification-message');
    
    if (!notification || !messageEl) {
        console.error('Không tìm thấy element notification');
        alert(message); // Fallback
        return;
    }
    
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
    console.log('Register form submitted');
    
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
    console.log('Current users before registration:', users);
    
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
    
    console.log('New user registered:', newUser);
    console.log('All users after registration:', users);
    
    showNotification('Đăng ký thành công! Đang chuyển hướng...');
    
    setTimeout(() => {
        window.location.href = 'index.html';
    }, 2000);
}

// Xử lý đăng nhập
function handleLogin(e) {
    e.preventDefault();
    console.log('Login form submitted');
    
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;
    
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const user = users.find(u => u.username === username && u.password === password);
    
    if (user) {
        // Lưu thông tin người dùng hiện tại
        localStorage.setItem('currentUser', JSON.stringify(user));
        console.log('User logged in:', user);
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
    console.log('DOM loaded - Initializing auth system');
    
    // Khởi tạo dữ liệu
    initializeData();
    
    // Đăng ký form
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        console.log('Register form found');
        registerForm.addEventListener('submit', handleRegister);
    } else {
        console.log('Register form not found');
    }
    
    // Đăng nhập form
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        console.log('Login form found');
        loginForm.addEventListener('submit', handleLogin);
    } else {
        console.log('Login form not found');
    }
});

// Đăng xuất
function logout() {
    localStorage.removeItem('currentUser');
    window.location.href = 'index.html';
}