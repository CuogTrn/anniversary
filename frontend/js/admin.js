/**
 * ============================================================
 * OUR LOVE STORY - Admin Dashboard Logic
 * ============================================================
 * File xử lý logic trang quản trị viên (Admin):
 *   - Cơ chế truy cập ẩn (Long-press logo 3 giây)
 *   - Đăng nhập/Đăng xuất Admin
 *   - CRUD Kỷ niệm (Thêm, Sửa, Xóa với upload ảnh)
 *   - CRUD Bucket List (Thêm, Xóa)
 *   - Xem trước Time Capsule (đặc quyền xem thư đang khóa)
 * ============================================================
 */

// ============================================================
// 1. BIẾN TOÀN CỤC ADMIN
// ============================================================

/** Trạng thái Admin đang bật hay tắt */
let isAdminMode = false;

/** Timer cho long-press detection */
let longPressTimer = null;

/** Thời gian nhấn giữ cần thiết (3000ms = 3 giây) */
const LONG_PRESS_DURATION = 3000;

// ============================================================
// 2. CƠ CHẾ TRUY CẬP ẨN (LONG-PRESS DETECTION)
// ============================================================

/**
 * Khởi tạo cơ chế nhấn giữ logo 3 giây để kích hoạt Admin
 * Hỗ trợ cả sự kiện chuột (mouse) và cảm ứng (touch) cho mobile
 *
 * Luồng hoạt động:
 * 1. User nhấn giữ logo → bắt đầu đếm 3 giây
 * 2. Thanh progress bar hiển thị tiến trình
 * 3. Nếu đủ 3 giây → hiển thị popup đăng nhập Admin
 * 4. Nếu thả tay trước 3 giây → hủy bỏ
 */
function initLongPressAdmin() {
  const logo = document.getElementById('logo');
  const progressBar = document.getElementById('long-press-bar');

  /**
   * Bắt đầu nhấn giữ
   * Kích hoạt timer đếm 3 giây và hiệu ứng progress bar
   */
  function startPress(e) {
    e.preventDefault(); // Ngăn context menu trên mobile

    // Nếu đang ở Admin mode → bỏ qua
    if (isAdminMode) return;

    // Hiển thị progress bar
    progressBar.style.width = '0%';
    progressBar.classList.add('pressing');

    // Đặt timer 3 giây
    longPressTimer = setTimeout(() => {
      progressBar.classList.remove('pressing');
      progressBar.style.width = '0%';

      // Hiển thị popup đăng nhập Admin
      showAdminLoginModal();
    }, LONG_PRESS_DURATION);
  }

  /**
   * Thả tay / hủy nhấn giữ
   * Dừng timer và ẩn progress bar
   */
  function cancelPress() {
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      longPressTimer = null;
    }
    progressBar.classList.remove('pressing');
    progressBar.style.width = '0%';
  }

  // Sự kiện MOUSE (Desktop)
  logo.addEventListener('mousedown', startPress);
  logo.addEventListener('mouseup', cancelPress);
  logo.addEventListener('mouseleave', cancelPress);

  // Sự kiện TOUCH (Mobile)
  logo.addEventListener('touchstart', startPress, { passive: false });
  logo.addEventListener('touchend', cancelPress);
  logo.addEventListener('touchcancel', cancelPress);
}

// ============================================================
// 3. MODAL ĐĂNG NHẬP ADMIN
// ============================================================

/**
 * Hiển thị popup đăng nhập Admin
 */
function showAdminLoginModal() {
  const modal = document.getElementById('modal-admin-login');
  const passwordInput = document.getElementById('admin-password');

  modal.classList.add('active');
  passwordInput.value = '';
  passwordInput.focus();
}

/**
 * Ẩn popup đăng nhập Admin
 */
function hideAdminLoginModal() {
  const modal = document.getElementById('modal-admin-login');
  modal.classList.remove('active');
}

/**
 * Xử lý đăng nhập Admin
 * Gửi mật khẩu lên server để xác thực
 */
