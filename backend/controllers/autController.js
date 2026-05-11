const jwt = require("jsonwebtoken");
require("dotenv").config();
const { User } = require("../models");
const bcrypt = require("bcrypt");
const saltRounds = 10;
const { promisify } = require("util");

// helper to sign a token and set a cookie
const createTokenAndSetCookie = (userId, res) => {
  const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "1d",
  });

  res.cookie("jwt", token, {
    httpOnly: true,
    // secure: true, // enable in production with HTTPS
    expires: new Date(
      Date.now() +
        (process.env.JWT_COOKIE_EXPIRED_IN || 90) * 24 * 60 * 60 * 1000,
    ),
  });

  return token;
};

exports.signUp = async (req, res) => {
  const { firstName, lastName, email, password, classLevel } = req.body;

  if (!firstName || !lastName || !email || !password) {
    return res
      .status(400)
      .json({ error: "firstName, lastName, email and password are required" });
  }

  try {
    const hash = await bcrypt.hash(password, saltRounds);
    const user = await User.create({
      firstName,
      lastName,
      email,
      password: hash,
      classLevel: classLevel ? Number.parseInt(classLevel, 10) : null,
    });

    createTokenAndSetCookie(user.userId, res);
    // console.log(tt);
    return res.status(201).json({
      status: "ok",
      data: {
        user: {
          userId: user.userId,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role,
          classLevel: user.classLevel,
        },
      },
    });
  } catch (err) {
    console.error("SignUp error:", err);
    if (err.name === "SequelizeUniqueConstraintError") {
      return res.status(409).json({ error: "Email already in use" });
    }
    res.status(500).json({ error: "Internal server error" });
  }
};
exports.login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  try {
    const userRecord = await User.findOne({ where: { email } });
    if (!userRecord) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const user = userRecord.toJSON();
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const tt = createTokenAndSetCookie(user.userId, res);
    console.log(tt);
    const { userId, firstName, lastName, role, classLevel } = user;

    res.status(200).json({
      status: "ok",
      data: {
        user: { userId, firstName, lastName, email, role, classLevel },
        tt,
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.jwtauth = async (req, res, next) => {
  try {
    const token = req.cookies && req.cookies.jwt;
    if (!token) {
      return res
        .status(401)
        .json({ success: false, message: "Please log in first" });
    }

    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
    if (!decoded || !decoded.userId) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid token payload" });
    }

    const userRecord = await User.findOne({
      where: { userId: decoded.userId },
    });
    if (!userRecord) {
      return res.status(401).json({
        status: "fail",
        message: "The user belonging to this token no longer exists",
      });
    }

    req.user = userRecord.toJSON();
    next();
  } catch (err) {
    console.error("JWT Auth Error:", err);
    return res.status(401).json({
      success: false,
      message: "Invalid credentials or token expired",
    });
  }
};
const requireRoles =
  (...roles) =>
  (req, res, next) => {
    const role = req.user && req.user.role;
    if (!roles.includes(role)) {
      return res.status(403).json({
        status: "fail",
        message: "You are not authorized to access this resource",
      });
    }
    next();
  };

exports.requireRoles = requireRoles;
exports.admin = requireRoles("admin");
exports.teacher = requireRoles("teacher");
exports.librarian = requireRoles("librarian");
exports.student = requireRoles("student");
exports.librarianOrAdmin = requireRoles("librarian", "admin");
exports.teacherOrStudent = requireRoles("teacher", "student");
exports.teacherOrLibrarian = requireRoles("teacher", "librarian");
exports.libraryMember = requireRoles(
  "student",
  "teacher",
  "librarian",
  "admin",
);
exports.logout = (req, res) => {
  res.clearCookie("jwt");
  res.status(200).json({ status: "ok", message: "Logged out" });
};
