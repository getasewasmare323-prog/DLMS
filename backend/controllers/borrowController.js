const {
  BorrowTransaction,
  Notification,
  PhysicalCopy,
  ReadingProgress,
  Reservation,
  Resource,
  SystemSetting,
  User,
} = require("../models");
const { Op } = require("sequelize");
const { Sequelize } = require("sequelize");
const { v4: uuidv4 } = require("uuid");

const DEFAULT_POLICIES = {
  student: {
    digitalLimit: 3,
    physicalLimit: 2,
    digitalDays: 7,
    physicalDays: 14,
  },
  teacher: {
    digitalLimit: 5,
    physicalLimit: 5,
    digitalDays: 14,
    physicalDays: 21,
  },
  librarian: {
    digitalLimit: 8,
    physicalLimit: 8,
    digitalDays: 14,
    physicalDays: 21,
  },
  admin: {
    digitalLimit: 10,
    physicalLimit: 10,
    digitalDays: 14,
    physicalDays: 21,
  },
};

const getPolicyConfig = async () => {
  const record = await SystemSetting.findByPk("borrowing_policy");
  return record?.settingValue || DEFAULT_POLICIES;
};

const getRolePolicy = async (role) => {
  const config = await getPolicyConfig();
  return config[role] || DEFAULT_POLICIES.student;
};

const addDays = (days) => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date;
};

const notifyBorrower = async (userId, payload) => {
  await Notification.create({
    notificationId: uuidv4(),
    userId,
    title: payload.title,
    message: payload.message,
    read: false,
    resourceId: payload.resourceId || null,
  });
};

const canViewTransaction = (reqUser, transaction) => {
  if (reqUser.role === "admin" || reqUser.role === "librarian") {
    return true;
  }
  return reqUser.userId === transaction.userId;
};

