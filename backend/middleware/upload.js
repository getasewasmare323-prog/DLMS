const multer = require("multer");
const path = require("path");

// Allowed MIME types for different resource types
const ALLOWED_MIME_TYPES = {
  pdf: "application/pdf",
  video: ["video/mp4", "video/mpeg"],
  documents: [
    "application/msword", // .doc
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // .docx
    "application/vnd.ms-powerpoint", // .ppt
    "application/vnd.openxmlformats-officedocument.presentationml.presentation", // .pptx
  ],
  images: ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"],
};

// File types allowed for librarians only
const getLibrarianResourceTypes = () => [ALLOWED_MIME_TYPES.pdf];

// Additional file types allowed ONLY for teachers
const getTeacherOnlyTypes = () => [
  ...ALLOWED_MIME_TYPES.video,
  ...ALLOWED_MIME_TYPES.documents,
  ...ALLOWED_MIME_TYPES.images,
];

// Get allowed types based on user role
const getAllowedResourceTypes = (userRole) => {
  if (userRole === "teacher") {
    return [ALLOWED_MIME_TYPES.pdf, ...getTeacherOnlyTypes()];
  }

  if (userRole === "librarian") {
    return getLibrarianResourceTypes();
  }

  // Default: only PDF
  return [ALLOWED_MIME_TYPES.pdf];
};

// Storage logic
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Check a field in the request or the route to decide folder
    if (file.fieldname === "avatar") {
      cb(null, "uploads/profiles/");
    } else {
      cb(null, "uploads/resources/");
    }
  },
  filename: (req, file, cb) => {
    // Create a unique filename: user-123-timestamp.jpg
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname),
    );
  },
});

// File Filter: Validate types based on user role
const fileFilter = (req, file, cb) => {
  if (file.fieldname === "avatar") {
    // Only images for profiles
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Profile must be an image (JPG, PNG, GIF, WebP)!"), false);
    }
  } else {
    // Multiple file types for resources - based on user role
    const userRole = req.user?.role || "guest";
    const allowedTypes = getAllowedResourceTypes(userRole);

    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      const fileExt = path.extname(file.originalname).toLowerCase();

      // Customize error message based on user role
      let supportedTypes = "PDF, MP4, MPEG";
      if (userRole === "teacher") {
        supportedTypes =
          "PDF, MP4, MPEG, DOC, DOCX, PPT, PPTX, JPG, PNG, GIF, WebP";
      }

      cb(
        new Error(
          `File type not allowed: ${fileExt}. Supported for ${userRole}s: ${supportedTypes}`,
        ),
        false,
      );
    }
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB Limit
});

module.exports = upload;
// const multer = require("multer");

// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, "uploads/resources"); // Specify the upload directory
//   },
//   filename: function (req, file, cb) {
//     cb(null, Date.now() + "-" + file.originalname); // Use a unique filename
//   },
//   // add file url to rec body
// });

// const upload = multer({ storage: storage });

// module.exports = upload;
