const express = require("express");
const autController = require("../controllers/autController");
const forumController = require("../controllers/forumController");

const router = express.Router();

router.use(autController.jwtauth);

router.get("/threads", forumController.getThreads);
router.post("/threads", forumController.createThread);
router.get("/threads/:id", forumController.getThreadById);
router.post("/threads/:id/posts", forumController.createPost);

module.exports = router;
