const router = require("express").Router();
const autController = require("../controllers/autController");
const teacherController = require("../controllers/teacherController");

router.use(autController.jwtauth);
router.use(autController.teacher);

router.get("/resources", teacherController.getMyResources);
router.get("/exercises", teacherController.getMyExercises);
router.post("/exercises", teacherController.createExercise);

module.exports = router;
