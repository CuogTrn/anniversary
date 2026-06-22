/**
 * ============================================================
 * OUR LOVE STORY - API Layer (Tầng kết nối mạng)
 * ============================================================
 * File này chứa tất cả các hàm gọi API đến Backend Server.
 * Sử dụng fetch() để gửi/nhận dữ liệu qua HTTP.
 *
 * CẤU TRÚC:
 * - API.auth    → Xác thực Admin
 * - API.memories → CRUD Kỷ niệm (có upload ảnh)
 * - API.bucketList → CRUD Bucket List
 * - API.timeCapsule → CRUD Time Capsule
 *
 * LƯU Ý KHI DEPLOY:
 * - Đổi API_BASE thành URL server thật (VD: https://yourdomain.com/api)
 * - Thêm token vào header Authorization cho các request Admin
 * ============================================================
 */

// ============================================================
// CẤU HÌNH
// ============================================================

/**
 * URL gốc của Backend API
 * Đổi thành URL server thật khi deploy
 */
const API_BASE = "https://ourlove-backend.onrender.com";

/**
 * URL gốc để hiển thị ảnh từ server
 * Ảnh được phục vụ qua express.static('/uploads')
 */
const UPLOADS_BASE = "http://localhost:3000/uploads";

// ============================================================
// HÀM HỖ TRỢ (HELPER FUNCTIONS)
// ============================================================

/**
 * Hàm gọi API chung - bọc fetch() với xử lý lỗi thống nhất
 * @param {string} endpoint - Đường dẫn API (VD: '/memories')
 * @param {object} options - Cấu hình fetch (method, body, headers...)
 * @returns {Promise<object>} - Dữ liệu JSON từ server
 */
async function apiRequest(endpoint, options = {}) {
    try {
        // Thêm token Admin vào header nếu đang đăng nhập
        const token = sessionStorage.getItem("adminToken");
        if (token) {
            options.headers = {
                ...options.headers,
                Authorization: `Bearer ${token}`,
            };
        }

        // Gọi API
        const response = await fetch(`${API_BASE}${endpoint}`, options);

        // Parse JSON response
        const data = await response.json();

        // Kiểm tra response status
        if (!response.ok) {
            throw new Error(data.message || `Lỗi HTTP ${response.status}`);
        }

        return data;
    } catch (error) {
        console.error(`[API ERROR] ${endpoint}:`, error.message);

        // Nếu lỗi mạng (server không hoạt động) → thông báo rõ ràng
        if (
            error.message.includes("Failed to fetch") ||
            error.message.includes("NetworkError")
        ) {
            throw new Error(
                "Không thể kết nối đến server! Hãy kiểm tra Backend đang chạy tại http://localhost:3000",
            );
        }

        throw error;
    }
}

/**
 * Hàm tạo đường dẫn đầy đủ đến ảnh trên server
 * @param {string} path - URL ảnh (Cloudinary hoặc Local)
 * @returns {string} - URL đầy đủ
 */
function getImageUrl(path) {
    if (!path) return "";
    // Nếu path đã là URL đầy đủ (Cloudinary) thì trả về luôn
    if (path.startsWith("http")) return path;
    // Fallback cho ảnh cũ (nếu còn)
    return `${UPLOADS_BASE}/${path}`;
}

// ============================================================
// API OBJECT - TỔNG HỢP TẤT CẢ CÁC HÀM GỌI API
// ============================================================

