const {
  BorrowTransaction,
  Notification,
  PhysicalCopy,
  Resource,
  SystemSetting,
  User,
} = require("../models");
const { Op } = require("sequelize");
const { v4: uuidv4 } = require("uuid");

const DEFAULT_POLICIES = {
  student: { digitalLimit: 3, physicalLimit: 2, digitalDays: 7, physicalDays: 14 },
  teacher: { digitalLimit: 5, physicalLimit: 5, digitalDays: 14, physicalDays: 21 },
  librarian: { digitalLimit: 8, physicalLimit: 8, digitalDays: 14, physicalDays: 21 },
  admin: { digitalLimit: 10, physicalLimit: 10, digitalDays: 14, physicalDays: 21 },
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

exports.borrowDigitalResource = async (req, res) => {
  try {
    const resource = await Resource.findByPk(req.params.resourceId);
    if (!resource) {
      return res.status(404).json({ status: "fail", error: "Resource not found" });
    }

    if (resource.formatType === "physical") {
      return res.status(400).json({
        status: "fail",
        error: "This resource is physical only",
      });
    }

    if (resource.status && resource.status !== "approved") {
      return res.status(403).json({
        status: "fail",
        error: "Resource is not available for borrowing",
      });
    }

    const rolePolicy = await getRolePolicy(req.user.role);
    const activeDigitalCount = await BorrowTransaction.count({
      where: {
        userId: req.user.userId,
        borrowType: "digital",
        status: "active",
      },
    });

    if (activeDigitalCount >= rolePolicy.digitalLimit) {
      return res.status(400).json({
        status: "fail",
        error: "Digital borrow limit reached",
      });
    }

    const existingActiveBorrow = await BorrowTransaction.findOne({
      where: {
        userId: req.user.userId,
        resourceId: resource.resourceId,
        borrowType: "digital",
        status: "active",
      },
    });

    if (existingActiveBorrow) {
      return res.status(409).json({
        status: "fail",
        error: "You already have active digital access to this resource",
      });
    }

    const dueAt = addDays(rolePolicy.digitalDays);
    const transaction = await BorrowTransaction.create({
      transactionId: uuidv4(),
      userId: req.user.userId,
      resourceId: resource.resourceId,
      borrowType: "digital",
      status: "active",
      borrowedAt: new Date(),
      dueAt,
      accessExpiresAt: dueAt,
    });

    await notifyBorrower(req.user.userId, {
      title: `Borrowed: ${resource.title}`,
      message: `Your digital access is active until ${dueAt.toLocaleDateString()}.`,
      resourceId: resource.resourceId,
    });

    res.status(201).json({ status: "ok", data: { transaction } });
  } catch (error) {
    console.error("Digital borrow error:", error.message);
    res.status(500).json({ status: "error", error: "Internal server error" });
  }
};

exports.borrowPhysicalResource = async (req, res) => {
  try {
    const resource = await Resource.findByPk(req.params.resourceId, {
      include: [{ model: PhysicalCopy, as: "physicalCopies" }],
    });

    if (!resource) {
      return res.status(404).json({ status: "fail", error: "Resource not found" });
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
    const transaction = await BorrowTransaction.findByPk(req.params.transactionId, {
      include: [
        { model: Resource, as: "resource" },
        { model: PhysicalCopy, as: "physicalCopy" },
      ],
    });

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
