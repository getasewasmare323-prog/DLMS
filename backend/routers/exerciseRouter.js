const express = require("express");
const autController = require("../controllers/autController");
const exerciseController = require("../controllers/exerciseController");

const router = express.Router();

router.use(autController.jwtauth);

router.get("/", exerciseController.getExercises);
router.get("/:id", exerciseController.getExerciseById);

module.exports = router;