const API = {
    // ==========================================================
    // XÁC THỰC ADMIN
    // ==========================================================
    auth: {
        /**
         * Đăng nhập Admin
         * Gửi mật khẩu lên server, nhận về token nếu đúng
         * Token được lưu vào sessionStorage để sử dụng cho các request sau
         *
         * @param {string} password - Mật khẩu Admin
         * @returns {Promise<object>} - { success: true, token: "admin-xxx" }
         */
        login: async function (password) {
            const data = await apiRequest("/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ password }),
            });

            // Lưu token vào sessionStorage (mất khi đóng tab)
            if (data.success && data.token) {
                sessionStorage.setItem("adminToken", data.token);
            }

            return data;
        },

        /**
         * Đăng xuất Admin
         * Xóa token khỏi sessionStorage
         */
        logout: function () {
            sessionStorage.removeItem("adminToken");
        },

        /**
         * Kiểm tra đang ở chế độ Admin hay không
         * @returns {boolean}
         */
        isAdmin: function () {
            return !!sessionStorage.getItem("adminToken");
        },
    },

    // ==========================================================
    // KỶ NIỆM (MEMORIES) - CRUD với upload ảnh
    // ==========================================================
    memories: {
        /**
         * Lấy tất cả kỷ niệm
         * GET /api/memories
         * @returns {Promise<Array>} - Mảng các object kỷ niệm
         */
        getAll: async function () {
            const data = await apiRequest("/memories");
            return data.data || [];
        },

        /**
         * Tạo kỷ niệm mới (có upload ảnh)
         * POST /api/memories
         *
         * SỬ DỤNG FormData: Vì cần gửi cả text + file ảnh trong 1 request
         * FormData tự động set Content-Type: multipart/form-data
         * QUAN TRỌNG: KHÔNG set Content-Type header thủ công khi dùng FormData!
         *
         * @param {object} memoryData - { title, content, date }
         * @param {File|null} imageFile - File Object từ <input type="file">
         * @returns {Promise<object>} - Kỷ niệm vừa tạo
         */
        create: async function (memoryData, imageFile) {
            // Tạo FormData để đóng gói text + file
            const formData = new FormData();
            formData.append("title", memoryData.title);
            formData.append("content", memoryData.content || "");
            formData.append("date", memoryData.date);

            // Chỉ thêm file nếu có chọn ảnh
            if (imageFile) {
                formData.append("image", imageFile);
            }

            // Gọi API - KHÔNG set Content-Type (FormData tự xử lý boundary)
            const response = await fetch(`${API_BASE}/memories`, {
                method: "POST",
                body: formData,
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.message);
            return data.data;
        },

        /**
         * Cập nhật kỷ niệm (sửa text hoặc thay ảnh mới)
         * PUT /api/memories/:id
         *
         * Tương tự create(), dùng FormData để gửi cả text + file
         * Nếu không chọn ảnh mới → server giữ nguyên ảnh cũ
         *
         * @param {string} id - ID kỷ niệm cần sửa
         * @param {object} memoryData - { title, content, date }
         * @param {File|null} imageFile - File mới (null nếu không thay ảnh)
         * @returns {Promise<object>} - Kỷ niệm đã cập nhật
         */
        update: async function (id, memoryData, imageFile) {
            const formData = new FormData();
            formData.append("title", memoryData.title);
            formData.append("content", memoryData.content || "");
            formData.append("date", memoryData.date);

            // Chỉ gửi file nếu Admin chọn ảnh mới để ghi đè
            if (imageFile) {
                formData.append("image", imageFile);
            }

            const response = await fetch(`${API_BASE}/memories/${id}`, {
                method: "PUT",
                body: formData,
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.message);
            return data.data;
        },

        /**
         * Xóa kỷ niệm (xóa cả file ảnh trên server)
         * DELETE /api/memories/:id
         *
         * @param {string} id - ID kỷ niệm cần xóa
         * @returns {Promise<object>} - Thông báo kết quả
         */
        delete: async function (id) {
            const data = await apiRequest(`/memories/${id}`, {
                method: "DELETE",
            });
            return data;
        },
    },

    // ==========================================================
    // DANH SÁCH MONG ƯỚC (BUCKET LIST)
    // ==========================================================
    bucketList: {
        /**
         * Lấy tất cả mục tiêu
         * GET /api/bucketlist
         * @returns {Promise<Array>}
         */
        getAll: async function () {
            const data = await apiRequest("/bucketlist");
            return data.data || [];
        },

        /**
         * Thêm mục tiêu mới (chỉ Admin)
         * POST /api/bucketlist
         * @param {string} task - Nội dung mục tiêu
         * @returns {Promise<object>}
         */
        create: async function (task) {
            const data = await apiRequest("/bucketlist", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ task }),
            });
            return data.data;
        },

        /**
         * Toggle trạng thái hoàn thành (User + Admin đều có quyền)
         * PUT /api/bucketlist/:id
         * @param {string} id - ID mục tiêu
         * @param {boolean} isCompleted - Trạng thái mới
         * @returns {Promise<object>}
         */
        toggleComplete: async function (id, isCompleted) {
            const data = await apiRequest(`/bucketlist/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ isCompleted }),
            });
            return data.data;
        },

        /**
         * Xóa mục tiêu (chỉ Admin)
         * DELETE /api/bucketlist/:id
         * @param {string} id - ID mục tiêu cần xóa
         * @returns {Promise<object>}
         */
        delete: async function (id) {
            const data = await apiRequest(`/bucketlist/${id}`, {
                method: "DELETE",
            });
            return data;
        },
    },

    // ==========================================================
    // HỘP THƯ HẸN GIỜ (TIME CAPSULE)
    // ==========================================================
    timeCapsule: {
        /**
         * Lấy tất cả thư hẹn giờ
         * GET /api/timecapsule
         *
         * XỬ LÝ KHÓA/MỞ:
         * - Server trả về đầy đủ tất cả thư
         * - Ở chế độ User: hàm này sẽ ẩn nội dung (message) của các thư
         *   chưa đến ngày mở khóa → thay bằng thông báo "Đang khóa"
         * - Ở chế độ Admin: trả về đầy đủ nội dung (đặc quyền xem trước)
         *
         * @returns {Promise<Array>} - Mảng thư hẹn giờ (đã xử lý khóa/mở)
         */
        getAll: async function () {
            const data = await apiRequest("/timecapsule");
            const capsules = data.data || [];
            const now = new Date();
            const isAdmin = API.auth.isAdmin();

            // Xử lý logic khóa/mở cho mỗi thư
            return capsules.map((capsule) => {
                const unlockDate = new Date(capsule.unlockDate);
                const isUnlocked = now >= unlockDate;

                return {
                    ...capsule,
                    isUnlocked: isUnlocked,
                    // Nếu User thường + thư chưa mở khóa → ẩn nội dung
                    displayMessage:
                        isUnlocked || isAdmin
                            ? capsule.message
                            : "🔒 Nội dung đang được khóa. Hãy chờ đến ngày mở khóa!",
                    // Tính thời gian còn lại
                    timeRemaining: isUnlocked ? null : unlockDate - now,
                };
            });
        },

        /**
         * Tạo thư hẹn giờ mới
         * POST /api/timecapsule
         * @param {string} message - Nội dung thư
         * @param {string} unlockDate - Ngày mở khóa (YYYY-MM-DD)
         * @returns {Promise<object>}
         */
        create: async function (message, unlockDate) {
            const data = await apiRequest("/timecapsule", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message, unlockDate }),
            });
            return data.data;
        },

        /**
         * Xóa thư hẹn giờ (chỉ Admin)
         * DELETE /api/timecapsule/:id
         * @param {string} id - ID thư cần xóa
         * @returns {Promise<object>}
         */
        delete: async function (id) {
            const data = await apiRequest(`/timecapsule/${id}`, {
                method: "DELETE",
            });
            return data;
        },
    },

    // ==========================================================
    // CÀI ĐẶT (SETTINGS)
    // ==========================================================
    settings: {
        /**
         * Lấy cấu hình chung
         * @returns {Promise<object>}
         */
        get: async function () {
            const data = await apiRequest("/settings");
            return data.data;
        },

        /**
         * Cập nhật ảnh đại diện
         * @param {File|null} avatar1 - File ảnh bạn nam
         * @param {File|null} avatar2 - File ảnh bạn nữ
         */
        updateAvatars: async function (avatar1, avatar2) {
            const formData = new FormData();
            if (avatar1) formData.append("avatar1", avatar1);
            if (avatar2) formData.append("avatar2", avatar2);

            const response = await fetch(`${API_BASE}/settings/avatars`, {
                method: "POST",
                body: formData,
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.message);
            return data.data;
        },

        /**
         * Cập nhật ngày yêu
         * @param {string} date - Format ISO hoặc YYYY-MM-DD
         */
        updateLoveDate: async function (date) {
            const data = await apiRequest("/settings", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ loveStartDate: date }),
            });
            return data.data;
        },
    },
};

// Export cho các file JS khác sử dụng
// (Trong trường hợp dùng module bundler)
// export { API, getImageUrl, API_BASE, UPLOADS_BASE };

console.log("[API] Module đã tải. Base URL:", API_BASE);
