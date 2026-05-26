const userRouter = require("./routers/userRouter");
const resourceRouter = require("./routers/resourceRouter");
const adminRouter = require("./routers/adminRouter");
const borrowRouter = require("./routers/borrowRouter");
const learningRouter = require("./routers/learningRouter");
const teacherRouter = require("./routers/teacherRouter");
const exerciseRouter = require("./routers/exerciseRouter");
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const path = require("path");
const { sequelize } = require("./models");

const app = express();

const sendStartupTestEmail = async () => {
  return;
};

app.use(
  cors({
    origin: true,
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
    exposedHeaders: ["Content-Disposition"],
  }),
);

app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(
  "/uploads",
  express.static(path.join(__dirname, "uploads"), {
    setHeaders: (res, filePath) => {
      if (
        filePath.toLowerCase().endsWith(".pdf") ||
        filePath.toLowerCase().endsWith(".mp4") ||
        filePath.toLowerCase().endsWith(".ppt") ||
        filePath.toLowerCase().endsWith(".doc") ||
        filePath.toLowerCase().endsWith(".jpg")
      ) {
        if (filePath.toLowerCase().endsWith(".pdf")) {
          res.setHeader("Content-Type", "application/pdf");
          res.setHeader("Content-Disposition", "inline");
        } else if (filePath.toLowerCase().endsWith(".mp4")) {
          res.setHeader("Content-Type", "video/mp4");
          res.setHeader("Content-Disposition", "inline");
        }
      }
    },
  }),
);

app.get("/", (req, res) => {
  res.status(200).json({ status: "OK" });
});

app.use("/user", userRouter);
app.use("/resources", resourceRouter);
app.use("/exercises", exerciseRouter);
app.use("/teacher", teacherRouter);
app.use("/admin", adminRouter);
app.use("/borrows", borrowRouter);
app.use("/learning", learningRouter);

const PORT = process.env.PORT || 8000;

const repairLegacySchema = async () => {
  // Clean up an accidental legacy Ratings."userId " column that was created
  // by a past association typo before Sequelize runs alter-sync again.
  await sequelize.query(`
    ALTER TABLE "Ratings" DROP CONSTRAINT IF EXISTS "Ratings_userId _fkey";
    ALTER TABLE "Ratings" DROP COLUMN IF EXISTS "userId ";
  `);
};

const repairResourceAssociations = async () => {
  await sequelize.query(`
    DELETE FROM "Notifications"
    WHERE "resourceId" IS NOT NULL
      AND "resourceId" NOT IN (SELECT "resourceId" FROM "Resources");
    DELETE FROM "Bookmarks"
    WHERE "resourceId" IS NOT NULL
      AND "resourceId" NOT IN (SELECT "resourceId" FROM "Resources");
    DELETE FROM "BorrowTransactions"
    WHERE "resourceId" IS NOT NULL
      AND "resourceId" NOT IN (SELECT "resourceId" FROM "Resources");
    DELETE FROM "PhysicalCopies"
    WHERE "resourceId" IS NOT NULL
      AND "resourceId" NOT IN (SELECT "resourceId" FROM "Resources");
    DELETE FROM "ReadingListItems"
    WHERE "resourceId" IS NOT NULL
      AND "resourceId" NOT IN (SELECT "resourceId" FROM "Resources");
    DELETE FROM "ReadingProgresses"
    WHERE "resourceId" IS NOT NULL
      AND "resourceId" NOT IN (SELECT "resourceId" FROM "Resources");
    DELETE FROM "Ratings"
    WHERE "resourceId" IS NOT NULL
      AND "resourceId" NOT IN (SELECT "resourceId" FROM "Resources");
  `);
};

const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log("Database connection established.");

    if (process.env.NODE_ENV !== "production") {
      await repairLegacySchema();
      await repairResourceAssociations();
      await sequelize.sync({ alter: true });
      console.log("Database schema synchronized for development.");
    }

    app.listen(PORT, () => {
      sendStartupTestEmail();
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();