async function handleAdminLogin() {
  const passwordInput = document.getElementById('admin-password');
  const password = passwordInput.value.trim();

  if (!password) {
    showToast('Vui lòng nhập mật khẩu!', 'error');
    passwordInput.focus();
    return;
  }

  try {
    const result = await API.auth.login(password);

    if (result.success) {
      isAdminMode = true;
      hideAdminLoginModal();
      enterAdminMode();
      showToast('🔓 Đăng nhập Admin thành công!', 'success');
    }
  } catch (error) {
    showToast('❌ ' + (error.message || 'Mật khẩu không đúng!'), 'error');
    passwordInput.value = '';
    passwordInput.focus();
  }
}

/**
 * Xử lý đăng xuất Admin
 */
function handleAdminLogout() {
  API.auth.logout();
  isAdminMode = false;
  exitAdminMode();
  showToast('👋 Đã đăng xuất Admin', 'success');
}

// ============================================================
// 4. CHUYỂN ĐỔI CHẾ ĐỘ ADMIN / USER
// ============================================================

/**
 * Vào chế độ Admin
 * - Hiển thị Admin badge
 * - Chuyển đến trang Admin Dashboard
 * - Ẩn bottom navigation thường
 * - Load dữ liệu quản trị
 */
function enterAdminMode() {
  // Hiện Admin badge
  document.getElementById('admin-badge').classList.add('active');

  // Hiển thị trang Admin
  navigateTo('admin');

  // Ẩn bottom nav (Admin dùng tab riêng)
  document.getElementById('bottom-nav').style.display = 'none';

  // Load dữ liệu admin
  loadAdminMemories();
}

/**
 * Thoát chế độ Admin
 * - Ẩn Admin badge
 * - Quay về trang chủ User
 * - Hiện lại bottom navigation
 */
function exitAdminMode() {
  // Ẩn Admin badge
  document.getElementById('admin-badge').classList.remove('active');

  // Hiện lại bottom nav
  document.getElementById('bottom-nav').style.display = 'flex';

  // Quay về trang chủ
  navigateTo('home');
}

// ============================================================
// 5. ADMIN TAB NAVIGATION
// ============================================================

/**
 * Khởi tạo tab navigation trong Admin Dashboard
 * 3 tabs: Kỷ niệm, Bucket List, Time Capsule
 */
function initAdminTabs() {
  document.querySelectorAll('.admin-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      const tabName = tab.dataset.adminTab;

      // Cập nhật active tab
      document.querySelectorAll('.admin-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      // Ẩn/Hiện admin section tương ứng
      document.querySelectorAll('.admin-section').forEach(s => s.classList.remove('active'));
      document.getElementById(`admin-${tabName}`).classList.add('active');

      // Load dữ liệu cho tab đó
      switch (tabName) {
        case 'memories':
          loadAdminMemories();
          break;
        case 'bucketlist':
          loadAdminBucketList();
          break;
        case 'capsules':
          loadAdminCapsules();
          break;
        case 'settings':
          loadAdminSettings();
          break;
      }
    });
  });
}

// ============================================================
// 6. ADMIN - QUẢN LÝ CÀI ĐẶT (SETTINGS & AVATARS)
// ============================================================

/**
 * Load dữ liệu cài đặt hiện tại
 */
async function loadAdminSettings() {
  try {
    const settings = await API.settings.get();
    
    // Cập nhật preview ảnh hiện tại
    const preview1 = document.getElementById('admin-avatar-1-preview');
    const preview2 = document.getElementById('admin-avatar-2-preview');
    
    if (settings.avatar1) {
      preview1.src = getImageUrl(settings.avatar1);
    } else {
      preview1.src = 'https://api.dicebear.com/9.x/personas/svg?seed=Felix&backgroundColor=ffd6e0';
    }

    if (settings.avatar2) {
      preview2.src = getImageUrl(settings.avatar2);
    } else {
      preview2.src = 'https://api.dicebear.com/9.x/personas/svg?seed=Lily&backgroundColor=fff0f3';
    }

    // Cập nhật ngày yêu
    if (settings.loveStartDate) {
      // Chuyển format từ ISO sang datetime-local (YYYY-MM-DDTHH:mm)
      const date = new Date(settings.loveStartDate);
      const formattedDate = date.toISOString().slice(0, 16);
      document.getElementById('admin-love-date').value = formattedDate;
    }

  } catch (error) {
    showToast('Lỗi khi tải cài đặt: ' + error.message, 'error');
  }
}

