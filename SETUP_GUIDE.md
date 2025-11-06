# Auth-Guard Setup Guide

Complete guide to set up and run the Auth-Guard authentication system.

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher)
- **npm** or **yarn**
- **MongoDB** (v6 or higher)
- **Git**

## Installation Steps

### 1. Install MongoDB

#### macOS (using Homebrew)
```bash
# Tap the MongoDB formula
brew tap mongodb/brew

# Install MongoDB Community Edition
brew install mongodb-community@7.0

# Start MongoDB service
brew services start mongodb-community@7.0

# Verify MongoDB is running
mongosh --eval "db.version()"
```

#### Ubuntu/Debian
```bash
# Import MongoDB public GPG key
wget -qO - https://www.mongodb.org/static/pgp/server-7.0.asc | sudo apt-key add -

# Create list file
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list

# Update package database
sudo apt-get update

# Install MongoDB
sudo apt-get install -y mongodb-org

# Start MongoDB
sudo systemctl start mongod
sudo systemctl enable mongod
```

#### Windows
1. Download MongoDB Community Server from [MongoDB Download Center](https://www.mongodb.com/try/download/community)
2. Run the installer and follow the installation wizard
3. MongoDB will start automatically as a Windows service

### 2. Clone and Setup Backend

```bash
# Navigate to backend directory
cd Full-Stack/Auth-Guard/backend

# Install dependencies
npm install

# Create .env file (already created, but verify settings)
# Edit .env file with your configuration
nano .env

# Start development server
npm run dev
```

The backend server will start on `http://localhost:5000`

### 3. Setup Frontend

```bash
# Navigate to frontend directory
cd Full-Stack/Auth-Guard/frontend

# Install dependencies
npm install

# Create .env file (already created)
# Verify VITE_API_URL points to backend
nano .env

# Start development server
npm run dev
```

The frontend will start on `http://localhost:5173`

## Environment Configuration

### Backend (.env)

```env
# Server Configuration
NODE_ENV=development
PORT=5000

# Database
MONGODB_URI=mongodb://localhost:27017/auth-guard

# JWT Secrets (Change these in production!)
JWT_ACCESS_SECRET=your-super-secret-access-token-key-change-this-in-production
JWT_REFRESH_SECRET=your-super-secret-refresh-token-key-change-this-in-production

# Frontend URL
FRONTEND_URL=http://localhost:5173

# Email Configuration
EMAIL_HOST=smtp.mailtrap.io
EMAIL_PORT=2525
EMAIL_USER=your-mailtrap-username
EMAIL_PASSWORD=your-mailtrap-password
EMAIL_FROM=noreply@auth-guard.com
```

### Frontend (.env)

```env
VITE_API_URL=http://localhost:5000/api
```

## Email Configuration

For development, we recommend using [Mailtrap](https://mailtrap.io/):

1. Sign up for a free Mailtrap account
2. Create a new inbox
3. Copy the SMTP credentials
4. Update the backend `.env` file with your Mailtrap credentials

For production, use a real email service like:
- SendGrid
- AWS SES
- Mailgun
- Postmark

## Testing the Application

### 1. Verify Backend is Running

```bash
curl http://localhost:5000/health
```

Expected response:
```json
{
  "success": true,
  "message": "Server is running",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### 2. Test User Registration

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test@1234",
    "firstName": "Test",
    "lastName": "User"
  }'
```

### 3. Access Frontend

Open your browser and navigate to `http://localhost:5173`

## Project Structure

```
Auth-Guard/
├── backend/
│   ├── src/
│   │   ├── config/          # Configuration files
│   │   ├── controllers/     # Request handlers
│   │   ├── middleware/      # Express middleware
│   │   ├── models/          # Mongoose models
│   │   ├── routes/          # API routes
│   │   ├── utils/           # Utility functions
│   │   ├── app.ts           # Express app setup
│   │   └── server.ts        # Server entry point
│   ├── .env                 # Environment variables
│   ├── package.json
│   └── tsconfig.json
│
└── frontend/
    ├── src/
    │   ├── components/      # Reusable components
    │   ├── layouts/         # Layout components
    │   ├── pages/           # Page components
    │   ├── router/          # React Router setup
    │   ├── services/        # API services
    │   ├── store/           # State management
    │   └── App.tsx          # Main app component
    ├── .env                 # Environment variables
    ├── package.json
    └── vite.config.ts
```

## Available Scripts

### Backend

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm start` - Start production server

### Frontend

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `POST /api/auth/refresh-token` - Refresh access token
- `GET /api/auth/verify-email/:token` - Verify email
- `POST /api/auth/resend-verification` - Resend verification email
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password/:token` - Reset password
- `POST /api/auth/change-password` - Change password (authenticated)

### User Management
- `GET /api/user/profile` - Get user profile
- `PUT /api/user/profile` - Update user profile
- `GET /api/user/activity` - Get user activity logs
- `DELETE /api/user/account` - Delete user account

### Admin (Admin only)
- `GET /api/admin/users` - Get all users
- `GET /api/admin/users/:userId` - Get user by ID
- `PUT /api/admin/users/:userId/role` - Update user role
- `PUT /api/admin/users/:userId/lock` - Lock/unlock user account
- `DELETE /api/admin/users/:userId` - Delete user
- `GET /api/admin/users/:userId/activity` - Get user activity
- `GET /api/admin/statistics` - Get system statistics

## Features

### Implemented Features

✅ **Authentication**
- User registration with email verification
- Login with JWT tokens (access + refresh)
- Password reset via email
- Change password (authenticated users)
- Logout with token invalidation

✅ **Security**
- Password hashing with bcrypt
- JWT token authentication
- Refresh token rotation
- Rate limiting on sensitive endpoints
- Account locking after failed login attempts
- Email verification required for sensitive operations

✅ **User Management**
- User profile management
- Activity logging
- Account deletion

✅ **Admin Features**
- User management dashboard
- Role management
- Account locking/unlocking
- User activity monitoring
- System statistics

✅ **Frontend**
- Responsive design with Tailwind CSS
- Protected routes
- Role-based access control
- Auto token refresh
- Error handling
- Loading states

### Pending Features (Phase 4)

🔄 **Two-Factor Authentication**
- TOTP-based 2FA
- QR code generation
- Backup codes

🔄 **OAuth Integration**
- Google OAuth
- GitHub OAuth

🔄 **Advanced Features**
- Session management
- Device tracking
- IP-based restrictions

## Troubleshooting

### MongoDB Connection Issues

**Error**: `MongooseServerSelectionError: connect ECONNREFUSED`

**Solution**:
```bash
# Check if MongoDB is running
brew services list | grep mongodb

# Start MongoDB if not running
brew services start mongodb-community@7.0

# Or start manually
mongod --config /usr/local/etc/mongod.conf
```

### Port Already in Use

**Error**: `EADDRINUSE: address already in use :::5000`

**Solution**:
```bash
# Find process using port 5000
lsof -i :5000

# Kill the process
kill -9 <PID>

# Or use a different port in .env
PORT=5001
```

### Email Not Sending

**Issue**: Verification emails not being sent

**Solution**:
1. Verify Mailtrap credentials in `.env`
2. Check Mailtrap inbox for emails
3. Review backend logs for email errors

## Production Deployment

### Backend Deployment

1. **Environment Variables**
   - Set strong JWT secrets
   - Use production MongoDB URI
   - Configure production email service
   - Set NODE_ENV=production

2. **Build**
   ```bash
   npm run build
   ```

3. **Deploy** to platforms like:
   - Heroku
   - AWS EC2
   - DigitalOcean
   - Railway
   - Render

### Frontend Deployment

1. **Build**
   ```bash
   npm run build
   ```

2. **Deploy** to platforms like:
   - Vercel
   - Netlify
   - AWS S3 + CloudFront
   - GitHub Pages

## Security Best Practices

1. **Never commit `.env` files** to version control
2. **Use strong JWT secrets** in production
3. **Enable HTTPS** in production
4. **Implement rate limiting** on all endpoints
5. **Regular security audits** with `npm audit`
6. **Keep dependencies updated**
7. **Use environment-specific configurations**
8. **Implement proper CORS policies**
9. **Enable MongoDB authentication** in production
10. **Regular backups** of database

## Support

For issues or questions:
1. Check the troubleshooting section
2. Review the API documentation
3. Check backend/frontend logs
4. Verify environment configuration

## License

This project is for educational purposes.