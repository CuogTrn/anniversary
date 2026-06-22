# 🎊 OUR LOVE STORY - Backend (PostgreSQL Version)

## 📝 Tóm tắt cập nhật

Đã chuyển đổi từ **MongoDB Atlas** (bị chặn AWS) → **PostgreSQL trên Render** ✨

### 📦 Các thay đổi chính:

1. **Database:** MongoDB Mongoose → PostgreSQL Sequelize
2. **ORM:** Mongoose → Sequelize
3. **Models:** 4 bảng (Memory, BucketItem, TimeCapsule, Settings)
4. **API Routes:** Giữ nguyên - tương thích 100% với Frontend

---

## 🚀 Cách sử dụng

### Bước 1: Sao chép DATABASE_URL từ Render

```
Truy cập Render → PostgreSQL Database → Copy "Internal Database URL"
```

### Bước 2: Cập nhật `.env`

```env
DATABASE_URL=postgresql://user:password@host:5432/database
```

### Bước 3: Cài đặt & chạy

```bash
cd backend
npm install
npm start
```

✅ Server sẽ tự động tạo tất cả bảng PostgreSQL

---

## 📂 Cấu trúc mới

```
backend/
├── config/database.js        # Cấu hình Sequelize
├── models/                   # Database models
│   ├── Memory.js
│   ├── BucketItem.js
│   ├── TimeCapsule.js
│   └── Settings.js
├── server.js                 # API server (PostgreSQL)
├── package.json              # Dependencies (Sequelize + pg)
├── .env                       # Biến môi trường
├── MIGRATION.md              # Hướng dẫn chi tiết
└── README.md                 # File này
```

---

## 🔄 API Endpoints (giữ nguyên)

### Memories (Kỷ niệm)

- `GET /api/memories` - Lấy tất cả
- `POST /api/memories` - Tạo mới (upload ảnh)
- `PUT /api/memories/:id` - Cập nhật
- `DELETE /api/memories/:id` - Xóa

### Bucket List (Danh sách mong ước)

- `GET /api/bucketlist` - Lấy tất cả
- `POST /api/bucketlist` - Tạo mới
- `PUT /api/bucketlist/:id` - Cập nhật status
- `DELETE /api/bucketlist/:id` - Xóa

### Time Capsule (Thư hẹn giờ)

- `GET /api/timecapsule` - Lấy tất cả
- `POST /api/timecapsule` - Tạo mới
- `DELETE /api/timecapsule/:id` - Xóa

### Settings (Cấu hình)

- `GET /api/settings` - Lấy cấu hình
- `POST /api/settings/avatars` - Upload ảnh đại diện
- `PUT /api/settings` - Cập nhật ngày yêu

---

## 📊 Database Schema

Sequelize tự động tạo các bảng:

- **memories** - Kỷ niệm (id, title, content, imageUrl, date, timestamps)
- **bucket_items** - Mục tiêu (id, task, isCompleted, completedAt)
- **time_capsules** - Thư hẹn giờ (id, message, unlockDate, createdAt)
- **settings** - Cấu hình (id, avatar1, avatar2, loveStartDate)

---

## 🛠️ Lệnh Hữu Ích

```bash
# Cài đặt dependencies
npm install

# Chạy server (production)
npm start

# Chạy server (dev - auto reload)
npm run dev

# Xem logs
node server.js
```

---

## ✅ Frontend - Không cần thay đổi gì!

Vì API endpoints giữ nguyên, frontend (`frontend/js/api.js`) **hoạt động bình thường**

---

## 📚 Hướng dẫn chi tiết

Xem file **MIGRATION.md** để biết:

- Cấu hình PostgreSQL Render
- Sơ đồ bảng database
- Giải pháp các lỗi thường gặp
- Hướng dẫn deploy lên Render

---

## 🎯 Next Steps

1. ✅ Cập nhật `.env` với DATABASE_URL
2. ✅ Chạy `npm install` để cài Sequelize & pg
3. ✅ Chạy `npm start` để tạo bảng & khởi động server
4. ✅ Frontend sẽ tự động hoạt động!
5. ✅ Deploy backend lên Render (thêm DATABASE_URL vào Environment)

---

**Happy coding! 💕**
