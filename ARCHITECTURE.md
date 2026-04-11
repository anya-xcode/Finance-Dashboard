# 🏗️ Finance Dashboard — System Architecture

> Comprehensive architectural documentation for the **FinanceX** Premium Financial Audit System, covering use cases, data models, and interaction sequences.

---

## 📋 Table of Contents

1. [Use Case Diagram](#1-use-case-diagram)
2. [ER Diagram](#2-er-diagram)
3. [Sequence Diagrams](#3-sequence-diagrams)
   - [User Registration](#31-user-registration)
   - [User Login & Session Initialization](#32-user-login--session-initialization)
   - [Dashboard Data Loading](#33-dashboard-data-loading)
   - [Financial Record CRUD Operations](#34-financial-record-crud-operations)
   - [Admin User Management](#35-admin-user-management)

---

## 1. Use Case Diagram

This diagram illustrates the interactions between the three user roles (**Admin**, **Analyst**, **Viewer**) and the system's core functionalities.

```mermaid
flowchart LR
    subgraph Actors
        Admin(("🔐 Admin"))
        Analyst(("📊 Analyst"))
        Viewer(("👁️ Viewer"))
    end

    subgraph AuthSystem["Authentication System"]
        UC1["Register Account"]
        UC2["Login"]
        UC3["Logout"]
        UC4["View Profile (GET /me)"]
    end

    subgraph DashboardSystem["Dashboard & Analytics"]
        UC5["View Summary Cards"]
        UC6["View Monthly Trends Chart"]
        UC7["View Category Allocation Chart"]
        UC8["View Recent Activity Log"]
    end

    subgraph RecordSystem["Financial Record Management"]
        UC9["View All Records"]
        UC10["Filter Records (Type / Category)"]
        UC11["Create New Record"]
        UC12["Edit Existing Record"]
        UC13["Delete Record (Soft Delete)"]
        UC14["Export Records to CSV"]
    end

    subgraph UserMgmt["User Administration"]
        UC15["View All Users"]
        UC16["Change User Role"]
        UC17["Activate / Deactivate User"]
    end

    %% --- Actor Connections ---

    %% All roles can authenticate
    Admin --- UC1 & UC2 & UC3 & UC4
    Analyst --- UC1 & UC2 & UC3 & UC4
    Viewer --- UC1 & UC2 & UC3 & UC4

    %% Dashboard access
    Admin --- UC5 & UC6 & UC7 & UC8
    Analyst --- UC5 & UC6 & UC7 & UC8
    Viewer --- UC5

    %% Record access
    Admin --- UC9 & UC10 & UC11 & UC12 & UC13 & UC14
    Analyst --- UC9 & UC10 & UC14
    Viewer --- UC9 & UC10

    %% Admin-only user management
    Admin --- UC15 & UC16 & UC17
```

### Role Permission Summary

| Capability                  | Admin | Analyst | Viewer |
| :-------------------------- | :---: | :-----: | :----: |
| Register / Login / Logout   |  ✅   |   ✅    |   ✅   |
| View Summary Cards          |  ✅   |   ✅    |   ✅   |
| View Charts & Trends        |  ✅   |   ✅    |   ❌   |
| View Recent Activity Log    |  ✅   |   ✅    |   ❌   |
| View Financial Records      |  ✅   |   ✅    |   ✅   |
| Filter Records              |  ✅   |   ✅    |   ✅   |
| Create / Edit / Delete Records |  ✅   |   ❌    |   ❌   |
| Export CSV                  |  ✅   |   ✅    |   ❌   |
| Manage Users & Roles        |  ✅   |   ❌    |   ❌   |

---

## 2. ER Diagram

This Entity-Relationship diagram shows the data models stored in MongoDB and their relationships.

```mermaid
erDiagram
    USER {
        ObjectId _id PK
        String name
        String email UK
        String password
        Enum role "admin | analyst | viewer"
        Boolean isActive
        DateTime createdAt
        DateTime updatedAt
    }

    RECORD {
        ObjectId _id PK
        Number amount
        Enum type "income | expense"
        Enum category "Salary | Freelance | Investment | Rent | Food | Transport | Utilities | Entertainment | Healthcare | Education | Shopping | Other"
        Date date
        String description
        ObjectId createdBy FK
        Boolean isDeleted
        DateTime createdAt
        DateTime updatedAt
    }

    JWT_TOKEN {
        String userId FK
        String email
        String role
        DateTime iat "Issued At"
        DateTime exp "Expiration"
    }

    DASHBOARD_SUMMARY {
        Number totalIncome "Aggregated"
        Number totalExpenses "Aggregated"
        Number netBalance "Computed"
        Number recordCount "Aggregated"
    }

    CATEGORY_TOTAL {
        String category "Grouped by"
        Number total "Sum of amounts"
        Number count "Number of records"
    }

    MONTHLY_TREND {
        String month "YYYY-MM format"
        Number income "Monthly income sum"
        Number expense "Monthly expense sum"
    }

    USER ||--o{ RECORD : "creates"
    USER ||--o| JWT_TOKEN : "authenticates via"
    RECORD }o--|| DASHBOARD_SUMMARY : "aggregates into"
    RECORD }o--|| CATEGORY_TOTAL : "groups into"
    RECORD }o--|| MONTHLY_TREND : "trends into"
```

### MongoDB Indexes

| Collection | Index                             | Purpose                          |
| :--------- | :-------------------------------- | :------------------------------- |
| `users`    | `email` (unique)                  | Fast login lookups               |
| `records`  | `{ type: 1, category: 1, date: -1 }` | Compound filter & sort queries |
| `records`  | `{ isDeleted: 1 }`               | Efficient soft-delete filtering  |

---

## 3. Sequence Diagrams

### 3.1 User Registration

```mermaid
sequenceDiagram
    actor User
    participant Frontend as React Frontend
    participant API as Express API
    participant Validator as Validation Middleware
    participant AuthService as AuthService
    participant UserFactory as UserFactory
    participant UserRepo as UserRepository
    participant MongoDB as MongoDB

    User->>Frontend: Fills registration form (name, email, password)
    Frontend->>Frontend: Client-side validation (password match)
    Frontend->>API: POST /api/auth/register {name, email, password}

    API->>Validator: registerValidation rules
    alt Validation Fails
        Validator-->>API: 400 Validation Error
        API-->>Frontend: {success: false, message: "Validation failed"}
        Frontend-->>User: Display error message
    end

    Validator->>AuthService: register(dto)
    AuthService->>UserRepo: findByEmail(email)
    UserRepo->>MongoDB: db.users.findOne({email})
    MongoDB-->>UserRepo: null (not found)
    UserRepo-->>AuthService: null

    AuthService->>AuthService: bcrypt.hash(password, 10)
    AuthService->>UserFactory: create({...dto, hashedPassword})
    UserFactory-->>AuthService: userData with defaults (role: viewer, isActive: true)

    AuthService->>UserRepo: create(userData)
    UserRepo->>MongoDB: db.users.insertOne(userData)
    MongoDB-->>UserRepo: Created User Document
    UserRepo-->>AuthService: User Document

    AuthService->>AuthService: jwt.sign({userId, email, role})
    AuthService-->>API: {user, token}
    API-->>Frontend: 201 {success: true, data: {user, token}}

    Frontend-->>User: "Registration Successful" → Redirect to /login
```

### 3.2 User Login & Session Initialization

```mermaid
sequenceDiagram
    actor User
    participant Frontend as React Frontend
    participant AuthContext as AuthContext
    participant API as Express API
    participant Validator as Validation Middleware
    participant AuthService as AuthService
    participant UserRepo as UserRepository
    participant MongoDB as MongoDB

    User->>Frontend: Enters email & password
    Frontend->>API: POST /api/auth/login {email, password}

    API->>Validator: loginValidation rules
    Validator->>AuthService: login(dto)

    AuthService->>UserRepo: findByEmail(email)
    UserRepo->>MongoDB: db.users.findOne({email})
    MongoDB-->>UserRepo: User Document
    UserRepo-->>AuthService: User Document

    AuthService->>AuthService: Check user.isActive
    alt Account Deactivated
        AuthService-->>API: 403 "Account is deactivated"
        API-->>Frontend: Error response
        Frontend-->>User: Display error
    end

    AuthService->>AuthService: bcrypt.compare(password, hash)
    alt Invalid Password
        AuthService-->>API: 401 "Invalid email or password"
        API-->>Frontend: Error response
        Frontend-->>User: Display error
    end

    AuthService->>AuthService: jwt.sign({userId, email, role})
    AuthService-->>API: {user, token}
    API-->>Frontend: 200 {success: true, data: {user, token}}

    Frontend->>AuthContext: login(token, user)
    AuthContext->>AuthContext: localStorage.setItem("token", token)
    AuthContext->>AuthContext: setState({user, token})
    Frontend-->>User: Redirect to /dashboard

    Note over Frontend,API: On subsequent page loads:
    Frontend->>API: GET /api/auth/me (Authorization: Bearer token)
    API->>API: authMiddleware → verify JWT
    API->>UserRepo: findById(userId) [Live Role Detection]
    UserRepo->>MongoDB: db.users.findById(userId)
    MongoDB-->>UserRepo: Latest User Document
    UserRepo-->>API: User with current role
    API-->>Frontend: 200 {user data with live role}
```

### 3.3 Dashboard Data Loading

```mermaid
sequenceDiagram
    actor User
    participant Frontend as DashboardPage
    participant AuthContext as AuthContext
    participant API as Express API
    participant AuthMW as authMiddleware
    participant RoleMW as roleMiddleware
    participant DashCtrl as DashboardController
    participant DashSvc as DashboardService
    participant RecordRepo as RecordRepository
    participant MongoDB as MongoDB

    User->>Frontend: Navigate to /dashboard
    Frontend->>AuthContext: Check user role
    AuthContext-->>Frontend: role (admin/analyst/viewer)

    par Parallel API Requests
        Frontend->>API: GET /api/dashboard/summary
        API->>AuthMW: Verify JWT + Live Role Detection
        AuthMW->>RoleMW: Check role in [admin, analyst, viewer]
        RoleMW->>DashCtrl: getSummary()
        DashCtrl->>DashSvc: getSummary()
        DashSvc->>RecordRepo: getSummaryTotals()
        RecordRepo->>MongoDB: aggregate([{$match: {isDeleted: false}}, {$group: {_id: "$type"}}])
        MongoDB-->>RecordRepo: [{_id: "income", total, count}, {_id: "expense", total, count}]
        RecordRepo-->>DashSvc: Aggregation results
        DashSvc-->>DashCtrl: {totalIncome, totalExpenses, netBalance, recordCount}
        DashCtrl-->>Frontend: 200 Summary data
    and
        Frontend->>API: GET /api/dashboard/category-totals
        API->>AuthMW: Verify JWT
        AuthMW->>RoleMW: Check role
        RoleMW->>DashCtrl: getCategoryTotals()
        DashCtrl->>DashSvc: getCategoryTotals()
        DashSvc->>RecordRepo: getCategoryTotals()
        RecordRepo->>MongoDB: aggregate([{$group: {_id: "$category"}}])
        MongoDB-->>Frontend: Category totals
    and
        Frontend->>API: GET /api/dashboard/monthly-trends
        API->>AuthMW: Verify JWT
        AuthMW->>RoleMW: Check role
        RoleMW->>DashCtrl: getMonthlyTrends()
        DashCtrl->>DashSvc: getMonthlyTrends()
        DashSvc->>RecordRepo: getMonthlyTrends()
        RecordRepo->>MongoDB: aggregate([{$group: {_id: {month, type}}}])
        MongoDB-->>Frontend: Monthly trend data
    and
        Frontend->>API: GET /api/dashboard/recent-activity
        API->>AuthMW: Verify JWT
        DashCtrl->>DashSvc: getRecentActivity(10)
        DashSvc->>RecordRepo: getRecentRecords(10)
        RecordRepo->>MongoDB: find({isDeleted: false}).sort({date: -1}).limit(10)
        MongoDB-->>Frontend: Recent 10 records
    end

    Frontend->>Frontend: Render StatCards, AreaChart, PieChart, Activity Table
    Frontend-->>User: Display complete dashboard
```

### 3.4 Financial Record CRUD Operations

```mermaid
sequenceDiagram
    actor Admin
    participant Frontend as RecordsPage
    participant API as Express API
    participant AuthMW as authMiddleware
    participant RoleMW as roleMiddleware
    participant Validator as Validation Middleware
    participant RecordCtrl as RecordController
    participant RecordSvc as RecordService
    participant RecordFactory as RecordFactory
    participant RecordRepo as RecordRepository
    participant MongoDB as MongoDB

    Note over Admin,MongoDB: === CREATE RECORD ===
    Admin->>Frontend: Click "New Record" → Fill form → Submit
    Frontend->>API: POST /api/records {amount, type, category, date, description}
    API->>AuthMW: Verify JWT + Live Role Detection
    AuthMW->>RoleMW: Check role === "admin"
    RoleMW->>Validator: createRecordValidation
    Validator->>RecordCtrl: create(req.body, req.user.userId)
    RecordCtrl->>RecordSvc: createRecord(dto, userId)
    RecordSvc->>RecordFactory: create(dto, userId)
    RecordFactory-->>RecordSvc: Record data with createdBy
    RecordSvc->>RecordRepo: create(recordData)
    RecordRepo->>MongoDB: db.records.insertOne(...)
    MongoDB-->>Frontend: 201 Created record

    Note over Admin,MongoDB: === READ RECORDS ===
    Admin->>Frontend: View Records page / Apply filters
    Frontend->>API: GET /api/records?type=expense&category=Food
    API->>AuthMW: Verify JWT
    RecordCtrl->>RecordSvc: getRecords(filters)
    RecordSvc->>RecordRepo: findFiltered(filters)
    RecordRepo->>MongoDB: find({isDeleted: false, type, category}).sort({date: -1}).paginate()
    MongoDB-->>Frontend: 200 {data: [...records], total, page, totalPages}

    Note over Admin,MongoDB: === UPDATE RECORD ===
    Admin->>Frontend: Click Edit icon → Modify form → Submit
    Frontend->>API: PATCH /api/records/:id {amount, description}
    API->>AuthMW: Verify JWT
    AuthMW->>RoleMW: Check role === "admin"
    RoleMW->>Validator: updateRecordValidation
    Validator->>RecordCtrl: update(id, body)
    RecordCtrl->>RecordSvc: updateRecord(id, updates)
    RecordSvc->>RecordRepo: findById(id)
    RecordRepo->>MongoDB: findById(id)
    MongoDB-->>RecordSvc: Existing record (check !isDeleted)
    RecordSvc->>RecordRepo: updateById(id, updateData)
    RecordRepo->>MongoDB: findByIdAndUpdate(id, updateData)
    MongoDB-->>Frontend: 200 Updated record

    Note over Admin,MongoDB: === SOFT DELETE RECORD ===
    Admin->>Frontend: Click Delete icon → Confirm
    Frontend->>API: DELETE /api/records/:id
    API->>AuthMW: Verify JWT
    AuthMW->>RoleMW: Check role === "admin"
    RecordCtrl->>RecordSvc: deleteRecord(id)
    RecordSvc->>RecordRepo: findById(id)
    RecordRepo->>MongoDB: findById(id)
    MongoDB-->>RecordSvc: Record exists
    RecordSvc->>RecordRepo: softDelete(id)
    RecordRepo->>MongoDB: findByIdAndUpdate(id, {isDeleted: true})
    MongoDB-->>Frontend: 200 "Record deleted successfully"
```

### 3.5 Admin User Management

```mermaid
sequenceDiagram
    actor Admin
    participant Frontend as UsersPage
    participant API as Express API
    participant AuthMW as authMiddleware
    participant RoleMW as roleMiddleware
    participant UserCtrl as UserController
    participant UserSvc as UserService
    participant UserRepo as UserRepository
    participant MongoDB as MongoDB

    Note over Admin,MongoDB: === LIST ALL USERS ===
    Admin->>Frontend: Navigate to /users
    Frontend->>API: GET /api/users
    API->>AuthMW: Verify JWT + Live Role Detection
    AuthMW->>RoleMW: Check role === "admin"
    RoleMW->>UserCtrl: getAll()
    UserCtrl->>UserSvc: getAllUsers()
    UserSvc->>UserRepo: findAll()
    UserRepo->>MongoDB: db.users.find({})
    MongoDB-->>UserRepo: All user documents
    UserRepo-->>Frontend: 200 [{id, name, email, role, isActive}, ...]
    Frontend-->>Admin: Render users table with role badges

    Note over Admin,MongoDB: === CHANGE USER ROLE ===
    Admin->>Frontend: Click role button (e.g., "analyst" → "admin")
    Frontend->>API: PATCH /api/users/:id {role: "admin"}
    API->>AuthMW: Verify JWT
    AuthMW->>RoleMW: Check role === "admin"
    RoleMW->>UserCtrl: update(id, {role})
    UserCtrl->>UserSvc: updateUser(id, {role})
    UserSvc->>UserRepo: updateById(id, {role: "admin"})
    UserRepo->>MongoDB: findByIdAndUpdate(id, {role: "admin"})
    MongoDB-->>Frontend: 200 Updated user

    Note right of AuthMW: Live Role Detection ensures<br/>the target user's next API call<br/>will use their new role instantly

    Note over Admin,MongoDB: === TOGGLE USER ACTIVE STATUS ===
    Admin->>Frontend: Click "ACTIVE" / "OFFLINE" badge
    Frontend->>API: PATCH /api/users/:id {isActive: false}
    API->>AuthMW: Verify JWT
    AuthMW->>RoleMW: Check role === "admin"
    RoleMW->>UserCtrl: update(id, {isActive: false})
    UserCtrl->>UserSvc: updateUser(id, {isActive: false})
    UserSvc->>UserRepo: updateById(id, {isActive: false})
    UserRepo->>MongoDB: findByIdAndUpdate(id, {isActive: false})
    MongoDB-->>Frontend: 200 User deactivated

    Note right of AuthMW: Deactivated user's next request<br/>will be blocked by authMiddleware<br/>(Live Role Detection check)
```

---

## 🧱 System Architecture Overview

```mermaid
flowchart TB
    subgraph Client["Frontend (React + Vite)"]
        direction TB
        Browser["Browser"]
        Pages["Pages<br/>(Login, Register, Dashboard, Records, Users)"]
        Components["Components<br/>(Navbar, ProtectedRoute)"]
        Context["AuthContext<br/>(State Management)"]
        AxiosClient["Axios API Client<br/>(JWT Interceptor)"]
    end

    subgraph Server["Backend (Node.js + Express + TypeScript)"]
        direction TB
        Middleware["Middleware Layer<br/>(CORS, JSON Parser, Auth, Role, Validation)"]
        Routes["Route Layer<br/>(/api/auth, /api/users, /api/records, /api/dashboard)"]
        Controllers["Controller Layer<br/>(AuthController, UserController, RecordController, DashboardController)"]
        Services["Service Layer<br/>(AuthService, UserService, RecordService, DashboardService)"]
        Factories["Factory Layer<br/>(UserFactory, RecordFactory)"]
        Repositories["Repository Layer<br/>(BaseRepository, UserRepository, RecordRepository)"]
    end

    subgraph Database["Database (MongoDB Atlas)"]
        UsersCollection["users Collection"]
        RecordsCollection["records Collection"]
    end

    Browser --> Pages --> Components --> Context --> AxiosClient
    AxiosClient -->|"HTTP + Bearer Token"| Middleware
    Middleware --> Routes --> Controllers --> Services --> Repositories
    Services --> Factories
    Repositories -->|"Mongoose ODM"| UsersCollection & RecordsCollection
```

---

> **Note:** All diagrams reflect the current implementation. The system follows a strict **Repository → Service → Controller** layered architecture with JWT-based authentication and **Live Role Detection** for real-time permission enforcement.
