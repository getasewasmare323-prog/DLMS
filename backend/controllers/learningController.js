const {
  Bookmark,
  BorrowTransaction,
  Notification,
  ReadingList,
  ReadingListItem,
  ReadingProgress,
  Resource,
  User,
} = require("../models");
const { Op } = require("sequelize");
const { v4: uuidv4 } = require("uuid");

const approvedResourceWhere = {
  [Op.or]: [{ status: "approved" }, { status: null }],
};

exports.getDashboard = async (req, res) => {
  try {
    const isStudentOrTeacher =
      req.user.role === "student" || req.user.role === "teacher";

    const queries = [
      BorrowTransaction.findAll({
        where: {
          userId: req.user.userId,
          borrowType: { [Op.ne]: "digital" },
          status: { [Op.in]: ["active", "overdue"] },
        },
        include: [{ model: Resource, as: "resource" }],
        order: [["dueAt", "ASC"]],
      }),
      BorrowTransaction.findAll({
        where: {
          userId: req.user.userId,
          borrowType: { [Op.ne]: "digital" },
        },
        include: [{ model: Resource, as: "resource" }],
        order: [["updatedAt", "DESC"]],
        limit: 10,
      }),
      ...(isStudentOrTeacher
        ? [
            Bookmark.findAll({
              where: { userId: req.user.userId },
              include: [
                {
                  model: Resource,
                  as: "resource",
                  where: approvedResourceWhere,
                },
              ],
              order: [["createdAt", "DESC"]],
            }),
            ReadingProgress.findAll({
              where: { userId: req.user.userId },
              include: [{ model: Resource, as: "resource" }],
              order: [["updatedAt", "DESC"]],
            }),
          ]
        : [null, null]),
      Notification.findAll({
        where: { userId: req.user.userId },
        order: [["createdAt", "DESC"]],
        limit: 10,
      }),
    ];

    const [activeBorrows, history, bookmarks, progressEntries, notifications] =
      await Promise.all(queries);

    res.status(200).json({
      status: "ok",
      data: {
        activeBorrows,
        history,
        ...(isStudentOrTeacher && { bookmarks, progressEntries }),
        notifications,
      },
    });
  } catch (error) {
    console.error("Dashboard error:", error.message);
    res.status(500).json({ status: "error", error: "Internal server error" });
  }
};

