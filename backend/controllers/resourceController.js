const {
  Notification,
  PhysicalCopy,
  Resource,
  User,
  Bookmark,
  BorrowTransaction,
  ReadingListItem,
  ReadingProgress,
  Rating,
} = require("../models");
const { Op } = require("sequelize");
const { v4: uuidv4 } = require("uuid");
const sendMail = require("../middleware/emailService");
const fs = require("fs");
const path = require("path");
const {
  getNotificationSettings,
  getApprovalWorkflowSettings,
} = require("../utils/systemSettings");
const { validateResourceContent } = require("../utils/contentValidator");

const normalizeGradeLevel = (value) => {
  if (value === undefined || value === null || value === "") {
    return null;
  }

  const parsed = Number.parseInt(String(value).replace(/[^\d]/g, ""), 10);
  return Number.isNaN(parsed) ? null : parsed;
};

const normalizeLibrarySection = (value, fallbackRole) => {
  if (value === "textbook" || value === "teacher-material") {
    return value;
  }

  return fallbackRole === "teacher" ? "teacher-material" : "textbook";
};

const parseContentData = (contentData) => {
  if (typeof contentData === "string" && contentData.trim()) {
    try {
      return JSON.parse(contentData);
    } catch (error) {
      return { description: contentData };
    }
  }

  return contentData || {};
};

const parseArrayField = (value) => {
  if (!value) {
    return [];
  }

  if (Array.isArray(value)) {
    return value;
  }

  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) {
      return [];
    }

    try {
      const parsed = JSON.parse(trimmed);
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      return [value];
    }
  }

  return [];
};

const parseKeywords = (keywords) => {
  if (!keywords) {
    return [];
  }

  if (Array.isArray(keywords)) {
    return keywords.map((item) => String(item).trim()).filter(Boolean);
  }

  return String(keywords)
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
};

const normalizeFormatType = (value, fallback = "digital") => {
  if (["digital", "physical", "hybrid"].includes(value)) {
    return value;
  }

  return fallback;
};

const getDefaultResourceStatus = async (
  userRole,
  resourceType,
  uploadContext = {},
) => {
  const approvalSettings = await getApprovalWorkflowSettings();

  if (userRole === "admin") {
    return "approved";
  }

  if (
    userRole === "teacher" &&
    approvalSettings.teacherUploadsRequireApproval
  ) {
    return "pending";
  }

  if (
    userRole === "librarian" &&
    approvalSettings.librarianUploadsRequireApproval
  ) {
    return "pending";
  }

  if (approvalSettings.requireSubjectAlignment && !uploadContext.subject) {
    return "pending";
  }

  if (
    approvalSettings.requireGradeLevelMatch &&
    (uploadContext.gradeLevel === null ||
      uploadContext.gradeLevel === undefined)
  ) {
    return "pending";
  }

  if (resourceType === "video") {
    return approvalSettings.autoApproveVideos ? "approved" : "pending";
  }

  if (resourceType === "reading") {
    const librarySection = normalizeLibrarySection(
      uploadContext.librarySection,
      userRole,
    );
    if (librarySection === "textbook") {
      return approvalSettings.autoApproveTextbooks ? "approved" : "pending";
    }
  }

  return "approved";
};

const getVisibleResourceWhere = () => ({
  [Op.or]: [{ status: "approved" }, { status: null }],
});

const uploadsRoot = path.resolve(__dirname, "..", "uploads");

const getResourceLibrarySection = (resource) =>
  resource?.contentData?.librarySection ||
  (resource?.user?.role === "teacher" ? "teacher-material" : "textbook");

const isStudentDownloadableResource = (resource) => {
  if (!resource?.filePath) {
    return false;
  }

  if (resource.resourceType === "video") {
    return true;
  }

  return (
    resource.resourceType === "reading" &&
    getResourceLibrarySection(resource) === "teacher-material"
  );
};

