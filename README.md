<div align="center">

# 🔐 Auth-Guard

### 🛡️ Enterprise-Grade Authentication System

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Express](https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)

🔒 **Secure authentication** • 👥 **User management** • 🔑 **JWT tokens** • 📧 **Email verification**

[Features](#-features) • [Demo](#-demo) • [Installation](#-installation) • [Documentation](#-documentation) • [Tech Stack](#-tech-stack)

</div>

---

## ✨ Features

<table>
<tr>
<td width="50%">

### 🔐 Core Authentication
- 📝 User registration
- 🔑 Secure login (JWT)
- 🔄 Token refresh mechanism
- 📧 Email verification
- 🔒 Password reset
- 🚪 Logout with invalidation
- ⚡ Auto token refresh

</td>
<td width="50%">

### 🛡️ Security Features
- 🔐 Bcrypt password hashing
- 🎫 JWT authentication
- 🔄 Refresh token rotation
- ⏱️ Rate limiting
- 🔒 Account locking
- 🛡️ CORS protection
- 🪖 Helmet security headers

</td>
</tr>
<tr>
<td width="50%">

### 👤 User Management
- 👤 Profile management
- 📊 Activity logging
- 🗑️ Account deletion
- 🎭 Role-based access (RBAC)
- 📍 IP tracking
- 🖥️ User agent tracking

</td>
<td width="50%">

### 👨‍💼 Admin Features
- 📊 User management dashboard
- 🔍 Search & pagination
- 🎭 Role assignment
- 🔒 Lock/unlock accounts
- 🗑️ User deletion
- 📈 System statistics
- 📝 Activity logs

</td>
</tr>
</table>

---

## 🎬 Demo

<div align="center">

### 🖥️ Screenshots

| Login Page | User Dashboard | Admin Panel |
|:----------:|:--------------:|:-----------:|
| ![Login](https://via.placeholder.com/250x150/4CAF50/FFFFFF?text=Login+Page) | ![Dashboard](https://via.placeholder.com/250x150/2196F3/FFFFFF?text=User+Dashboard) | ![Admin](https://via.placeholder.com/250x150/FF9800/FFFFFF?text=Admin+Panel) |

</div>

---

## 🚀 Quick Start

### 📋 Prerequisites

```bash
Node.js 18+  ✅
MongoDB 6+   ✅
npm/yarn     ✅
```

### ⚡ Installation

```bash
# 1️⃣ Clone the repository
git clone https://github.com/yourusername/auth-guard.git
cd auth-guard

# 2️⃣ Setup Backend
cd backend
npm install
cp .env.example .env
# Edit .env with your configuration
npm run dev

# 3️⃣ Setup Frontend
cd ../frontend
npm install
cp .env.example .env
npm run dev
```

### 🌐 Access Application

- 🎨 **Frontend**: http://localhost:5173
- ⚙️ **Backend API**: http://localhost:5000
- 💚 **Health Check**: http://localhost:5000/health

---

## 💻 Tech Stack

<div align="center">

### Backend 🔧

![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Express](https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=JSON%20web%20tokens&logoColor=white)
![Bcrypt](https://img.shields.io/badge/Bcrypt-003A70?style=for-the-badge&logo=letsencrypt&logoColor=white)

### Frontend 🎨

![React](https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Zustand](https://img.shields.io/badge/Zustand-000000?style=for-the-badge&logo=react&logoColor=white)

</div>

---

## 📁 Project Structure

```
🔐 Auth-Guard/
├── 📂 backend/                 # Backend API
│   ├── 📂 src/
│   │   ├── ⚙️ config/         # Configuration
│   │   ├── 🎮 controllers/    # Controllers
│   │   ├── 🗄️ models/         # Database models
│   │   ├── 🛣️ routes/         # API routes
│   │   ├── 🔒 middleware/     # Middleware
│   │   └── 🛠️ utils/          # Utilities
│   └── 📦 package.json
│
├── 📂 frontend/               # React Frontend
│   ├── 📂 src/
│   │   ├── 🧩 components/    # Components
│   │   ├── 📄 pages/         # Pages
│   │   ├── 🛣️ router/        # Routing
│   │   ├── 🌐 services/      # API services
│   │   ├── 💾 store/         # State management
│   │   └── 📝 types/         # TypeScript types
│   └── 📦 package.json
│
├── 📚 SETUP_GUIDE.md         # Setup guide
├── 📖 API_REFERENCE.md       # API documentation
└── 📄 README.md              # This file
```

---

## 🎯 Key Features in Detail

### 🔐 Authentication Flow
- 🔑 JWT-based authentication
- 🎫 Access & refresh tokens
- 🔄 Automatic token refresh
- 📧 Email verification required
- 🔒 Secure password reset
- 🚪 Clean logout process

### 🛡️ Security Measures
- 🔐 Password hashing (bcrypt, 10 rounds)
- 🎫 JWT token expiration
- 🔄 Refresh token rotation
- ⏱️ Rate limiting (5 req/15min)
- 🔒 Account locking (5 failed attempts)
- 🛡️ CORS & Helmet protection
- ✅ Input validation & sanitization

### 👥 User Management
- 👤 Profile CRUD operations
- 📊 Activity tracking
- 📍 IP address logging
- 🖥️ User agent tracking
- 🎭 Role-based permissions
- 🗑️ Account deletion

### 👨‍💼 Admin Dashboard
- 📊 User statistics
- 🔍 Advanced search
- 📄 Pagination support
- 🎭 Role management
- 🔒 Account control
- 📝 Activity monitoring

---

## 🔒 Security Features

### 🔑 Password Requirements
- ✅ Minimum 8 characters
- ✅ One uppercase letter
- ✅ One lowercase letter
- ✅ One number
- ✅ One special character (@$!%*?&)

### ⏱️ Rate Limiting
- 🌐 General API: 100 req/15min
- 🔐 Auth endpoints: 5 req/15min
- 🔒 Password reset: 3 req/hour
- 📧 Email verification: 3 req/hour

### 🛡️ Account Security
- 🔒 Auto-lock after 5 failed attempts
- ⏰ Lock duration: 2 hours
- 🔐 Bcrypt hashing (10 rounds)
- 🎫 JWT token expiration
- 🔄 Refresh token rotation

---

## 📚 API Documentation

### 🔐 Authentication Endpoints

```http
POST   /api/auth/register          # Register new user
POST   /api/auth/login             # Login user
POST   /api/auth/logout            # Logout user
POST   /api/auth/refresh-token     # Refresh access token
POST   /api/auth/forgot-password   # Request password reset
POST   /api/auth/reset-password    # Reset password
POST   /api/auth/verify-email      # Verify email address
```

### 👤 User Endpoints

```http
GET    /api/users/me               # Get current user
PATCH  /api/users/me               # Update profile
PATCH  /api/users/update-password  # Change password
DELETE /api/users/me               # Delete account
GET    /api/users/activity         # Get activity log
```

### 👨‍💼 Admin Endpoints

```http
GET    /api/admin/users            # Get all users
GET    /api/admin/users/:id        # Get user by ID
PATCH  /api/admin/users/:id/role   # Update user role
PATCH  /api/admin/users/:id/lock   # Lock/unlock account
DELETE /api/admin/users/:id        # Delete user
GET    /api/admin/statistics       # Get system stats
```

For complete API documentation, see [API_REFERENCE.md](./API_REFERENCE.md)

---

## 🧪 Testing

```bash
# 🔬 Run backend tests
cd backend
npm test                    # Run all tests
npm run test:watch         # Watch mode
npm run test:coverage      # Coverage report

# 🎨 Run frontend tests
cd frontend
npm test                    # Run all tests
npm run test:ui            # UI mode
npm run test:coverage      # Coverage report
```

---

## 📝 Environment Variables

### Backend Configuration

```env
# Server
NODE_ENV=development
PORT=5000

# Database
MONGODB_URI=mongodb://localhost:27017/auth-guard

# JWT
JWT_ACCESS_SECRET=your-access-secret-key
JWT_REFRESH_SECRET=your-refresh-secret-key
JWT_ACCESS_EXPIRE=15m
JWT_REFRESH_EXPIRE=7d

# Frontend
FRONTEND_URL=http://localhost:5173

# Email
EMAIL_HOST=smtp.mailtrap.io
EMAIL_PORT=2525
EMAIL_USER=your-email-user
EMAIL_PASSWORD=your-email-password
EMAIL_FROM=noreply@auth-guard.com
```

### Frontend Configuration

```env
VITE_API_URL=http://localhost:5000/api
```

---

## 🚀 Deployment

### 🌐 Deployment Options

- ☁️ **Backend**: Railway, Heroku, Render, AWS
- 🎨 **Frontend**: Vercel, Netlify, AWS S3
- 🗄️ **Database**: MongoDB Atlas, AWS DocumentDB

### 📦 Build for Production

```bash
# Backend
cd backend
npm run build
npm start

# Frontend
cd frontend
npm run build
npm run preview
```

---

## 🤝 Contributing

We welcome contributions! 🎉

1. 🍴 Fork the repository
2. 🌿 Create feature branch (`git checkout -b feature/amazing`)
3. 💾 Commit changes (`git commit -m 'Add amazing feature'`)
4. 📤 Push to branch (`git push origin feature/amazing`)
5. 🔀 Open Pull Request

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Author

**Your Name**
- 🌐 Website: [yourwebsite.com](https://yourwebsite.com)
- 💼 LinkedIn: [linkedin.com/in/yourprofile](https://linkedin.com/in/yourprofile)
- 🐙 GitHub: [@yourusername](https://github.com/yourusername)
- 📧 Email: your.email@example.com

---

## 🙏 Acknowledgments

- 💙 React Team for the amazing framework
- ⚡ Express Team for the web framework
- 🍃 MongoDB Team for the database
- 🔐 JWT Team for authentication
- 🎨 Tailwind CSS for beautiful styling

---

## 📈 Project Stats

![GitHub stars](https://img.shields.io/github/stars/yourusername/auth-guard?style=social)
![GitHub forks](https://img.shields.io/github/forks/yourusername/auth-guard?style=social)
![GitHub issues](https://img.shields.io/github/issues/yourusername/auth-guard)
![GitHub pull requests](https://img.shields.io/github/issues-pr/yourusername/auth-guard)

---

<div align="center">

### 🌟 Star this repo if you find it helpful!

**Made with ❤️ and ☕**

**Version**: 1.0.0 | **Status**: ✅ Production Ready

[⬆ Back to Top](#-auth-guard)

</div>