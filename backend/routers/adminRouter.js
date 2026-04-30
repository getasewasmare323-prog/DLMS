const express = require("express");

const resourceController = require("../controllers/resourceController");
const autController = require("../controllers/autController");
const userController = require("../controllers/userController");
const adminController = require("../controllers/adminController");

const router = express.Router();

router.use(autController.jwtauth);
router.use(autController.admin);

router.get(
  "/allUsers",
  userController.getAllUser,
);

router.get("/summary", adminController.getSystemSummary);
router.get("/settings", adminController.getSystemSettings);
router.put("/settings", adminController.upsertSystemSetting);
router.patch("/resources/:id/review", adminController.reviewResource);
router.get("/borrows/overview", adminController.getBorrowingOverview);
router.get("/getUserById/:id", userController.getUserById);
router.patch("/updateUser/:id", userController.updateUser);
router.patch("/updateUserRole/:id", userController.updateUserRole);
router.delete("/deleteUser/:id", userController.deleteUser);
module.exports = router;
