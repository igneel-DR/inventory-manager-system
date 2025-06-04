# 📦 Inventory Management System

<div align="center">

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg?cacheSeconds=2592000)
![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)
![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)
![React](https://img.shields.io/badge/react-19.0.0-blue.svg)

**A comprehensive inventory management solution for efficient stock tracking, supplier management, and business analytics.**

[Demo](#) · [Documentation](#) · [Report Bug](#) · [Request Feature](#)

</div>

---

## 🌟 Overview

Transform your inventory management with this cutting-edge solution that combines modern web technologies with intelligent automation. Built for businesses of all sizes, from small retailers to large enterprises.

### ✨ Key Highlights

- 🚀 **Modern Tech Stack** - Built with React 19 and Node.js
- 🤖 **AI-Powered Queries** - Natural language inventory search
- 📊 **Real-time Analytics** - Live dashboards and insights
- 📱 **Mobile Responsive** - Works seamlessly on all devices
- 🔒 **Enterprise Security** - JWT authentication and role-based access
- ⚡ **Lightning Fast** - Optimized performance with Vite

---

## 🎯 Features

<table>
<tr>
<td width="50%">

### 🔐 **Authentication & Security**
- Secure user registration and login
- JWT-based authentication
- Role-based access control
- Session management

### 📦 **Product Management**
- Complete product lifecycle management
- Advanced search and filtering
- Bulk operations support
- Product categorization

### 🏷️ **Category Organization**
- Hierarchical category structure
- Custom category creation
- Category-based reporting
- Easy reorganization

</td>
<td width="50%">

### 🤝 **Supplier Management**
- Comprehensive supplier profiles
- Performance tracking
- Contact management
- Purchase history

### 📊 **Stock Movement Tracking**
- Real-time stock updates
- Movement history
- Automated calculations
- Transfer management

### 🚨 **Smart Alerts**
- Low stock notifications
- Reorder point alerts
- Expiry date warnings
- Custom alert rules

</td>
</tr>
</table>

### 🧠 **AI-Powered Features**
- 💬 **Natural Language Queries** - Ask questions like "Show me products with low stock"
- 📈 **Predictive Analytics** - AI-driven demand forecasting
- 🔍 **Smart Search** - Intelligent product discovery
- 📋 **Automated Reports** - AI-generated insights and recommendations

---

## 🛠️ Tech Stack

<div align="center">

### Frontend Technologies
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)

### Backend Technologies
[![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express.js-404D59?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![JWT](https://img.shields.io/badge/JWT-black?style=for-the-badge&logo=JSON%20web%20tokens)](https://jwt.io/)

### Development Tools
[![Git](https://img.shields.io/badge/Git-F05032?style=for-the-badge&logo=git&logoColor=white)](https://git-scm.com/)
[![ESLint](https://img.shields.io/badge/ESLint-4B3263?style=for-the-badge&logo=eslint&logoColor=white)](https://eslint.org/)
[![Prettier](https://img.shields.io/badge/Prettier-F7B93E?style=for-the-badge&logo=prettier&logoColor=black)](https://prettier.io/)

</div>

### 🎨 UI Components & Visualization
- **Radix UI** - Accessible component primitives
- **Recharts** - Beautiful data visualization
- **React Router DOM** - Client-side routing
- **Axios** - HTTP client for API calls

---

## 🚀 Quick Start

### 📋 Prerequisites

Before you begin, ensure you have the following installed:

```bash
node --version  # v18.0.0 or higher
npm --version   # v8.0.0 or higher
mongod --version # MongoDB 5.0 or higher
```

### ⚡ Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/igneel-DR/inventory-manager-system.git
   cd inventory-manager-system
   ```

2. **Backend Setup**
   ```bash
   cd backend
   npm install
   ```

3. **Frontend Setup**
   ```bash
   cd ../frontend
   npm install
   ```

4. **Environment Configuration**

   **Backend (.env)**
   ```env
   PORT=5001
   MONGODB_URI=mongodb://localhost:27017/inventory
   JWT_SECRET=your_super_secret_jwt_key_here
   JWT_EXPIRE=30d
   AI_API_KEY=your_ai_api_key_here
   AI_API_ENDPOINT=https://api.deepseek.com
   AI_MODEL=deepseek-coder
   NODE_ENV=development
   ```

   **Frontend (.env)**
   ```env
   VITE_API_URL=http://localhost:5001/api
   ```

5. **Launch the Application**
   ```bash
   # Terminal 1 - Backend
   cd backend && npm run dev
   
   # Terminal 2 - Frontend
   cd frontend && npm run dev
   ```

6. **Open Your Browser**
   Navigate to `http://localhost:5173` 🎉

---

## 📚 API Documentation

<details>
<summary><strong>🔐 Authentication Endpoints</strong></summary>

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/auth/register` | Register new user |
| `POST` | `/api/auth/login` | User login |
| `GET` | `/api/auth/profile` | Get user profile |

</details>

<details>
<summary><strong>📦 Product Management</strong></summary>

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/products` | Get all products |
| `POST` | `/api/products` | Create new product |
| `GET` | `/api/products/:id` | Get single product |
| `PUT` | `/api/products/:id` | Update product |
| `DELETE` | `/api/products/:id` | Delete product |

</details>

<details>
<summary><strong>🏷️ Category Management</strong></summary>

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/categories` | Get all categories |
| `POST` | `/api/categories` | Create new category |
| `GET` | `/api/categories/:id` | Get single category |
| `PUT` | `/api/categories/:id` | Update category |
| `DELETE` | `/api/categories/:id` | Delete category |

</details>

<details>
<summary><strong>🤝 Supplier Management</strong></summary>

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/suppliers` | Get all suppliers |
| `POST` | `/api/suppliers` | Create new supplier |
| `GET` | `/api/suppliers/:id` | Get single supplier |
| `PUT` | `/api/suppliers/:id` | Update supplier |
| `DELETE` | `/api/suppliers/:id` | Delete supplier |

</details>

<details>
<summary><strong>📊 Analytics & Reports</strong></summary>

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/reports/inventory` | Inventory reports |
| `GET` | `/api/reports/movements` | Stock movement reports |
| `GET` | `/api/dashboard/summary` | Dashboard summary |
| `GET` | `/api/dashboard/low-stock` | Low stock alerts |

</details>

<details>
<summary><strong>🤖 AI-Powered Features</strong></summary>

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/chat/query` | Natural language query |
| `GET` | `/api/chat/history` | Query history |
| `DELETE` | `/api/chat/history` | Clear history |

</details>

---

## 🎨 Screenshots

<div align="center">

### 📊 Dashboard Overview
![Dashboard](https://via.placeholder.com/800x400/4F46E5/FFFFFF?text=Dashboard+Preview)

### 📦 Product Management
![Products](https://via.placeholder.com/800x400/059669/FFFFFF?text=Product+Management)

### 📈 Analytics & Reports
![Analytics](https://via.placeholder.com/800x400/DC2626/FFFFFF?text=Analytics+%26+Reports)

</div>

---

## 🔧 Configuration

### Database Configuration
```javascript
// MongoDB connection options
const mongoOptions = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
}
```

### JWT Configuration
```javascript
// JWT settings
const jwtConfig = {
  secret: process.env.JWT_SECRET,
  expiresIn: '30d',
  issuer: 'inventory-manager-system',
  audience: 'inventory-users'
}
```

---

## 🤝 Contributing

We welcome contributions! Here's how you can help:

1. **Fork the Project**
2. **Create your Feature Branch** (`git checkout -b feature/AmazingFeature`)
3. **Commit your Changes** (`git commit -m 'Add some AmazingFeature'`)
4. **Push to the Branch** (`git push origin feature/AmazingFeature`)
5. **Open a Pull Request**

### 📝 Development Guidelines

- Follow the existing code style
- Write clear commit messages
- Add tests for new features
- Update documentation as needed

---

## 📊 Project Status

<div align="center">

![GitHub last commit](https://img.shields.io/github/last-commit/igneel-DR/inventory-manager-system)
![GitHub issues](https://img.shields.io/github/issues/igneel-DR/inventory-manager-system)
![GitHub pull requests](https://img.shields.io/github/issues-pr/igneel-DR/inventory-manager-system)
![GitHub stars](https://img.shields.io/github/stars/igneel-DR/inventory-manager-system)

</div>

### 🎯 Roadmap
- [ ] 🔔 Push Notifications
- [ ] 📈 Advanced Analytics
- [ ] 🌍 Multi-language Support
- [ ] 📊 Excel Import/Export
- [ ] 🔄 Real-time Sync
- [ ] 🤖 Advanced AI Features
---

## 👨‍💻 Author

**Hicham El Farouki**

[![GitHub](https://img.shields.io/badge/GitHub-100000?style=for-the-badge&logo=github&logoColor=white)](https://github.com/igneel-DR)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-0077B5?style=for-the-badge&logo=linkedin&logoColor=white)](https://linkedin.com/in/hicham-el-farouki)
[![Email](https://img.shields.io/badge/Email-D14836?style=for-the-badge&logo=gmail&logoColor=white)](elfarouki.hicham08@gmail.com)

---

## 🙏 Acknowledgments

- Thanks to all contributors who have helped shape this project
- Inspired by modern inventory management best practices
- Built with love using open-source technologies

---

<div align="center">

**⭐ If you find this project helpful, please give it a star! ⭐**

Made with ❤️ by [Hicham El Farouki](https://github.com/igneel-DR)

</div>