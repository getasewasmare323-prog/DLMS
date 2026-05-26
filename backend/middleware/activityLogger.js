const { ActivityLog } = require("../models");

/**
 * Middleware to log user activities
 * This is a wrapper function that can be used to log specific actions
 */
const logActivity = async ({
  userId,
  action,
  actionType,
  category,
  resourceId,
  resourceType,
  description,
  status = "SUCCESS",
  details,
  req,
}) => {
  try {
    // Extract IP address from request
    const ipAddress = req
      ? req.ip ||
        req.connection.remoteAddress ||
        req.socket.remoteAddress ||
        req.connection.socket?.remoteAddress
      : null;

    // Extract user agent from request
    const userAgent = req ? req.get("user-agent") : null;

    await ActivityLog.create({
      userId,
      action,
      actionType,
      category,
      resourceId,
      resourceType,
      ipAddress,
      userAgent,
      description,
      status,
      details,
    });
  } catch (error) {
    console.error("Error logging activity:", error);
    // Don't throw error - logging should not break the main flow
  }
};

/**
 * Express middleware to attach logger to request
 */
const attachLogger = (req, res, next) => {
  req.logActivity = async (activityData) => {
    await logActivity({
      ...activityData,
      req,
    });
  };
  next();
};

module.exports = {
  logActivity,
  attachLogger,
};
