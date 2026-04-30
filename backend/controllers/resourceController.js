const { Notification, PhysicalCopy, Resource, User } = require("../models");
const { Op } = require("sequelize");
const { v4: uuidv4 } = require("uuid");
const sendMail = require("../middleware/emailService");

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

const getDefaultResourceStatus = (role) =>
  role === "teacher" ? "pending" : "approved";

const getVisibleResourceWhere = () => ({
  [Op.or]: [{ status: "approved" }, { status: null }],
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

  await sendResourceEmails(students, resource, actorRole);
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
    if (req.user.role === "teacher") {
      where.userId = req.user.userId;
    }

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

    await resource.destroy();
    res.status(200).json({ status: "ok" });
  } catch (err) {
    console.error("Delete managed resource error:", err.message);
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
    if (status && (req.user?.role === "admin" || req.user?.role === "librarian")) {
      andConditions.push({ status });
    }
    if (availability === "available") {
      andConditions.push({
        [Op.or]: [{ formatType: "digital" }, { availableCopies: { [Op.gt]: 0 } }],
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

    res.status(200).json({ status: "ok", data: { resources } });
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
    const parsedContentData = parseContentData(contentData);
    const status = getDefaultResourceStatus(req.user.role);
    const newResource = await Resource.create({
      resourceId: uuidv4(),
      title,
      author: req.body.author?.trim() || null,
      subject,
      gradeLevel: normalizeGradeLevel(req.body.gradeLevel),
      description: req.body.description?.trim() || null,
      keywords: parseKeywords(req.body.keywords),
      filePath,
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
    res
      .status(201)
      .json({ status: "success", data: { resource: newResource } });
  } catch (err) {
    console.error("Controller error:", err.message);
    res.status(500).json({ status: "error", error: "Internal server error" });
  }
};

exports.uploadVideo = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      status: "fail",
      error: "An MP4 file is required",
    });
  }

  const { title, subject, contentData } = req.body;
  try {
    const status = getDefaultResourceStatus(req.user.role);
    const response = await Resource.create({
      resourceId: uuidv4(),
      title,
      author: req.body.author?.trim() || null,
      subject,
      gradeLevel: normalizeGradeLevel(req.body.gradeLevel),
      description: req.body.description?.trim() || null,
      keywords: parseKeywords(req.body.keywords),
      filePath: req.file.path,
      contentData: parseContentData(contentData),
      resourceType: "video",
      formatType: "digital",
      accessLevel: req.body.accessLevel || "public",
      status,
      userId: req.user.userId,
    });
    if (status === "approved") {
      await createStudentNotifications(response, req.user.role);
    }
    res.status(201).json({ status: "success", data: { resource: response } });
  } catch (err) {
    console.log("error message", err.message);
    res.status(500).json({ status: "error", error: "Internal server error" });
  }
};

exports.registerPhysicalResource = async (req, res) => {
  try {
    const totalCopies = Math.max(Number.parseInt(req.body.totalCopies, 10) || 1, 1);
    const status = req.user.role === "teacher" ? "pending" : "approved";
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

    res.status(201).json({ status: "ok", data: { resource, copies } });
  } catch (error) {
    console.error("Physical resource register error:", error.message);
    res.status(500).json({ status: "error", error: "Internal server error" });
  }
};

exports.updateManagedResource = async (req, res) => {
  try {
    const resource = await Resource.findByPk(req.params.id);
    if (!resource) {
      return res.status(404).json({ status: "fail", error: "Resource not found" });
    }

    if (req.user.role === "teacher" && resource.userId !== req.user.userId) {
      return res.status(403).json({
        status: "fail",
        error: "You are not allowed to update this resource",
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
