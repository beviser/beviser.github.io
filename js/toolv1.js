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
    
    messageEl.textContent = message;
    notification.className = `notification ${type}`;
    notification.classList.add('show');
    
    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}

// Xử lý đăng nhập
document.addEventListener('DOMContentLoaded', function() {
    initializeData();
    
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            
            const users = JSON.parse(localStorage.getItem('users'));
            const user = users.find(u => u.username === username && u.password === password);
            
            if (user) {
                // Lưu thông tin người dùng hiện tại
                localStorage.setItem('currentUser', JSON.stringify(user));
                showNotification('Đăng nhập thành công!');
                
                setTimeout(() => {
                    window.location.href = 'home.html';
                }, 1500);
            } else {
                showNotification('Tên đăng nhập hoặc mật khẩu không đúng!', 'error');
            }
        });
    }
    
    if (registerForm) {
        registerForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const username = document.getElementById('regUsername').value;
            const password = document.getElementById('regPassword').value;
            const confirmPassword = document.getElementById('confirmPassword').value;
            
            if (password !== confirmPassword) {
                showNotification('Mật khẩu xác nhận không khớp!', 'error');
                return;
            }
            
            if (password.length < 6) {
                showNotification('Mật khẩu phải có ít nhất 6 ký tự!', 'error');
                return;
            }
            
            const users = JSON.parse(localStorage.getItem('users'));
            
            if (users.find(u => u.username === username)) {
                showNotification('Tên đăng nhập đã tồn tại!', 'error');
                return;
            }
            
            // Thêm người dùng mới
            const newUser = {
                username,
                password,
                balance: 0,
                isAdmin: false,
                createdAt: new Date().toISOString()
            };
            
            users.push(newUser);
            localStorage.setItem('users', JSON.stringify(users));
            
            showNotification('Đăng ký thành công!');
            
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1500);
        });
    }
});

// Đăng xuất
function logout() {
    localStorage.removeItem('currentUser');
    window.location.href = 'index.html';
}