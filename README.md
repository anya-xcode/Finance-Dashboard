# Finance Dashboard — Premium Financial Audit System

A state-of-the-art, role-based finance management application built with a modern tech stack and premium aesthetics. Featuring real-time analytics, glassmorphic design, and the "Live Role Detection" security protocol.

![Lucide-React](https://img.shields.io/badge/UI-Lucide--React-00d1b3?style=for-the-badge)
![TypeScript](https://img.shields.io/badge/TypeScript-007acc?style=for-the-badge)
![MongoDB](https://img.shields.io/badge/Database-MongoDB-47A248?style=for-the-badge)
![Express](https://img.shields.io/badge/Server-Express-000000?style=for-the-badge)

## ✨ Features

*   **Premium Glassmorphism**: High-blur, translucent UI components with vibrant gradients for a top-tier look.
*   **Role-Based Access Control (RBAC)**: Supports **Admin**, **Analyst**, and **Viewer** roles with distinct permissions.
*   **Live Role Detection**: Proprietary middleware that refreshes user permissions in real-time derived directly from the database—no stale JWT role issues.
*   **Localized Finance**: Full support for Indian Rupee (**₹**) and localized date formats.
*   **Audit Logic**: Complete CRUD (Create, Read, Update, Delete) for financial records with soft-delete capabilities.
*   **Visual Analytics**: Real-time dashboard summaries for Net Balance, Monthly Trends, and Category Totals.

---

## 🛠 Tech Stack

### Frontend
- **Framework**: React 18 with Vite
- **Styling**: TailwindCSS + Custom Glassmorphism CSS
- **Animations**: Framer Motion
- **Icons**: Lucide-React
- **State Management**: React Context API (AuthContext)
- **API Client**: Axios

### Backend
- **Framework**: Node.js + Express + TypeScript
- **Database**: MongoDB (Mongoose ODM)
- **Security**: JWT (Json Web Token) + Bcrypt hashing
- **Validation**: Express-Validator
- **Pattern**: Repository & Service pattern for clean separation of concerns

---

## 🚀 Setup & Installation

### 1. Prerequisites
- Node.js (v16 or higher)
- MongoDB (Local or Atlas)

### 2. Backend Setup
1. Navigate to the `backend` directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file based on the environment variables needed:
   ```bash
   PORT=5000
   MONGODB_URI=your_mongodb_uri
   JWT_SECRET=your_jwt_secret
   JWT_EXPIRES_IN=7d
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```

### 3. Frontend Setup
1. Navigate to the `frontend` directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Vite dev server:
   ```bash
   npm run dev
   ```

---

## 🔒 Security Protocols

### Live Role Detection
The application uses a custom `authMiddleware` that doesn't just trust the role encoded in the JWT token. For each incoming request, it cross-references the User ID with the database to ensure the user's role is still valid and their account is active. This eliminates the need for manual logout/login cycles after administrative permissions are updated.

---

## 👤 Role Definitions

| Role | Permissions |
| :--- | :--- |
| **Admin** | Create, Update, Delete Records, Access Ledger & Users, View Dashboard |
| **Analyst** | Access Ledger, View Dashboard & Analytics |
| **Viewer** | View Dashboard (Summary only) |

---

## ⚙️ Maintenance & Updates
The project follows a strict **Repository/Service** pattern in the backend to ensure scalability and ease of adding new data features. For any UI updates, utilize the standardized glassmorph tokens in `index.css`.
