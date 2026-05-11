# Digital Library Management System (High School)

This project is a role-based library management platform for Ethiopian high schools. It includes:

- student access to reading materials, videos, exercises, and discussion tools
- teacher document/video upload and exercise creation
- librarian textbook registration, circulation, and resource management
- admin user management, system settings, and reporting

## Project structure

- `backend/` — Express.js + Sequelize API server
- `front/` — React + Vite frontend application
- `scripts/dev.cmd` — Windows command to launch frontend and backend in separate terminals

## Setup

### 1. Backend

1. Copy `backend/.env.example` to `backend/.env`
2. Update secrets and database connection values
3. Install dependencies:
   ```bash
   cd backend
   npm install
   ```
4. Start development server:
   ```bash
   npm run dev
   ```

### 2. Frontend

1. Install dependencies:
   ```bash
   cd front
   npm install
   ```
2. Start development server:
   ```bash
   npm run dev
   ```

## Run both apps together

From the project root:

```bash
npm run dev
```

This uses `scripts/dev.cmd` to open the backend and frontend in separate terminal windows.

## Notes

- The backend uses cookie-based JWT authentication.
- The frontend API base URL is configured in `front/src/lib/api.js`.
- Role-based access control is implemented on both frontend routes and backend APIs.

## Improvements made

- Centralized user session hook in `front/src/hooks/useUser.js`
- Signup now redirects directly to the dashboard after account creation
- Added backend `.env.example` for safer environment setup
- Added root `README.md` with install and usage instructions
