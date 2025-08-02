# 🌟 Tour Management System

**Nhóm thực hiện:**
- Sơn Tân - 2201700053
- Lê Công Hoàng Phúc - 2201700083  
- Nguyễn Ngọc Thạch - 2201700077

Một hệ thống quản lý tour du lịch hiện đại được xây dựng với Next.js, GraphQL, và MongoDB, cung cấp trải nghiệm người dùng tuyệt vời cho việc tìm kiếm, đặt tour và quản lý yêu thích.

![Tour Management System](https://via.placeholder.com/800x400/3b82f6/ffffff?text=Tour+Management+System)

## 📋 Mục lục

- [Tính năng chính](#-tính-năng-chính)
- [Công nghệ sử dụng](#-công-nghệ-sử-dụng)
- [Cài đặt](#-cài-đặt)
- [Tài khoản test](#-tài-khoản-test)
- [Cấu trúc dự án](#-cấu-trúc-dự-án)
- [API Documentation](#-api-documentation)
- [Screenshots](#-screenshots)
- [Contributing](#-contributing)

## ✨ Tính năng chính

### 🔐 Authentication & Authorization
- **Đăng ký/Đăng nhập** với email và password
- **JWT Token** authentication
- **Role-based access** (Admin/Client)
- **Protected routes** cho admin và user

### 🎯 Tour Management (Admin)
- **CRUD operations** cho tours
- **Upload multiple images** cho mỗi tour
- **Category management** 
- **Tour status management** (active/inactive)
- **Advanced filtering** và search

### 🌟 Client Features
- **Browse tours** với advanced search và filters
- **Tour detail pages** với đầy đủ thông tin
- **Favorite system** - thêm/xóa tour yêu thích
- **Drag & drop reorder** favorites
- **Real-time sync** favorite status giữa các trang
- **Booking system** với form đặt tour
- **Review system** - đánh giá và comment

### 💖 Advanced Favorite System
- **Heart icon** trên mỗi tour card
- **Favorites page** với list layout
- **Drag & drop reorder** để sắp xếp thứ tự yêu thích
- **Real-time synchronization** giữa tất cả các trang
- **Optimistic updates** cho UX mượt mà

### 📱 User Experience
- **Responsive design** cho mọi thiết bị
- **Modern UI/UX** với Tailwind CSS
- **Loading states** và error handling
- **Image gallery** với modal view
- **Pagination** cho danh sách

## 🚀 Công nghệ sử dụng

### Frontend
- **Next.js 15** - React framework với App Router
- **Apollo Client** - GraphQL client với caching
- **Tailwind CSS** - Utility-first CSS framework
- **React Hooks** - State management
- **Context API** - Global state cho authentication

### Backend
- **Node.js** với Express
- **Apollo Server** - GraphQL server
- **MongoDB** với Mongoose ODM
- **JWT** - Authentication tokens
- **Bcrypt** - Password hashing

### DevOps & Tools
- **Turbopack** - Fast bundler cho development
- **ESLint** - Code linting
- **Git** - Version control

## 🛠 Cài đặt

### Prerequisites
- Node.js 18+
- MongoDB 6+
- npm 

### 1. Clone repository
https://github.com/tannguyen1129/tour
