const express = require("express");
const autController = require("../controllers/autController");
const borrowController = require("../controllers/borrowController");

const router = express.Router();

router.use(autController.jwtauth);
router.use(autController.libraryMember);

router.get("/", borrowController.getMyBorrows);
router.post("/digital/:resourceId", borrowController.borrowDigitalResource);
router.post("/physical/:resourceId", borrowController.borrowPhysicalResource);
router.patch("/:transactionId/return", borrowController.returnBorrowedResource);
router.get(
  "/overdue/list",
  autController.librarianOrAdmin,
  borrowController.getOverdueBorrows,
);

module.exports = router;
