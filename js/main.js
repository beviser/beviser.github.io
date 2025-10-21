// main.js - Xử lý trang chủ và chức năng chung (ĐÃ SỬA)

let selectedPrices = {
    toolv1: { price: 10000, duration: 1, unit: 'hour' },
    toolmd5: { price: 10000, duration: 1, unit: 'hour' },
    toolsicbo: { price: 10000, duration: 1, unit: 'hour' }
};

let appliedVouchers = {
    toolv1: null,
    toolmd5: null,
    toolsicbo: null
};

document.addEventListener('DOMContentLoaded', function() {
    console.log('🏠 Home page loaded');
    
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
    
    // Tải trạng thái tools
    loadToolsStatus();
    
    // Hiển thị/hide admin panel link
    if (currentUser.isAdmin) {
        const adminLink = document.getElementById('adminPanelLink');
        if (adminLink) adminLink.classList.remove('hidden');
    }

    // Khởi tạo sự kiện cho các lựa chọn giá
    initPriceOptions();
    
    console.log('✅ Home page initialized');
});

// Khởi tạo sự kiện cho các lựa chọn giá
function initPriceOptions() {
    document.querySelectorAll('.price-option').forEach(option => {
        option.addEventListener('click', function() {
            const toolCard = this.closest('.tool-card');
            const toolId = toolCard.id.replace('Card', '');
            const price = parseInt(this.getAttribute('data-price'));
            const duration = parseInt(this.getAttribute('data-duration'));
            const unit = this.getAttribute('data-unit');

            // Lưu lựa chọn
            selectedPrices[toolId] = { price, duration, unit };

            // Đổi trạng thái selected
            this.parentElement.querySelectorAll('.price-option').forEach(opt => {
                opt.classList.remove('selected');
            });
            this.classList.add('selected');
            
            console.log(`💰 Selected ${toolId}: ${price}đ for ${duration} ${unit}`);
        });
    });
}

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
}

// Tải trạng thái tools
function loadToolsStatus() {
    const tools = JSON.parse(localStorage.getItem('tools')) || {};
    
    Object.keys(tools).forEach(toolName => {
        const tool = tools[toolName];
        const toolCard = document.getElementById(`${toolName}Card`);
        
        if (toolCard) {
            const statusEl = toolCard.querySelector('.tool-status');
            const buyBtn = toolCard.querySelector('.buy-btn');
            const timerEl = toolCard.querySelector('.timer-display');
            const openBtn = toolCard.querySelector('#toolv1OpenBtn, #toolmd5OpenBtn, #toolsicboOpenBtn');
            const keyInput = toolCard.querySelector('.key-input');
            
            if (tool.active && tool.expiry > Date.now()) {
                // Tool đang active
                statusEl.textContent = '✅ Đã kích hoạt';
                statusEl.className = 'tool-status unlocked';
                buyBtn.textContent = 'Đã mua';
                buyBtn.disabled = true;
                if (timerEl) timerEl.classList.remove('hidden');
                if (openBtn) openBtn.classList.remove('hidden');
                if (keyInput) keyInput.value = tool.key || '';

                // Cập nhật bộ đếm thời gian
                updateToolTimer(toolName, tool.expiry);
            } else {
                // Tool chưa active
                statusEl.textContent = '🔒 Đã khóa';
                statusEl.className = 'tool-status locked';
                buyBtn.textContent = 'Thuê ngay';
                buyBtn.disabled = false;
                if (timerEl) timerEl.classList.add('hidden');
                if (openBtn) openBtn.classList.add('hidden');
            }
        }
    });
}

// Cập nhật bộ đếm thời gian cho tool
function updateToolTimer(toolName, expiry) {
    const timerElement = document.getElementById(`${toolName}TimeLeft`);
    if (!timerElement) return;

    function update() {
        const now = Date.now();
        const timeLeft = expiry - now;

        if (timeLeft <= 0) {
            timerElement.textContent = 'Hết hạn';
            timerElement.classList.add('timer-expired');
            // Tự động vô hiệu hóa tool khi hết hạn
            const tools = JSON.parse(localStorage.getItem('tools')) || {};
            if (tools[toolName]) {
                tools[toolName].active = false;
                localStorage.setItem('tools', JSON.stringify(tools));
            }
            // Reload để cập nhật trạng thái
            window.location.reload();
            return;
        }

        const hours = Math.floor(timeLeft / (1000 * 60 * 60));
        const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);

        timerElement.textContent = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        setTimeout(update, 1000);
    }

    update();
}

