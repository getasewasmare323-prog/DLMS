const express = require("express");
const autController = require("../controllers/autController");
const notificationController = require("../controllers/notificationController");
const userController = require("../controllers/userController");
const router = express.Router();

// public
router.post("/signup", autController.signUp);
router.post("/login", autController.login);
router.post("/logout", autController.jwtauth, autController.logout);
router.post("/forgot-password", userController.forgotPassword);
router.post("/reset-password", userController.resetPassword);
// protected
router.get("/me", autController.jwtauth, userController.getCurrentUser);
router.patch("/me", autController.jwtauth, userController.updateCurrentUser);
router.patch(
  "/me/password",
  autController.jwtauth,
  userController.updateCurrentPassword,
);
router.get(
  "/notifications",
  autController.jwtauth,
  notificationController.getMyNotifications,
);
router.patch(
  "/notifications/read-all",
  autController.jwtauth,
  notificationController.markAllAsRead,
);
router.delete(
  "/notifications/history",
  autController.jwtauth,
  notificationController.clearMyNotifications,
);

module.exports = router;
