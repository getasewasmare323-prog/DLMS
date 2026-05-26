const {
  ActivityLog,
  User,
  Resource,
  BorrowTransaction,
  Exercise,
} = require("../models");
const { Op, fn, col, literal } = require("sequelize");
const json2csv = require("json2csv").Parser;

/**
 * Get user activity logs with filters
 */
exports.getUserActivityLogs = async (req, res) => {
  try {
    const {
      userId,
      userRole,
      action,
      category,
      resourceType,
      startDate,
      endDate,
      limit = 50,
      offset = 0,
      sortBy = "timestamp",
      sortOrder = "DESC",
    } = req.query;

    const where = {};

    if (userId) where.userId = userId;
    if (action) where.action = action;
    if (category) where.category = category;
    if (resourceType) where.resourceType = resourceType;

    if (startDate || endDate) {
      where.timestamp = {};
      if (startDate) where.timestamp[Op.gte] = new Date(startDate);
      if (endDate) where.timestamp[Op.lte] = new Date(endDate);
    }

    const userInclude = {
      model: User,
      as: "user",
      attributes: ["userId", "firstName", "lastName", "email", "role"],
    };

    if (userRole) {
      userInclude.where = { role: userRole };
    }

    const logs = await ActivityLog.findAndCountAll({
      where,
      include: [userInclude],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [[sortBy, sortOrder]],
    });

    res.status(200).json({
      status: "ok",
      data: {
        total: logs.count,
        logs: logs.rows,
        limit: parseInt(limit),
        offset: parseInt(offset),
      },
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Failed to fetch activity logs",
      error: error.message,
    });
  }
};

/**
 * Get activity report for a specific user
 */
exports.getUserActivityReport = async (req, res) => {
  try {
    const { userId } = req.params;
    const { startDate, endDate } = req.query;

    const where = { userId };
    if (startDate || endDate) {
      where.timestamp = {};
      if (startDate) where.timestamp[Op.gte] = new Date(startDate);
      if (endDate) where.timestamp[Op.lte] = new Date(endDate);
    }

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({
        status: "error",
        message: "User not found",
      });
    }

    const activities = await ActivityLog.findAll({
      where,
      order: [["timestamp", "DESC"]],
    });

    const summary = {
      totalActivities: activities.length,
      byCategory: {},
      byActionType: {},
      byStatus: {},
    };

    activities.forEach((activity) => {
      summary.byCategory[activity.category] =
        (summary.byCategory[activity.category] || 0) + 1;
      summary.byActionType[activity.actionType] =
        (summary.byActionType[activity.actionType] || 0) + 1;
      summary.byStatus[activity.status] =
        (summary.byStatus[activity.status] || 0) + 1;
    });

    res.status(200).json({
      status: "ok",
      data: {
        user: {
          userId: user.userId,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role,
        },
        summary,
        activities,
      },
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Failed to fetch user activity report",
      error: error.message,
    });
  }
};

/**
 * Get system activity summary
 */
exports.getActivitySummary = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const where = {};
    if (startDate || endDate) {
      where.timestamp = {};
      if (startDate) where.timestamp[Op.gte] = new Date(startDate);
      if (endDate) where.timestamp[Op.lte] = new Date(endDate);
    }

    const [
      totalActivities,
      activitiesByCategory,
      activitiesByActionType,
      activitiesByStatus,
    ] = await Promise.all([
      ActivityLog.count({ where }),
      ActivityLog.findAll({
        where,
        attributes: [
          "category",
          [require("sequelize").fn("COUNT", "*"), "count"],
        ],
        group: ["category"],
        raw: true,
      }),
      ActivityLog.findAll({
        where,
        attributes: [
          "actionType",
          [require("sequelize").fn("COUNT", "*"), "count"],
        ],
        group: ["actionType"],
        raw: true,
      }),
      ActivityLog.findAll({
        where,
        attributes: [
          "status",
          [require("sequelize").fn("COUNT", "*"), "count"],
        ],
        group: ["status"],
        raw: true,
      }),
    ]);

    const recentActivities = await ActivityLog.findAll({
      where,
      include: [
        {
          model: User,
          as: "user",
          attributes: ["userId", "firstName", "lastName", "email", "role"],
        },
      ],
      limit: 20,
      order: [["timestamp", "DESC"]],
    });

    res.status(200).json({
      status: "ok",
      data: {
        totalActivities,
        activitiesByCategory: Object.fromEntries(
          activitiesByCategory.map((item) => [
            item.category,
            parseInt(item.count),
          ]),
        ),
        activitiesByActionType: Object.fromEntries(
          activitiesByActionType.map((item) => [
            item.actionType,
            parseInt(item.count),
          ]),
        ),
        activitiesByStatus: Object.fromEntries(
          activitiesByStatus.map((item) => [item.status, parseInt(item.count)]),
        ),
        recentActivities,
      },
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Failed to fetch activity summary",
      error: error.message,
    });
  }
};

