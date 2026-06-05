<div align="center">

# 🅿️ ParkingSlot Management System

**Hệ thống quản lý bãi đỗ xe thông minh — Hiện đại, Bảo mật, Toàn diện**

[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactjs.org)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://mongodb.com)
[![Express](https://img.shields.io/badge/Express-5-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com)
[![Vite](https://img.shields.io/badge/Vite-5-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev)

[🚀 Live Demo](https://parkingslot.vercel.app) · [🐛 Báo lỗi](https://github.com/thphattt/ParkingSlot/issues) · [💡 Đề xuất](https://github.com/thphattt/ParkingSlot/issues)

</div>

---

## 📋 Mục lục

- [Tổng quan](#-tổng-quan)
- [Tính năng](#-tính-năng)
- [Công nghệ](#-công-nghệ)
- [Cài đặt](#-cài-đặt)
- [Biến môi trường](#-biến-môi-trường)
- [Cấu trúc dự án](#-cấu-trúc-dự-án)
- [API Endpoints](#-api-endpoints)
- [Phân quyền](#-phân-quyền)
- [Deploy](#-deploy)

---

## 🎯 Tổng quan

**ParkingSlot Management System** là một ứng dụng web full-stack giúp ban quản lý chung cư/tòa nhà quản lý toàn diện hệ thống bãi đỗ xe — từ quản lý cư dân, phương tiện, hợp đồng thuê, thanh toán đến ghi nhận xe vào/ra theo thời gian thực.

> **Stack:** MERN (MongoDB · Express · React · Node.js) với kiến trúc RESTful API + JWT Authentication

---

## ✨ Tính năng

| Module | Mô tả |
|--------|--------|
| 🔐 **Xác thực** | Đăng nhập JWT, Refresh Token tự động, phân quyền theo vai trò |
| 📊 **Dashboard** | Thống kê realtime — tổng cư dân, xe đang trong bãi, doanh thu tháng |
| 👤 **Cư dân** | Quản lý hồ sơ cư dân, validate Email/SĐT/CCCD không trùng lặp |
| 🚘 **Phương tiện** | Đăng ký và quản lý xe theo từng cư dân |
| 🅿️ **Bãi đỗ xe** | Tạo ô đỗ hàng loạt, theo dõi trạng thái trống/đã thuê/bảo trì |
| 📋 **Hợp đồng** | Tạo/hủy hợp đồng thuê, tự động cập nhật trạng thái ô đỗ |
| 💳 **Thanh toán** | Sinh hóa đơn hàng loạt, hạn thanh toán ngày 5, tích hợp PayOS |
| 🚗 **Vào/Ra** | Ghi nhận xe vào/ra theo biển số, theo dõi xe đang trong bãi |
| 📈 **Báo cáo** | Biểu đồ doanh thu, lưu lượng xe theo tháng |
| 🔔 **Thông báo** | Gửi Email tự động (Nodemailer), Auto nhắc nợ hàng loạt |
| ⚙️ **Cài đặt** | Quản lý hồ sơ, đổi mật khẩu, tạo/quản lý tài khoản nhân viên |

---

## 🛠 Công nghệ

### Backend
- **Runtime:** Node.js 18+
- **Framework:** Express.js 5
- **Database:** MongoDB Atlas + Mongoose
- **Auth:** JWT (Access Token + Refresh Token)
- **Email:** Nodemailer + Gmail SMTP
- **Payment:** PayOS
- **Realtime:** Socket.io
- **Security:** Helmet, CORS, bcryptjs

### Frontend
- **Framework:** React 18 + Vite 5
- **Routing:** React Router v6
- **State:** Zustand
- **HTTP:** Axios (với interceptor tự động refresh token)
- **Charts:** Recharts
- **UI:** Tailwind CSS + Lucide Icons
- **Notifications:** React Hot Toast

---

## 🚀 Cài đặt

### Yêu cầu
- Node.js >= 18
- MongoDB Atlas account (hoặc MongoDB local)
- Gmail account (để gửi email)

### 1. Clone repository

```bash
git clone https://github.com/thphattt/ParkingSlot.git
cd ParkingSlot
```

### 2. Cài đặt dependencies

```bash
# Backend
cd server
npm install

# Frontend
cd ../client
npm install
```

### 3. Cấu hình môi trường

```bash
# Tạo file .env cho Backend
cp server/.env.example server/.env

# Tạo file .env cho Frontend
cp client/.env.example client/.env
```

Điền các biến môi trường vào 2 file `.env` (xem hướng dẫn bên dưới).

### 4. Chạy ứng dụng

```bash
# Terminal 1 — Backend (port 5000)
cd server
npm run dev

# Terminal 2 — Frontend (port 5173)
cd client
npm run dev
```

Mở trình duyệt tại **http://localhost:5173**

---

## 🔐 Biến môi trường

### `server/.env`

```env
# Server
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/parkingslot

# JWT
JWT_SECRET=your_super_secret_key_here
JWT_EXPIRE=7d
JWT_REFRESH_SECRET=your_refresh_secret_here
JWT_REFRESH_EXPIRE=30d

# Client
CLIENT_URL=http://localhost:5173

# Phí đỗ xe (VND/tháng)
CAR_MONTHLY_FEE=2000000
MOTORBIKE_MONTHLY_FEE=250000

# Email (Gmail SMTP)
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
EMAIL_FROM=ParkingSlot <your_email@gmail.com>

# PayOS
PAYOS_CLIENT_ID=your_client_id
PAYOS_API_KEY=your_api_key
PAYOS_CHECKSUM_KEY=your_checksum_key
```

### `client/.env`

```env
VITE_API_URL=http://localhost:5000/api
```

---

## 📁 Cấu trúc dự án

```
ParkingSlot/
├── client/                   # React Frontend
│   └── src/
│       ├── components/       # Shared components (Layout, Sidebar...)
│       ├── pages/            # Pages theo module
│       │   ├── auth/
│       │   ├── dashboard/
│       │   ├── residents/
│       │   ├── vehicles/
│       │   ├── parking-slots/
│       │   ├── parking-logs/
│       │   ├── contracts/
│       │   ├── payments/
│       │   ├── reports/
│       │   ├── notifications/
│       │   └── settings/
│       ├── services/         # Axios API calls
│       ├── stores/           # Zustand state (authStore)
│       └── routes/           # ProtectedRoute, RoleRoute
│
└── server/                   # Express Backend
    └── src/
        ├── controllers/      # Business logic
        ├── models/           # Mongoose schemas
        ├── routes/           # API routes
        ├── middlewares/      # Auth, error handling
        ├── services/         # External services
        ├── utils/            # Helpers (sendEmail, emailTemplate)
        └── sockets/          # Socket.io handlers
```

---

## 📡 API Endpoints

### Authentication
| Method | Endpoint | Mô tả |
|--------|----------|--------|
| `POST` | `/api/auth/register` | Đăng ký |
| `POST` | `/api/auth/login` | Đăng nhập |
| `POST` | `/api/auth/logout` | Đăng xuất |
| `GET` | `/api/auth/me` | Thông tin user hiện tại |
| `POST` | `/api/auth/refresh-token` | Làm mới Access Token |

### Core Resources
| Method | Endpoint | Mô tả |
|--------|----------|--------|
| `GET/POST` | `/api/residents` | Danh sách / Tạo cư dân |
| `GET/PUT/DELETE` | `/api/residents/:id` | Chi tiết / Sửa / Xóa |
| `GET/POST` | `/api/vehicles` | Danh sách / Tạo phương tiện |
| `GET/POST` | `/api/parking-slots` | Danh sách / Tạo ô đỗ |
| `POST` | `/api/parking-slots/bulk` | Tạo hàng loạt |
| `GET/POST` | `/api/contracts` | Danh sách / Tạo hợp đồng |
| `PUT` | `/api/contracts/:id/cancel` | Hủy hợp đồng |
| `GET/POST` | `/api/payments` | Danh sách / Sinh hóa đơn |
| `PUT` | `/api/payments/:id/pay` | Đánh dấu đã thanh toán |
| `POST` | `/api/parking-logs/entry` | Ghi nhận xe vào |
| `POST` | `/api/parking-logs/exit` | Ghi nhận xe ra |
| `GET` | `/api/notifications` | Danh sách thông báo |
| `POST` | `/api/notifications` | Tạo và gửi thông báo |
| `POST` | `/api/notifications/auto-remind` | Auto nhắc nợ hàng loạt |
| `GET` | `/api/reports` | Báo cáo doanh thu |
| `GET` | `/api/dashboard/stats` | Thống kê tổng quan |

---

## 🛡 Phân quyền

| Tính năng | Admin | Bảo vệ |
|-----------|-------|--------|
| Dashboard | ✅ | ✅ |
| Xem Cư dân / Phương tiện / Bãi đỗ | ✅ | ✅ |
| Thêm/Sửa/Xóa Cư dân, Phương tiện | ✅ | ❌ |
| Ghi nhận xe Vào/Ra | ✅ | ✅ |
| Hợp đồng, Thanh toán, Báo cáo | ✅ | ❌ |
| Xem Thông báo | ✅ | ✅ |
| Tạo/Gửi Thông báo | ✅ | ❌ |
| Quản lý Nhân viên (Cài đặt) | ✅ | ❌ |
| Hồ sơ & Đổi mật khẩu cá nhân | ✅ | ✅ |

---

## 🌐 Deploy

| Thành phần | Nền tảng | Trạng thái |
|-----------|----------|------------|
| Frontend | Vercel | [![Vercel](https://img.shields.io/badge/Vercel-Deployed-000?style=flat&logo=vercel)](https://parkingslot.vercel.app) |
| Backend | Render | [![Render](https://img.shields.io/badge/Render-Live-46E3B7?style=flat&logo=render)](https://parkingslot-soxq.onrender.com) |
| Database | MongoDB Atlas | [![MongoDB](https://img.shields.io/badge/Atlas-Connected-47A248?style=flat&logo=mongodb)](https://mongodb.com/atlas) |

---

<div align="center">

Made with ❤️ by [thphattt](https://github.com/thphattt)

</div>
