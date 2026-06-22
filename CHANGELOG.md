📋 SUMMARY: MongoDB → PostgreSQL Migration (2026-06-22)

## 🎯 Mục đích

Chuyển đổi từ MongoDB Atlas (bị chặn AWS) → PostgreSQL trên Render

## 📝 Các File Được Thay Đổi/Tạo Mới

### ✅ Tạo Mới:

1. **config/database.js** - Cấu hình Sequelize + PostgreSQL
2. **models/Memory.js** - Model kỷ niệm
3. **models/BucketItem.js** - Model bucket list
4. **models/TimeCapsule.js** - Model time capsule
5. **models/Settings.js** - Model cấu hình
6. **.env.example** - Mẫu biến môi trường
7. **MIGRATION.md** - Hướng dẫn chi tiết (tiếng Việt)
8. **README.md** - Tài liệu README (tiếng Việt)
9. **SETUP_QUICK.md** - Hướng dẫn nhanh (tiếng Việt)

### ✏️ Thay Đổi:

1. **server.js**
    - Xóa: Tất cả import/config Mongoose
    - Thêm: Import Sequelize & models
    - Thay thế: Tất cả routes từ Mongoose → Sequelize
    - Thêm: Hàm initializeDatabase() để tạo bảng tự động

2. **package.json**
    - Xóa: "mongoose": "^9.7.1"
    - Thêm:
        - "sequelize": "^6.35.2"
        - "pg": "^8.11.3"
    - Cập nhật version từ 1.0.0 → 2.0.0

3. **.env**
    - Xóa: MONGODB_URI=...
    - Thêm: DATABASE_URL=postgresql://...

## 🔄 Chuyển Đổi API:

### Mongoose → Sequelize

| Mongoose                   | Sequelize                  | Route                    |
| -------------------------- | -------------------------- | ------------------------ |
| Memory.find()              | Memory.findAll()           | GET /api/memories        |
| new Memory(...).save()     | Memory.create(...)         | POST /api/memories       |
| Memory.findByIdAndUpdate() | m.findByPk() + m.save()    | PUT /api/memories/:id    |
| Memory.findByIdAndDelete() | m.findByPk() + m.destroy() | DELETE /api/memories/:id |

Tương tự cho: BucketItem, TimeCapsule, Settings

## ✨ Các Tính Năng Giữ Nguyên:

✅ Memories (CRUD + upload ảnh Cloudinary)
✅ Bucket List (CRUD + toggle complete)
✅ Time Capsule (Create, Read, Delete)
✅ Settings (avatars, loveStartDate)
✅ Auth (Admin login)
✅ Cloudinary (upload ảnh)

## 📊 Database Structure:

```sql
-- memories
id (UUID), title, content, imageUrl, date, createdAt, updatedAt

-- bucket_items
id (UUID), task, isCompleted, completedAt

-- time_capsules
id (UUID), message, unlockDate, createdAt

-- settings
id (UUID), avatar1, avatar2, loveStartDate
```

## 🚀 Hướng Dẫn Cài Đặt:

1. Sao chép DATABASE_URL từ Render PostgreSQL
2. Cập nhật .env: DATABASE_URL=...
3. Chạy: npm install (ở backend/)
4. Chạy: npm start
5. Server tự động tạo bảng!

## 🎯 Frontend:

Không cần thay đổi gì! Vì:

- API endpoints giữ nguyên
- Response format giữ nguyên
- Cloudinary upload giữ nguyên
- Tất cả hoạt động 100% tương thích

## ⚙️ Sequelize Configuration:

File: config/database.js

- Sử dụng DATABASE_URL từ .env
- SSL enabled (Render yêu cầu)
- Logging SQL queries (có thể tắt)
- UUID cho primary keys

## 📁 Cấu Trúc Backend Mới:

```
backend/
├── config/
│   └── database.js (Sequelize config)
├── models/
│   ├── Memory.js
│   ├── BucketItem.js
│   ├── TimeCapsule.js
│   └── Settings.js
├── server.js (API routes)
├── package.json (Sequelize + pg)
├── .env (DATABASE_URL)
├── .env.example
├── README.md
├── MIGRATION.md
├── SETUP_QUICK.md
└── db.json (không dùng nữa)
```

## 🔐 Biến Môi Trường:

```env
PORT=3000
DATABASE_URL=postgresql://...
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
ADMIN_PASSWORD=ourlove2025
```

## ✅ Testing:

curl http://localhost:3000/api/bucketlist
→ Phải trả về: { success: true, data: [...] }

## 📌 Notes:

- Sequelize model IDs: UUID (tự động generate)
- Timestamps: createdAt, updatedAt (tự động)
- Cloudinary: Upload ảnh vẫn dùng đường link
- Settings: Chỉ 1 record (findOne)
- BucketItem: Có thể nhiều records
- TimeCapsule: Có thể nhiều records
- Memory: Có thể nhiều records
