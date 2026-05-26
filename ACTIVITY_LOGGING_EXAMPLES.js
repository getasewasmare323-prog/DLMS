/**
 * EXAMPLE: How to integrate activity logging into your controllers
 * This file shows practical examples for different scenarios
 */

// Example 1: Login Activity (for autController)
async function loginExample(req, res) {
  try {
    const user = await User.findOne({ where: { email: req.body.email } });

    if (!user || !(await user.validatePassword(req.body.password))) {
      // Log failed login
      await logActivity({
        userId: null,
        action: "LOGIN_FAILED",
        actionType: "LOGIN",
        category: "USER",
        description: `Failed login attempt with email: ${req.body.email}`,
        status: "FAILED",
        req,
      });
      return res
        .status(401)
        .json({ status: "error", message: "Invalid credentials" });
    }

    // Log successful login
    await logActivity({
      userId: user.userId,
      action: "USER_LOGIN",
      actionType: "LOGIN",
      category: "USER",
      description: `User ${user.email} logged in`,
      status: "SUCCESS",
      req,
    });

    // ... rest of login logic
  } catch (error) {
    await logActivity({
      userId: null,
      action: "LOGIN_ERROR",
      actionType: "LOGIN",
      category: "USER",
      description: error.message,
      status: "FAILED",
      req,
    });
  }
}

// Example 2: Resource Creation (for resourceController)
async function createResourceExample(req, res) {
  try {
    const resource = await Resource.create({
      ...req.body,
      userId: req.user.userId,
    });

    // Log resource creation
    await logActivity({
      userId: req.user.userId,
      action: "RESOURCE_CREATED",
      actionType: "CREATE",
      category: "RESOURCE",
      resourceId: resource.resourceId,
      resourceType: "Resource",
      description: `Created resource: "${resource.title}"`,
      status: "SUCCESS",
      details: {
        resourceTitle: resource.title,
        resourceType: resource.resourceType,
        fileName: resource.fileName,
      },
      req,
    });

    res.status(201).json({ status: "ok", data: resource });
  } catch (error) {
    await logActivity({
      userId: req.user.userId,
      action: "RESOURCE_CREATION_FAILED",
      actionType: "CREATE",
      category: "RESOURCE",
      description: `Failed to create resource: ${error.message}`,
      status: "FAILED",
      details: { error: error.message },
      req,
    });

    res.status(500).json({ status: "error", error: error.message });
  }
}

// Example 3: User Role Update (for userController)
async function updateUserRoleExample(req, res) {
  try {
    const user = await User.findByPk(req.params.id);
    const oldRole = user.role;

    await user.update({ role: req.body.role });

    // Log role change
    await logActivity({
      userId: req.user.userId, // Admin making the change
      action: "USER_ROLE_UPDATED",
      actionType: "UPDATE",
      category: "USER",
      resourceId: user.userId,
      resourceType: "User",
      description: `Changed user ${user.email} role from ${oldRole} to ${user.role}`,
      status: "SUCCESS",
      details: {
        targetUserId: user.userId,
        targetUserEmail: user.email,
        oldRole,
        newRole: user.role,
      },
      req,
    });

    res.status(200).json({ status: "ok", data: user });
  } catch (error) {
    await logActivity({
      userId: req.user.userId,
      action: "USER_ROLE_UPDATE_FAILED",
      actionType: "UPDATE",
      category: "USER",
      resourceId: req.params.id,
      resourceType: "User",
      description: error.message,
      status: "FAILED",
      req,
    });

    res.status(500).json({ status: "error", error: error.message });
  }
}

// Example 4: Borrow Transaction (for borrowController)
async function createBorrowExample(req, res) {
  try {
    const transaction = await BorrowTransaction.create({
      userId: req.user.userId,
      resourceId: req.body.resourceId,
      status: "active",
      borrowDate: new Date(),
      dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days
    });

    // Log borrow transaction
    await logActivity({
      userId: req.user.userId,
      action: "RESOURCE_BORROWED",
      actionType: "CREATE",
      category: "BORROW",
      resourceId: transaction.resourceId,
      resourceType: "BorrowTransaction",
      description: `User borrowed a resource`,
      status: "SUCCESS",
      details: {
        borrowTransactionId: transaction.borrowTransactionId,
        borrowDate: transaction.borrowDate,
        dueDate: transaction.dueDate,
      },
      req,
    });

    res.status(201).json({ status: "ok", data: transaction });
  } catch (error) {
    await logActivity({
      userId: req.user.userId,
      action: "BORROW_FAILED",
      actionType: "CREATE",
      category: "BORROW",
      resourceId: req.body.resourceId,
      resourceType: "BorrowTransaction",
      description: error.message,
      status: "FAILED",
      req,
    });

    res.status(500).json({ status: "error", error: error.message });
  }
}