// Mua tool - ĐÃ SỬA HOÀN TOÀN
function buyTool(toolName) {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const users = JSON.parse(localStorage.getItem('users'));
    const tools = JSON.parse(localStorage.getItem('tools')) || {};

    const selectedPrice = selectedPrices[toolName];
    const quantityInput = document.getElementById(`${toolName}Quantity`);
    const quantity = quantityInput ? parseInt(quantityInput.value) || 1 : 1;

    if (!selectedPrice) {
        showNotification('Vui lòng chọn thời gian thuê!', 'error');
        return;
    }

    // Tính tổng thời gian theo milliseconds
    let totalDurationMs = 0;
    switch(selectedPrice.unit) {
        case 'hour':
            totalDurationMs = selectedPrice.duration * 60 * 60 * 1000;
            break;
        case 'day':
            totalDurationMs = selectedPrice.duration * 24 * 60 * 60 * 1000;
            break;
        default:
            totalDurationMs = selectedPrice.duration * 60 * 60 * 1000;
    }

    // Áp dụng voucher nếu có
    let finalPrice = selectedPrice.price * quantity;
    const voucher = appliedVouchers[toolName];
    if (voucher) {
        finalPrice = finalPrice * (1 - voucher.discount / 100);
        finalPrice = Math.round(finalPrice);
    }

    if (currentUser.balance < finalPrice) {
        showNotification('Số dư không đủ! Vui lòng nạp thêm tiền.', 'error');
        setTimeout(() => {
            window.location.href = 'deposit.html';
        }, 2000);
        return;
    }

    // Trừ tiền
    currentUser.balance -= finalPrice;

    // Tạo key và thời gian hết hạn
    const key = generateKey();
    const expiry = Date.now() + totalDurationMs;

    // Cập nhật tool
    tools[toolName] = {
        active: true,
        expiry: expiry,
        key: key
    };

    // Cập nhật dữ liệu
    const userIndex = users.findIndex(u => u.username === currentUser.username);
    if (userIndex !== -1) {
        users[userIndex] = currentUser;
    }

    // Lưu lịch sử mua hàng
    const purchaseHistory = JSON.parse(localStorage.getItem('purchaseHistory')) || [];
    purchaseHistory.push({
        toolName: toolName,
        username: currentUser.username,
        key: key,
        price: finalPrice,
        duration: selectedPrice.duration,
        unit: selectedPrice.unit,
        expiry: expiry,
        purchaseDate: Date.now()
    });
    
    localStorage.setItem('purchaseHistory', JSON.stringify(purchaseHistory));
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    localStorage.setItem('users', JSON.stringify(users));
    localStorage.setItem('tools', JSON.stringify(tools));

    // Hiển thị key trong modal
    document.getElementById('generatedKey').textContent = key;
    showModal('keyModal');

    showNotification(`Mua thành công! Thời gian: ${getDurationText(selectedPrice.duration, selectedPrice.unit)}`);

    // Cập nhật voucher đã sử dụng
    if (voucher) {
        updateVoucherUsage(voucher.code);
    }

    // Reload để cập nhật trạng thái
    setTimeout(() => {
        window.location.reload();
    }, 2000);
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

// Tạo key ngẫu nhiên
function generateKey() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let key = '';
    for (let i = 0; i < 16; i++) {
        key += chars.charAt(Math.floor(Math.random() * chars.length));
        if ((i + 1) % 4 === 0 && i !== 15) {
            key += '-';
        }
    }
    return key;
}

// Kích hoạt tool bằng key
function activateKey(toolName) {
    const keyInput = document.getElementById(`${toolName}Key`);
    const key = keyInput.value.trim();

    if (!key) {
        showNotification('Vui lòng nhập key!', 'error');
        return;
    }

    const tools = JSON.parse(localStorage.getItem('tools')) || {};
    const tool = tools[toolName];

    if (tool && tool.key === key) {
        if (tool.expiry > Date.now()) {
            tool.active = true;
            localStorage.setItem('tools', JSON.stringify(tools));
            showNotification('Kích hoạt thành công!');
            setTimeout(() => {
                window.location.reload();
            }, 1500);
        } else {
            showNotification('Key đã hết hạn!', 'error');
        }
    } else {
        showNotification('Key không hợp lệ!', 'error');
    }
}

// Áp dụng voucher
function applyVoucher(toolName) {
    const voucherInput = document.getElementById(`voucherInput${toolName}`);
    if (!voucherInput) {
        showNotification('Không tìm thấy ô nhập voucher!', 'error');
        return;
    }
    
    const voucherCode = voucherInput.value.trim();
    if (!voucherCode) {
        showNotification('Vui lòng nhập mã giảm giá!', 'error');
        return;
    }

    const vouchers = JSON.parse(localStorage.getItem('vouchers')) || [];
    const voucher = vouchers.find(v => 
        v.code === voucherCode && 
        (v.tool === toolName || v.tool === 'all') &&
        v.expiry > Date.now() &&
        v.usedCount < v.maxUses
    );

    if (!voucher) {
        showNotification('Mã giảm giá không hợp lệ hoặc đã hết hạn!', 'error');
        return;
    }

    appliedVouchers[toolName] = voucher;
    showNotification(`Áp dụng thành công! Giảm ${voucher.discount}% cho ${toolName}`);
}

