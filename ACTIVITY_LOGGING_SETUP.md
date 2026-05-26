# Admin Activity Logging & Reporting System - Setup Guide

## Overview

This system provides complete user activity tracking and reporting capabilities for admins. It logs all user actions and provides multiple report views.

## What Was Created

### 1. **ActivityLog Model** (`models/activitylog.js`)

- Tracks all user activities with detailed information
- Stores: user ID, action type, category, resource ID, IP address, user agent, status, timestamps

### 2. **Activity Logger Middleware** (`middleware/activityLogger.js`)

- `logActivity()` - Function to log activities
- `attachLogger` - Express middleware to add logging capability to requests

### 3. **Report Controller** (`controllers/reportController.js`)

Provides 5 main endpoints:

- `GET /admin/reports/activity-logs` - View all activity logs with filters
- `GET /admin/reports/user/:userId` - Get specific user's activity report
- `GET /admin/reports/activity-summary` - System-wide activity summary
- `GET /admin/reports/system` - Comprehensive system report
- `GET /admin/reports/export-logs` - Export logs as CSV

### 4. **Migration File** (`migrations/20260521000000-create-activity-log.js`)

- Creates ActivityLogs table with proper indexes

---

## Installation Steps

### Step 1: Install Required Dependency

```bash
npm install json2csv
```

### Step 2: Add Logger Middleware to app.js

Add this line after other middleware (around line 37, after cookieParser):

```javascript
const { attachLogger } = require("./middleware/activityLogger");

// Add this line with other middleware
app.use(attachLogger);
```

### Step 3: Run Database Migration

```bash
npx sequelize-cli db:migrate
```

### Step 4: Restart Backend

```bash
npm run dev
```

---

## How to Use - Logging Activities

### In Your Controllers

Add activity logging to any controller action:

```javascript
const { logActivity } = require("../middleware/activityLogger");

exports.createResource = async (req, res) => {
  try {
    // Your creation logic
    const resource = await Resource.create(req.body);

    // Log the activity
    await req.logActivity({
      userId: req.user.userId,
      action: "CREATED_RESOURCE",
      actionType: "CREATE",
      category: "RESOURCE",
      resourceId: resource.resourceId,
      resourceType: "Resource",
      description: `Created resource: ${resource.title}`,
      status: "SUCCESS",
      details: {
        resourceTitle: resource.title,
        resourceType: resource.resourceType,
      },
    });

    res.status(201).json({ status: "ok", data: resource });
  } catch (error) {
    // Log failed activity
    await req.logActivity({
      userId: req.user.userId,
      action: "CREATE_RESOURCE_FAILED",
      actionType: "CREATE",
      category: "RESOURCE",
      description: error.message,
      status: "FAILED",
    });

    res.status(500).json({ status: "error", error: error.message });
  }
};
```

### Common Activities to Log

**User Actions:**

```javascript
// Login
await req.logActivity({
  userId: user.userId,
  action: "USER_LOGIN",
  actionType: "LOGIN",
  category: "USER",
  description: "User logged in",
});

// Profile Update
await req.logActivity({
  userId: req.user.userId,
  action: "PROFILE_UPDATED",
  actionType: "UPDATE",
  category: "USER",
  description: "User profile updated",
});

// Password Changed
await req.logActivity({
  userId: req.user.userId,
  action: "PASSWORD_CHANGED",
  actionType: "UPDATE",
  category: "USER",
  description: "Password changed",
});
```

**Resource Actions:**

```javascript
// Create Resource
await req.logActivity({
  userId: req.user.userId,
  action: "RESOURCE_CREATED",
  actionType: "CREATE",
  category: "RESOURCE",
  resourceId: resource.resourceId,
  resourceType: "Resource",
  description: `Created: ${resource.title}`,
});

// Update Resource
await req.logActivity({
  userId: req.user.userId,
  action: "RESOURCE_UPDATED",
  actionType: "UPDATE",
  category: "RESOURCE",
  resourceId: resource.resourceId,
  resourceType: "Resource",
  description: `Updated: ${resource.title}`,
});

// Delete Resource
await req.logActivity({
  userId: req.user.userId,
  action: "RESOURCE_DELETED",
  actionType: "DELETE",
  category: "RESOURCE",
  resourceId: resource.resourceId,
  resourceType: "Resource",
  description: `Deleted: ${resource.title}`,
});
```

**Borrow Actions:**

```javascript
await req.logActivity({
  userId: req.user.userId,
  action: "BORROW_CREATED",
  actionType: "CREATE",
  category: "BORROW",
  resourceId: transaction.resourceId,
  resourceType: "BorrowTransaction",
  description: `Borrowed resource`,
});
```

---

## API Endpoints

### 1. Get Activity Logs (Filterable)