// Example 5: Resource Download (for resourceController)
async function downloadResourceExample(req, res) {
  try {
    const resource = await Resource.findByPk(req.params.id);

    // Log download activity
    await logActivity({
      userId: req.user.userId,
      action: "RESOURCE_DOWNLOADED",
      actionType: "DOWNLOAD",
      category: "RESOURCE",
      resourceId: resource.resourceId,
      resourceType: "Resource",
      description: `Downloaded resource: "${resource.title}"`,
      status: "SUCCESS",
      details: {
        fileName: resource.fileName,
        fileSize: resource.fileSize,
      },
      req,
    });

    // ... rest of download logic
    res.download(resource.filePath);
  } catch (error) {
    await logActivity({
      userId: req.user.userId,
      action: "RESOURCE_DOWNLOAD_FAILED",
      actionType: "DOWNLOAD",
      category: "RESOURCE",
      resourceId: req.params.id,
      resourceType: "Resource",
      description: error.message,
      status: "FAILED",
      req,
    });

    res.status(500).json({ status: "error", error: error.message });
  }
}

// Example 6: Exercise Completion (for exerciseController)
async function submitExerciseExample(req, res) {
  try {
    const submission = await ExerciseSubmission.create({
      userId: req.user.userId,
      exerciseId: req.body.exerciseId,
      answers: req.body.answers,
      submittedAt: new Date(),
    });

    // Log exercise submission
    await logActivity({
      userId: req.user.userId,
      action: "EXERCISE_SUBMITTED",
      actionType: "CREATE",
      category: "EXERCISE",
      resourceId: submission.exerciseId,
      resourceType: "ExerciseSubmission",
      description: `Submitted exercise answers`,
      status: "SUCCESS",
      details: {
        submissionId: submission.submissionId,
        exerciseId: submission.exerciseId,
      },
      req,
    });

    res.status(201).json({ status: "ok", data: submission });
  } catch (error) {
    await logActivity({
      userId: req.user.userId,
      action: "EXERCISE_SUBMISSION_FAILED",
      actionType: "CREATE",
      category: "EXERCISE",
      resourceId: req.body.exerciseId,
      resourceType: "ExerciseSubmission",
      description: error.message,
      status: "FAILED",
      req,
    });

    res.status(500).json({ status: "error", error: error.message });
  }
}

// Example 7: Admin Settings Change
async function updateSettingsExample(req, res) {
  try {
    const setting = await SystemSetting.upsert(req.body);

    // Log admin action
    await logActivity({
      userId: req.user.userId,
      action: "SYSTEM_SETTINGS_UPDATED",
      actionType: "UPDATE",
      category: "ADMIN",
      description: `Updated system settings`,
      status: "SUCCESS",
      details: {
        updatedFields: Object.keys(req.body),
      },
      req,
    });

    res.status(200).json({ status: "ok", data: setting });
  } catch (error) {
    await logActivity({
      userId: req.user.userId,
      action: "SETTINGS_UPDATE_FAILED",
      actionType: "UPDATE",
      category: "ADMIN",
      description: error.message,
      status: "FAILED",
      req,
    });

    res.status(500).json({ status: "error", error: error.message });
  }
}

/**
 * HOW TO INTEGRATE:
 *
 * 1. At the top of each controller, add:
 *    const { logActivity } = require('../middleware/activityLogger');
 *
 * 2. In each action, wrap your logic in try-catch
 *
 * 3. After successful operation, call:
 *    await logActivity({ ... });
 *
 * 4. In catch block, also call logActivity with status: 'FAILED'
 *
 * 5. Always include req parameter so IP and user agent are captured
 */
