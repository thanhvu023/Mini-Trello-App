# Mini Trello App

Ứng dụng quản lý bảng thời gian thực với tính năng kéo thả, tích hợp GitHub và xác thực qua email.

## Tính năng chính

- ✅ Xác thực người dùng qua email (không cần mật khẩu)
- ✅ Quản lý bảng và thẻ
- ✅ Kéo thả nhiệm vụ giữa các trạng thái
- ✅ Cập nhật thời gian thực với WebSocket
- ✅ Tích hợp GitHub OAuth
- ✅ Mời thành viên vào bảng
- ✅ Gán nhiệm vụ cho thành viên
- ✅ Giao diện responsive

## Công nghệ sử dụng

### Frontend
- React 18 với Vite
- React Router DOM
- Socket.io Client
- React DnD (Drag & Drop)
- Tailwind CSS
- Lucide React (Icons)

### Backend
- Express.js
- MongoDB với Mongoose
- Socket.io
- JWT Authentication
- Nodemailer
- GitHub API Integration

## Cài đặt và chạy

### Backend
```bash
cd backend
npm install
npm run dev
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

## API Endpoints

### Authentication
- `POST /auth/signup` - Đăng ký với email
- `POST /auth/signin` - Đăng nhập với mã xác minh

### Boards
- `GET /boards` - Lấy tất cả bảng
- `POST /boards` - Tạo bảng mới
- `PUT /boards/:id` - Cập nhật bảng
- `DELETE /boards/:id` - Xóa bảng

### Cards
- `GET /boards/:boardId/cards` - Lấy tất cả thẻ
- `POST /boards/:boardId/cards` - Tạo thẻ mới
- `PUT /boards/:boardId/cards/:id` - Cập nhật thẻ
- `DELETE /boards/:boardId/cards/:id` - Xóa thẻ

### Tasks
- `GET /boards/:boardId/cards/:id/tasks` - Lấy tất cả nhiệm vụ
- `POST /boards/:boardId/cards/:id/tasks` - Tạo nhiệm vụ mới
- `PUT /boards/:boardId/cards/:id/tasks/:taskId` - Cập nhật nhiệm vụ
- `DELETE /boards/:boardId/cards/:id/tasks/:taskId` - Xóa nhiệm vụ

## Cấu trúc dự án

```
mini-trello-app/
├── frontend/          # React app với Vite
├── backend/           # Express.js server
└── README.md
```

## Tác giả

Mini Trello App - Dự án thực hành React & Node.js