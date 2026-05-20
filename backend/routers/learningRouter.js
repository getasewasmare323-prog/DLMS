const express = require("express");
const autController = require("../controllers/autController");
const learningController = require("../controllers/learningController");

const router = express.Router();

router.use(autController.jwtauth);

router.get(
  "/dashboard",
  autController.requireRoles("student", "teacher", "librarian", "admin"),
  learningController.getDashboard,
);
router.get(
  "/bookmarks",
  autController.requireRoles("student", "teacher"),
  learningController.listBookmarks,
);
router.post(
  "/bookmarks/:resourceId",
  autController.requireRoles("student", "teacher"),
  learningController.addBookmark,
);
router.delete(
  "/bookmarks/:resourceId",
  autController.requireRoles("student", "teacher"),
  learningController.removeBookmark,
);
router.patch(
  "/progress/:resourceId",
  autController.requireRoles("student", "teacher"),
  learningController.updateReadingProgress,
);
router.get(
  "/reading-lists",
  autController.requireRoles("student", "teacher", "admin"),
  learningController.listReadingLists,
);
router.post(
  "/reading-lists",
  autController.requireRoles("teacher", "admin"),
  learningController.createReadingList,
);
router.post(
  "/reading-lists/:readingListId/items",
  autController.requireRoles("teacher", "admin"),
  learningController.addReadingListItem,
);

module.exports = router;