exports.listBookmarks = async (req, res) => {
  try {
    const bookmarks = await Bookmark.findAll({
      where: { userId: req.user.userId },
      include: [
        {
          model: Resource,
          as: "resource",
          where: approvedResourceWhere,
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    res.status(200).json({ status: "ok", data: { bookmarks } });
  } catch (error) {
    console.error("Bookmark list error:", error.message);
    res.status(500).json({ status: "error", error: "Internal server error" });
  }
};

exports.addBookmark = async (req, res) => {
  try {
    const resource = await Resource.findByPk(req.params.resourceId);
    if (!resource) {
      return res
        .status(404)
        .json({ status: "fail", error: "Resource not found" });
    }

    const [bookmark] = await Bookmark.findOrCreate({
      where: {
        userId: req.user.userId,
        resourceId: resource.resourceId,
      },
      defaults: {
        bookmarkId: uuidv4(),
        userId: req.user.userId,
        resourceId: resource.resourceId,
      },
    });

    res.status(201).json({ status: "ok", data: { bookmark } });
  } catch (error) {
    console.error("Bookmark create error:", error.message);
    res.status(500).json({ status: "error", error: "Internal server error" });
  }
};

exports.removeBookmark = async (req, res) => {
  try {
    await Bookmark.destroy({
      where: {
        userId: req.user.userId,
        resourceId: req.params.resourceId,
      },
    });

    res.status(200).json({ status: "ok" });
  } catch (error) {
    console.error("Bookmark delete error:", error.message);
    res.status(500).json({ status: "error", error: "Internal server error" });
  }
};

exports.clearBookmarks = async (req, res) => {
  try {
    const deletedCount = await Bookmark.destroy({
      where: { userId: req.user.userId },
    });

    res.status(200).json({
      status: "ok",
      data: { deletedCount },
      message: "Saved resources cleared",
    });
  } catch (error) {
    console.error("Bookmark clear error:", error.message);
    res.status(500).json({ status: "error", error: "Internal server error" });
  }
};

exports.updateReadingProgress = async (req, res) => {
  try {
    const resource = await Resource.findByPk(req.params.resourceId);
    if (!resource) {
      return res
        .status(404)
        .json({ status: "fail", error: "Resource not found" });
    }

    const progressPercent = Math.max(
      0,
      Math.min(100, Number.parseInt(req.body.progressPercent, 10) || 0),
    );
    const lastPage =
      req.body.lastPage === undefined || req.body.lastPage === null
        ? null
        : Number.parseInt(req.body.lastPage, 10) || null;

    const [progress] = await ReadingProgress.findOrCreate({
      where: {
        userId: req.user.userId,
        resourceId: resource.resourceId,
      },
      defaults: {
        progressId: uuidv4(),
        userId: req.user.userId,
        resourceId: resource.resourceId,
        progressPercent,
        lastPage,
        completedAt: progressPercent >= 100 ? new Date() : null,
      },
    });

    if (!progress.isNewRecord) {
      await progress.update({
        progressPercent,
        lastPage,
        completedAt: progressPercent >= 100 ? new Date() : null,
      });
    }

    res.status(200).json({ status: "ok", data: { progress } });
  } catch (error) {
    console.error("Reading progress error:", error.message);
    res.status(500).json({ status: "error", error: "Internal server error" });
  }
};

exports.clearReadingProgressHistory = async (req, res) => {
  try {
    const deletedCount = await ReadingProgress.destroy({
      where: { userId: req.user.userId },
    });

    res.status(200).json({
      status: "ok",
      data: { deletedCount },
      message: "Reading progress history cleared",
    });
  } catch (error) {
    console.error("Reading progress clear error:", error.message);
    res.status(500).json({ status: "error", error: "Internal server error" });
  }
};

exports.listReadingLists = async (req, res) => {
  try {
    const where = {};
    if (req.user.role === "teacher") {
      where.creatorId = req.user.userId;
    } else if (req.user.role === "student") {
      where[Op.or] = [
        { visibility: "school" },
        { gradeLevel: req.user.classLevel || null },
      ];
    }

    const readingLists = await ReadingList.findAll({
      where,
      include: [
        {
          model: ReadingListItem,
          as: "items",
          include: [
            {
              model: Resource,
              as: "resource",
            },
          ],
        },
        {
          model: User,
          as: "creator",
          attributes: ["userId", "firstName", "lastName", "role"],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    res.status(200).json({ status: "ok", data: { readingLists } });
  } catch (error) {
    console.error("Reading list error:", error.message);
    res.status(500).json({ status: "error", error: "Internal server error" });
  }
};

exports.createReadingList = async (req, res) => {
  try {
    if (req.user.role !== "teacher" && req.user.role !== "admin") {
      return res.status(403).json({
        status: "fail",
        error: "Only teachers and admins can create reading lists",
      });
    }

    const title = String(req.body.title || "").trim();
    if (!title) {
      return res.status(400).json({
        status: "fail",
        error: "title is required",
      });
    }

    const readingList = await ReadingList.create({
      readingListId: uuidv4(),
      creatorId: req.user.userId,
      title,
      description: req.body.description?.trim() || null,
      gradeLevel:
        req.body.gradeLevel === undefined || req.body.gradeLevel === ""
          ? null
          : Number.parseInt(req.body.gradeLevel, 10) || null,
      visibility: req.body.visibility === "school" ? "school" : "class",
    });

    res.status(201).json({ status: "ok", data: { readingList } });
  } catch (error) {
    console.error("Reading list create error:", error.message);
    res.status(500).json({ status: "error", error: "Internal server error" });
  }
};

exports.addReadingListItem = async (req, res) => {
  try {
    const readingList = await ReadingList.findByPk(req.params.readingListId);
    if (!readingList) {
      return res
        .status(404)
        .json({ status: "fail", error: "Reading list not found" });
    }

    if (
      req.user.role !== "admin" &&
      readingList.creatorId !== req.user.userId
    ) {
      return res.status(403).json({
        status: "fail",
        error: "You are not allowed to modify this reading list",
      });
    }

    const resource = await Resource.findByPk(req.body.resourceId);
    if (!resource) {
      return res
        .status(404)
        .json({ status: "fail", error: "Resource not found" });
    }

    const item = await ReadingListItem.create({
      readingListItemId: uuidv4(),
      readingListId: readingList.readingListId,
      resourceId: resource.resourceId,
      note: req.body.note?.trim() || null,
    });

    res.status(201).json({ status: "ok", data: { item } });
  } catch (error) {
    console.error("Reading list item error:", error.message);
    res.status(500).json({ status: "error", error: "Internal server error" });
  }
};
