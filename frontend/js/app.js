/**
 * ============================================================
 * OUR LOVE STORY - Main Application Logic
 * ============================================================
 * File xử lý logic chính của ứng dụng phía người dùng (User):
 *   - Đồng hồ đếm ngày yêu nhau (Love Counter)
 *   - Hiệu ứng trái tim rơi (Falling Hearts Canvas)
 *   - Điều hướng SPA (Navigation)
 *   - Render Timeline kỷ niệm
 *   - Render & toggle Bucket List
 *   - Render & tạo Time Capsule
 *   - Điều khiển nhạc nền (Audio Controller)
 *   - Toast notification
 * ============================================================
 */

// ============================================================
// 1. HẰNG SỐ & BIẾN TOÀN CỤC
// ============================================================

/**
 * Mốc thời gian bắt đầu yêu nhau
 * Sẽ được cập nhật từ Server (settings)
 */
let loveStartDate = new Date('2025-12-22T00:00:00');

/** Biến lưu interval ID của đồng hồ đếm ngày */
let counterInterval = null;

/** Biến lưu interval ID của đếm ngược Time Capsule */
let capsuleCountdownInterval = null;

// ============================================================
// 2. ĐỒNG HỒ ĐẾM NGÀY YÊU NHAU (LOVE COUNTER)
// ============================================================

/**
 * Cập nhật đồng hồ đếm ngày yêu nhau
 * Tính khoảng cách thời gian giữa LOVE_START_DATE và hiện tại
 * Hiển thị: ngày, giờ, phút, giây - cập nhật mỗi giây
 */
function updateLoveCounter() {
  const now = new Date();
  const diff = now - loveStartDate; // Khoảng cách tính bằng milliseconds

  // Nếu chưa đến ngày bắt đầu yêu → hiển thị 0
  if (diff < 0) {
    document.getElementById('counter-days').textContent = '0';
    document.getElementById('counter-hours').textContent = '0';
    document.getElementById('counter-minutes').textContent = '0';
    document.getElementById('counter-seconds').textContent = '0';
    return;
  }

  // Tính toán ngày, giờ, phút, giây
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  // Cập nhật DOM
  document.getElementById('counter-days').textContent = days;
  document.getElementById('counter-hours').textContent = String(hours).padStart(2, '0');
  document.getElementById('counter-minutes').textContent = String(minutes).padStart(2, '0');
  document.getElementById('counter-seconds').textContent = String(seconds).padStart(2, '0');
}

/**
 * Khởi động đồng hồ đếm ngày
 */
function startLoveCounter() {
  updateLoveCounter(); // Cập nhật ngay lập tức
  counterInterval = setInterval(updateLoveCounter, 1000); // Cập nhật mỗi giây
}

// ============================================================
// 3. HIỆU ỨNG TRÁI TIM RƠI (FALLING HEARTS CANVAS)
// ============================================================

/**
 * Hệ thống particle trái tim trên Canvas
 * Mỗi trái tim là 1 particle với vị trí, tốc độ, kích thước ngẫu nhiên
 * Canvas phủ toàn màn hình với pointer-events: none
 */
