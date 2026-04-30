const {
  BorrowTransaction,
  Exercise,
  ForumPost,
  ForumThread,
  Notification,
  Resource,
  SystemSetting,
  User,
} = require("../models");
const { Op, col, fn } = require("sequelize");
const { v4: uuidv4 } = require("uuid");

exports.getSystemSummary = async (req, res) => {
  try {
    const [
      totalUsers,
      totalStudents,
      totalTeachers,
      totalLibrarians,
      totalAdmins,
      totalResources,
      totalVideos,
      totalReading,
      totalExercises,
      totalThreads,
      totalPosts,
      unreadNotifications,
      activeBorrows,
      pendingResources,
    ] = await Promise.all([
      User.count(),
      User.count({ where: { role: "student" } }),
      User.count({ where: { role: "teacher" } }),
      User.count({ where: { role: "librarian" } }),
      User.count({ where: { role: "admin" } }),
      Resource.count(),
      Resource.count({ where: { resourceType: "video" } }),
      Resource.count({ where: { resourceType: "reading" } }),
      Exercise.count(),
      ForumThread.count(),
      ForumPost.count(),
      Notification.count({ where: { read: false } }),
      BorrowTransaction.count({ where: { status: { [Op.in]: ["active", "overdue"] } } }),
      Resource.count({ where: { status: "pending" } }),
    ]);

    res.status(200).json({
      status: "ok",
      data: {
        totalUsers,
        totalStudents,
        totalTeachers,
        totalLibrarians,
        totalAdmins,
        totalResources,
        totalVideos,
        totalReading,
        totalExercises,
        totalThreads,
        totalPosts,
        unreadNotifications,
        activeBorrows,
        pendingResources,
      },
    });
  } catch (error) {
    console.error("Admin summary error:", error.message);
    res.status(500).json({ status: "error", error: "Internal server error" });
  }
};

exports.getSystemSettings = async (req, res) => {
  try {
    const settings = await SystemSetting.findAll({
      order: [["settingKey", "ASC"]],
    });

    res.status(200).json({ status: "ok", data: { settings } });
  } catch (error) {
    console.error("System settings error:", error.message);
    res.status(500).json({ status: "error", error: "Internal server error" });
  }
};

exports.upsertSystemSetting = async (req, res) => {
  try {
    const settingKey = String(req.body.settingKey || "").trim();
    if (!settingKey) {
      return res.status(400).json({
        status: "fail",
        error: "settingKey is required",
      });
    }

    await SystemSetting.upsert(
      {
        settingKey,
        settingValue: req.body.settingValue || {},
        description: req.body.description?.trim() || null,
      },
    );
    const setting = await SystemSetting.findByPk(settingKey);

    res.status(200).json({ status: "ok", data: { setting } });
  } catch (error) {
    console.error("System setting update error:", error.message);
    res.status(500).json({ status: "error", error: "Internal server error" });
  }
};

exports.reviewResource = async (req, res) => {
  try {
    const resource = await Resource.findByPk(req.params.id);
    if (!resource) {
      return res.status(404).json({ status: "fail", error: "Resource not found" });
    }

    const nextStatus = req.body.status;
    if (!["approved", "rejected", "archived"].includes(nextStatus)) {
      return res.status(400).json({
        status: "fail",
        error: "status must be approved, rejected, or archived",
      });
    }

    await resource.update({
      status: nextStatus,
      reviewNote: req.body.reviewNote?.trim() || null,
      approvedBy: nextStatus === "approved" ? req.user.userId : null,
      approvedAt: nextStatus === "approved" ? new Date() : null,
    });

    if (resource.userId) {
      await Notification.create({
        notificationId: uuidv4(),
        userId: resource.userId,
        title: `Resource ${nextStatus}`,
        message: `${resource.title} has been ${nextStatus}.`,
        read: false,
        resourceId: resource.resourceId,
      });
    }

    if (nextStatus === "approved") {
      const studentWhere = { role: "student" };
      if (resource.gradeLevel !== null && resource.gradeLevel !== undefined) {
        studentWhere.classLevel = resource.gradeLevel;
      }

      const students = await User.findAll({
        where: studentWhere,
        attributes: ["userId"],
      });

      if (students.length) {
        await Notification.bulkCreate(
          students.map((student) => ({
            notificationId: uuidv4(),
            userId: student.userId,
            title: `${resource.title} is now available`,
            message: `${resource.title} has been approved and added to the library.`,
            read: false,
            resourceId: resource.resourceId,
            gradeLevel: resource.gradeLevel,
            actorRole: req.user.role,
          })),
        );
      }
    }

    res.status(200).json({ status: "ok", data: { resource } });
  } catch (error) {
    console.error("Resource review error:", error.message);
    res.status(500).json({ status: "error", error: "Internal server error" });
  }
};

exports.getBorrowingOverview = async (req, res) => {
  try {
    const [active, overdue, returned, byType] = await Promise.all([
      BorrowTransaction.count({ where: { status: "active" } }),
      BorrowTransaction.count({ where: { status: "overdue" } }),
      BorrowTransaction.count({ where: { status: "returned" } }),
      BorrowTransaction.findAll({
        attributes: ["borrowType", [fn("COUNT", col("transactionId")), "count"]],
        group: ["borrowType"],
      }),
    ]);

    res.status(200).json({
      status: "ok",
      data: {
        active,
        overdue,
        returned,
        byType,
      },
    });
  } catch (error) {
    console.error("Borrowing overview error:", error.message);
    res.status(500).json({ status: "error", error: "Internal server error" });
  }
};