// Cập nhật số lần sử dụng voucher
function updateVoucherUsage(voucherCode) {
    const vouchers = JSON.parse(localStorage.getItem('vouchers')) || [];
    const voucherIndex = vouchers.findIndex(v => v.code === voucherCode);
    
    if (voucherIndex !== -1) {
        vouchers[voucherIndex].usedCount += 1;
        localStorage.setItem('vouchers', JSON.stringify(vouchers));
    }
}

// Hiển thị modal
function showModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('show');
    }
}

// Đóng modal
function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('show');
    }
}

// Sao chép key
function copyKey() {
    const keyText = document.getElementById('generatedKey').textContent;
    navigator.clipboard.writeText(keyText).then(() => {
        showNotification('Đã sao chép key!');
    });
}

// Hiển thị lịch sử mua hàng
function showHistory() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) return;
    
    const purchaseHistory = JSON.parse(localStorage.getItem('purchaseHistory')) || [];
    const userHistory = purchaseHistory.filter(item => item.username === currentUser.username);
    
    const historyContent = document.getElementById('historyContent');
    if (!historyContent) {
        createHistoryModal();
        return;
    }
    
    historyContent.innerHTML = '';
    
    if (userHistory.length === 0) {
        historyContent.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">📜</div>
                <div class="empty-title">Chưa có lịch sử mua hàng</div>
                <div class="empty-description">Bạn chưa mua tool nào</div>
            </div>
        `;
    } else {
        userHistory.sort((a, b) => b.purchaseDate - a.purchaseDate);
        
        userHistory.forEach((item, index) => {
            const isActive = item.expiry > Date.now();
            const timeLeft = item.expiry - Date.now();
            const hoursLeft = Math.floor(timeLeft / (1000 * 60 * 60));
            const minutesLeft = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
            
            const historyCard = document.createElement('div');
            historyCard.className = 'history-card';
            historyCard.innerHTML = `
                <div class="history-header">
                    <div class="history-tool-name">${getToolDisplayName(item.toolName)}</div>
                    <div class="history-date">${new Date(item.purchaseDate).toLocaleDateString('vi-VN')}</div>
                </div>
                <div class="history-details">
                    <div class="history-detail-item">
                        <div class="detail-label">Key</div>
                        <div class="detail-value" style="font-family: monospace; color: var(--accent-purple);">${item.key}</div>
                    </div>
                    <div class="history-detail-item">
                        <div class="detail-label">Thời gian</div>
                        <div class="detail-value">${getDurationText(item.duration, item.unit)}</div>
                    </div>
                    <div class="history-detail-item">
                        <div class="detail-label">Giá</div>
                        <div class="detail-value">${formatCurrency(item.price)}</div>
                    </div>
                    <div class="history-detail-item">
                        <div class="detail-label">Trạng thái</div>
                        <div class="status-badge ${isActive ? 'active' : 'expired'}">
                            ${isActive ? 'Đang hoạt động' : 'Hết hạn'}
                        </div>
                    </div>
                </div>
                ${isActive ? `
                <div class="timer-display">
                    <span class="timer-icon">⏱️</span>
                    <span class="timer-text">Thời gian còn lại: 
                        <span class="timer-value">${hoursLeft > 0 ? hoursLeft + ' giờ ' : ''}${minutesLeft} phút</span>
                    </span>
                </div>
                ` : ''}
            `;
            historyContent.appendChild(historyCard);
        });
    }
    
    showModal('historyModal');
}

function getToolDisplayName(toolKey) {
    const toolNames = {
        'toolv1': 'Tool V1 - Dự đoán Tài Xỉu',
        'toolmd5': 'Tool MD5 - Giải mã MD5',
        'toolsicbo': 'Tool Sicbo - Phát hiện BÃO'
    };
    return toolNames[toolKey] || toolKey;
}

// Tạo modal history nếu chưa có
function createHistoryModal() {
    const modalHTML = `
        <div id="historyModal" class="modal">
            <div class="modal-content" style="max-width: 800px;">
                <div class="modal-header">
                    <h3 class="modal-title">Lịch Sử Mua Hàng</h3>
                    <button class="close-modal" onclick="closeModal('historyModal')">×</button>
                </div>
                <div class="modal-body">
                    <div id="historyContent" class="history-container"></div>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    showHistory();
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

// Cho deposit.html
function copyText(elementId) {
    const element = document.getElementById(elementId);
    const text = element.textContent;
    navigator.clipboard.writeText(text).then(() => {
        showNotification('Đã sao chép!');
    });
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
