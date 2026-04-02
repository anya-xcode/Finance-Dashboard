# Finance Dashboard — Backend

A TypeScript + Express + MongoDB backend for managing financial records with role-based access control.

## Architecture

```
Routes → Middleware → Controllers → Services → Repositories → MongoDB
```

### Design Patterns Used

| Pattern       | Location                    | Purpose                                |
|---------------|----------------------------|----------------------------------------|
| **Singleton** | `database.ts`              | Single DB connection instance          |
| **Repository**| `repositories/`            | Abstracts database queries             |
| **Service**   | `services/`                | Business logic layer                   |
| **Factory**   | `factories/`               | Object creation with defaults          |
| **Strategy**  | `middleware/roleMiddleware` | Flexible role-based access control     |

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Set up environment variables
cp .env.example .env
# Edit .env with your MongoDB URI

# 3. Seed the database with sample data
npm run seed

# 4. Start the dev server
npm run dev
```

## Default Login Credentials

| Role    | Email                 | Password    |
|---------|-----------------------|-------------|
| Admin   | admin@example.com     | admin123    |
| Analyst | analyst@example.com   | analyst123  |
| Viewer  | viewer@example.com    | viewer123   |

## API Endpoints

### Auth (`/api/auth`)
| Method | Endpoint    | Access | Description          |
|--------|-------------|--------|----------------------|
| POST   | `/register` | Public | Register new user    |
| POST   | `/login`    | Public | Login, returns JWT   |
| GET    | `/me`       | Auth   | Get current user     |

### Users (`/api/users`) — Admin Only
| Method | Endpoint | Access | Description            |
|--------|----------|--------|------------------------|
| GET    | `/`      | Admin  | List all users         |
| GET    | `/:id`   | Admin  | Get single user        |
| PATCH  | `/:id`   | Admin  | Update user role/status|
| DELETE | `/:id`   | Admin  | Deactivate user        |

### Records (`/api/records`)
| Method | Endpoint | Access | Description                  |
|--------|----------|--------|------------------------------|
| POST   | `/`      | Admin  | Create a record              |
| GET    | `/`      | Auth   | List records (with filters)  |
| GET    | `/:id`   | Auth   | Get single record            |
| PATCH  | `/:id`   | Admin  | Update a record              |
| DELETE | `/:id`   | Admin  | Soft-delete a record         |

**Query filters:** `?type=income&category=Salary&startDate=2026-01-01&endDate=2026-03-31&page=1&limit=20`

### Dashboard (`/api/dashboard`)
| Method | Endpoint           | Access         | Description                   |
|--------|--------------------|----------------|-------------------------------|
| GET    | `/summary`         | Analyst, Admin | Total income, expenses, net   |
| GET    | `/category-totals` | Analyst, Admin | Grouped by category           |
| GET    | `/monthly-trends`  | Analyst, Admin | Monthly income/expense trends |
| GET    | `/recent-activity` | Auth           | Last 10 records               |

## Role Permissions

| Action              | Viewer | Analyst | Admin |
|---------------------|--------|---------|-------|
| View records        | ✅     | ✅      | ✅    |
| View recent activity| ✅     | ✅      | ✅    |
| View analytics      | ❌     | ✅      | ✅    |
| Create/edit records | ❌     | ❌      | ✅    |
| Manage users        | ❌     | ❌      | ✅    |