function initFallingHearts() {
  const canvas = document.getElementById('hearts-canvas');
  const ctx = canvas.getContext('2d');

  // Tự động resize canvas khi thay đổi kích thước cửa sổ
  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);

  /** Mảng chứa các particle trái tim */
  const hearts = [];

  /** Số lượng trái tim tối đa trên màn hình (giảm trên mobile để tối ưu) */
  const MAX_HEARTS = window.innerWidth < 768 ? 15 : 25;

  /** Màu sắc trái tim - tông hồng/đỏ lãng mạn */
  const HEART_COLORS = [
    'rgba(244, 160, 181, 0.7)',  // Hồng pastel
    'rgba(255, 107, 138, 0.6)',  // Hồng đậm
    'rgba(183, 110, 121, 0.5)',  // Rose gold
    'rgba(232, 180, 184, 0.6)',  // Blush
    'rgba(255, 77, 109, 0.4)',   // Đỏ hồng
    'rgba(201, 24, 74, 0.3)',    // Đỏ đậm
  ];

  /**
   * Lớp Heart - Đại diện cho 1 trái tim particle
   */
  class Heart {
    constructor() {
      this.reset();
    }

    /** Reset vị trí và thuộc tính ngẫu nhiên */
    reset() {
      this.x = Math.random() * canvas.width;           // Vị trí X ngẫu nhiên
      this.y = canvas.height + 20;                       // Bắt đầu từ dưới màn hình
      this.size = Math.random() * 12 + 6;               // Kích thước: 6-18px
      this.speedY = Math.random() * 1.5 + 0.5;          // Tốc độ bay lên: 0.5-2
      this.speedX = (Math.random() - 0.5) * 0.5;        // Tốc độ lắc ngang
      this.opacity = Math.random() * 0.5 + 0.3;         // Độ mờ: 0.3-0.8
      this.rotation = Math.random() * Math.PI * 2;      // Góc xoay ban đầu
      this.rotationSpeed = (Math.random() - 0.5) * 0.03;// Tốc độ xoay
      this.swayAmplitude = Math.random() * 30 + 10;     // Biên độ lắc ngang
      this.swaySpeed = Math.random() * 0.02 + 0.01;     // Tốc độ lắc
      this.time = Math.random() * 100;                   // Phase ngẫu nhiên cho sway
      this.color = HEART_COLORS[Math.floor(Math.random() * HEART_COLORS.length)];
    }

    /** Cập nhật vị trí mỗi frame */
    update() {
      this.y -= this.speedY;                             // Bay lên
      this.x += Math.sin(this.time * this.swaySpeed) * 0.5; // Lắc ngang
      this.rotation += this.rotationSpeed;               // Xoay
      this.time++;

      // Nếu bay ra khỏi màn hình → reset lại
      if (this.y < -this.size * 2) {
        this.reset();
      }
    }

    /** Vẽ trái tim lên canvas */
    draw() {
      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.rotate(this.rotation);
      ctx.globalAlpha = this.opacity;

      // Vẽ hình trái tim bằng Bezier curves
      ctx.beginPath();
      const s = this.size;
      ctx.moveTo(0, s * 0.3);
      ctx.bezierCurveTo(-s * 0.5, -s * 0.3, -s, s * 0.1, 0, s);
      ctx.bezierCurveTo(s, s * 0.1, s * 0.5, -s * 0.3, 0, s * 0.3);
      ctx.fillStyle = this.color;
      ctx.fill();
      ctx.closePath();

      ctx.restore();
    }
  }

  // Tạo các trái tim ban đầu (vị trí ngẫu nhiên trên màn hình)
  for (let i = 0; i < MAX_HEARTS; i++) {
    const heart = new Heart();
    heart.y = Math.random() * canvas.height; // Phân bổ đều trên màn hình
    hearts.push(heart);
  }

  /**
   * Vòng lặp animation chính
   * Sử dụng requestAnimationFrame để mượt mà
   */
  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    hearts.forEach(heart => {
      heart.update();
      heart.draw();
    });

    requestAnimationFrame(animate);
  }

  animate(); // Bắt đầu animation
}

// ============================================================
// 4. ĐIỀU HƯỚNG SPA (NAVIGATION)
// ============================================================

/**
 * Chuyển đổi hiển thị giữa các trang (section)
 * @param {string} pageName - Tên trang: 'home', 'timeline', 'bucketlist', 'capsule', 'admin'
 */
function navigateTo(pageName) {
  // Ẩn tất cả các section
  document.querySelectorAll('.page-section').forEach(section => {
    section.classList.remove('active');
  });

  // Hiển thị section được chọn
  const targetSection = document.getElementById(`page-${pageName}`);
  if (targetSection) {
    targetSection.classList.add('active');
  }

  // Cập nhật active state cho bottom nav
  document.querySelectorAll('.nav-item').forEach(item => {
    item.classList.remove('active');
    if (item.dataset.page === pageName) {
      item.classList.add('active');
    }
  });

  // Load dữ liệu cho trang đó
  switch (pageName) {
    case 'timeline':
      renderTimeline();
      break;
    case 'bucketlist':
      renderBucketList();
      break;
    case 'capsule':
      renderTimeCapsules();
      break;
  }

  // Cuộn về đầu trang
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

/**
 * Khởi tạo sự kiện click cho bottom navigation
 */
function initNavigation() {
  document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', () => {
      const page = item.dataset.page;
      navigateTo(page);
    });
  });
}