const buildDownloadFilename = (resource) => {
  const extension = path.extname(resource.filePath || "") || "";
  const safeTitle = String(resource.title || "resource")
    .replace(/[<>:"/\\|?*\x00-\x1f]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  return `${safeTitle || "resource"}${extension}`;
};

const buildVideoItemFilename = (resourceTitle, item) => {
  const extension = path.extname(item?.filePath || "") || ".mp4";
  const safeName = String(item?.title || resourceTitle || "video")
    .replace(/[<>:"/\\|?*\x00-\x1f]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  return `${safeName || "video"}${extension}`;
};

const getPlaylistItems = (resource) => {
  if (!Array.isArray(resource?.contentData?.playlistItems)) {
    return [];
  }

  return resource.contentData.playlistItems
    .filter((item) => item && item.filePath)
    .map((item, index) => ({
      itemId: item.itemId || `playlist-item-${index + 1}`,
      title: item.title || `Lesson ${index + 1}`,
      description: item.description || "",
      filePath: item.filePath,
      position:
        Number.isInteger(item.position) && item.position > 0
          ? item.position
          : index + 1,
    }))
    .sort((left, right) => left.position - right.position);
};

const getDownloadTarget = (resource, requestedItemId = null) => {
  if (
    resource.resourceType !== "video" ||
    resource.contentType !== "playlist"
  ) {
    return {
      filePath: resource.filePath,
      downloadName: buildDownloadFilename(resource),
    };
  }

  const playlistItems = getPlaylistItems(resource);
  if (!playlistItems.length) {
    return null;
  }

  const selectedItem =
    playlistItems.find((item) => item.itemId === requestedItemId) ||
    playlistItems[0];

  return {
    filePath: selectedItem.filePath,
    downloadName: buildVideoItemFilename(resource.title, selectedItem),
  };
};

const collectResourceFilePaths = (resource) => {
  const filePaths = new Set();

  if (resource?.filePath) {
    filePaths.add(resource.filePath);
  }

  getPlaylistItems(resource).forEach((item) => {
    if (item.filePath) {
      filePaths.add(item.filePath);
    }
  });

  return Array.from(filePaths);
};

const removeResourceFilesFromDisk = async (filePaths) => {
  await Promise.allSettled(
    filePaths.map(async (filePath) => {
      const absoluteFilePath = path.resolve(__dirname, "..", filePath);
      if (!absoluteFilePath.startsWith(uploadsRoot)) {
        return;
      }

      await fs.promises.unlink(absoluteFilePath);
    }),
  );
};

const buildPlaylistItemsFromUpload = (entries, files) =>
  files.map((file, index) => {
    const entry = entries[index] || {};
    return {
      itemId: uuidv4(),
      title: String(entry.title || file.originalname || `Lesson ${index + 1}`)
        .replace(path.extname(file.originalname || ""), "")
        .trim(),
      description: String(entry.description || "").trim(),
      filePath: file.path,
      position: index + 1,
    };
  });

const getGradeScopeText = (gradeLevel) =>
  gradeLevel !== null && gradeLevel !== undefined
    ? `Grade ${gradeLevel}`
    : "all grades";

const sendResourceEmails = async (students, resource, actorRole) => {
  const scopedStudents = students.filter((student) => student.email);

  if (!scopedStudents.length) {
    return;
  }

  const gradeScopeText = getGradeScopeText(resource.gradeLevel);
  const mailResults = await Promise.allSettled(
    scopedStudents.map((student) =>
      sendMail({
        email: student.email,
        subject: `New resource: ${resource.title}`,
        html: `
          <h2>New resource available</h2>
          <p>Hello ${student.firstName || "student"},</p>
          <p>A new ${resource.resourceType} resource was uploaded by a ${actorRole} for ${gradeScopeText}.</p>
          <p><strong>Title:</strong> ${resource.title}</p>
          <p><strong>Subject:</strong> ${resource.subject || "General"}</p>
        `,
      }),
    ),
  );

  const failedCount = mailResults.filter(
    (result) => result.status === "rejected",
  ).length;

  console.log(
    `[email] Resource notification emails sent: ${mailResults.length - failedCount}/${mailResults.length}`,
  );

  if (failedCount) {
    console.error(
      `[email] Resource notification emails failed: ${failedCount}`,
    );
  }
};

const createStudentNotifications = async (resource, actorRole) => {
  const notificationSettings = await getNotificationSettings();
  if (!notificationSettings.newResourceNotifications) {
    return;
  }

  const where = { role: "student" };
  if (resource.gradeLevel !== null && resource.gradeLevel !== undefined) {
    where.classLevel = resource.gradeLevel;
  }

  const students = await User.findAll({
    where,
    attributes: ["userId", "email", "firstName"],
  });

  if (!students.length) {
    return;
  }

  const scopeText = resource.gradeLevel
    ? `Grade ${resource.gradeLevel}`
    : "all grades";

  await Notification.bulkCreate(
    students.map((student) => ({
      notificationId: uuidv4(),
      title: `${resource.title} is now available`,
      message: `A ${resource.resourceType} resource was uploaded by a ${actorRole} for ${scopeText}.`,
      read: false,
      userId: student.userId,
      resourceId: resource.resourceId,
      gradeLevel: resource.gradeLevel,
      actorRole,
    })),
  );

  if (notificationSettings.emailNotifications) {
    await sendResourceEmails(students, resource, actorRole);
  }
};

const listReadingResources = async (res, section = null) => {
  try {
    const items = await Resource.findAll({
      where: {
        resourceType: "reading",
        ...getVisibleResourceWhere(),
      },
      include: [
        {
          model: User,
          as: "user",
          attributes: ["userId", "firstName", "lastName", "role"],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    const resources = section
      ? items.filter((item) => {
          const librarySection =
            item.contentData?.librarySection ||
            (item.user?.role === "teacher" ? "teacher-material" : "textbook");

          return librarySection === section;
        })
      : items;
    console.log("Fetched resources:", resources);
    res.status(200).json({ status: "ok", data: { resources } });
  } catch (err) {
    console.error("Controller error:", err.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.getReadingResources = async (req, res) => {
  await listReadingResources(res);
};

exports.getTextbookResources = async (req, res) => {
  await listReadingResources(res, "textbook");
};

exports.getTeacherMaterials = async (req, res) => {
  await listReadingResources(res, "teacher-material");
};

exports.getVideoResources = async (req, res) => {
  try {
    const items = await Resource.findAll({
      where: {
        resourceType: "video",
        ...getVisibleResourceWhere(),
      },
      include: [
        {
          model: User,
          as: "user",
          attributes: ["userId", "firstName", "lastName", "role"],
        },
      ],
      order: [["createdAt", "DESC"]],
    });
    res.status(200).json({ status: "ok", data: { resources: items } });
  } catch (err) {
    console.error("Controller error:", err.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.getManagedResources = async (req, res) => {
  try {
    const where = {};
    const include = [
      {
        model: User,
        as: "user",
        attributes: ["userId", "firstName", "lastName", "role"],
      },
    ];

    if (req.user.role === "teacher") {
      where.userId = req.user.userId;
    } else if (req.user.role === "librarian") {
      // Librarians should not see teachers' materials
      include[0].where = { role: { [Op.ne]: "teacher" } };
      include[0].required = true; // to inner join
    }

    const resources = await Resource.findAll({
      where,
      include,
      order: [["createdAt", "DESC"]],
    });

    res.status(200).json({ status: "ok", data: { resources } });
  } catch (err) {
    console.error("Managed resource error:", err.message);
    res.status(500).json({ status: "error", error: "Internal server error" });
  }
};

exports.deleteManagedResource = async (req, res) => {
  try {
    const resource = await Resource.findOne({
      where: { resourceId: req.params.id },
      include: [
        {
          model: User,
          as: "user",
          attributes: ["role"],
        },
      ],
    });

    if (!resource) {
      return res
        .status(404)
        .json({ status: "fail", error: "Resource not found" });
    }

    if (req.user.role === "teacher" && resource.userId !== req.user.userId) {
      return res.status(403).json({
        status: "fail",
        error: "You are not allowed to delete this resource",
      });
    }

    if (req.user.role === "librarian" && resource.user?.role === "teacher") {
      return res.status(403).json({
        status: "fail",
        error: "Librarians cannot manage teachers' materials",
      });
    }

    const resourceFilePaths = collectResourceFilePaths(resource);

    await Resource.sequelize.transaction(async (transaction) => {
      await Promise.all([
        Bookmark.destroy({
          where: { resourceId: resource.resourceId },
          transaction,
        }),
        BorrowTransaction.destroy({
          where: { resourceId: resource.resourceId },
          transaction,
        }),
        PhysicalCopy.destroy({
          where: { resourceId: resource.resourceId },
          transaction,
        }),
        ReadingListItem.destroy({
          where: { resourceId: resource.resourceId },
          transaction,
        }),
        ReadingProgress.destroy({
          where: { resourceId: resource.resourceId },
          transaction,
        }),
        Rating.destroy({
          where: { resourceId: resource.resourceId },
          transaction,
        }),
        Notification.destroy({
          where: { resourceId: resource.resourceId },
          transaction,
        }),
      ]);

      await resource.destroy({ transaction });
    });

    await removeResourceFilesFromDisk(resourceFilePaths);

    res.status(200).json({ status: "ok" });
  } catch (err) {
    console.error("Delete managed resource error:", err);
    res.status(500).json({ status: "error", error: "Internal server error" });
  }
};

exports.getResourceById = async (req, res) => {
  const id = req.params.id;
  try {
    const resource = await Resource.findOne({
      where: {
        resourceId: id,
        ...getVisibleResourceWhere(),
      },
      include: [
        {
          model: User,
          as: "user",
          attributes: ["userId", "firstName", "lastName", "role"],
        },
        {
          model: PhysicalCopy,
          as: "physicalCopies",
          attributes: ["copyId", "barcode", "status", "condition"],
        },
      ],
    });
    if (!resource) {
      return res.status(404).json({ error: "Resource not found" });
    }
    res.status(200).json({ status: "success", data: { resource } });
  } catch (err) {
    console.error("Controller error:", err.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.downloadStudentResource = async (req, res) => {
  try {
    if (req.user?.role !== "student") {
      return res.status(403).json({
        status: "fail",
        error: "Only students can download teacher materials and videos",
      });
    }

    const resource = await Resource.findOne({
      where: {
        resourceId: req.params.id,
        ...getVisibleResourceWhere(),
      },
      include: [
        {
          model: User,
          as: "user",
          attributes: ["role"],
        },
      ],
    });

    if (!resource) {
      return res
        .status(404)
        .json({ status: "fail", error: "Resource not found" });
    }

    if (!isStudentDownloadableResource(resource)) {
      return res.status(403).json({
        status: "fail",
        error: "This resource is not available for student download",
      });
    }

    const downloadTarget = getDownloadTarget(resource, req.query.itemId);
    if (!downloadTarget?.filePath) {
      return res.status(404).json({
        status: "fail",
        error: "The selected lesson file could not be found",
      });
    }

    const absoluteFilePath = path.resolve(
      __dirname,
      "..",
      downloadTarget.filePath,
    );
    if (!absoluteFilePath.startsWith(uploadsRoot)) {
      return res.status(400).json({
        status: "fail",
        error: "Invalid resource file path",
      });
    }

    await fs.promises.access(absoluteFilePath, fs.constants.R_OK);

    res.download(absoluteFilePath, downloadTarget.downloadName);
  } catch (error) {
    console.error("Student resource download error:", error.message);
    res.status(500).json({ status: "error", error: "Failed to download file" });
  }
};

exports.searchResources = async (req, res) => {
  try {
    const {
      q,
      subject,
      gradeLevel,
      resourceType,
      formatType,
      availability,
      status,
    } = req.query;

    const andConditions = [];

    if (!(req.user?.role === "admin" || req.user?.role === "librarian")) {
      andConditions.push(getVisibleResourceWhere());
    }

    if (q) {
      andConditions.push({
        [Op.or]: [
          { title: { [Op.iLike]: `%${q}%` } },
          { subject: { [Op.iLike]: `%${q}%` } },
          { author: { [Op.iLike]: `%${q}%` } },
          { description: { [Op.iLike]: `%${q}%` } },
        ],
      });
    }

    if (subject) {
      andConditions.push({ subject: { [Op.iLike]: `%${subject}%` } });
    }
    if (gradeLevel) {
      andConditions.push({ gradeLevel: normalizeGradeLevel(gradeLevel) });
    }
    if (resourceType) {
      andConditions.push({ resourceType });
    }
    if (formatType) {
      andConditions.push({ formatType });
    }
    if (
      status &&
      (req.user?.role === "admin" || req.user?.role === "librarian")
    ) {
      andConditions.push({ status });
    }
    if (availability === "available") {
      andConditions.push({
        [Op.or]: [
          { formatType: "digital" },
          { availableCopies: { [Op.gt]: 0 } },
        ],
      });
    }

    const where = andConditions.length ? { [Op.and]: andConditions } : {};

    const resources = await Resource.findAll({
      where,
      include: [
        {
          model: User,
          as: "user",
          attributes: ["userId", "firstName", "lastName", "role"],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    // Only apply library section filters when NOT searching for moderation purposes
    // (pending/rejected/archived resources should be visible to admins for review)
    const isModerationSearch =
      status && ["pending", "rejected", "archived"].includes(status);

    const filteredResources = isModerationSearch
      ? resources
      : resources.filter((resource) => {
          if (resource.resourceType === "video") {
            return false;
          }

          const librarySection = getResourceLibrarySection(resource);
          return librarySection !== "teacher-material";
        });

    res
      .status(200)
      .json({ status: "ok", data: { resources: filteredResources } });
  } catch (error) {
    console.error("Resource search error:", error.message);
    res.status(500).json({ status: "error", error: "Internal server error" });
  }
};

exports.uploadBook = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      status: "fail",
      error: "A PDF file is required",
    });
  }

  const { title, subject, contentData } = req.body;
  const filePath = req.file.path;

  try {
    // Validate content for spam and duplicates
    const validation = await validateResourceContent(
      {
        title: title?.trim() || "",
        description: req.body.description?.trim() || "",
        subject: subject?.trim() || "",
        gradeLevel: normalizeGradeLevel(req.body.gradeLevel),
      },
      filePath,
    );

    if (!validation.isValid) {
      // Clean up uploaded file if validation fails
      fs.unlink(filePath, (err) => {
        if (err) console.error("Error deleting file:", err);
      });

      return res.status(400).json({
        status: "fail",
        errors: validation.errors,
        message: "Content validation failed",
      });
    }

    const parsedContentData = parseContentData(contentData);
    const status = await getDefaultResourceStatus(req.user.role, "reading", {
      librarySection: req.body.librarySection,
      subject,
      gradeLevel: normalizeGradeLevel(req.body.gradeLevel),
    });
    const newResource = await Resource.create({
      resourceId: uuidv4(),
      title,
      author: req.body.author?.trim() || null,
      subject,
      gradeLevel: normalizeGradeLevel(req.body.gradeLevel),
      description: req.body.description?.trim() || null,
      keywords: parseKeywords(req.body.keywords),
      filePath,
      fileHash: validation.fileHash || null,
      contentData: {
        ...parsedContentData,
        librarySection: normalizeLibrarySection(
          req.body.librarySection,
          req.user.role,
        ),
      },
      resourceType: "reading",
      formatType: normalizeFormatType(req.body.formatType, "digital"),
      accessLevel: req.body.accessLevel || "public",
      status,
      totalCopies: Number.parseInt(req.body.totalCopies, 10) || 0,
      availableCopies: Number.parseInt(req.body.availableCopies, 10) || 0,
      shelfLocation: req.body.shelfLocation?.trim() || null,
      userId: req.user.userId,
    });

    if (status === "approved") {
      await createStudentNotifications(newResource, req.user.role);
    }

    // Return warnings if any
    const response = { status: "success", data: { resource: newResource } };
    if (validation.warnings.length > 0) {
      response.warnings = validation.warnings;
    }

    res.status(201).json(response);
  } catch (err) {
    console.error("Controller error:", err.message);
    // Clean up uploaded file on error
    fs.unlink(filePath, (err) => {
      if (err) console.error("Error deleting file:", err);
    });
    res.status(500).json({ status: "error", error: "Internal server error" });
  }
};

exports.uploadVideo = async (req, res) => {
  try {
    const { title, subject, contentData } = req.body;
    const uploadMode =
      req.body.contentType === "playlist" ? "playlist" : "single";
    const singleFile = req.files?.file?.[0] || null;
    const playlistFiles = req.files?.playlistFiles || [];

    if (uploadMode === "single" && !singleFile) {
      return res.status(400).json({
        status: "fail",
        error: "An MP4 file is required",
      });
    }

    if (uploadMode === "playlist" && !playlistFiles.length) {
      return res.status(400).json({
        status: "fail",
        error: "At least one playlist video file is required",
      });
    }

    // Validate content for spam and duplicates (use first file for hash calculation)
    const filePathForValidation =
      uploadMode === "single" ? singleFile.path : playlistFiles[0].path;
    const validation = await validateResourceContent(
      {
        title: title?.trim() || "",
        description: req.body.description?.trim() || "",
        subject: subject?.trim() || "",
        gradeLevel: normalizeGradeLevel(req.body.gradeLevel),
      },
      filePathForValidation,
    );

    if (!validation.isValid) {
      // Clean up uploaded files if validation fails
      const allFiles =
        uploadMode === "single"
          ? [singleFile]
          : [singleFile, ...playlistFiles].filter(Boolean);
      allFiles.forEach((file) => {
        fs.unlink(file.path, (err) => {
          if (err) console.error("Error deleting file:", err);
        });
      });

      return res.status(400).json({
        status: "fail",
        errors: validation.errors,
        message: "Content validation failed",
      });
    }

    const parsedContentData = parseContentData(contentData);
    const playlistEntries = parseArrayField(req.body.playlistEntries);
    const playlistItems =
      uploadMode === "playlist"
        ? buildPlaylistItemsFromUpload(playlistEntries, playlistFiles)
        : [];
    const status = await getDefaultResourceStatus(req.user.role, "video", {
      subject,
      gradeLevel: normalizeGradeLevel(req.body.gradeLevel),
    });
    const response = await Resource.create({
      resourceId: uuidv4(),
      title,
      author: req.body.author?.trim() || null,
      subject,
      gradeLevel: normalizeGradeLevel(req.body.gradeLevel),
      description: req.body.description?.trim() || null,
      keywords: parseKeywords(req.body.keywords),
      filePath:
        uploadMode === "playlist"
          ? playlistItems[0]?.filePath || null
          : singleFile.path,
      fileHash: validation.fileHash || null,
      contentType: uploadMode,
      contentData: {
        ...parsedContentData,
        description: req.body.description?.trim() || null,
        playlistItems,
      },
      resourceType: "video",
      formatType: "digital",
      accessLevel: req.body.accessLevel || "public",
      status,
      userId: req.user.userId,
    });
    if (status === "approved") {
      await createStudentNotifications(response, req.user.role);
    }

    // Return warnings if any
    const responseData = { status: "success", data: { resource: response } };
    if (validation.warnings.length > 0) {
      responseData.warnings = validation.warnings;
    }

    res.status(201).json(responseData);
  } catch (err) {
    console.log("error message", err.message);
    res.status(500).json({ status: "error", error: "Internal server error" });
  }
};

exports.registerPhysicalResource = async (req, res) => {
  try {
    // Validate content for spam
    const validation = await validateResourceContent(
      {
        title: req.body.title?.trim() || "",
        description: req.body.description?.trim() || "",
        subject: req.body.subject?.trim() || "",
        gradeLevel: normalizeGradeLevel(req.body.gradeLevel),
      },
      null, // No file for physical resources
    );

    if (!validation.isValid) {
      return res.status(400).json({
        status: "fail",
        errors: validation.errors,
        message: "Content validation failed",
      });
    }

    const totalCopies = Math.max(
      Number.parseInt(req.body.totalCopies, 10) || 1,
      1,
    );
    const status = await getDefaultResourceStatus(
      req.user.role,
      req.body.resourceType,
      {
        subject: req.body.subject,
        gradeLevel: normalizeGradeLevel(req.body.gradeLevel),
        librarySection: req.body.contentData?.librarySection,
      },
    );
    const resource = await Resource.create({
      resourceId: uuidv4(),
      title: req.body.title?.trim(),
      author: req.body.author?.trim() || null,
      subject: req.body.subject?.trim() || null,
      gradeLevel: normalizeGradeLevel(req.body.gradeLevel),
      description: req.body.description?.trim() || null,
      keywords: parseKeywords(req.body.keywords),
      resourceType: req.body.resourceType === "video" ? "video" : "reading",
      formatType: req.body.hasDigitalAccess ? "hybrid" : "physical",
      accessLevel: req.body.accessLevel || "public",
      status,
      totalCopies,
      availableCopies: totalCopies,
      shelfLocation: req.body.shelfLocation?.trim() || null,
      contentData: parseContentData(req.body.contentData),
      userId: req.user.userId,
    });

    const copies = await PhysicalCopy.bulkCreate(
      Array.from({ length: totalCopies }, (_, index) => ({
        copyId: uuidv4(),
        resourceId: resource.resourceId,
        barcode:
          req.body.barcodes?.[index] ||
          `${resource.resourceId.slice(0, 8)}-${index + 1}`,
        condition: req.body.condition || "good",
        locationNote: req.body.shelfLocation?.trim() || null,
      })),
    );

    // Return warnings if any
    const responseData = { status: "ok", data: { resource, copies } };
    if (validation.warnings.length > 0) {
      responseData.warnings = validation.warnings;
    }

    res.status(201).json(responseData);
  } catch (error) {
    console.error("Physical resource register error:", error.message);
    res.status(500).json({ status: "error", error: "Internal server error" });
  }
};

exports.updateManagedResource = async (req, res) => {
  try {
    const resource = await Resource.findOne({
      where: { resourceId: req.params.id },
      include: [
        {
          model: User,
          as: "user",
          attributes: ["role"],
        },
      ],
    });
    if (!resource) {
      return res
        .status(404)
        .json({ status: "fail", error: "Resource not found" });
    }

    if (req.user.role === "teacher" && resource.userId !== req.user.userId) {
      return res.status(403).json({
        status: "fail",
        error: "You are not allowed to update this resource",
      });
    }

    if (req.user.role === "librarian" && resource.user?.role === "teacher") {
      return res.status(403).json({
        status: "fail",
        error: "Librarians cannot manage teachers' materials",
      });
    }

    const updatePayload = {
      title: req.body.title ?? resource.title,
      author: req.body.author ?? resource.author,
      subject: req.body.subject ?? resource.subject,
      gradeLevel:
        req.body.gradeLevel === undefined
          ? resource.gradeLevel
          : normalizeGradeLevel(req.body.gradeLevel),
      description: req.body.description ?? resource.description,
      keywords:
        req.body.keywords === undefined
          ? resource.keywords
          : parseKeywords(req.body.keywords),
      accessLevel: req.body.accessLevel ?? resource.accessLevel,
      shelfLocation: req.body.shelfLocation ?? resource.shelfLocation,
    };

    if (req.body.description !== undefined) {
      updatePayload.description = req.body.description ?? resource.description;
    }

    if (
      req.body.description !== undefined ||
      req.body.contentData !== undefined
    ) {
      const nextContentData =
        req.body.contentData && typeof req.body.contentData === "object"
          ? req.body.contentData
          : resource.contentData || {};

      updatePayload.contentData = {
        ...(resource.contentData || {}),
        ...nextContentData,
      };

      if (req.body.description !== undefined) {
        updatePayload.contentData.description =
          req.body.description?.trim() || null;
      }
    }

    if (req.user.role !== "teacher") {
      updatePayload.status = req.body.status ?? resource.status;
      updatePayload.totalCopies =
        req.body.totalCopies === undefined
          ? resource.totalCopies
          : Math.max(Number.parseInt(req.body.totalCopies, 10) || 0, 0);
      updatePayload.availableCopies =
        req.body.availableCopies === undefined
          ? resource.availableCopies
          : Math.max(Number.parseInt(req.body.availableCopies, 10) || 0, 0);
    }

    await resource.update(updatePayload);

    res.status(200).json({ status: "ok", data: { resource } });
  } catch (error) {
    console.error("Managed resource update error:", error.message);
    res.status(500).json({ status: "error", error: "Internal server error" });
  }
};