exports.getMyBorrows = async (req, res) => {
  try {
    const where =
      req.user.role === "admin" || req.user.role === "librarian"
        ? {}
        : { userId: req.user.userId };

    where.borrowType = { [Op.ne]: "digital" };

    const transactions = await BorrowTransaction.findAll({
      where,
      include: [
        {
          model: Resource,
          as: "resource",
          attributes: [
            "resourceId",
            "title",
            "subject",
            "resourceType",
            "formatType",
            "status",
          ],
        },
        {
          model: PhysicalCopy,
          as: "physicalCopy",
          attributes: ["copyId", "barcode", "status"],
        },
        {
          model: User,
          as: "user",
          attributes: ["userId", "firstName", "lastName", "role"],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    res.status(200).json({ status: "ok", data: { transactions } });
  } catch (error) {
    console.error("Borrow listing error:", error.message);
    res.status(500).json({ status: "error", error: "Internal server error" });
  }
};

exports.borrowPhysicalResource = async (req, res) => {
  try {
    const resource = await Resource.findByPk(req.params.resourceId, {
      include: [{ model: PhysicalCopy, as: "physicalCopies" }],
    });

    if (!resource) {
      return res
        .status(404)
        .json({ status: "fail", error: "Resource not found" });
    }

    if (resource.formatType === "digital") {
      return res.status(400).json({
        status: "fail",
        error: "This resource is digital only",
      });
    }

    if (resource.status && resource.status !== "approved") {
      return res.status(403).json({
        status: "fail",
        error: "Resource is not available for borrowing",
      });
    }

    const rolePolicy = await getRolePolicy(req.user.role);
    const activePhysicalCount = await BorrowTransaction.count({
      where: {
        userId: req.user.userId,
        borrowType: "physical",
        status: "active",
      },
    });

    if (activePhysicalCount >= rolePolicy.physicalLimit) {
      return res.status(400).json({
        status: "fail",
        error: "Physical borrow limit reached",
      });
    }

    const availableCopy = (resource.physicalCopies || []).find(
      (copy) => copy.status === "available",
    );

    if (!availableCopy) {
      return res.status(400).json({
        status: "fail",
        error: "No available physical copies",
      });
    }

    const dueAt = addDays(rolePolicy.physicalDays);
    const transaction = await BorrowTransaction.create({
      transactionId: uuidv4(),
      userId: req.user.userId,
      resourceId: resource.resourceId,
      physicalCopyId: availableCopy.copyId,
      borrowType: "physical",
      status: "active",
      borrowedAt: new Date(),
      dueAt,
      issuedBy:
        req.user.role === "librarian" || req.user.role === "admin"
          ? req.user.userId
          : null,
    });

    await availableCopy.update({ status: "borrowed" });
    await resource.update({
      availableCopies: Math.max((resource.availableCopies || 0) - 1, 0),
    });

    await notifyBorrower(req.user.userId, {
      title: `Borrowed: ${resource.title}`,
      message: `Your physical borrowing is active until ${dueAt.toLocaleDateString()}.`,
      resourceId: resource.resourceId,
    });

    res.status(201).json({ status: "ok", data: { transaction } });
  } catch (error) {
    console.error("Physical borrow error:", error.message);
    res.status(500).json({ status: "error", error: "Internal server error" });
  }
};

exports.returnBorrowedResource = async (req, res) => {
  try {
    const transaction = await BorrowTransaction.findByPk(
      req.params.transactionId,
      {
        include: [
          { model: Resource, as: "resource" },
          { model: PhysicalCopy, as: "physicalCopy" },
        ],
      },
    );

    if (!transaction) {
      return res
        .status(404)
        .json({ status: "fail", error: "Borrow transaction not found" });
    }

    if (!canViewTransaction(req.user, transaction)) {
      return res.status(403).json({
        status: "fail",
        error: "You are not allowed to modify this borrow transaction",
      });
    }

    if (transaction.status !== "active" && transaction.status !== "overdue") {
      return res.status(400).json({
        status: "fail",
        error: "Borrow transaction is already closed",
      });
    }

    await transaction.update({
      status: "returned",
      returnedAt: new Date(),
      returnProcessedBy:
        req.user.role === "admin" || req.user.role === "librarian"
          ? req.user.userId
          : null,
    });

    if (transaction.borrowType === "physical" && transaction.physicalCopy) {
      await transaction.physicalCopy.update({ status: "available" });
      if (transaction.resource) {
        await transaction.resource.update({
          availableCopies: (transaction.resource.availableCopies || 0) + 1,
        });
      }
    }

    await notifyBorrower(transaction.userId, {
      title: "Return completed",
      message: `${transaction.resource?.title || "Resource"} has been marked as returned.`,
      resourceId: transaction.resourceId,
    });

    res.status(200).json({ status: "ok", data: { transaction } });
  } catch (error) {
    console.error("Borrow return error:", error.message);
    res.status(500).json({ status: "error", error: "Internal server error" });
  }
};

exports.getOverdueBorrows = async (req, res) => {
  try {
    const transactions = await BorrowTransaction.findAll({
      where: {
        status: { [Op.in]: ["active", "overdue"] },
        dueAt: { [Op.lt]: new Date() },
      },
      include: [
        {
          model: Resource,
          as: "resource",
          attributes: ["resourceId", "title", "formatType"],
        },
        {
          model: User,
          as: "user",
          attributes: ["userId", "firstName", "lastName", "email", "role"],
        },
      ],
      order: [["dueAt", "ASC"]],
    });

    await Promise.all(
      transactions
        .filter((transaction) => transaction.status === "active")
        .map((transaction) => transaction.update({ status: "overdue" })),
    );

    res.status(200).json({ status: "ok", data: { transactions } });
  } catch (error) {
    console.error("Overdue borrow error:", error.message);
    res.status(500).json({ status: "error", error: "Internal server error" });
  }
};

// ===== READING PROGRESS FUNCTIONALITY =====

exports.saveReadingProgress = async (req, res) => {
  try {
    const {
      resourceId,
      progressPercent,
      lastPage,
      totalPages,
      timeSpent,
      bookmarks,
      notes,
    } = req.body;

    const [progress, created] = await ReadingProgress.upsert({
      userId: req.user.userId,
      resourceId,
      progressPercent: Math.min(progressPercent || 0, 100),
      lastPage,
      totalPages,
      timeSpent: timeSpent || 0,
      bookmarks: bookmarks || [],
      notes: notes || [],
      lastReadAt: new Date(),
      completedAt: progressPercent >= 100 ? new Date() : null,
    });

    res.status(created ? 201 : 200).json({
      status: "ok",
      data: { progress },
      message: created
        ? "Reading progress created"
        : "Reading progress updated",
    });
  } catch (error) {
    console.error("Save reading progress error:", error.message);
    res.status(500).json({ status: "error", error: "Internal server error" });
  }
};

exports.getReadingProgress = async (req, res) => {
  try {
    const { resourceId } = req.params;

    const progress = await ReadingProgress.findOne({
      where: {
        userId: req.user.userId,
        resourceId,
      },
    });

    res.status(200).json({
      status: "ok",
      data: { progress: progress || null },
    });
  } catch (error) {
    console.error("Get reading progress error:", error.message);
    res.status(500).json({ status: "error", error: "Internal server error" });
  }
};

exports.getMyReadingProgress = async (req, res) => {
  try {
    const progress = await ReadingProgress.findAll({
      where: { userId: req.user.userId },
      include: [
        {
          model: Resource,
          as: "resource",
          attributes: ["resourceId", "title", "subject", "resourceType"],
        },
      ],
      order: [["lastReadAt", "DESC"]],
    });

    res.status(200).json({ status: "ok", data: { progress } });
  } catch (error) {
    console.error("Get my reading progress error:", error.message);
    res.status(500).json({ status: "error", error: "Internal server error" });
  }
};

// ===== RESERVATION SYSTEM =====

exports.createReservation = async (req, res) => {
  try {
    const { resourceId } = req.params;

    const resource = await Resource.findByPk(resourceId);
    if (!resource) {
      return res
        .status(404)
        .json({ status: "fail", error: "Resource not found" });
    }

    // Check if user already has an active reservation for this resource
    const existingReservation = await Reservation.findOne({
      where: {
        userId: req.user.userId,
        resourceId,
        status: "active",
      },
    });

    if (existingReservation) {
      return res.status(409).json({
        status: "fail",
        error: "You already have an active reservation for this resource",
      });
    }

    // Check if resource is currently available
    if (
      resource.formatType === "digital" ||
      (resource.availableCopies && resource.availableCopies > 0)
    ) {
      return res.status(400).json({
        status: "fail",
        error:
          "Resource is currently available - borrow directly instead of reserving",
      });
    }

    // Calculate queue position
    const queuePosition =
      (await Reservation.count({
        where: {
          resourceId,
          status: "active",
        },
      })) + 1;

    // Set expiration (7 days from now)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    const reservation = await Reservation.create({
      userId: req.user.userId,
      resourceId,
      status: "active",
      reservedAt: new Date(),
      expiresAt,
      queuePosition,
    });

    await notifyBorrower(req.user.userId, {
      title: `Reserved: ${resource.title}`,
      message: `You are #${queuePosition} in queue. We'll notify you when it's available.`,
      resourceId,
    });

    res.status(201).json({ status: "ok", data: { reservation } });
  } catch (error) {
    console.error("Create reservation error:", error.message);
    res.status(500).json({ status: "error", error: "Internal server error" });
  }
};

exports.getMyReservations = async (req, res) => {
  try {
    const reservations = await Reservation.findAll({
      where: { userId: req.user.userId },
      include: [
        {
          model: Resource,
          as: "resource",
          attributes: [
            "resourceId",
            "title",
            "subject",
            "resourceType",
            "formatType",
          ],
        },
      ],
      order: [["reservedAt", "DESC"]],
    });

    res.status(200).json({ status: "ok", data: { reservations } });
  } catch (error) {
    console.error("Get my reservations error:", error.message);
    res.status(500).json({ status: "error", error: "Internal server error" });
  }
};

exports.cancelReservation = async (req, res) => {
  try {
    const { reservationId } = req.params;

    const reservation = await Reservation.findOne({
      where: {
        reservationId,
        userId: req.user.userId,
        status: "active",
      },
    });

    if (!reservation) {
      return res
        .status(404)
        .json({ status: "fail", error: "Reservation not found" });
    }

    await reservation.update({ status: "cancelled" });

    // Update queue positions for remaining reservations
    await Reservation.update(
      { queuePosition: Sequelize.literal("queue_position - 1") },
      {
        where: {
          resourceId: reservation.resourceId,
          status: "active",
          queuePosition: { [Op.gt]: reservation.queuePosition },
        },
      },
    );

    res.status(200).json({ status: "ok", message: "Reservation cancelled" });
  } catch (error) {
    console.error("Cancel reservation error:", error.message);
    res.status(500).json({ status: "error", error: "Internal server error" });
  }
};

exports.clearBorrowHistory = async (req, res) => {
  try {
    const deletedCount = await BorrowTransaction.destroy({
      where: {
        userId: req.user.userId,
        [Op.or]: [
          { borrowType: "digital" },
          { status: "cancelled" },
          { status: "returned" },
          {
            status: "overdue",
            returnedAt: { [Op.ne]: null },
          },
        ],
      },
    });

    res.status(200).json({
      status: "ok",
      data: { deletedCount },
      message: "Closed borrow history cleared",
    });
  } catch (error) {
    console.error("Clear borrow history error:", error.message);
    res.status(500).json({ status: "error", error: "Internal server error" });
  }
};

exports.clearReservationHistory = async (req, res) => {
  try {
    const deletedCount = await Reservation.destroy({
      where: {
        userId: req.user.userId,
        status: { [Op.in]: ["cancelled", "expired", "fulfilled"] },
      },
    });

    res.status(200).json({
      status: "ok",
      data: { deletedCount },
      message: "Reservation history cleared",
    });
  } catch (error) {
    console.error("Clear reservation history error:", error.message);
    res.status(500).json({ status: "error", error: "Internal server error" });
  }
};

// ===== DUE DATE REMINDERS =====

exports.sendDueDateReminders = async (req, res) => {
  try {
    // Only librarians and admins can trigger reminders
    if (!["librarian", "admin"].includes(req.user.role)) {
      return res.status(403).json({ status: "fail", error: "Unauthorized" });
    }

    const reminderDays = [7, 3, 1]; // Days before due date to send reminders
    const sentReminders = [];

    for (const days of reminderDays) {
      const reminderDate = new Date();
      reminderDate.setDate(reminderDate.getDate() + days);

      const transactions = await BorrowTransaction.findAll({
        where: {
          status: "active",
          dueAt: {
            [Op.gte]: new Date(),
            [Op.lt]: reminderDate,
          },
        },
        include: [
          {
            model: User,
            as: "user",
            attributes: ["userId", "firstName", "lastName", "email"],
          },
          {
            model: Resource,
            as: "resource",
            attributes: ["resourceId", "title"],
          },
        ],
      });

      for (const transaction of transactions) {
        // Check if reminder already sent for this time period
        const existingReminder = await Notification.findOne({
          where: {
            userId: transaction.userId,
            resourceId: transaction.resourceId,
            title: {
              [Op.like]: `%Due in ${days} day%`,
            },
            createdAt: {
              [Op.gte]: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
            },
          },
        });

        if (!existingReminder) {
          await notifyBorrower(transaction.userId, {
            title: `Due Reminder: ${transaction.resource.title}`,
            message: `Your borrowing is due in ${days} day${days > 1 ? "s" : ""} (${transaction.dueAt.toLocaleDateString()}).`,
            resourceId: transaction.resourceId,
          });

          sentReminders.push({
            userId: transaction.userId,
            resourceId: transaction.resourceId,
            days,
          });
        }
      }
    }

    res.status(200).json({
      status: "ok",
      data: { sentReminders: sentReminders.length },
      message: `Sent ${sentReminders.length} due date reminders`,
    });
  } catch (error) {
    console.error("Send due date reminders error:", error.message);
    res.status(500).json({ status: "error", error: "Internal server error" });
  }
};
