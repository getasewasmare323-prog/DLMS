const { Exercise, Question, User } = require("../models");

exports.getExercises = async (req, res) => {
  try {
    const where = {};

    if (req.user.role === "student" && req.user.classLevel) {
      where.gradeLevel = req.user.classLevel;
    }

    if (req.user.role === "teacher") {
      where.creatorId = req.user.userId;
    }

    const exercises = await Exercise.findAll({
      where,
      include: [
        {
          model: Question,
          as: "quizQuestions",
        },
        {
          model: User,
          as: "creator",
          attributes: ["userId", "firstName", "lastName", "role"],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    res.status(200).json({ status: "ok", data: { exercises } });
  } catch (error) {
    console.error("Exercise list error:", error.message);
    res.status(500).json({ status: "error", error: "Internal server error" });
  }
};

exports.getExerciseById = async (req, res) => {
  try {
    const exercise = await Exercise.findOne({
      where: { exerciseId: req.params.id },
      include: [
        {
          model: Question,
          as: "quizQuestions",
        },
        {
          model: User,
          as: "creator",
          attributes: ["userId", "firstName", "lastName", "role"],
        },
      ],
    });

    if (!exercise) {
      return res.status(404).json({ status: "fail", error: "Exercise not found" });
    }

    if (
      req.user.role === "student" &&
      exercise.gradeLevel &&
      req.user.classLevel !== exercise.gradeLevel
    ) {
      return res.status(403).json({
        status: "fail",
        error: "You are not allowed to access this exercise",
      });
    }

    if (req.user.role === "teacher" && exercise.creatorId !== req.user.userId) {
      return res.status(403).json({
        status: "fail",
        error: "You are not allowed to access this exercise",
      });
    }

    res.status(200).json({ status: "ok", data: { exercise } });
  } catch (error) {
    console.error("Exercise detail error:", error.message);
    res.status(500).json({ status: "error", error: "Internal server error" });
  }
};
