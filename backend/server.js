/**
 * ============================================================
 * OUR LOVE STORY - Backend Server (PostgreSQL + Sequelize)
 * ============================================================
 * Server Node.js + Express cho Website kỷ niệm tình yêu.
 * Chức năng chính:
 *   - REST API cho Kỷ niệm (Memories), Bucket List, Time Capsule
 *   - Upload ảnh với Multer → Cloudinary
 *   - Xác thực Admin bằng mật khẩu
 *   - Database: PostgreSQL + Sequelize
 * ============================================================
 */

const express = require("express");
const cors = require("cors");
const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
require("dotenv").config();

// ============================================================
// IMPORT DATABASE & MODELS
// ============================================================
const sequelize = require("./config/database");
const Memory = require("./models/Memory");
const BucketItem = require("./models/BucketItem");
const TimeCapsule = require("./models/TimeCapsule");
const Settings = require("./models/Settings");

// ============================================================
// KHỞI TẠO EXPRESS APP
// ============================================================
const app = express();
const PORT = process.env.PORT || 3000;

// ============================================================
// CẤU HÌNH CLOUDINARY - LƯU TRỮ ẢNH
// ============================================================
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: "our_love_story",
        allowed_formats: ["jpg", "png", "jpeg", "webp", "gif"],
        transformation: [{ width: 1000, height: 1000, crop: "limit" }],
    },
});

const upload = multer({ storage: storage });

// ============================================================
// MIDDLEWARE
// ============================================================
app.use(cors());
app.use(express.json());

// ============================================================
// HEALTH CHECK ENDPOINT
// ============================================================
app.get('/health', (req, res) => {
    res.status(200).json({ 
        status: 'ok', 
        timestamp: new Date(),
        service: 'our-love-story-backend'
    });
});

// ============================================================
// CẤU HÌNH ADMIN
// ============================================================
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "ourlove2025";

// ============================================================
// TẠO BẢNG & KHỞI ĐỘNG DATABASE
// ============================================================
async function initializeDatabase() {
    try {
        // Tạo tất cả bảng nếu chưa tồn tại
        await sequelize.sync({ alter: false });
        console.log("[DB] ✅ Các bảng đã được khởi tạo!");

        // Tạo Settings record duy nhất nếu chưa có
        const [settings, created] = await Settings.findOrCreate({
            where: {},
            defaults: {
                avatar1: "",
                avatar2: "",
                loveStartDate: new Date("2025-12-22T00:00:00"),
            },
        });

        if (created) {
            console.log("[DB] ✅ Đã tạo Settings record mặc định!");
        }
    } catch (error) {
        console.error("[DB] ❌ Lỗi khởi tạo database:", error.message);
    }
}

// ============================================================
// API ROUTES - XÁC THỰC ADMIN
// ============================================================

/**
 * POST /api/auth/login
 * Xác thực mật khẩu Admin
 */
app.post("/api/auth/login", (req, res) => {
    const { password } = req.body;

    if (password === ADMIN_PASSWORD) {
        const token =
            "admin-" +
            Date.now().toString(36) +
            Math.random().toString(36).substring(2);
        console.log(`[AUTH] ✅ Admin đăng nhập thành công. Token: ${token}`);
        res.json({
            success: true,
            token: token,
            message: "Đăng nhập thành công!",
        });
    } else {
        console.log("[AUTH] ❌ Đăng nhập thất bại - Sai mật khẩu");
        res.status(401).json({
            success: false,
            message: "Mật khẩu không đúng!",
        });
    }
});

// ============================================================
// API ROUTES - KỶ NIỆM (MEMORIES)
// ============================================================

/**
 * GET /api/memories
 * Lấy danh sách tất cả kỷ niệm
 */
