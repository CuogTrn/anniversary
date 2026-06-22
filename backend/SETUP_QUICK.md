# ⚡ Hướng dẫn Nhanh: MongoDB → PostgreSQL

## 🎯 Mục tiêu

Chuyển đổi backend từ MongoDB Atlas → PostgreSQL Render để tránh bị chặn AWS

---

## 📋 Bước 1: Lấy DATABASE_URL từ Render (5 phút)

### 1. Đăng nhập Render

→ https://dashboard.render.com

### 2. Tìm PostgreSQL Database

```
Sidebar → PostgreSQL
→ Nhấp vào database "our-love-story" (hoặc tên database của bạn)
```

### 3. Sao chép URL

```
Kéo xuống → "Connections"
→ Copy: "Internal Database URL"

Ví dụ kết quả:
postgresql://user123:pass456@dpg-abc123.postgres.render.com:5432/mydb
```

---

## 🔧 Bước 2: Cập nhật File `.env`

Mở file: `backend/.env`

**Thay đổi:**

```env
# ❌ CŨ (Xóa dòng này):
MONGODB_URI=mongodb+srv://...

# ✅ MỚI (Thêm dòng này):
DATABASE_URL=postgresql://user:password@host:5432/database
```

**Ví dụ:**

```env
PORT=3000
DATABASE_URL=postgresql://user123:pass456@dpg-abc123.postgres.render.com:5432/mydb
CLOUDINARY_CLOUD_NAME=dkvjqgpa4
CLOUDINARY_API_KEY=248222842584343
CLOUDINARY_API_SECRET=7HBFLOcH_-4YImlsDR-K0_qdsl0
ADMIN_PASSWORD=ourlove2025
```

---

## 📦 Bước 3: Cài đặt Dependencies

Mở Terminal, chạy:

```bash
cd backend
npm install
```

✅ Sẽ cài Sequelize & PostgreSQL driver

---

## 🚀 Bước 4: Chạy Server

```bash
# Terminal tại folder backend/
npm start
```

**Khi thành công, bạn sẽ thấy:**

```
✅ Kết nối PostgreSQL thành công!
✅ Các bảng đã được khởi tạo!
✅ Đã tạo Settings record mặc định!

🚀 OUR LOVE STORY - Backend Server (PostgreSQL)
📍 Đang chạy tại: http://localhost:3000
🗄️ Database: PostgreSQL + Sequelize
```

---

## ✅ Bước 5: Kiểm Tra

Mở trình duyệt, truy cập:

```
http://localhost:3000/api/bucketlist
```

Sẽ thấy:

```json
{
  "success": true,
  "data": [ ... ]
}
```

✅ **Thành công!**

---

## 📱 Frontend - Không cần thay đổi!

Folder `frontend/` vẫn hoạt động bình thường:

```bash
cd frontend
python -m http.server 8000
```

Truy cập: http://localhost:8000

---

## ⚠️ Gặp Lỗi?

### Lỗi 1: "Không thể kết nối PostgreSQL"

```
❌ Error: getaddrinfo ENOTFOUND ...
```

**Fix:** Kiểm tra DATABASE_URL có đúng không

### Lỗi 2: "relation does not exist"

```
❌ error: relation "memories" does not exist
```

**Fix:** Đợi server khởi động xong, nó sẽ tạo bảng tự động

### Lỗi 3: npm install lỗi

```bash
# Xóa node_modules & package-lock.json
rm -rf node_modules package-lock.json

# Cài lại
npm install
```

---

## 🎉 Tất xong!

Bây giờ bạn có:

- ✅ PostgreSQL database trên Render
- ✅ Backend với Sequelize
- ✅ Frontend hoạt động bình thường
- ✅ Không lo bị chặn MongoDB Atlas nữa!

---

## 📚 Tài liệu Thêm

- Hướng dẫn chi tiết: `MIGRATION.md`
- README: `README.md`
- Docs Sequelize: https://sequelize.org

---

**Thắc mắc? Xem file MIGRATION.md để hiểu thêm chi tiết!** 💕
