# Node.js Backend - Digital Agency ERP

## 🚀 Quick Start

```bash
cd server
npm install
cp .env.example .env
# Edit .env with your database credentials
node helpers/migrate-postgres.js
node helpers/seed-admin.js
npm run dev
```

Server runs on http://localhost:5000

## 🔑 Default Users

- **Admin:** admin@bytez.com / password123
- **Manager:** manager@bytez.com / password123
- **Employee:** employee@bytez.com / password123

## 🛠️ Tech Stack

- Node.js with Express.js
- PostgreSQL (Neon Cloud)
- JWT Authentication
- bcrypt Password Hashing
- Helmet.js Security
- Rate Limiting

## 📁 Project Structure

```
server/
├── config/
│   └── database.js          # PostgreSQL connection
├── controllers/
│   ├── authController.js    # Authentication logic
│   ├── clientController.js  # Client CRUD
│   ├── projectController.js # Project CRUD
│   ├── taskController.js    # Task CRUD
│   ├── dashboardController.js # Analytics
│   └── aiController.js      # AI integration
├── middleware/
│   ├── auth.js              # JWT & RBAC middleware
│   ├── rateLimiter.js       # Rate limiting
│   └── validation.js        # Input validation
├── routes/
│   ├── authRoutes.js
│   ├── clientRoutes.js
│   ├── projectRoutes.js
│   ├── taskRoutes.js
│   ├── dashboardRoutes.js
│   └── aiRoutes.js
├── helpers/
│   ├── migrate-postgres.js  # Database migration
│   └── seed-admin.js        # Seed default users
├── .env
├── .env.example
├── server.js
└── package.json
```

## 🔐 Environment Variables

Create `.env` file:

```env
DATABASE_URL=postgresql://user:password@host/database
JWT_SECRET=your_secret_key_here
JWT_EXPIRE=7d
DB_TYPE=postgres
PORT=5000
NODE_ENV=development
GEMINI_API_KEY=your_gemini_api_key (optional)
```

## 📡 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration

### Clients (Admin only)
- `GET /api/clients` - Get all clients
- `POST /api/clients` - Create client
- `PUT /api/clients/:id` - Update client
- `DELETE /api/clients/:id` - Delete client

### Projects (Admin & Manager)
- `GET /api/projects` - Get all projects
- `POST /api/projects` - Create project
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project

### Tasks (All users)
- `GET /api/tasks` - Get all tasks
- `POST /api/tasks` - Create task (Admin/Manager)
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task (Admin/Manager)

### Dashboard (All users)
- `GET /api/dashboard/stats` - Get dashboard statistics

### AI Tools (All users)
- `POST /api/ai/generate-content` - Generate AI content
- `GET /api/ai/project-insights` - Get project insights

## 🔒 RBAC Implementation

### Middleware Usage

```javascript
const { auth, authorize } = require('./middleware/auth');

// Admin only
router.post('/clients', auth, authorize('Admin'), controller.create);

// Admin & Manager
router.post('/projects', auth, authorize('Admin', 'Manager'), controller.create);

// All authenticated users
router.get('/tasks', auth, controller.getAll);
```

### Role Permissions

| Feature | Admin | Manager | Employee |
|---------|-------|---------|----------|
| Manage Clients | ✅ | ❌ | ❌ |
| Create Projects | ✅ | ✅ | ❌ |
| Assign Tasks | ✅ | ✅ | ❌ |
| View Tasks | ✅ | ✅ | ✅ |
| Update Task Status | ✅ | ✅ | ✅ |
| AI Tools | ✅ | ✅ | ✅ |

## 🗄️ Database Setup

### PostgreSQL (Neon Cloud)

1. Create account at https://neon.tech
2. Create new project
3. Copy connection string
4. Add to `.env` as `DATABASE_URL`

### Run Migrations

```bash
node helpers/migrate-postgres.js
```

Creates tables:
- users
- clients
- projects
- tasks

### Seed Data

```bash
node helpers/seed-admin.js
```

Creates default users (Admin, Manager, Employee)

## 🤖 AI Integration

### Supported APIs

1. **Google Gemini** (Primary - Free)
   - Get key: https://aistudio.google.com/app/apikey
   - Add to `.env`: `GEMINI_API_KEY=your_key`

2. **OpenAI** (Optional)
   - Requires billing setup
   - Add to `.env`: `OPENAI_API_KEY=your_key`

3. **Mock Fallback** (Always available)
   - Works without API key
   - Perfect for testing

### AI Features

- Social Media Captions
- Blog Ideas (5 suggestions)
- Ad Copy
- Project Insights

## 🛡️ Security Features

- ✅ Password hashing (bcrypt)
- ✅ JWT authentication (7-day expiry)
- ✅ Rate limiting (100 req/15min)
- ✅ Helmet.js security headers
- ✅ CORS configuration
- ✅ SQL injection prevention
- ✅ Input validation
- ✅ Role-based access control

## 📦 Dependencies

```json
{
  "express": "^4.x",
  "pg": "^8.x",
  "bcryptjs": "^2.x",
  "jsonwebtoken": "^9.x",
  "helmet": "^7.x",
  "cors": "^2.x",
  "express-rate-limit": "^7.x",
  "dotenv": "^16.x",
  "axios": "^1.x"
}
```

## 🧪 Testing

### Test Authentication
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@bytez.com","password":"admin123"}'
```

### Test Protected Route
```bash
curl -X GET http://localhost:5000/api/clients \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## 🚀 Deployment

### Production Build

```bash
npm install --production
NODE_ENV=production node server.js
```

### Environment Variables (Production)

```env
NODE_ENV=production
DATABASE_URL=your_production_db_url
JWT_SECRET=strong_random_secret
PORT=5000
```

## ✅ Features Implemented

- ✅ RESTful API architecture
- ✅ JWT authentication
- ✅ Role-based authorization
- ✅ PostgreSQL database
- ✅ Error handling middleware
- ✅ Input validation
- ✅ Rate limiting
- ✅ Security headers
- ✅ CORS configuration
- ✅ AI integration
- ✅ Database migrations
- ✅ Seed scripts

## 📚 Additional Resources

- **RBAC_GUIDE.md** - Complete RBAC implementation guide
- **docs/API_DOCUMENTATION.md** - Detailed API documentation
- **docs/ER_DIAGRAM.md** - Database schema
