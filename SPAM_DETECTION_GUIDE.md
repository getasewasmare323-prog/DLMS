# Automated Spam Detection & Content Validation

## Overview

The system now includes automated spam detection and duplicate content detection for all resource uploads (books, videos, and physical resources).

## Features Implemented

### 1. **Spam Keyword Detection**

- Detects common spam keywords in resource titles and descriptions
- Keywords include: "viagra", "casino", "bitcoin", "make money fast", etc.
- Returns error if spam keywords detected
- Response: HTTP 400 with spam keyword details

### 2. **Spam Pattern Detection**

- Detects suspicious formatting patterns in content
- Patterns include:
  - Multiple consecutive special characters ($$, !!!)
  - Excessive ALL CAPS text
  - Suspicious long URLs
- Returns as warnings (allows upload but notifies user)

### 3. **Content Length Validation**

- Title: Minimum 3 characters, Maximum 255 characters
- Description: Maximum 5000 characters
- Prevents empty or oversized content

### 4. **Duplicate File Detection**

- Calculates SHA-256 hash of uploaded files
- Stores hash in database with each resource
- Detects if identical file was already uploaded (by content, not filename)
- Returns error if duplicate found with reference to original upload

### 5. **Duplicate Content Detection**

- Checks for resources with identical title, subject, and grade level
- Prevents duplicate resource registrations
- Returns warning with reference to existing resource

## Database Changes

### New Field: `fileHash`

```sql
ALTER TABLE "Resources" ADD COLUMN "fileHash" VARCHAR(64) UNIQUE;
```

This field stores the SHA-256 hash of uploaded files for duplicate detection.

## API Responses

### Success with Warnings

```json
{
  "status": "success",
  "data": { "resource": { ... } },
  "warnings": [
    {
      "type": "spam_pattern",
      "pattern": "/[!]{3,}/g",
      "message": "Text contains suspicious formatting patterns"
    }
  ]
}
```

### Validation Failure

```json
{
  "status": "fail",
  "message": "Content validation failed",
  "errors": [
    {
      "type": "spam_keyword",
      "detected": "viagra",
      "message": "Suspicious keyword detected: \"viagra\""
    },
    {
      "type": "duplicate_file",
      "isDuplicate": true,
      "existingResource": {
        "resourceId": "uuid-here",
        "title": "Original Title",
        "uploadedAt": "2026-05-26T10:00:00Z"
      },
      "message": "This file was already uploaded as \"Original Title\""
    }
  ]
}
```

## Validation Endpoints

All upload endpoints now include spam detection:

### 1. Upload Book

```
POST /resources/uploadBook
```

- Validates title, description, subject
- Calculates file hash for duplicate detection
- Checks for existing resources with same title/subject/grade

### 2. Upload Video

```
POST /resources/uploadVideo
```

- Single and playlist mode validation
- Hash calculated on first file in playlist
- Same content validation as books

### 3. Register Physical Resource

```
POST /resources/registerPhysical
```

- Content validation without file hash
- Prevents spam in physical resource metadata

## Implementation Details

### File: `backend/utils/contentValidator.js`

Core validation utilities:

- `calculateFileHash(filePath)` - SHA-256 hash calculation
- `detectSpamKeywords(text)` - Keyword matching
- `detectSpamPatterns(text)` - Pattern detection
- `validateContentLength(title, description)` - Length validation
- `checkDuplicateFile(filePath)` - File hash duplicate check
- `checkDuplicateContent(title, subject, gradeLevel)` - Metadata duplicate check
- `validateResourceContent(data, filePath)` - Comprehensive validation

### Integration Points

**resourceController.js**:

- `uploadBook()` - Lines ~760
- `uploadVideo()` - Lines ~835
- `registerPhysicalResource()` - Lines ~912

All functions now:

1. Call `validateResourceContent()` before creating resource
2. Handle validation errors with HTTP 400
3. Clean up uploaded files if validation fails
4. Store `fileHash` in resource record
5. Return warnings in response if applicable

## Security Considerations

✅ **Spam Prevention:**

- Blocks uploads with suspicious keywords/patterns
- Prevents malicious URLs in descriptions
- Protects against promotional/spam content

✅ **Duplicate Prevention:**

- File hash prevents uploading identical content twice
- Metadata checking prevents duplicate registrations
- Reduces storage waste and confusion

✅ **Data Cleanup:**

- Uploaded files are deleted if validation fails
- No orphaned files left on disk

## Configuration

To add more spam keywords, edit `SPAM_KEYWORDS` array in `backend/utils/contentValidator.js`:

```javascript
const SPAM_KEYWORDS = [
  "viagra",
  "casino",
  // Add more as needed
];
```

To add more spam patterns:

```javascript
const SPAM_PATTERNS = [
  /\${2,}/g, // Multiple dollar signs
  // Add more regex patterns
];
```

## Future Enhancements

Possible additions:

- Machine learning-based content classification
- Virus/malware scanning for uploaded files
- Image content moderation
- Natural language processing for context-aware spam detection
- User reputation scoring
- Configurable spam keywords via admin panel
