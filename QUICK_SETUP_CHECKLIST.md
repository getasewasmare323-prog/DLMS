# Quick Setup Checklist ✓

## Admin Activity Logging System - Implementation Checklist

### Files Already Created ✅

- [x] `backend/models/activitylog.js` - ActivityLog database model
- [x] `backend/middleware/activityLogger.js` - Logging middleware
- [x] `backend/controllers/reportController.js` - Report endpoints
- [x] `backend/migrations/20260521000000-create-activity-log.js` - Database migration
- [x] `ACTIVITY_LOGGING_SETUP.md` - Complete setup guide
- [x] `ACTIVITY_LOGGING_EXAMPLES.js` - Practical code examples

### Files Already Updated ✅

- [x] `backend/routers/adminRouter.js` - Added 5 new report routes

---

## Your Todo List

### 1. Install Dependency

```bash
cd backend
npm install json2csv
```

**Why:** Needed to export activity logs as CSV files

### 2. Update app.js (Add Logging Middleware)

Find line ~37 (after cookieParser middleware) and add:

```javascript
const { attachLogger } = require("./middleware/activityLogger");
app.use(attachLogger);
```

**Why:** Makes `req.logActivity()` available in all routes

### 3. Run Database Migration

```bash
npx sequelize-cli db:migrate
```

**Why:** Creates the ActivityLogs table in your database

### 4. Test the Endpoints

Start your backend and test these endpoints:

```
GET http://localhost:YOUR_PORT/admin/reports/activity-summary
GET http://localhost:YOUR_PORT/admin/reports/system
```

### 5. (Optional) Add Logging to Existing Controllers

Update your controllers to log activities:

- `authController.js` - Log login/logout
- `resourceController.js` - Log create/update/delete resource
- `userController.js` - Log role changes
- `borrowController.js` - Log borrow transactions
- `exerciseController.js` - Log exercise submissions

**See `ACTIVITY_LOGGING_EXAMPLES.js` for code samples**

---

## API Routes Available

Once setup is complete, you'll have these admin endpoints:

| Endpoint                              | Purpose                     | Query Params                                                |
| ------------------------------------- | --------------------------- | ----------------------------------------------------------- |
| `GET /admin/reports/activity-logs`    | View all logs               | userId, action, category, startDate, endDate, limit, offset |
| `GET /admin/reports/user/:userId`     | User's activity report      | startDate, endDate                                          |
| `GET /admin/reports/activity-summary` | System activity summary     | startDate, endDate                                          |
| `GET /admin/reports/system`           | Comprehensive system report | startDate, endDate                                          |
| `GET /admin/reports/export-logs`      | Export as CSV               | userId, category, startDate, endDate                        |

---

## What Gets Logged?

The system automatically captures:

- ✅ User ID
- ✅ Action type (CREATE, READ, UPDATE, DELETE, LOGIN, LOGOUT, DOWNLOAD, UPLOAD)
- ✅ Category (USER, RESOURCE, BORROW, EXERCISE, ADMIN)
- ✅ Resource ID (if applicable)
- ✅ IP Address
- ✅ User Agent (browser/device info)
- ✅ Timestamp
- ✅ Success/Failure status
- ✅ Custom details (JSON)

---

## Next Steps After Setup

### Create Admin Dashboard

Build a frontend page to display:

- Recent activity logs
- User activity charts
- System statistics
- Export functionality

### Add Logging to All Key Actions

Gradually add `logActivity()` calls to:

- User authentication
- Resource management
- Borrowing transactions
- User role changes
- Admin operations

### Generate Reports

Use the endpoints to:

- Track user behavior
- Monitor resource usage
- Identify problem areas
- Export for analysis

---

## Database Schema

The `ActivityLogs` table has these fields:

```
activityLogId (UUID, Primary Key)
userId (UUID, Foreign Key to Users)
action (String) - e.g., "USER_LOGIN", "RESOURCE_CREATED"
actionType (ENUM) - CREATE, READ, UPDATE, DELETE, LOGIN, LOGOUT, DOWNLOAD, UPLOAD
category (ENUM) - USER, RESOURCE, BORROW, EXERCISE, ADMIN
resourceId (UUID) - Optional, link to affected resource
resourceType (String) - Type of affected resource
ipAddress (String) - User's IP address
userAgent (Text) - Browser/device information
description (Text) - Human-readable description
status (ENUM) - SUCCESS, FAILED, PENDING
details (JSON) - Additional data
timestamp (DateTime) - When activity occurred
```

---

## Example Usage in Frontend

```javascript
// Get last 100 activities
const response = await fetch("/admin/reports/activity-logs?limit=100");
const data = await response.json();

// Filter by user
const response = await fetch("/admin/reports/activity-logs?userId=USER_ID");

// Get user report
const response = await fetch("/admin/reports/user/USER_ID");

// Export logs for a date range
window.location.href =
  "/admin/reports/export-logs?startDate=2026-05-01&endDate=2026-05-31";
```

---

## Notes

⚠️ **Important:**

- Make sure JWT authentication is working on admin routes
- Only admins can access `/admin/*` routes
- All timestamps are in UTC
- CSV export is paginated to avoid memory issues
- Logging doesn't slow down main operations (errors are caught silently)

---

## Need Help?

Refer to:

1. `ACTIVITY_LOGGING_SETUP.md` - Detailed setup guide
2. `ACTIVITY_LOGGING_EXAMPLES.js` - Code examples for each action
3. The 5 new endpoints in `reportController.js`

---

## Progress Tracker

- [ ] Install json2csv dependency
- [ ] Add attachLogger middleware to app.js
- [ ] Run database migration
- [ ] Restart backend
- [ ] Test endpoints
- [ ] Add logging to auth controller
- [ ] Add logging to resource controller
- [ ] Add logging to user controller
- [ ] Add logging to borrow controller
- [ ] Build admin dashboard frontend
