const { User } = require("../models");
const bcrypt = require("bcrypt");
const saltRounds = 10;

const serializeUser = (user) => {
  if (!user) return null;
  return {
    userId: user.userId,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    role: user.role,
    classLevel: user.classLevel,
  };
};

exports.getAllUser = async (req, res) => {
  try {
    const result = await User.findAll({
      attributes: ["userId", "firstName", "lastName", "email", "role", "classLevel"],
    });
    if (!result.length) {
      return res.status(404).json({ error: "No users found" });
    }

    res.status(200).json({
      status: "ok",
      data: { users: result },
    });
  } catch (err) {
    console.error("Controller error:", err.message);
    res.status(500).json({ error: "Internal server error" });
  }
};
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findOne({
      where: { userId: req.params.id },
      attributes: ["userId", "firstName", "lastName", "email", "role", "classLevel"],
    });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.status(200).json({
      status: "success",
      data: { user },
    });
  } catch (err) {
    console.error("Controller error:", err.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.getCurrentUser = async (req, res) => {
  res.status(200).json({
    status: "ok",
    data: { user: serializeUser(req.user) },
  });
};

exports.updateUser = async (req, res) => {
  const userId = req.params.id;
  const { firstName, lastName, email, role, classLevel } = req.body;
  try {
    const user = await User.findOne({
      where: { userId },
    });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const nextRole = role ?? user.role;
    const normalizedClassLevel =
      classLevel === undefined
        ? user.classLevel
        : classLevel === null || classLevel === "" || nextRole !== "student"
          ? null
          : Number.parseInt(classLevel, 10);

    await user.update({
      firstName: firstName ?? user.firstName,
      lastName: lastName ?? user.lastName,
      email: email ?? user.email,
      role: nextRole,
      classLevel: normalizedClassLevel,
    });

    res.status(200).json({
      status: "success",
      data: { user },
    });
  } catch (err) {
    console.error("Controller error:", err.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.updateCurrentUser = async (req, res) => {
  const userId = req.user.userId;
  const { firstName, lastName, email, classLevel } = req.body;

  try {
    const user = await User.findOne({
      where: { userId },
    });
    if (!user) {
      return res.status(404).json({ status: "fail", error: "User not found" });
    }

    const normalizedClassLevel =
      user.role !== "student"
        ? null
        : classLevel === undefined
          ? user.classLevel
          : classLevel === null || classLevel === ""
            ? null
            : Number.parseInt(classLevel, 10);

    await user.update({
      firstName:
        typeof firstName === "string" && firstName.trim()
          ? firstName.trim()
          : user.firstName,
      lastName:
        typeof lastName === "string" && lastName.trim()
          ? lastName.trim()
          : user.lastName,
      email:
        typeof email === "string" && email.trim()
          ? email.trim().toLowerCase()
          : user.email,
      classLevel: normalizedClassLevel,
    });

    res.status(200).json({
      status: "ok",
      data: { user: serializeUser(user) },
    });
  } catch (err) {
    console.error("Current user update error:", err.message);
    if (err.name === "SequelizeUniqueConstraintError") {
      return res.status(409).json({ status: "fail", error: "Email already in use" });
    }
    res.status(500).json({ status: "error", error: "Internal server error" });
  }
};

exports.updateCurrentPassword = async (req, res) => {
  const userId = req.user.userId;
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({
      status: "fail",
      error: "currentPassword and newPassword are required",
    });
  }

  if (String(newPassword).length < 6) {
    return res.status(400).json({
      status: "fail",
      error: "New password must be at least 6 characters long",
    });
  }

  try {
    const user = await User.findOne({
      where: { userId },
    });
    if (!user) {
      return res.status(404).json({ status: "fail", error: "User not found" });
    }

    const passwordMatches = await bcrypt.compare(currentPassword, user.password);
    if (!passwordMatches) {
      return res.status(400).json({
        status: "fail",
        error: "Current password is incorrect",
      });
    }

    const nextPasswordHash = await bcrypt.hash(newPassword, saltRounds);
    await user.update({ password: nextPasswordHash });

    res.status(200).json({
      status: "ok",
      message: "Password updated successfully",
    });
  } catch (err) {
    console.error("Password update error:", err.message);
    res.status(500).json({ status: "error", error: "Internal server error" });
  }
};
exports.updateUserRole = async (req, res) => {
  const userId = req.params.id;
  const { role, classLevel } = req.body;
  try {
    const user = await User.findOne({
      where: { userId },
    });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const nextRole = role ?? user.role;
    const normalizedClassLevel =
      classLevel === undefined
        ? user.classLevel
        : classLevel === null || classLevel === "" || nextRole !== "student"
          ? null
          : Number.parseInt(classLevel, 10);

    await user.update({
      role: nextRole,
      classLevel: normalizedClassLevel,
    });

    res.status(200).json({
      status: "success",
      data: { user },
    });
  } catch (err) {
    console.error("Controller error:", err.message);
    res.status(500).json({ error: "Internal server error" });
  }
};
exports.deleteUser = async (req, res) => {
  const userId = req.params.id;
  try {
    const result = await User.destroy({ where: { userId } });
    if (result == 0) {
      return res.status(404).json({ error: "User not found" });
    } else {
      res.status(200).json({
        status: "ok",
        message: "User deleted successfully",
      });
    }
  } catch (err) {
    console.error("Controller error:", err.message);
    res.status(500).json({ error: "Internal server error" });
  }
};