const buildDateFilter = (startDate, endDate) => {
  const where = {};
  if (startDate) where[Op.gte] = new Date(startDate);
  if (endDate) where[Op.lte] = new Date(endDate);
  return Object.keys(where).length ? where : null;
};

const generateUsageReport = async ({ where, userRole, resourceType }) => {
  const userInclude = {
    model: User,
    as: "user",
    attributes: ["userId", "firstName", "lastName", "email", "role"],
  };

  if (userRole) {
    userInclude.where = { role: userRole };
  }

  if (resourceType) {
    where.resourceType = resourceType;
  }

  const [totalActivities, actionsByType, topUsers, topResources, activeUsers] =
    await Promise.all([
      ActivityLog.count({ where, include: [userInclude] }),
      ActivityLog.findAll({
        where,
        attributes: ["actionType", [fn("COUNT", "*"), "count"]],
        group: ["actionType"],
        raw: true,
      }),
      ActivityLog.findAll({
        where,
        include: [userInclude],
        attributes: ["userId", [fn("COUNT", "*"), "count"]],
        group: ["userId"],
        order: [[literal("count"), "DESC"]],
        limit: 10,
        raw: true,
      }),
      ActivityLog.findAll({
        where: { ...where, resourceId: { [Op.ne]: null } },
        attributes: ["resourceId", [fn("COUNT", "*"), "count"]],
        group: ["resourceId"],
        order: [[literal("count"), "DESC"]],
        limit: 10,
        raw: true,
      }),
      ActivityLog.count({
        where: { ...where, actionType: "LOGIN" },
        distinct: true,
        col: "userId",
      }),
    ]);

  return {
    totalActivities,
    actionsByType: Object.fromEntries(
      actionsByType.map((item) => [item.actionType, parseInt(item.count, 10)]),
    ),
    topUsers: topUsers.map((row) => ({
      userId: row.userId,
      activityCount: parseInt(row.count, 10),
    })),
    topResources: topResources.map((row) => ({
      resourceId: row.resourceId,
      activityCount: parseInt(row.count, 10),
    })),
    activeUsers,
  };
};

const generatePerformanceReport = async ({ where, userRole, resourceType }) => {
  if (resourceType) {
    where.resourceType = resourceType;
  }

  const [
    resourceCreations,
    resourceUpdates,
    resourceReads,
    totalExercises,
    actionsPerUser,
  ] = await Promise.all([
    ActivityLog.count({
      where: { ...where, actionType: "CREATE", category: "RESOURCE" },
    }),
    ActivityLog.count({
      where: { ...where, actionType: "UPDATE", category: "RESOURCE" },
    }),
    ActivityLog.count({
      where: { ...where, actionType: "READ", category: "RESOURCE" },
    }),
    Exercise.count(),
    ActivityLog.findAll({
      where,
      attributes: ["userId", [fn("COUNT", "*"), "count"]],
      group: ["userId"],
      raw: true,
    }),
  ]);

  const averageActivityPerUser = actionsPerUser.length
    ? actionsPerUser.reduce((sum, row) => sum + parseInt(row.count, 10), 0) /
      actionsPerUser.length
    : 0;

  return {
    resourceCreations,
    resourceUpdates,
    resourceReads,
    totalExercises,
    averageActivityPerUser: Number(averageActivityPerUser.toFixed(2)),
    usersTracked: actionsPerUser.length,
  };
};

