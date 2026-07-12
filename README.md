# AssetFlow - Enterprise Asset Tracking and Resource Management System

AssetFlow is a web application designed to track, allocate, audit, and maintain enterprise assets. It was built as a solution for the Odoo Hackathon 2026. The system supports multi-role access control (Admin, Asset Manager, Department Head, and Employee) to manage the lifecycle of corporate inventory, book shared resources, and request hardware maintenance.

---

## Tech Stack

### Backend
- Runtime: Node.js
- Language: TypeScript
- Framework: Express.js
- ORM: Prisma
- Database: SQLite / PostgreSQL

### Frontend
- Library: React
- Language: TypeScript
- Build Tool: Vite
- Styling: Tailwind CSS
- Router: React Router DOM
- Icons: Lucide React

---

## Key Modules and Features

### 1. Dashboard
Provides high-level metric cards showing total assets, active allocations, open maintenance tickets, upcoming bookings, active audit cycles, and recent notifications. It also features interactive visualization widgets.

### 2. Organization Setup
Allows administration of departments, employees, and asset categories:
- Department Head Assignment: Admin can designate a department head from the active employee directory.
- Role Synchronization: Promoting an employee to a department head automatically updates their system role and demotes the previous department head back to the Employee role (with a confirmation warning in the UI).

### 3. Asset Inventory
The system acts as a central repository for registering and tracking corporate hardware, licenses, and office supplies. It handles custom fields such as serial numbers, locations, purchase costs, and acquisitions.

### 4. Asset Allocation
Admin and Asset Managers can allocate items to departments or individual employees:
- Validation: Ensures the expected return date cannot be set before the allocation date.
- Display: Dates are formatted to dd/mm/yyyy throughout the allocation module.

### 5. Transfer Requests
Allows transferring allocated assets between different employees or departments, complete with approval workflows.

### 6. Resource Booking
Enables scheduling shared assets (e.g. conference rooms, test equipment):
- Overlap Prevention: Confirms timeslots do not conflict on the backend.
- Validation: Ensures booking end times are strictly after the start times.
- Management: Allows editing/rescheduling and cancelling bookings.

### 7. Maintenance Management
Streamlines hardware repair workflows:
- Roles: Employees can submit tickets specifying issue description, priority, and photo URLs. Admin accounts are restricted from raising requests, but maintain global read access to oversee and update the lifecycle of all tickets.
- Workflow: Progression from pending, to approved, to assigning technicians, in-progress, and resolved.

### 8. Asset Audit
Supports structured, periodic verification cycles instead of one-off checks:
- Scopes: Scoped by location, department, or organization-wide.
- Auditors: Assign one or multiple employees as auditors.
- Validation: The audit end date must be on or after the start date.

### 9. Reports & Analytics
Comprehensive dashboards summarizing:
- Most-used and idle assets.
- Maintenance frequencies categorized by individual assets or broader categories.
- Aging assets nearing retirement thresholds.
- Active department allocations.
- Resource Booking Heatmap: Maps peak usage hours across days of the week, with explicit intersection labels.

### 10. Activity Center & Audit Logs
Tracks operations for accountability:
- View More Pagination: Replaces endless lists with pagination, rendering 5 notifications or audit logs initially and revealing 5 more incrementally on demand.
- Header Shortcut: Accessible via the top notifications bell icon.

---

## Project Structure

```
AssetFlow-Odoo-Hackathon-2026/
├── backend/
│   ├── prisma/             # Prisma schema and seeding scripts
│   ├── src/
│   │   ├── controllers/    # Request handlers
│   │   ├── routes/         # Express API endpoints
│   │   ├── utils/          # Activity loggers, validation schemas, error classes
│   │   └── server.ts       # Application entry point
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── src/
│   │   ├── components/    # Reusable UI elements and layouts
│   │   ├── config/        # Sidebar structure configurations
│   │   ├── context/       # Authentication states
│   │   ├── pages/         # Application view components
│   │   └── services/      # Axios API service integrations
│   ├── package.json
│   └── vite.config.ts
└── README.md
```

---

## Setup and Installation

### Prerequisites
- Node.js (version 18 or above recommended)
- npm (Node Package Manager)

### Step 1: Clone the Repository
Clone the project repository to your local machine:
```bash
git clone https://github.com/rupeshv2121/AssetFlow-Odoo-Hackathon-2026.git
cd AssetFlow-Odoo-Hackathon-2026
```

### Step 2: Setup the Backend
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up the environment variables. Create a `.env` file in the root of the backend folder and define your database credentials and port (or default to the pre-configured SQLite file path).
4. Run Prisma database migrations to set up database schemas:
   ```bash
   npx prisma migrate dev
   ```
5. Seed the database with mock roles, users, and assets:
   ```bash
   npm run seed
   ```
6. Start the backend development server:
   ```bash
   npm run dev
   ```
   The backend server should run on port 5000.

### Step 3: Setup the Frontend
1. Navigate to the frontend directory:
   ```bash
   cd ../frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
   The frontend application should run on port 5173 (http://localhost:5173).

---

## Development Notes
- Prisma Client: If you modify the backend `schema.prisma`, run `npx prisma generate` to update the TypeScript client typings.
- Date Validations: All date range checks are enforced on both the backend validator level and the React components before form submissions.
- Styling: Custom solid color configurations for UI actions are loaded globally via `frontend/src/index.css` to maintain theme consistency.
