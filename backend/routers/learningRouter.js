const express = require("express");
const autController = require("../controllers/autController");
const learningController = require("../controllers/learningController");

const router = express.Router();

router.use(autController.jwtauth);
router.use(autController.libraryMember);

router.get("/dashboard", learningController.getDashboard);
router.get("/bookmarks", learningController.listBookmarks);
router.post(
  "/bookmarks/:resourceId",
  autController.teacherOrStudent,
  learningController.addBookmark,
);
router.delete("/bookmarks/:resourceId", learningController.removeBookmark);
router.patch("/progress/:resourceId", learningController.updateReadingProgress);
router.get("/reading-lists", learningController.listReadingLists);
router.post("/reading-lists", learningController.createReadingList);
router.post(
  "/reading-lists/:readingListId/items",
  learningController.addReadingListItem,
);

module.exports = router;