const generateSecurityReport = async ({ where, userRole, resourceType }) => {
  if (resourceType) {
    where.resourceType = resourceType;
  }

  const [
    loginCount,
    logoutCount,
    failedActions,
    failedLogins,
    suspiciousUsers,
  ] = await Promise.all([
    ActivityLog.count({ where: { ...where, actionType: "LOGIN" } }),
    ActivityLog.count({ where: { ...where, actionType: "LOGOUT" } }),
    ActivityLog.count({ where: { ...where, status: "FAILED" } }),
    ActivityLog.count({
      where: { ...where, status: "FAILED", actionType: "LOGIN" },
    }),
    ActivityLog.findAll({
      where: { ...where, status: "FAILED" },
      attributes: ["userId", [fn("COUNT", "*"), "count"]],
      group: ["userId"],
      order: [[literal("count"), "DESC"]],
      limit: 10,
      raw: true,
    }),
  ]);

  return {
    loginCount,
    logoutCount,
    failedActions,
    failedLogins,
    suspiciousUsers: suspiciousUsers.map((row) => ({
      userId: row.userId,
      failedAttempts: parseInt(row.count, 10),
    })),
  };
};

const generateCurriculumReport = async ({
  subject,
  gradeLevel,
  resourceType,
}) => {
  const resourceWhere = {};
  const exerciseWhere = {};

  if (subject) {
    resourceWhere.subject = subject;
    exerciseWhere.subject = subject;
  }

  if (gradeLevel) {
    resourceWhere.gradeLevel = gradeLevel;
    exerciseWhere.gradeLevel = gradeLevel;
  }

  if (resourceType) {
    resourceWhere.resourceType = resourceType;
  }

  const [
    resourcesBySubject,
    resourcesByGrade,
    exercisesBySubject,
    exercisesByGrade,
  ] = await Promise.all([
    Resource.findAll({
      where: resourceWhere,
      attributes: ["subject", [fn("COUNT", "*"), "count"]],
      group: ["subject"],
      raw: true,
    }),
    Resource.findAll({
      where: resourceWhere,
      attributes: ["gradeLevel", [fn("COUNT", "*"), "count"]],
      group: ["gradeLevel"],
      raw: true,
    }),
    Exercise.findAll({
      where: exerciseWhere,
      attributes: ["subject", [fn("COUNT", "*"), "count"]],
      group: ["subject"],
      raw: true,
    }),
    Exercise.findAll({
      where: exerciseWhere,
      attributes: ["gradeLevel", [fn("COUNT", "*"), "count"]],
      group: ["gradeLevel"],
      raw: true,
    }),
  ]);

  return {
    resourcesBySubject: Object.fromEntries(
      resourcesBySubject.map((row) => [
        row.subject || "Unknown",
        parseInt(row.count, 10),
      ]),
    ),
    resourcesByGrade: Object.fromEntries(
      resourcesByGrade.map((row) => [
        String(row.gradeLevel),
        parseInt(row.count, 10),
      ]),
    ),
    exercisesBySubject: Object.fromEntries(
      exercisesBySubject.map((row) => [
        row.subject || "Unknown",
        parseInt(row.count, 10),
      ]),
    ),
    exercisesByGrade: Object.fromEntries(
      exercisesByGrade.map((row) => [
        String(row.gradeLevel),
        parseInt(row.count, 10),
      ]),
    ),
  };
};

const formatReportCsv = (reportType, reportData) => {
  const rows = [];

  Object.entries(reportData).forEach(([key, value]) => {
    if (value === null || value === undefined) {
      return;
    }

    if (Array.isArray(value)) {
      value.forEach((item) =>
        rows.push({ metric: key, details: JSON.stringify(item) }),
      );
      return;
    }

    if (typeof value === "object") {
      Object.entries(value).forEach(([subKey, subValue]) => {
        rows.push({ metric: `${key}.${subKey}`, details: subValue });
      });
      return;
    }

    rows.push({ metric: key, details: value });
  });

  return new json2csv({ fields: ["metric", "details"] }).parse(rows);
};

