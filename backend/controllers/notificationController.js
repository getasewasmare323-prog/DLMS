const { Notification } = require("../models");

exports.getMyNotifications = async (req, res) => {
  try {
    const notifications = await Notification.findAll({
      where: { userId: req.user.userId },
      order: [["createdAt", "DESC"]],
      limit: 25,
    });

    res.status(200).json({
      status: "ok",
      data: { notifications },
    });
  } catch (error) {
    console.error("Notification fetch error:", error.message);
    res.status(500).json({ status: "error", error: "Internal server error" });
  }
};

exports.markAllAsRead = async (req, res) => {
  try {
    await Notification.update(
      { read: true },
      { where: { userId: req.user.userId, read: false } },
    );

    res.status(200).json({ status: "ok" });
  } catch (error) {
    console.error("Notification update error:", error.message);
    res.status(500).json({ status: "error", error: "Internal server error" });
  }
};

exports.clearMyNotifications = async (req, res) => {
  try {
    const deletedCount = await Notification.destroy({
      where: { userId: req.user.userId },
    });

    res.status(200).json({
      status: "ok",
      data: { deletedCount },
      message: "Notification history cleared",
    });
  } catch (error) {
    console.error("Notification clear error:", error.message);
    res.status(500).json({ status: "error", error: "Internal server error" });
  }
};
