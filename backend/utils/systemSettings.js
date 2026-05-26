const { SystemSetting } = require("../models");

const DEFAULT_NOTIFICATION_SETTINGS = {
  emailNotifications: true,
  newResourceNotifications: true,
  exerciseNotifications: true,
  overdueReminders: true,
  returnReminders: true,
  weeklyReports: false,
  monthlyReports: true,
};

const DEFAULT_APPROVAL_WORKFLOW = {
  teacherUploadsRequireApproval: false,
  librarianUploadsRequireApproval: false,
  autoApproveTextbooks: true,
  autoApproveVideos: false,
  requireSubjectAlignment: true,
  requireGradeLevelMatch: true,
};

const getSystemSetting = async (settingKey, defaultValue) => {
  const record = await SystemSetting.findByPk(settingKey);
  if (!record || !record.settingValue) {
    return defaultValue;
  }

  return {
    ...defaultValue,
    ...record.settingValue,
  };
};

const getNotificationSettings = async () =>
  getSystemSetting("notification_settings", DEFAULT_NOTIFICATION_SETTINGS);

const getApprovalWorkflowSettings = async () =>
  getSystemSetting("approval_workflow", DEFAULT_APPROVAL_WORKFLOW);

module.exports = {
  DEFAULT_NOTIFICATION_SETTINGS,
  DEFAULT_APPROVAL_WORKFLOW,
  getNotificationSettings,
  getApprovalWorkflowSettings,
};
