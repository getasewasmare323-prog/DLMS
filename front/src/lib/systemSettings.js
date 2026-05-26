export const DEFAULT_BORROWING_POLICY = {
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

export const DEFAULT_SCHOOL_INFO = {
  schoolName: "Bahir Dar University Preparatory School",
  schoolAddress: "Bahir Dar, Ethiopia",
  schoolPhone: "+251-XXX-XXXXXXX",
  schoolEmail: "library@school.et",
  principalName: "",
  librarianName: "",
  website: "https://school.et",
};

export const DEFAULT_ACADEMIC_SETTINGS = {
  currentAcademicYear: "2025-2026",
  semester: "1", // 1 or 2
  gradeLevels: [9, 10, 11, 12],
  subjects: [
    "English",
    "Mathematics",
    "Biology",
    "Chemistry",
    "Physics",
    "History",
    "Geography",
    "Civics",
    "Amharic",
    "Economics",
    "Information Technology",
  ],
};

export const DEFAULT_LIBRARY_HOURS = {
  monday: { open: "08:00", close: "17:00", closed: false },
  tuesday: { open: "08:00", close: "17:00", closed: false },
  wednesday: { open: "08:00", close: "17:00", closed: false },
  thursday: { open: "08:00", close: "17:00", closed: false },
  friday: { open: "08:00", close: "17:00", closed: false },
  saturday: { open: "09:00", close: "13:00", closed: false },
  sunday: { open: "00:00", close: "00:00", closed: true },
};

export const DEFAULT_NOTIFICATION_SETTINGS = {
  emailNotifications: true,
  newResourceNotifications: true,
  exerciseNotifications: true,
  overdueReminders: true,
  returnReminders: true,
  weeklyReports: false,
  monthlyReports: true,
};

export const DEFAULT_FINE_SETTINGS = {
  dailyOverdueFine: 5, // ETB per day
  maxOverdueFine: 100, // Maximum fine amount
  gracePeriodDays: 3, // Days before fines start
  fineWaiverThreshold: 50, // Amount that requires admin approval for waiver
};

export const DEFAULT_APPROVAL_WORKFLOW = {
  teacherUploadsRequireApproval: false,
  librarianUploadsRequireApproval: false,
  autoApproveTextbooks: true,
  autoApproveVideos: false,
  requireSubjectAlignment: true,
  requireGradeLevelMatch: true,
};

export const DEFAULT_LOCALIZATION_SETTINGS = {
  primaryLanguage: "en", // "en" or "am"
  supportedLanguages: ["en", "am"],
  dateFormat: "DD/MM/YYYY",
  currency: "ETB",
  timezone: "Africa/Addis_Ababa",
};
