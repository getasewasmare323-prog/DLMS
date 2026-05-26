const express = require("express");

const resourceController = require("../controllers/resourceController");
const autController = require("../controllers/autController");
const userController = require("../controllers/userController");
const adminController = require("../controllers/adminController");
const reportController = require("../controllers/reportController");

const router = express.Router();

router.use(autController.jwtauth);
router.use(autController.admin);

router.get("/allUsers", userController.getAllUser);

router.get("/summary", adminController.getSystemSummary);
router.get("/settings", adminController.getSystemSettings);
router.put("/settings", adminController.upsertSystemSetting);
router.patch("/resources/:id/review", adminController.reviewResource);
router.get("/borrows/overview", adminController.getBorrowingOverview);
router.get("/getUserById/:id", userController.getUserById);
router.patch("/updateUser/:id", userController.updateUser);
router.patch("/updateUserRole/:id", userController.updateUserRole);
router.delete("/deleteUser/:id", userController.deleteUser);

// Activity and Report Routes
router.get("/reports/activity-logs", reportController.getUserActivityLogs);
router.get("/reports/user/:userId", reportController.getUserActivityReport);
router.get("/reports/activity-summary", reportController.getActivitySummary);
router.get("/reports/generate", reportController.generateReport);
router.get("/reports/system", reportController.getSystemReport);
router.get("/reports/export-logs", reportController.exportActivityLogs);

module.exports = router;
