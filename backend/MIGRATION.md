# 🚀 Hướng dẫn: Di chuyển từ MongoDB sang PostgreSQL trên Render

## 📋 Tóm tắt thay đổi

**Từ:** MongoDB Atlas + Mongoose  
**Sang:** PostgreSQL (Render) + Sequelize

### ✅ Những tính năng giữ nguyên:

- ✓ Tất cả API endpoints (Memories, Bucket List, Time Capsule, Settings)
- ✓ Upload ảnh qua Cloudinary
- ✓ Xác thực Admin bằng mật khẩu
- ✓ Cấu trúc dữ liệu tương tự

---

## 🔧 Bước 1: Lấy Database URL từ Render

### 1.1 Truy cập Render Dashboard

- Đăng nhập vào https://dashboard.render.com
- Chọn **PostgreSQL database** của bạn từ danh sách dự án

### 1.2 Sao chép Database URL

```
Chọn: PostgreSQL Instance
→ Kéo xuống mục "Connections"
→ Copy "Internal Database URL" (hoặc "External Database URL" nếu muốn kết nối từ máy cục bộ)

Ví dụ URL:
postgresql://user:password@dpg-xxx.postgres.render.com:5432/database_name
```

### 1.3 Cập nhật file `.env`

Mở file `backend/.env` và thay đổi:

```env
# Cũ:
MONGODB_URI=mongodb+srv://...

# Mới:
DATABASE_URL=postgresql://user:password@host:5432/database
```

---

## 📦 Bước 2: Cài đặt Dependencies mới

```bash
cd backend
npm install
```

Dependencies mới được thêm vào:

- `sequelize` - ORM cho PostgreSQL
- `pg` - Driver PostgreSQL
- Đã xóa `mongoose` (MongoDB ORM)

---

## 🗂️ Bước 3: Cấu trúc File mới

Backend hiện tại có cấu trúc như sau:

```
backend/
├── server.js                 # Main server (đã cập nhật)
├── config/
│   └── database.js          # Cấu hình Sequelize + PostgreSQL [MỚI]
├── models/
│   ├── Memory.js            # Model kỷ niệm [MỚI]
│   ├── BucketItem.js        # Model bucket list [MỚI]
│   ├── TimeCapsule.js       # Model time capsule [MỚI]
│   └── Settings.js          # Model settings [MỚI]
├── .env                      # Biến môi trường (cập nhật DATABASE_URL)
├── .env.example              # Mẫu biến môi trường [MỚI]
└── package.json              # Dependencies (cập nhật)
```

---

## 🚀 Bước 4: Chạy Server

```bash
# Khởi động server (tự động tạo bảng)
npm start

# Hoặc chế độ phát triển (tự động reload)
npm run dev
```

**Khi server khởi động:**

1. ✅ Kết nối PostgreSQL
2. ✅ Tự động tạo bảng (Memory, BucketItem, TimeCapsule, Settings)
3. ✅ Tạo Settings record mặc định
4. ✅ Sẵn sàng phục vụ API

---

## 📊 Sơ đồ Bảng Database

Sequelize sẽ tự động tạo các bảng sau:

### 1️⃣ Bảng `memories` (Kỷ niệm)

```sql
CREATE TABLE "memories" (
  "id" UUID PRIMARY KEY,
  "title" VARCHAR(255) NOT NULL,
  "content" TEXT,
  "imageUrl" VARCHAR(255),
  "date" TIMESTAMP NOT NULL,
  "createdAt" TIMESTAMP,
  "updatedAt" TIMESTAMP
);
```

### 2️⃣ Bảng `bucket_items` (Danh sách mong ước)

```sql
CREATE TABLE "bucket_items" (
  "id" UUID PRIMARY KEY,
  "task" VARCHAR(255) NOT NULL,
  "isCompleted" BOOLEAN DEFAULT FALSE,
  "completedAt" TIMESTAMP
);
```

### 3️⃣ Bảng `time_capsules` (Hộp thư hẹn giờ)

```sql
CREATE TABLE "time_capsules" (
  "id" UUID PRIMARY KEY,
  "message" TEXT NOT NULL,
  "unlockDate" TIMESTAMP NOT NULL,
  "createdAt" TIMESTAMP DEFAULT NOW()
);
```

### 4️⃣ Bảng `settings` (Cấu hình)

