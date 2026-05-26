const {
  Exercise,
  Notification,
  Question,
  Resource,
  User,
} = require("../models");
const { v4: uuidv4 } = require("uuid");
const sendMail = require("../middleware/emailService");
const { getNotificationSettings } = require("../utils/systemSettings");

const normalizeGradeLevel = (value) => {
  if (value === undefined || value === null || value === "") {
    return null;
  }

  const parsed = Number.parseInt(String(value).replace(/[^\d]/g, ""), 10);
  return Number.isNaN(parsed) ? null : parsed;
};

const getGradeScopeText = (gradeLevel) =>
  gradeLevel !== null && gradeLevel !== undefined
    ? `Grade ${gradeLevel}`
    : "all grades";

const sendExerciseEmails = async (students, exercise, teacher) => {
  const scopedStudents = students.filter((student) => student.email);

  if (!scopedStudents.length) {
    return;
  }

  const teacherName =
    [teacher.firstName, teacher.lastName].filter(Boolean).join(" ").trim() ||
    "Your teacher";
  const gradeScopeText = getGradeScopeText(exercise.gradeLevel);
  const mailResults = await Promise.allSettled(
    scopedStudents.map((student) =>
      sendMail({
        email: student.email,
        subject: `New exercise: ${exercise.title}`,
        html: `
          <h2>New exercise available</h2>
          <p>Hello ${student.firstName || "student"},</p>
          <p>${teacherName} uploaded a new ${exercise.subject || "class"} exercise for ${gradeScopeText}.</p>
          <p><strong>Title:</strong> ${exercise.title}</p>
          ${
            exercise.instructions
              ? `<p><strong>Instructions:</strong> ${exercise.instructions}</p>`
              : ""
          }
        `,
      }),
    ),
  );

  const failedCount = mailResults.filter(
    (result) => result.status === "rejected",
  ).length;

  console.log(
    `[email] Exercise notification emails sent: ${mailResults.length - failedCount}/${mailResults.length}`,
  );

  if (failedCount) {
    console.error(
      `[email] Exercise notification emails failed: ${failedCount}`,
    );
  }
};

const notifyTargetStudents = async (exercise, teacher) => {
  const notificationSettings = await getNotificationSettings();
  const shouldSendExerciseEmails =
    notificationSettings.emailNotifications &&
    notificationSettings.exerciseNotifications;

  const where = { role: "student" };
  if (exercise.gradeLevel !== null && exercise.gradeLevel !== undefined) {
    where.classLevel = exercise.gradeLevel;
  }

  const students = await User.findAll({
    where,
    attributes: ["userId", "email", "firstName"],
  });

  if (!students.length) {
    return;
  }

  await Notification.bulkCreate(
    students.map((student) => ({
      notificationId: uuidv4(),
      title: `New exercise: ${exercise.title}`,
      message: `${teacher.firstName || "Your teacher"} added a ${exercise.subject || "class"} exercise${exercise.gradeLevel ? ` for Grade ${exercise.gradeLevel}` : ""}.`,
      read: false,
      userId: student.userId,
      gradeLevel: exercise.gradeLevel,
      actorRole: teacher.role,
    })),
  );

  if (shouldSendExerciseEmails) {
    await sendExerciseEmails(students, exercise, teacher);
  }
};