exports.generateReport = async (req, res) => {
  try {
    const {
      reportType = "usage",
      startDate,
      endDate,
      userRole,
      resourceType,
      subject,
      gradeLevel,
      format = "json",
    } = req.query;

    const where = {};
    const dateFilter = buildDateFilter(startDate, endDate);
    if (dateFilter) where.timestamp = dateFilter;

    let reportData;
    switch ((reportType || "usage").toLowerCase()) {
      case "usage":
        reportData = await generateUsageReport({
          where,
          userRole,
          resourceType,
        });
        break;
      case "performance":
        reportData = await generatePerformanceReport({
          where,
          userRole,
          resourceType,
        });
        break;
      case "security":
        reportData = await generateSecurityReport({
          where,
          userRole,
          resourceType,
        });
        break;
      case "curriculum":
        reportData = await generateCurriculumReport({
          subject,
          gradeLevel,
          resourceType,
        });
        break;
      default:
        return res.status(400).json({
          status: "error",
          message:
            "Invalid reportType. Valid values: usage, performance, security, curriculum",
        });
    }

    if (format.toLowerCase() === "csv") {
      const csv = formatReportCsv(reportType, reportData);
      res.header("Content-Type", "text/csv");
      res.header(
        "Content-Disposition",
        `attachment; filename=${reportType}-report.csv`,
      );
      return res.send(csv);
    }

    res.status(200).json({
      status: "ok",
      data: {
        reportType,
        filters: {
          startDate,
          endDate,
          userRole,
          resourceType,
          subject,
          gradeLevel,
        },
        report: reportData,
      },
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Failed to generate report",
      error: error.message,
    });
  }
};

/**
 * Export activity logs as CSV
 */
exports.exportActivityLogs = async (req, res) => {
  try {
    const { userId, category, startDate, endDate } = req.query;

    const where = {};
    if (userId) where.userId = userId;
    if (category) where.category = category;

    if (startDate || endDate) {
      where.timestamp = {};
      if (startDate) where.timestamp[Op.gte] = new Date(startDate);
      if (endDate) where.timestamp[Op.lte] = new Date(endDate);
    }

    const logs = await ActivityLog.findAll({
      where,
      include: [
        {
          model: User,
          as: "user",
          attributes: ["userId", "firstName", "lastName", "email", "role"],
        },
      ],
      order: [["timestamp", "DESC"]],
    });

    const csvData = logs.map((log) => ({
      Timestamp: log.timestamp,
      User: `${log.user?.firstName} ${log.user?.lastName}`,
      Email: log.user?.email,
      Action: log.action,
      ActionType: log.actionType,
      Category: log.category,
      ResourceId: log.resourceId || "N/A",
      Status: log.status,
      IPAddress: log.ipAddress || "N/A",
      Description: log.description || "",
    }));

    const csv = new json2csv({
      fields: [
        "Timestamp",
        "User",
        "Email",
        "Action",
        "ActionType",
        "Category",
        "ResourceId",
        "Status",
        "IPAddress",
        "Description",
      ],
    }).parse(csvData);

    res.header("Content-Type", "text/csv");
    res.header("Content-Disposition", "attachment; filename=activity-logs.csv");
    res.send(csv);
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Failed to export activity logs",
      error: error.message,
    });
  }
};

/**
 * Get comprehensive system report
 */
exports.getSystemReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const where = {};
    if (startDate || endDate) {
      where.timestamp = {};
      if (startDate) where.timestamp[Op.gte] = new Date(startDate);
      if (endDate) where.timestamp[Op.lte] = new Date(endDate);
    }

    const [
      totalActivities,
      activeUsers,
      totalResources,
      totalExercises,
      activeBorrows,
      loginCount,
      logoutCount,
      resourceCreations,
      resourceUpdates,
      borrowTransactions,
    ] = await Promise.all([
      ActivityLog.count({ where }),
      ActivityLog.count({
        where: { ...where, actionType: "LOGIN" },
        distinct: true,
        col: "userId",
      }),
      Resource.count(),
      Exercise.count(),
      BorrowTransaction.count({
        where: {
          status: { [require("sequelize").Op.in]: ["active", "overdue"] },
        },
      }),
      ActivityLog.count({ where: { ...where, actionType: "LOGIN" } }),
      ActivityLog.count({ where: { ...where, actionType: "LOGOUT" } }),
      ActivityLog.count({
        where: { ...where, actionType: "CREATE", category: "RESOURCE" },
      }),
      ActivityLog.count({
        where: { ...where, actionType: "UPDATE", category: "RESOURCE" },
      }),
      BorrowTransaction.count(),
    ]);

    res.status(200).json({
      status: "ok",
      data: {
        totalActivities,
        activeUsers,
        totalResources,
        totalExercises,
        activeBorrows,
        logins: loginCount,
        logouts: logoutCount,
        resourceCreations,
        resourceUpdates,
        totalBorrowTransactions: borrowTransactions,
      },
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Failed to generate system report",
      error: error.message,
    });
  }
};
