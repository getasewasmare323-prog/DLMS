const express = require("express");
const autController = require("../controllers/autController");
const borrowController = require("../controllers/borrowController");

const router = express.Router();

router.use(autController.jwtauth);
router.use(autController.libraryMember);

// Borrow listing and return processing
router.get(
  "/",
  autController.requireRoles("student", "teacher", "librarian", "admin"),
  borrowController.getMyBorrows,
);
router.post(
  "/physical/:resourceId",
  autController.requireRoles("student", "teacher"),
  borrowController.borrowPhysicalResource,
);
router.patch(
  "/:transactionId/return",
  autController.requireRoles("student", "teacher", "librarian", "admin"),
  borrowController.returnBorrowedResource,
);
router.get(
  "/overdue/list",
  autController.librarian,
  borrowController.getOverdueBorrows,
);

// Reading progress routes (student/teacher only)
router.post(
  "/progress",
  autController.requireRoles("student", "teacher"),
  borrowController.saveReadingProgress,
);
router.get(
  "/progress/:resourceId",
  autController.requireRoles("student", "teacher"),
  borrowController.getReadingProgress,
);
router.get(
  "/progress",
  autController.requireRoles("student", "teacher"),
  borrowController.getMyReadingProgress,
);

// Reservation routes
router.post(
  "/reserve/:resourceId",
  autController.requireRoles("student", "teacher"),
  borrowController.createReservation,
);
router.get(
  "/reservations",
  autController.requireRoles("student", "teacher"),
  borrowController.getMyReservations,
);
router.delete(
  "/reservations/:reservationId",
  autController.requireRoles("student", "teacher"),
  borrowController.cancelReservation,
);

// Due date reminders (librarian only)
router.post(
  "/reminders/send",
  autController.librarian,
  borrowController.sendDueDateReminders,
);

module.exports = router;