// ============================================================
// 5. RENDER TIMELINE KỶ NIỆM
// ============================================================

/**
 * Lấy dữ liệu và render danh sách kỷ niệm theo dòng thời gian
 * Mỗi kỷ niệm hiển thị: ngày, tiêu đề, nội dung, ảnh (nếu có)
 */
async function renderTimeline() {
  const container = document.getElementById('timeline-list');

  try {
    const memories = await API.memories.getAll();

    // Nếu không có kỷ niệm nào
    if (memories.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">📸</div>
          <p class="empty-state-text">Chưa có kỷ niệm nào. Hãy thêm kỷ niệm đầu tiên!</p>
        </div>
      `;
      return;
    }

    // Sắp xếp theo ngày (cũ → mới, dòng thời gian tự nhiên)
    const sorted = [...memories].sort((a, b) => new Date(a.date) - new Date(b.date));

    // Render từng kỷ niệm
    container.innerHTML = sorted.map(memory => {
      // Format ngày tháng sang tiếng Việt
      const dateStr = formatDateVN(memory.date);
      // Tạo URL ảnh (nếu có)
      const imageUrl = memory.imageUrl ? getImageUrl(memory.imageUrl) : '';

      return `
        <div class="timeline-item">
          <div class="glass-card">
            <div class="timeline-date">${dateStr}</div>
            <h3 class="timeline-title">${escapeHtml(memory.title)}</h3>
            <p class="timeline-content">${escapeHtml(memory.content)}</p>
            ${imageUrl ? `<img src="${imageUrl}" alt="${escapeHtml(memory.title)}" class="timeline-image" loading="lazy">` : ''}
          </div>
        </div>
      `;
    }).join('');

  } catch (error) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">⚠️</div>
        <p class="empty-state-text">${error.message}</p>
      </div>
    `;
  }
}

// ============================================================
// 6. RENDER BUCKET LIST
// ============================================================

/**
 * Lấy dữ liệu và render danh sách mong ước
 * User thường chỉ có thể toggle checkbox (hoàn thành/chưa)
 */
async function renderBucketList() {
  const container = document.getElementById('bucketlist-container');

  try {
    const items = await API.bucketList.getAll();

    if (items.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">✨</div>
          <p class="empty-state-text">Chưa có mục tiêu nào. Admin hãy thêm mục tiêu nhé!</p>
        </div>
      `;
      return;
    }

    container.innerHTML = items.map(item => `
      <div class="glass-card bucket-item" data-id="${item.id}">
        <input type="checkbox" class="bucket-checkbox"
               ${item.isCompleted ? 'checked' : ''}
               onchange="handleBucketToggle('${item.id}', this.checked)">
        <div>
          <span class="bucket-task ${item.isCompleted ? 'completed' : ''}">${escapeHtml(item.task)}</span>
          ${item.completedAt ? `<span class="bucket-completed-date">✓ Hoàn thành: ${formatDateVN(item.completedAt)}</span>` : ''}
        </div>
      </div>
    `).join('');

  } catch (error) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">⚠️</div>
        <p class="empty-state-text">${error.message}</p>
      </div>
    `;
  }
}

/**
 * Xử lý khi user toggle checkbox Bucket List
 * @param {string} id - ID mục tiêu
 * @param {boolean} isCompleted - Trạng thái mới
 */
async function handleBucketToggle(id, isCompleted) {
  try {
    await API.bucketList.toggleComplete(id, isCompleted);
    showToast(isCompleted ? '✅ Đã hoàn thành!' : '↩️ Đã bỏ đánh dấu', 'success');
    renderBucketList(); // Re-render để cập nhật UI
  } catch (error) {
    showToast('Lỗi: ' + error.message, 'error');
    renderBucketList(); // Re-render để khôi phục trạng thái
  }
}

// ============================================================
// 7. RENDER TIME CAPSULE
// ============================================================

/**
 * Lấy dữ liệu và render danh sách hộp thư hẹn giờ
 * Thư chưa đến ngày → hiển thị trạng thái "Đang khóa" + đếm ngược
 * Thư đã đến ngày → hiển thị nội dung đầy đủ
 */
async function renderTimeCapsules() {
  const container = document.getElementById('capsule-list');

  try {
    const capsules = await API.timeCapsule.getAll();

    if (capsules.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">💌</div>
          <p class="empty-state-text">Chưa có thư nào. Hãy viết bức thư đầu tiên!</p>
        </div>
      `;
      return;
    }

    container.innerHTML = capsules.map(capsule => {
      if (capsule.isUnlocked) {
        // Thư ĐÃ MỞ KHÓA → hiển thị nội dung
        return `
          <div class="glass-card capsule-card mb-3">
            <div class="text-lg mb-2">💌</div>
            <p class="capsule-message">${escapeHtml(capsule.displayMessage)}</p>
            <div class="capsule-meta">
              <span>📝 ${formatDateVN(capsule.createdAt)}</span>
              <span>🔓 Đã mở khóa</span>
            </div>
          </div>
        `;
      } else {
        // Thư ĐANG KHÓA → hiển thị đếm ngược
        const countdown = formatCountdown(capsule.timeRemaining);
        return `
          <div class="glass-card capsule-card capsule-locked mb-3">
            <div class="capsule-content-hidden">
              <p class="capsule-message">Nội dung bí mật...</p>
            </div>
            <div class="capsule-lock-overlay">
              <div class="lock-icon">🔒</div>
              <div class="capsule-countdown" data-unlock="${capsule.unlockDate}">${countdown}</div>
              <div class="capsule-unlock-label">Mở khóa: ${formatDateVN(capsule.unlockDate)}</div>
            </div>
          </div>
        `;
      }
    }).join('');

    // Bắt đầu đếm ngược cho các thư còn khóa
    startCapsuleCountdowns();

  } catch (error) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">⚠️</div>
        <p class="empty-state-text">${error.message}</p>
      </div>
    `;
  }
}

/**
 * Cập nhật đếm ngược cho các thư đang khóa mỗi giây
 */
function startCapsuleCountdowns() {
  // Dừng interval cũ nếu có
  if (capsuleCountdownInterval) clearInterval(capsuleCountdownInterval);

  capsuleCountdownInterval = setInterval(() => {
    const countdownElements = document.querySelectorAll('.capsule-countdown[data-unlock]');

    countdownElements.forEach(el => {
      const unlockDate = new Date(el.dataset.unlock);
      const now = new Date();
      const remaining = unlockDate - now;

      if (remaining <= 0) {
        // Thư vừa mở khóa → re-render toàn bộ
        renderTimeCapsules();
        return;
      }

      el.textContent = formatCountdown(remaining);
    });
  }, 1000);
}

/**
 * Xử lý gửi thư hẹn giờ mới
 */
async function handleSendCapsule() {
  const messageEl = document.getElementById('capsule-message');
  const dateEl = document.getElementById('capsule-date');

  const message = messageEl.value.trim();
  const unlockDate = dateEl.value;

  // Validate
  if (!message) {
    showToast('Vui lòng nhập nội dung thư!', 'error');
    messageEl.focus();
    return;
  }

  if (!unlockDate) {
    showToast('Vui lòng chọn ngày mở khóa!', 'error');
    dateEl.focus();
    return;
  }

  if (new Date(unlockDate) <= new Date()) {
    showToast('Ngày mở khóa phải ở tương lai!', 'error');
    return;
  }

  try {
    await API.timeCapsule.create(message, unlockDate);
    showToast('💌 Thư đã được gửi vào hộp thời gian!', 'success');

    // Reset form
    messageEl.value = '';
    dateEl.value = '';

    // Re-render danh sách
    renderTimeCapsules();
  } catch (error) {
    showToast('Lỗi: ' + error.message, 'error');
  }
}

// ============================================================
// 8. ĐIỀU KHIỂN NHẠC NỀN (AUDIO CONTROLLER)
// ============================================================

/**
 * Khởi tạo nút Bật/Tắt nhạc nền
 * Nút đĩa nhạc xoay khi đang phát
 */
function initMusicController() {
  const btn = document.getElementById('music-btn');
  const audio = document.getElementById('bg-music');
  let isPlaying = false;

  btn.addEventListener('click', () => {
    if (isPlaying) {
      audio.pause();
      btn.classList.remove('playing');
      btn.textContent = '🎵';
    } else {
      // Trình duyệt yêu cầu user tương tác trước khi phát audio
      audio.play().catch(err => {
        console.warn('[MUSIC] Không thể phát nhạc:', err.message);
        showToast('Không thể phát nhạc. Hãy thử lại!', 'error');
      });
      btn.classList.add('playing');
      btn.textContent = ''; // Ẩn emoji để thấy hiệu ứng xoay
    }
    isPlaying = !isPlaying;
  });
}

// ============================================================
// 9. HÀM TIỆN ÍCH (UTILITIES)
// ============================================================

/**
 * Format ngày tháng sang tiếng Việt
 * @param {string} dateStr - Chuỗi ngày (VD: "2025-12-22")
 * @returns {string} - "22 Tháng 12, 2025"
 */
function formatDateVN(dateStr) {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  const months = [
    'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4',
    'Tháng 5', 'Tháng 6', 'Tháng 7', 'Tháng 8',
    'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'
  ];
  return `${date.getDate()} ${months[date.getMonth()]}, ${date.getFullYear()}`;
}

/**
 * Format thời gian đếm ngược
 * @param {number} ms - Milliseconds còn lại
 * @returns {string} - "45 ngày 12:30:15"
 */
function formatCountdown(ms) {
  if (!ms || ms <= 0) return 'Đã mở khóa!';
  const days = Math.floor(ms / (1000 * 60 * 60 * 24));
  const hours = Math.floor((ms % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((ms % (1000 * 60)) / 1000);
  return `Còn ${days} ngày ${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

/**
 * Escape HTML để chống XSS
 * @param {string} text - Chuỗi cần escape
 * @returns {string} - Chuỗi đã được escape
 */
function escapeHtml(text) {
  if (!text) return '';
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

/**
 * Hiển thị toast notification
 * @param {string} message - Nội dung thông báo
 * @param {string} type - Loại: 'success' hoặc 'error'
 */
function showToast(message, type = 'success') {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.className = `toast ${type} show`;

  // Tự động ẩn sau 3 giây
  setTimeout(() => {
    toast.classList.remove('show');
  }, 3000);
}

// ============================================================
// 10. KHỞI TẠO ỨNG DỤNG (APP INITIALIZATION)
// ============================================================

/**
 * Hàm khởi tạo chính - chạy khi trang load xong
 */
document.addEventListener('DOMContentLoaded', function () {
  console.log('[APP] 💕 Our Love Story - Đang khởi tạo...');

  // 1. Khởi động đồng hồ đếm ngày yêu nhau
  startLoveCounter();

  // 2. Khởi tạo hiệu ứng trái tim rơi
  initFallingHearts();

  // 3. Khởi tạo điều hướng SPA
  initNavigation();

  // 4. Khởi tạo nút nhạc nền
  initMusicController();

  // 5. Gắn sự kiện gửi thư hẹn giờ
  document.getElementById('btn-send-capsule').addEventListener('click', handleSendCapsule);

  // 6. Đặt min date cho input ngày mở khóa = ngày mai
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  document.getElementById('capsule-date').min = tomorrow.toISOString().split('T')[0];

  console.log('[APP] ✅ Khởi tạo hoàn tất!');
  console.log(`[APP] 💕 Mốc bắt đầu yêu: ${loveStartDate.toLocaleDateString('vi-VN')}`);
  
  // 7. Đồng bộ dữ liệu từ Server (Avatars, Ngày yêu)
  refreshDashboardData();
});

/**
 * Tải dữ liệu cấu hình từ server và cập nhật UI Dashboard
 */
async function refreshDashboardData() {
  try {
    const settings = await API.settings.get();
    
    // 1. Cập nhật ảnh đại diện
    const avatar1 = document.getElementById('dashboard-avatar-1');
    const avatar2 = document.getElementById('dashboard-avatar-2');
    
    if (settings.avatar1) {
      avatar1.src = getImageUrl(settings.avatar1);
    }
    
    if (settings.avatar2) {
      avatar2.src = getImageUrl(settings.avatar2);
    }
    
    // 2. Cập nhật mốc thời gian yêu
    if (settings.loveStartDate) {
      loveStartDate = new Date(settings.loveStartDate);
      updateLoveCounter(); // Cập nhật lại đồng hồ ngay lập tức
    }

    console.log('[APP] 🔄 Đã đồng bộ dữ liệu cài đặt từ Server');
  } catch (error) {
    console.error('[APP] Lỗi khi đồng bộ dữ liệu:', error.message);
  }
}