/**
 * Xử lý lưu cài đặt
 */
async function handleSaveSettings() {
  const avatar1File = document.getElementById('admin-avatar-1-file').files[0];
  const avatar2File = document.getElementById('admin-avatar-2-file').files[0];
  const loveDate = document.getElementById('admin-love-date').value;

  try {
    // 1. Cập nhật Avatars nếu có chọn file mới
    if (avatar1File || avatar2File) {
      await API.settings.updateAvatars(avatar1File, avatar2File);
    }

    // 2. Cập nhật ngày yêu
    if (loveDate) {
      await API.settings.updateLoveDate(new Date(loveDate).toISOString());
    }

    showToast('✅ Đã lưu cài đặt thành công!', 'success');
    
    // Refresh dashboard data
    if (typeof refreshDashboardData === 'function') {
      refreshDashboardData();
    }
    
    // Tải lại preview
    loadAdminSettings();

  } catch (error) {
    showToast('Lỗi: ' + error.message, 'error');
  }
}

/**
 * Khởi tạo preview cho ảnh đại diện trong settings
 */
function initSettingsImagePreview() {
  const setupPreview = (inputId, imgId) => {
    const input = document.getElementById(inputId);
    const img = document.getElementById(imgId);
    
    input.addEventListener('change', function() {
      const file = this.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = e => img.src = e.target.result;
        reader.readAsDataURL(file);
      }
    });
  };

  setupPreview('admin-avatar-1-file', 'admin-avatar-1-preview');
  setupPreview('admin-avatar-2-file', 'admin-avatar-2-preview');
}

// ============================================================
// 7. ADMIN - QUẢN LÝ KỶ NIỆM (MEMORIES CRUD)
// ============================================================

/**
 * Load và hiển thị danh sách kỷ niệm trong Admin
 * Mỗi kỷ niệm có 2 nút: Sửa (Edit) và Xóa (Delete)
 */
