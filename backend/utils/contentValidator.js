const crypto = require("crypto");
const fs = require("fs");
const { Resource } = require("../models");

// Profanity/spam keyword list
const SPAM_KEYWORDS = [
  "viagra",
  "casino",
  "lottery",
  "bitcoin",
  "crypto",
  "forex",
  "porn",
  "xxx",
  "click here",
  "buy now",
  "limited offer",
  "act now",
  "free money",
  "work from home",
  "make money fast",
  "guaranteed",
  "no risk",
  "special offer",
  "exclusive deal",
];

// Suspicious patterns
const SPAM_PATTERNS = [
  /\${2,}/g, // Multiple dollar signs
  /[!]{3,}/g, // Multiple exclamation marks
  /\b[A-Z]{3,}\b.*\b[A-Z]{3,}\b/g, // ALL CAPS words
  /http[s]?:\/\/[^\s]{50,}/g, // Suspicious long URLs
];

/**
 * Calculate SHA-256 hash of a file
 */
const calculateFileHash = (filePath) => {
  return new Promise((resolve, reject) => {
    const hash = crypto.createHash("sha256");
    const stream = fs.createReadStream(filePath);

    stream.on("data", (data) => hash.update(data));
    stream.on("end", () => resolve(hash.digest("hex")));
    stream.on("error", reject);
  });
};

/**
 * Check if title/description contains spam keywords
 */
const detectSpamKeywords = (text) => {
  if (!text) return null;

  const lowerText = text.toLowerCase();

  for (const keyword of SPAM_KEYWORDS) {
    if (lowerText.includes(keyword.toLowerCase())) {
      return {
        type: "spam_keyword",
        detected: keyword,
        message: `Suspicious keyword detected: "${keyword}"`,
      };
    }
  }

  return null;
};

/**
 * Check if text matches spam patterns
 */
const detectSpamPatterns = (text) => {
  if (!text) return null;

  for (const pattern of SPAM_PATTERNS) {
    if (pattern.test(text)) {
      return {
        type: "spam_pattern",
        pattern: pattern.toString(),
        message: "Text contains suspicious formatting patterns",
      };
    }
  }

  return null;
};

/**
 * Validate content length
 */
const validateContentLength = (title, description) => {
  const issues = [];

  if (!title || title.trim().length < 3) {
    issues.push({
      field: "title",
      message: "Title must be at least 3 characters",
    });
  }

  if (title && title.trim().length > 255) {
    issues.push({
      field: "title",
      message: "Title must not exceed 255 characters",
    });
  }

  if (description && description.trim().length > 5000) {
    issues.push({
      field: "description",
      message: "Description must not exceed 5000 characters",
    });
  }

  return issues.length > 0 ? issues : null;
};

/**
 * Check for duplicate file (by content hash)
 */
const checkDuplicateFile = async (filePath) => {
  try {
    const fileHash = await calculateFileHash(filePath);

    // Check if file with same hash exists (from previous uploads)
    const existing = await Resource.findOne({
      where: { fileHash },
    });

    if (existing) {
      return {
        isDuplicate: true,
        existingResource: {
          resourceId: existing.resourceId,
          title: existing.title,
          uploadedBy: existing.userId,
          uploadedAt: existing.createdAt,
        },
        message: `This file was already uploaded as "${existing.title}"`,
      };
    }

    return { isDuplicate: false, fileHash };
  } catch (error) {
    console.error("Error calculating file hash:", error.message);
    throw new Error("Could not validate file uniqueness");
  }
};

/**
 * Check for duplicate title/content
 */
const checkDuplicateContent = async (title, subject, gradeLevel) => {
  try {
    // Look for resources with very similar titles
    const existing = await Resource.findOne({
      where: {
        title: title.trim(),
        subject: subject?.trim() || null,
        gradeLevel: gradeLevel || null,
      },
    });

    if (existing) {
      return {
        isDuplicate: true,
        existingResource: {
          resourceId: existing.resourceId,
          title: existing.title,
          uploadedAt: existing.createdAt,
        },
        message: `A resource with title "${title}" already exists for ${subject || "general"} grade ${gradeLevel || "all"}`,
      };
    }

    return { isDuplicate: false };
  } catch (error) {
    console.error("Error checking duplicate content:", error.message);
    throw new Error("Could not validate content uniqueness");
  }
};

/**
 * Comprehensive content validation
 */
const validateResourceContent = async (data, filePath) => {
  const errors = [];
  const warnings = [];

  // 1. Check title/description for spam
  const titleSpam = detectSpamKeywords(data.title);
  if (titleSpam) {
    errors.push(titleSpam);
  }

  const descSpam = detectSpamKeywords(data.description);
  if (descSpam) {
    errors.push(descSpam);
  }

  // 2. Check for suspicious patterns
  const titlePattern = detectSpamPatterns(data.title);
  if (titlePattern) {
    warnings.push(titlePattern);
  }

  const descPattern = detectSpamPatterns(data.description);
  if (descPattern) {
    warnings.push(descPattern);
  }

  // 3. Validate content length
  const lengthIssues = validateContentLength(data.title, data.description);
  if (lengthIssues) {
    errors.push(...lengthIssues);
  }

  // 4. Check for duplicate file
  if (filePath) {
    const duplicateFile = await checkDuplicateFile(filePath);
    if (duplicateFile.isDuplicate) {
      errors.push({
        type: "duplicate_file",
        ...duplicateFile,
      });
    } else {
      data.fileHash = duplicateFile.fileHash;
    }
  }

  // 5. Check for duplicate content
  const duplicateContent = await checkDuplicateContent(
    data.title,
    data.subject,
    data.gradeLevel,
  );
  if (duplicateContent.isDuplicate) {
    warnings.push({
      type: "duplicate_content",
      ...duplicateContent,
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
};

module.exports = {
  calculateFileHash,
  detectSpamKeywords,
  detectSpamPatterns,
  validateContentLength,
  checkDuplicateFile,
  checkDuplicateContent,
  validateResourceContent,
};