```sql
CREATE TABLE "settings" (
  "id" UUID PRIMARY KEY,
  "avatar1" VARCHAR(255) DEFAULT '',
  "avatar2" VARCHAR(255) DEFAULT '',
  "loveStartDate" TIMESTAMP DEFAULT '2025-12-22T00:00:00'
);
```

---

## 🔄 Cách Sequelize Thay Thế Mongoose

| Mongoose               | Sequelize                    | Mô tả             |
| ---------------------- | ---------------------------- | ----------------- |
| `.find()`              | `.findAll()`                 | Tìm nhiều bản ghi |
| `.findById()`          | `.findByPk()`                | Tìm theo ID       |
| `.findByIdAndUpdate()` | `.findByPk()` + `.save()`    | Cập nhật          |
| `.findByIdAndDelete()` | `.findByPk()` + `.destroy()` | Xóa               |
| `new Model()`          | `Model.create()`             | Tạo mới           |
| `.save()`              | `.save()`                    | Lưu thay đổi      |
| `Model.find()`         | `Model.findAll()`            | Tìm tất cả        |
| `Model.find().sort()`  | `Model.findAll({ order: })`  | Sắp xếp           |

---

## ❌ Lỗi Thường Gặp & Giải Pháp

### ❌ Lỗi: "Không thể kết nối PostgreSQL"

```
[DB] ❌ Lỗi kết nối PostgreSQL: ...
```

**Giải pháp:**

- Kiểm tra DATABASE_URL trong `.env`
- Đảm bảo PostgreSQL đang chạy trên Render
- Kiểm tra firewall/IP whitelist trên Render

### ❌ Lỗi: "ENOTFOUND: getaddrinfo"

```
Error: getaddrinfo ENOTFOUND your_host
```

**Giải pháp:**

- DATABASE_URL bị lỗi hostname
- Sao chép lại URL từ Render Dashboard

### ❌ Lỗi: "relation does not exist"

```
error: relation "memories" does not exist
```

**Giải pháp:**

- Chúng ta phải đợi server khởi động xong (tự tạo bảng)
- Hoặc chạy: `npm run dev` để tạo bảng

---

## 📤 Deploy lên Render

Khi deploy backend lên Render, cập nhật biến môi trường:

1. Render Dashboard → Backend Service
2. Environment → Thêm biến:
    ```
    DATABASE_URL = postgresql://...  (từ Render PostgreSQL)
    CLOUDINARY_CLOUD_NAME = ...
    CLOUDINARY_API_KEY = ...
    CLOUDINARY_API_SECRET = ...
    ADMIN_PASSWORD = ourlove2025
    ```
3. Deploy lại backend

---

## ✨ Frontend - Không cần thay đổi

Frontend (api.js) **vẫn giữ nguyên**!

Vì:

- ✓ Cấu trúc API endpoint giống hệt (GET, POST, PUT, DELETE)
- ✓ Response format giống hệt (data, success, message)
- ✓ Upload ảnh vẫn dùng Cloudinary
- ✓ Backend URL vẫn giữ nguyên

---

## 🧪 Kiểm Tra API

Sau khi chạy server, test các API:

```bash
# GET all memories
curl http://localhost:3000/api/memories

# GET bucket list
curl http://localhost:3000/api/bucketlist

# GET time capsules
curl http://localhost:3000/api/timecapsule

# GET settings
curl http://localhost:3000/api/settings

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"password":"ourlove2025"}'
```

---

## 📚 Tài liệu Thêm

- **Sequelize Docs:** https://sequelize.org/docs/v6/
- **Render PostgreSQL:** https://render.com/docs/databases
- **Cloudinary Upload:** https://cloudinary.com/documentation/image_upload_api

---

## ✅ Checklist

- [ ] Sao chép DATABASE_URL từ Render
- [ ] Cập nhật `.env` với DATABASE_URL
- [ ] Chạy `npm install` ở `backend/`
- [ ] Khởi động server: `npm start`
- [ ] Kiểm tra server log: "✅ Kết nối PostgreSQL thành công!"
- [ ] Test API bằng curl hoặc Postman
- [ ] Frontend tự động hoạt động (không cần thay đổi)
- [ ] Deploy backend lên Render với biến môi trường mới

---

**Chúc mừng! 🎉 Bạn đã thành công chuyển đổi từ MongoDB sang PostgreSQL!**