async function loadAdminMemories() {
  const container = document.getElementById('admin-memory-list');

  try {
    const memories = await API.memories.getAll();

    if (memories.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">📸</div>
          <p class="empty-state-text">Chưa có kỷ niệm nào</p>
        </div>
      `;
      return;
    }

    container.innerHTML = memories.map(memory => `
      <div class="glass-card admin-list-item" data-id="${memory.id || memory._id}">
        <div class="item-info">
          <div class="admin-item-title">${escapeHtml(memory.title)}</div>
          <div class="admin-item-meta">📅 ${formatDateVN(memory.date)} ${memory.imageUrl ? '| 🖼️ Có ảnh' : '| ❌ Chưa có ảnh'}</div>
          <div class="admin-item-preview">${escapeHtml(memory.content)}</div>
        </div>
        <div class="item-actions">
          <button class="btn-icon btn-edit" onclick="openEditMemory('${memory.id || memory._id}')" title="Chỉnh sửa">✏️</button>
          <button class="btn-icon btn-delete" onclick="handleDeleteMemory('${memory.id || memory._id}')" title="Xóa">🗑️</button>
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
 * Mở form THÊM kỷ niệm mới
 * Reset form về trạng thái trống
 */
function openAddMemory() {
  document.getElementById('memory-form-title').textContent = 'Thêm kỷ niệm mới';
  document.getElementById('memory-edit-id').value = '';
  document.getElementById('memory-title').value = '';
  document.getElementById('memory-content').value = '';
  document.getElementById('memory-date').value = '';
  document.getElementById('memory-image').value = '';

  // Ẩn preview ảnh
  const preview = document.getElementById('memory-image-preview');
  preview.src = '';
  preview.classList.remove('has-image');

  // Hiện modal
  document.getElementById('modal-memory-form').classList.add('active');
}

/**
 * Mở form CHỈNH SỬA kỷ niệm
 * Điền sẵn dữ liệu hiện tại của kỷ niệm vào form
 * @param {string} id - ID kỷ niệm cần sửa
 */
async function openEditMemory(id) {
  try {
    const memories = await API.memories.getAll();
    const memory = memories.find(m => m.id === id);

    if (!memory) {
      showToast('Không tìm thấy kỷ niệm!', 'error');
      return;
    }

    // Điền dữ liệu vào form
    document.getElementById('memory-form-title').textContent = 'Chỉnh sửa kỷ niệm';
    document.getElementById('memory-edit-id').value = memory.id || memory._id;
    document.getElementById('memory-title').value = memory.title;
    document.getElementById('memory-content').value = memory.content;
    document.getElementById('memory-date').value = memory.date.split('T')[0];
    document.getElementById('memory-image').value = ''; // Reset file input

    // Hiển thị preview ảnh hiện tại (nếu có)
    const preview = document.getElementById('memory-image-preview');
    if (memory.imageUrl) {
      preview.src = getImageUrl(memory.imageUrl);
      preview.classList.add('has-image');
    } else {
      preview.src = '';
      preview.classList.remove('has-image');
    }

    // Hiện modal
    document.getElementById('modal-memory-form').classList.add('active');

  } catch (error) {
    showToast('Lỗi: ' + error.message, 'error');
  }
}

/**
 * Xử lý LƯU kỷ niệm (Thêm mới hoặc Cập nhật)
 * Phân biệt Thêm/Sửa dựa trên memory-edit-id có giá trị hay không
 */
async function handleSaveMemory() {
  const editId = document.getElementById('memory-edit-id').value;
  const title = document.getElementById('memory-title').value.trim();
  const content = document.getElementById('memory-content').value.trim();
  const date = document.getElementById('memory-date').value;
  const imageInput = document.getElementById('memory-image');

  // Validate bắt buộc
  if (!title) {
    showToast('Vui lòng nhập tiêu đề!', 'error');
    return;
  }
  if (!date) {
    showToast('Vui lòng chọn ngày!', 'error');
    return;
  }

  // Lấy File Object từ input (null nếu không chọn ảnh)
  const imageFile = imageInput.files.length > 0 ? imageInput.files[0] : null;

  try {
    if (editId) {
      // CHẾ ĐỘ SỬA - Cập nhật kỷ niệm đã có
      await API.memories.update(editId, { title, content, date }, imageFile);
      showToast('✅ Đã cập nhật kỷ niệm!', 'success');
    } else {
      // CHẾ ĐỘ THÊM MỚI
      await API.memories.create({ title, content, date }, imageFile);
      showToast('✅ Đã thêm kỷ niệm mới!', 'success');
    }

    // Đóng modal và reload danh sách
    closeMemoryForm();
    loadAdminMemories();

  } catch (error) {
    showToast('Lỗi: ' + error.message, 'error');
  }
}

/**
 * Xử lý XÓA kỷ niệm
 * Hỏi xác nhận trước khi xóa
 * @param {string} id - ID kỷ niệm cần xóa
 */
async function handleDeleteMemory(id) {
  if (!confirm('Bạn có chắc muốn xóa kỷ niệm này? Hành động này không thể hoàn tác!')) {
    return;
  }

  try {
    await API.memories.delete(id);
    showToast('🗑️ Đã xóa kỷ niệm!', 'success');
    loadAdminMemories();
  } catch (error) {
    showToast('Lỗi: ' + error.message, 'error');
  }
}

/**
 * Đóng form thêm/sửa kỷ niệm
 */
function closeMemoryForm() {
  document.getElementById('modal-memory-form').classList.remove('active');
}

// ============================================================
// 7. ADMIN - QUẢN LÝ BUCKET LIST
// ============================================================

/**
 * Load và hiển thị danh sách Bucket List trong Admin
 * Admin có quyền: Thêm mới + Xóa mục tiêu
 */
async function loadAdminBucketList() {
  const container = document.getElementById('admin-bucketlist-list');

  try {
    const items = await API.bucketList.getAll();

    if (items.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">✨</div>
          <p class="empty-state-text">Chưa có mục tiêu nào</p>
        </div>
      `;
      return;
    }

    container.innerHTML = items.map(item => `
      <div class="glass-card admin-list-item" data-id="${item.id || item._id}">
        <div class="item-info">
          <div class="admin-item-title ${item.isCompleted ? 'line-through opacity-50' : ''}">
            ${item.isCompleted ? '✅' : '⬜'} ${escapeHtml(item.task)}
          </div>
          ${item.completedAt ? `<div class="admin-item-meta">Hoàn thành: ${formatDateVN(item.completedAt)}</div>` : ''}
        </div>
        <div class="item-actions">
          <button class="btn-icon btn-delete" onclick="handleDeleteBucketItem('${item.id || item._id}')" title="Xóa">🗑️</button>
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
 * Xử lý THÊM MỚI mục tiêu Bucket List (chỉ Admin)
 */
async function handleAddBucketItem() {
  const input = document.getElementById('admin-new-task');
  const task = input.value.trim();

  if (!task) {
    showToast('Vui lòng nhập nội dung mục tiêu!', 'error');
    input.focus();
    return;
  }

  try {
    await API.bucketList.create(task);
    showToast('✅ Đã thêm mục tiêu mới!', 'success');
    input.value = '';
    loadAdminBucketList();
  } catch (error) {
    showToast('Lỗi: ' + error.message, 'error');
  }
}

/**
 * Xử lý XÓA mục tiêu Bucket List (chỉ Admin)
 * @param {string} id - ID mục tiêu cần xóa
 */
async function handleDeleteBucketItem(id) {
  if (!confirm('Bạn có chắc muốn xóa mục tiêu này?')) return;

  try {
    await API.bucketList.delete(id);
    showToast('🗑️ Đã xóa mục tiêu!', 'success');
    loadAdminBucketList();
  } catch (error) {
    showToast('Lỗi: ' + error.message, 'error');
  }
}

// ============================================================
// 8. ADMIN - QUẢN LÝ TIME CAPSULE (ĐẶC QUYỀN XEM TRƯỚC)
// ============================================================

/**
 * Load và hiển thị danh sách Time Capsule trong Admin
 * ĐẶC QUYỀN: Admin xem được NỘI DUNG ĐẦY ĐỦ của thư đang khóa
 * (không cần đợi đến ngày mở khóa)
 */
async function loadAdminCapsules() {
  const container = document.getElementById('admin-capsule-list');

  try {
    // API.timeCapsule.getAll() sẽ trả về nội dung đầy đủ nếu isAdmin = true
    const capsules = await API.timeCapsule.getAll();

    if (capsules.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">💌</div>
          <p class="empty-state-text">Chưa có thư hẹn giờ nào</p>
        </div>
      `;
      return;
    }

    container.innerHTML = capsules.map(capsule => {
      // Xác định trạng thái thư
      const statusBadge = capsule.isUnlocked
        ? '<span class="inline-block px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">🔓 Đã mở</span>'
        : '<span class="inline-block px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-semibold">🔒 Đang khóa</span>';

      return `
        <div class="glass-card admin-list-item" data-id="${capsule.id || capsule._id}">
          <div class="item-info">
            <div class="flex items-center gap-2 mb-1">
              ${statusBadge}
              <span class="admin-item-meta">Mở khóa: ${formatDateVN(capsule.unlockDate)}</span>
            </div>
            <div class="admin-item-preview" style="-webkit-line-clamp: 4;">
              💬 ${escapeHtml(capsule.displayMessage)}
            </div>
            <div class="admin-item-meta mt-1">✍️ Tạo ngày: ${formatDateVN(capsule.createdAt)}</div>
          </div>
          <div class="item-actions">
            <button class="btn-icon btn-delete" onclick="handleDeleteCapsule('${capsule.id || capsule._id}')" title="Xóa">🗑️</button>
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

/**
 * Xử lý XÓA thư hẹn giờ (chỉ Admin)
 * @param {string} id - ID thư cần xóa
 */
async function handleDeleteCapsule(id) {
  if (!confirm('Bạn có chắc muốn xóa thư hẹn giờ này?')) return;

  try {
    await API.timeCapsule.delete(id);
    showToast('🗑️ Đã xóa thư hẹn giờ!', 'success');
    loadAdminCapsules();
  } catch (error) {
    showToast('Lỗi: ' + error.message, 'error');
  }
}

// ============================================================
// 9. PREVIEW ẢNH KHI CHỌN FILE (Image Preview)
// ============================================================

/**
 * Hiển thị preview ảnh khi Admin chọn file từ máy
 * Sử dụng FileReader để đọc file và hiển thị trước khi upload
 */
function initImagePreview() {
  const fileInput = document.getElementById('memory-image');
  const preview = document.getElementById('memory-image-preview');

  fileInput.addEventListener('change', function () {
    const file = this.files[0];

    if (file) {
      // Kiểm tra file có phải ảnh không
      if (!file.type.startsWith('image/')) {
        showToast('Vui lòng chọn file ảnh!', 'error');
        this.value = '';
        return;
      }

      // Kiểm tra kích thước (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        showToast('File ảnh không được vượt quá 5MB!', 'error');
        this.value = '';
        return;
      }

      // Đọc file và hiển thị preview
      const reader = new FileReader();
      reader.onload = function (e) {
        preview.src = e.target.result;
        preview.classList.add('has-image');
      };
      reader.readAsDataURL(file);
    } else {
      preview.src = '';
      preview.classList.remove('has-image');
    }
  });
}

// ============================================================
// 10. KHỞI TẠO ADMIN MODULE
// ============================================================

/**
 * Khởi tạo tất cả các thành phần Admin khi trang load
 */
document.addEventListener('DOMContentLoaded', function () {
  console.log('[ADMIN] 🔐 Module Admin đang khởi tạo...');

  // 1. Khởi tạo cơ chế nhấn giữ logo
  initLongPressAdmin();

  // 2. Khởi tạo tab navigation Admin
  initAdminTabs();

  // 3. Khởi tạo preview ảnh
  initImagePreview();

  // 4. Gắn sự kiện cho nút ĐĂNG NHẬP Admin
  document.getElementById('btn-admin-login').addEventListener('click', handleAdminLogin);

  // Cho phép Enter để đăng nhập
  document.getElementById('admin-password').addEventListener('keydown', function (e) {
    if (e.key === 'Enter') handleAdminLogin();
  });

  // 5. Gắn sự kiện cho nút HỦY đăng nhập
  document.getElementById('btn-admin-cancel').addEventListener('click', hideAdminLoginModal);

  // 6. Gắn sự kiện cho nút ĐĂNG XUẤT Admin
  document.getElementById('btn-admin-logout').addEventListener('click', handleAdminLogout);

  // 7. Gắn sự kiện cho nút THÊM KỶ NIỆM MỚI
  document.getElementById('btn-add-memory').addEventListener('click', openAddMemory);

  // 8. Gắn sự kiện cho nút LƯU kỷ niệm (trong modal form)
  document.getElementById('btn-save-memory').addEventListener('click', handleSaveMemory);

  // 9. Gắn sự kiện cho nút HỦY form kỷ niệm
  document.getElementById('btn-cancel-memory').addEventListener('click', closeMemoryForm);

  // 10. Gắn sự kiện cho nút THÊM mục tiêu Bucket List
  document.getElementById('btn-add-task').addEventListener('click', handleAddBucketItem);

  // 11. Gắn sự kiện lưu cài đặt
  document.getElementById('btn-save-settings').addEventListener('click', handleSaveSettings);

  // 12. Khởi tạo preview cho avatar settings
  initSettingsImagePreview();

  // 13. Click ngoài modal để đóng
  document.getElementById('modal-admin-login').addEventListener('click', function (e) {
    if (e.target === this) hideAdminLoginModal();
  });

  document.getElementById('modal-memory-form').addEventListener('click', function (e) {
    if (e.target === this) closeMemoryForm();
  });

  console.log('[ADMIN] ✅ Module Admin đã sẵn sàng!');
  console.log('[ADMIN] 💡 Mẹo: Nhấn giữ logo "Our love story" trong 3 giây để truy cập Admin');
});