exports.getMyResources = async (req, res) => {
  const teacherId = req.user.userId;
  try {
    const resources = await Resource.findAll({ where: { userId: teacherId } });
    res.status(200).json({ status: "ok", data: { resources } });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
};

exports.getMyExercises = async (req, res) => {
  try {
    const exercises = await Exercise.findAll({
      where: { creatorId: req.user.userId },
      include: [
        {
          model: Question,
          as: "quizQuestions",
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    res.status(200).json({ status: "ok", data: { exercises } });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
};

exports.createExercise = async (req, res) => {
  const creatorId = req.user.userId;
  const { title, subject, gradeLevel, timeLimit, instructions, questions } =
    req.body;

  if (!title || !subject || !Array.isArray(questions) || !questions.length) {
    return res.status(400).json({
      status: "fail",
      message: "title, subject and at least one question are required",
    });
  }

  try {
    const exercise = await Exercise.create({
      exerciseId: uuidv4(),
      creatorId,
      title: title.trim(),
      subject: subject.trim(),
      gradeLevel: normalizeGradeLevel(gradeLevel),
      instructions: instructions?.trim() || null,
      timeLimit: Number.parseInt(timeLimit, 10) || 15,
    });

    const questionRows = questions.map((question) => ({
      exerciseId: exercise.exerciseId,
      content: question.text?.trim(),
      optionA: question.options?.[0]?.trim() || "",
      optionB: question.options?.[1]?.trim() || "",
      optionC: question.options?.[2]?.trim() || "",
      optionD: question.options?.[3]?.trim() || "",
      correctAnswer: ["A", "B", "C", "D"][question.correct] || "A",
    }));

    await Question.bulkCreate(questionRows);
    await notifyTargetStudents(exercise, req.user);

    const createdExercise = await Exercise.findOne({
      where: { exerciseId: exercise.exerciseId },
      include: [{ model: Question, as: "quizQuestions" }],
    });

    res.status(201).json({
      status: "ok",
      data: { exercise: createdExercise },
    });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
};

exports.updateExercise = async (req, res) => {
  const { id } = req.params;
  const { title, subject, gradeLevel, timeLimit, instructions, questions } =
    req.body;

  if (!title || !subject || !Array.isArray(questions) || !questions.length) {
    return res.status(400).json({
      status: "fail",
      message: "title, subject and at least one question are required",
    });
  }

  try {
    const exercise = await Exercise.findOne({ where: { exerciseId: id } });
    if (!exercise) {
      return res
        .status(404)
        .json({ status: "fail", error: "Exercise not found" });
    }

    if (exercise.creatorId !== req.user.userId) {
      return res.status(403).json({
        status: "fail",
        error: "You are not allowed to update this exercise",
      });
    }

    await Exercise.sequelize.transaction(async (transaction) => {
      await exercise.update(
        {
          title: title.trim(),
          subject: subject.trim(),
          gradeLevel: normalizeGradeLevel(gradeLevel),
          instructions: instructions?.trim() || null,
          timeLimit: Number.parseInt(timeLimit, 10) || 15,
        },
        { transaction },
      );

      await Question.destroy({
        where: { exerciseId: exercise.exerciseId },
        transaction,
      });

      const questionRows = questions.map((question) => ({
        exerciseId: exercise.exerciseId,
        content: question.text?.trim(),
        optionA: question.options?.[0]?.trim() || "",
        optionB: question.options?.[1]?.trim() || "",
        optionC: question.options?.[2]?.trim() || "",
        optionD: question.options?.[3]?.trim() || "",
        correctAnswer: ["A", "B", "C", "D"][question.correct] || "A",
      }));

      await Question.bulkCreate(questionRows, { transaction });
    });

    const updatedExercise = await Exercise.findOne({
      where: { exerciseId: id },
      include: [{ model: Question, as: "quizQuestions" }],
    });

    res.status(200).json({
      status: "ok",
      data: { exercise: updatedExercise },
    });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
};

exports.deleteExercise = async (req, res) => {
  const { id } = req.params;

  try {
    const exercise = await Exercise.findOne({ where: { exerciseId: id } });
    if (!exercise) {
      return res
        .status(404)
        .json({ status: "fail", error: "Exercise not found" });
    }

    if (exercise.creatorId !== req.user.userId) {
      return res.status(403).json({
        status: "fail",
        error: "You are not allowed to delete this exercise",
      });
    }

    await Exercise.sequelize.transaction(async (transaction) => {
      await Question.destroy({
        where: { exerciseId: exercise.exerciseId },
        transaction,
      });

      await exercise.destroy({ transaction });
    });

    res.status(200).json({
      status: "ok",
      data: { exerciseId: exercise.exerciseId },
    });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
};