app.get("/api/memories", async (req, res) => {
    try {
        const memories = await Memory.findAll({
            order: [["date", "DESC"]],
        });
        res.json({ success: true, data: memories });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

/**
 * POST /api/memories
 * Tạo kỷ niệm mới, ảnh lưu trên Cloudinary
 */
app.post("/api/memories", upload.single("image"), async (req, res) => {
    try {
        const { title, content, date } = req.body;

        if (!title || !date) {
            return res
                .status(400)
                .json({
                    success: false,
                    message: "Tiêu đề và ngày tháng là bắt buộc!",
                });
        }

        const newMemory = await Memory.create({
            title,
            content: content || "",
            imageUrl: req.file ? req.file.path : "",
            date,
        });

        console.log(`[MEMORY] ✅ Đã lưu kỷ niệm mới: "${title}"`);
        res.status(201).json({ success: true, data: newMemory });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

/**
 * PUT /api/memories/:id
 * Cập nhật kỷ niệm
 */
app.put("/api/memories/:id", upload.single("image"), async (req, res) => {
    try {
        const { id } = req.params;
        const { title, content, date } = req.body;

        let memory = await Memory.findByPk(id);
        if (!memory) {
            return res
                .status(404)
                .json({ success: false, message: "Không tìm thấy kỷ niệm!" });
        }

        // Cập nhật dữ liệu
        memory.title = title || memory.title;
        memory.content = content !== undefined ? content : memory.content;
        memory.date = date || memory.date;

        // Cập nhật ảnh nếu có file mới
        if (req.file) {
            memory.imageUrl = req.file.path;
        }

        await memory.save();
        res.json({ success: true, data: memory });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

/**
 * DELETE /api/memories/:id
 * Xóa kỷ niệm
 */
app.delete("/api/memories/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const memory = await Memory.findByPk(id);

        if (!memory) {
            return res
                .status(404)
                .json({ success: false, message: "Không tìm thấy kỷ niệm!" });
        }

        await memory.destroy();
        res.json({ success: true, message: "Đã xóa kỷ niệm thành công!" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// ============================================================
// API ROUTES - BUCKET LIST
// ============================================================

/**
 * GET /api/bucketlist
 * Lấy tất cả mục tiêu
 */
app.get("/api/bucketlist", async (req, res) => {
    try {
        const items = await BucketItem.findAll();
        res.json({ success: true, data: items });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

/**
 * POST /api/bucketlist
 * Thêm mục tiêu mới
 */
app.post("/api/bucketlist", async (req, res) => {
    try {
        const { task } = req.body;

        if (!task) {
            return res
                .status(400)
                .json({ success: false, message: "Task không được để trống!" });
        }

        const newItem = await BucketItem.create({ task });
        res.status(201).json({ success: true, data: newItem });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

/**
 * PUT /api/bucketlist/:id
 * Toggle trạng thái hoàn thành
 */
app.put("/api/bucketlist/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { isCompleted } = req.body;

        let item = await BucketItem.findByPk(id);
        if (!item) {
            return res
                .status(404)
                .json({ success: false, message: "Không tìm thấy mục tiêu!" });
        }

        item.isCompleted =
            isCompleted !== undefined ? isCompleted : !item.isCompleted;
        item.completedAt = item.isCompleted ? new Date() : null;
        await item.save();

        res.json({ success: true, data: item });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

/**
 * DELETE /api/bucketlist/:id
 * Xóa mục tiêu
 */
app.delete("/api/bucketlist/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const item = await BucketItem.findByPk(id);

        if (!item) {
            return res
                .status(404)
                .json({ success: false, message: "Không tìm thấy mục tiêu!" });
        }

        await item.destroy();
        res.json({ success: true, message: "Đã xóa mục tiêu!" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// ============================================================
// API ROUTES - TIME CAPSULE
// ============================================================

/**
 * GET /api/timecapsule
 * Lấy tất cả thư hẹn giờ
 */
app.get("/api/timecapsule", async (req, res) => {
    try {
        const capsules = await TimeCapsule.findAll({
            order: [["unlockDate", "ASC"]],
        });
        res.json({ success: true, data: capsules });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

/**
 * POST /api/timecapsule
 * Tạo thư hẹn giờ mới
 */
app.post("/api/timecapsule", async (req, res) => {
    try {
        const { message, unlockDate } = req.body;

        if (!message || !unlockDate) {
            return res
                .status(400)
                .json({
                    success: false,
                    message: "Message và unlockDate là bắt buộc!",
                });
        }

        const newCapsule = await TimeCapsule.create({ message, unlockDate });
        res.status(201).json({ success: true, data: newCapsule });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

/**
 * DELETE /api/timecapsule/:id
 * Xóa thư hẹn giờ
 */
app.delete("/api/timecapsule/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const capsule = await TimeCapsule.findByPk(id);

        if (!capsule) {
            return res
                .status(404)
                .json({ success: false, message: "Không tìm thấy thư!" });
        }

        await capsule.destroy();
        res.json({ success: true, message: "Đã xóa thư hẹn giờ!" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// ============================================================
// GLOBAL ERROR HANDLER
// ============================================================
app.use((err, req, res, next) => {
    console.error('[ERROR]', err.message);
    res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Internal server error'
    });
});

// ============================================================
// API ROUTES - CÀI ĐẶT (SETTINGS & AVATARS)
// ============================================================

/**
 * GET /api/settings
 * Lấy cấu hình
 */
app.get("/api/settings", async (req, res) => {
    try {
        const settings = await Settings.findOne();
        res.json({ success: true, data: settings });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

/**
 * POST /api/settings/avatars
 * Cập nhật ảnh đại diện
 */
app.post(
    "/api/settings/avatars",
    upload.fields([
        { name: "avatar1", maxCount: 1 },
        { name: "avatar2", maxCount: 1 },
    ]),
    async (req, res) => {
        try {
            let settings = await Settings.findOne();
            if (!settings) {
                settings = await Settings.create({});
            }

            if (req.files["avatar1"]) {
                settings.avatar1 = req.files["avatar1"][0].path;
            }
            if (req.files["avatar2"]) {
                settings.avatar2 = req.files["avatar2"][0].path;
            }

            await settings.save();
            res.json({ success: true, data: settings });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },
);

/**
 * PUT /api/settings
 * Cập nhật ngày yêu
 */
app.put("/api/settings", async (req, res) => {
    try {
        const { loveStartDate } = req.body;

        if (!loveStartDate) {
            return res
                .status(400)
                .json({ success: false, message: "Thiếu ngày bắt đầu!" });
        }

        let settings = await Settings.findOne();
        if (!settings) {
            settings = await Settings.create({});
        }

        settings.loveStartDate = loveStartDate;
        await settings.save();
        res.json({ success: true, data: settings });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// ============================================================
// KHỞI ĐỘNG SERVER
// ============================================================
(async () => {
    try {
        // Khởi tạo database
        await initializeDatabase();

        // Khởi động server
        app.listen(PORT, '0.0.0.0', () => {
            console.log(`\n  🚀 OUR LOVE STORY - Backend Server (PostgreSQL)`);
            console.log(`  📍 Đang chạy tại: http://localhost:${PORT}`);
            console.log(`  🗄️  Database: PostgreSQL + Sequelize\n`);
        });
    } catch (error) {
        console.error("[ERROR] Lỗi khởi động server:", error.message);
        process.exit(1);
    }
})();