```
GET /admin/reports/activity-logs
Query Parameters:
  - userId (optional): Filter by user
  - action (optional): Filter by action name
  - category (optional): Filter by category (USER, RESOURCE, BORROW, EXERCISE, ADMIN)
  - startDate (optional): ISO date format
  - endDate (optional): ISO date format
  - limit (default: 50): Number of records
  - offset (default: 0): Pagination offset
  - sortBy (default: timestamp): Sort field
  - sortOrder (default: DESC): ASC or DESC

Response:
{
  "status": "ok",
  "data": {
    "total": 150,
    "logs": [...],
    "limit": 50,
    "offset": 0
  }
}
```

### 2. Get User Activity Report

```
GET /admin/reports/user/:userId
Query Parameters:
  - startDate (optional): ISO date
  - endDate (optional): ISO date

Response:
{
  "status": "ok",
  "data": {
    "user": { userId, firstName, lastName, email, role },
    "summary": {
      "totalActivities": 45,
      "byCategory": { "RESOURCE": 20, "BORROW": 15, ... },
      "byActionType": { "CREATE": 10, "READ": 20, ... },
      "byStatus": { "SUCCESS": 44, "FAILED": 1 }
    },
    "activities": [...]
  }
}
```

### 3. Get Activity Summary

```
GET /admin/reports/activity-summary
Query Parameters:
  - startDate (optional): ISO date
  - endDate (optional): ISO date

Response:
{
  "status": "ok",
  "data": {
    "totalActivities": 5000,
    "activitiesByCategory": { "USER": 1500, "RESOURCE": 2000, ... },
    "activitiesByActionType": { "CREATE": 1200, "READ": 2500, ... },
    "activitiesByStatus": { "SUCCESS": 4950, "FAILED": 50 },
    "recentActivities": [...]
  }
}
```

### 4. Get System Report

```
GET /admin/reports/system
Query Parameters:
  - startDate (optional): ISO date
  - endDate (optional): ISO date

Response:
{
  "status": "ok",
  "data": {
    "totalActivities": 5000,
    "activeUsers": 250,
    "totalResources": 500,
    "totalExercises": 150,
    "activeBorrows": 75,
    "logins": 2500,
    "logouts": 2450,
    "resourceCreations": 300,
    "resourceUpdates": 450,
    "totalBorrowTransactions": 800
  }
}
```

### 5. Export Logs as CSV

```
GET /admin/reports/export-logs
Query Parameters:
  - userId (optional): Filter by user
  - category (optional): Filter by category
  - startDate (optional): ISO date
  - endDate (optional): ISO date

Response: CSV file download
```

---

## Activity Categories & Types

**Categories:**

- `USER` - User-related activities
- `RESOURCE` - Resource-related activities
- `BORROW` - Borrowing transactions
- `EXERCISE` - Exercise activities
- `ADMIN` - Admin operations

**Action Types:**

- `CREATE` - Create new record
- `READ` - View/access record
- `UPDATE` - Modify record
- `DELETE` - Remove record
- `LOGIN` - User login
- `LOGOUT` - User logout
- `DOWNLOAD` - Download file
- `UPLOAD` - Upload file

**Status:**

- `SUCCESS` - Activity completed successfully
- `FAILED` - Activity failed
- `PENDING` - Activity pending

---

## Example Usage in Frontend (React)

```javascript
// Get Activity Logs
const getActivityLogs = async (filters = {}) => {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value) params.append(key, value);
  });

  const response = await fetch(`/admin/reports/activity-logs?${params}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.json();
};

// Get User Report
const getUserReport = async (userId, dates = {}) => {
  const params = new URLSearchParams(dates);
  const response = await fetch(`/admin/reports/user/${userId}?${params}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.json();
};

// Export Logs
const exportLogs = async (filters = {}) => {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value) params.append(key, value);
  });

  window.location.href = `/admin/reports/export-logs?${params}`;
};

// Get Summary
const getActivitySummary = async (dates = {}) => {
  const params = new URLSearchParams(dates);
  const response = await fetch(`/admin/reports/activity-summary?${params}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.json();
};
```

---

## Next Steps

1. ✅ Create ActivityLog model
2. ✅ Create report controller
3. ✅ Create migration
4. ✅ Update admin routes
5. **TODO:** Install json2csv dependency
6. **TODO:** Add attachLogger middleware to app.js
7. **TODO:** Run database migration
8. **TODO:** Add logging calls to existing controllers
9. **TODO:** Create frontend admin dashboard for reports

---

## Notes

- All timestamps are in UTC
- IP addresses and user agents are captured automatically
- Failed activities are logged with error messages
- The system automatically indexes frequently queried fields for performance
- CSV exports include all relevant activity information
- Reports can be filtered by date range, user, and category
