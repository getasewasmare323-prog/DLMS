const express = require("express");
// const upload = require("../medle_ware/upload");
const resourceController = require("../controllers/resourceController");
const autController = require("../controllers/autController");
// const borrowController = require("../controller/borrowController");
const router = express.Router();
const upload = require("../middleware/upload");

// upload route placeholder (handler not implemented yet)
router.post(
  "/uploadBook",
  autController.jwtauth,
  autController.teacherOrLibrarian,
  upload.single("file"),
  (req, res, next) => {
    console.log("Uploaded file:", req.file);
    next();
  },
  resourceController.uploadBook,
);

// upload video route
router.post(
  "/uploadVideo",
  autController.jwtauth,
  autController.teacher,
  upload.fields([
    { name: "file", maxCount: 1 },
    { name: "playlistFiles", maxCount: 24 },
  ]),
  (req, res, next) => {
    console.log("Uploaded files:", req.files);
    next();
  },
  resourceController.uploadVideo,
);

// reading resources (non–class dependent)
router.get(
  "/reading",
  autController.jwtauth,
  autController.libraryMember,
  resourceController.getReadingResources,
);
router.get(
  "/reading/textbooks",
  autController.jwtauth,
  autController.libraryMember,
  resourceController.getTextbookResources,
);
router.get(
  "/reading/materials",
  autController.jwtauth,
  autController.libraryMember,
  resourceController.getTeacherMaterials,
);
router.get(
  "/search",
  autController.jwtauth,
  autController.libraryMember,
  resourceController.searchResources,
);
// video resources
router.get(
  "/videos",
  autController.jwtauth,
  autController.libraryMember,
  resourceController.getVideoResources,
);
router.get(
  "/manage",
  autController.jwtauth,
  autController.teacherOrLibrarian,
  resourceController.getManagedResources,
);
router.get(
  "/:id/download",
  autController.jwtauth,
  autController.libraryMember,
  resourceController.downloadStudentResource,
);
router.patch(
  "/manage/:id",
  autController.jwtauth,
  autController.teacherOrLibrarian,
  resourceController.updateManagedResource,
);
router.delete(
  "/manage/:id",
  autController.jwtauth,
  autController.teacherOrLibrarian,
  resourceController.deleteManagedResource,
);
router.post(
  "/registerPhysical",
  autController.jwtauth,
  autController.librarian,
  resourceController.registerPhysicalResource,
);
router.get(
  "/:id",
  autController.jwtauth,
  autController.libraryMember,
  resourceController.getResourceById,
);

module.exports = router;
