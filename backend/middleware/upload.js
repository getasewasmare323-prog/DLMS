const multer = require("multer");
const path = require("path");

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

// File Filter: Validate types
const fileFilter = (req, file, cb) => {
  if (file.fieldname === "avatar") {
    // Only images for profiles
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Profile must be an image!"), false);
    }
  } else {
    // PDFs and Videos for resources
    const allowedTypes = ["application/pdf", "video/mp4", "video/mpeg"];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only PDFs and MP4 videos allowed!"), false);
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
