# Hybrid Digital Library Management System

## 1. Refined System Overview

The system should be refined from a general digital resource platform into a **Hybrid Digital Library Management System (HDLMS)** that manages both:

- **Digital resources**: PDFs, notes, references, videos, and teacher materials
- **Physical resources**: printed books and tracked library copies

The refined system keeps the current four core roles:

- **Admin**: control layer
- **Librarian**: operational layer
- **Teacher**: academic layer
- **Student**: end-user layer

The platform is organized around six functional modules:

1. Resource Management
2. Borrowing and Access
3. Search and Retrieval
4. User Management
5. Notification System
6. Learning Support

## 2. Main Goal of the Refined System

The goal of the hybrid system is to provide a single school platform where users can:

- manage digital and physical library resources in one place
- control access according to role and policy
- support borrowing, return, and access expiration
- help teaching and learning through reading lists, recommendations, and progress tracking
- monitor usage, compliance, and system activity

## 3. Role-Based Functional Organization

### 3.1 Admin

**Main responsibility:** system control, policy enforcement, security, and monitoring

**Permissions by module**

- **Resource Management**
  - approve or reject uploaded resources
  - remove invalid, duplicate, or inappropriate resources
  - define resource approval status
- **User Management**
  - create users
  - assign roles and permissions
  - activate or deactivate accounts
  - reset passwords or force password update
- **Borrowing and Access**
  - set maximum borrow limits
  - configure borrow duration for digital and physical resources
  - set overdue rules, penalties, and grace periods
- **Notification System**
  - define notification rules
  - configure due reminders, announcements, and policy alerts
- **System Monitoring**
  - view login logs, download history, borrow history, and access violations
  - generate reports on usage, overdue items, active users, and popular resources

### 3.2 Librarian

**Main responsibility:** daily library operation for digital and physical collections

**Permissions by module**

- **Resource Management**
  - add, edit, archive, or delete books and materials
  - upload digital files such as PDF books and references
  - register physical book records and copy quantities
- **Metadata Management**
  - assign subject, grade level, author, keywords, ISBN, edition, publisher, and shelf location
  - classify resources by type and availability
- **Borrowing and Access**
  - issue physical books
  - receive and confirm returns
  - track overdue physical borrowing
  - mark lost or damaged copies
- **Digital Access Control**
  - enable or disable digital file access
  - manage visibility of restricted resources
- **Notification**
  - send manual reminders and circulation notices

### 3.3 Teacher

**Main responsibility:** guide academic use of library resources

**Permissions by module**

- **Search and Retrieval**
  - search digital and physical resources
  - filter by subject, grade, author, type, and keyword
- **Resource Contribution**
  - upload teaching notes, references, and class materials
  - submit resources for librarian or admin approval
- **Learning Support**
  - create class reading lists
  - recommend books and references to students
  - attach resources to lessons or exercises
- **Borrowing and Access**
  - borrow and read digital books
  - request or borrow physical books based on policy
- **Monitoring**
  - view class-level reading activity where permitted
  - track which recommended resources were accessed by students

### 3.4 Student

**Main responsibility:** discover and use learning resources

**Permissions by module**

- **Search and Retrieval**
  - search by title, subject, keyword, author, and grade
  - filter by digital or physical availability
- **Borrowing and Access**
  - read or download digital resources according to access policy
  - request or borrow physical books
  - return physical books through library workflow
  - lose digital access automatically when the loan expires
- **Personal Dashboard**
  - view active borrowed items
  - check due dates and borrowing history
  - view bookmarks, favorites, and recommended materials
- **Learning Support**
  - bookmark resources
  - follow reading lists
  - track reading progress
- **Notification**
  - receive due reminders
  - receive recommendation alerts and new book alerts

## 4. Functional Modules

### 4.1 Resource Management

This module should manage the full lifecycle of both digital and physical resources.

**Key functions**

- create resource records
- upload digital files
- register physical copies
- approve submitted materials
- edit metadata
- archive or delete invalid items
- distinguish between official library resources and teacher-contributed materials

**Core refinement**

Resources should no longer be treated only as generic upload items. Each resource should support:

- resource category
- digital or physical format
- approval status
- ownership or uploader
- quantity and availability
- metadata for search and reporting

### 4.2 Borrowing and Access

This module should be split into two related subflows:

- **Digital access flow**
  - borrow or open digital item
  - start access timer
  - allow read or download if policy permits
  - revoke access automatically after expiry
- **Physical circulation flow**
  - request book
  - approve issue
  - hand over copy
  - confirm return
  - mark overdue, lost, or damaged status if needed

**Core refinement**

The system needs a real borrowing transaction model instead of simple resource access only.

### 4.3 Search and Retrieval

This module should support faster academic discovery.

**Search fields**

- title
- author
- subject
- grade level
- keyword
- resource type
- format
- availability

**Retrieval features**

- search suggestions
- filter and sort results
- separate digital availability from physical stock
- related resource recommendations

### 4.4 User Management

This module should support account lifecycle and role enforcement.

**Core functions**

- registration and account creation
- role assignment
- activation or deactivation
- class or department grouping
- permission enforcement
- account audit and login history

### 4.5 Notification System

This module should support both automated and manual communication.

**Automated notifications**

- borrow confirmation
- due date reminder
- overdue alert
- return confirmation
- new resource alert
- approval or rejection notice

**Manual notifications**

- librarian reminders
- admin announcements
- teacher recommendations

### 4.6 Learning Support

This module connects the library to teaching and learning outcomes.

**Core functions**

- reading lists by class
- teacher recommendations
- bookmarks and favorites
- reading progress tracking
- optional integration with exercises, forum, and discussion

This fits well with the current `Exercise`, `ForumThread`, and `ForumPost` structures already present in the backend.

## 5. Recommended Core Entities

To fully support the refined hybrid system, the following data entities should exist.

### Already aligned with current implementation

- `User`
- `Resource`
- `Notification`
- `AnalyticsEvent`
- `Exercise`
- `ForumThread`
- `ForumPost`

### New or expanded entities recommended

- `RolePermission`
  - maps role to allowed actions
- `PhysicalCopy`
  - each copy of a physical book with barcode, condition, and availability
- `BorrowTransaction`
  - tracks both digital and physical borrowing records
- `ResourceApproval`
  - tracks approval, reviewer, reason, and status changes
- `ReadingList`
  - teacher-created grouped resources for a class
- `ReadingListItem`
  - resource entries inside a reading list
- `Bookmark`
  - student or teacher favorites
- `ReadingProgress`
  - tracks page, percentage, or completion state
- `SystemSetting`
  - borrow limits, durations, penalties, and notification rules
- `AuditLog`
  - administrative and security events

## 6. Refined Resource Model

The current `Resource` model is a good starting point but should be expanded for hybrid library use.

**Recommended fields**

- `resourceId`
- `title`
- `author`
- `isbn`
- `publisher`
- `edition`
- `publicationYear`
- `subject`
- `gradeLevel`
- `keywords`
- `description`
- `resourceType`
  - book, note, reference, video, exercise material
- `formatType`
  - digital, physical, hybrid
- `filePath`
- `coverImage`
- `language`
- `status`
  - pending, approved, rejected, archived
- `accessLevel`
  - public, restricted, class-only, teacher-only
- `totalCopies`
- `availableCopies`
- `shelfLocation`
- `uploadedBy`
- `approvedBy`
- `approvedAt`

## 7. Borrowing Rules and Policy Layer

The refined system should enforce policy through configuration instead of hard-coded rules.

**Examples**

- students may borrow up to 2 physical books and access up to 3 digital books at a time
- teachers may have longer borrowing duration than students
- digital books may expire after 7 days
- physical books may be due after 14 days
- overdue students may be blocked from new borrowing

These settings should be stored in a `SystemSetting` or policy table and managed by admin.

## 8. End-to-End Workflow

### 8.1 Resource Upload Workflow

1. Librarian or teacher uploads a resource
2. Resource enters `pending` status if approval is required
3. Admin or librarian reviews the submission
4. Resource is approved or rejected
5. Approved item becomes searchable and accessible according to role and policy

### 8.2 Physical Borrow Workflow

1. Student or teacher searches for a physical book
2. System checks available copies
3. Librarian issues a copy
4. Borrow transaction is created with due date
5. Notification is sent
6. Librarian confirms return
7. Stock is updated automatically

### 8.3 Digital Borrow Workflow

1. User opens or borrows a digital item
2. System checks permission and borrow limit
3. Digital access record is created
4. User reads or downloads if allowed
5. Access expires automatically at due time
6. Notification is sent before expiry

### 8.4 Learning Support Workflow

1. Teacher creates a reading list for a class
2. Teacher adds books or references
3. Students receive notification
4. Students access materials and track progress
5. Teacher views engagement where policy allows

## 9. Role-Permission Matrix

| Action | Admin | Librarian | Teacher | Student |
|---|---|---|---|---|
| Create users | Yes | No | No | No |
| Assign roles | Yes | No | No | No |
| Approve resources | Yes | Yes | No | No |
| Upload resources | Yes | Yes | Yes | No |
| Edit library resources | Yes | Yes | Limited | No |
| Register physical copies | Yes | Yes | No | No |
| Borrow digital resources | Yes | Yes | Yes | Yes |
| Borrow physical resources | Yes | Yes | Yes | Yes |
| Issue physical books | No | Yes | No | No |
| Confirm returns | No | Yes | No | No |
| Create reading lists | No | No | Yes | No |
| Recommend books | No | Limited | Yes | No |
| View full logs and reports | Yes | Limited | No | No |
| View personal dashboard | Yes | Yes | Yes | Yes |

## 10. Alignment With the Current Codebase

The current project already supports an important part of this refined system:

- role-based users through `User`
- digital resources through `Resource`
- notifications through `Notification`
- activity capture through `AnalyticsEvent`
- learning support extensions through `Exercise` and forum models

However, the following major refinements are still needed for full hybrid DLMS support:

- separate digital and physical circulation logic
- add borrowing transactions
- add physical copy tracking
- add resource approval workflow
- enrich resource metadata
- add admin policy settings
- add reading list and bookmark features
- improve analytics and audit reporting

## 11. Recommended Implementation Phases

### Phase 1: Strengthen Core Hybrid Library Functions

- extend `Resource` model
- create `BorrowTransaction`
- create `PhysicalCopy`
- create `SystemSetting`
- add overdue and expiry logic

### Phase 2: Add Approval and Operational Control

- create `ResourceApproval`
- add approval endpoints for admin and librarian
- add reports and audit logs
- add notification rules

### Phase 3: Expand Learning Support

- create `ReadingList` and `ReadingListItem`
- create `Bookmark`
- create `ReadingProgress`
- connect resources with exercises and forums

### Phase 4: Improve Search, Monitoring, and Reporting

- advanced search filters
- top borrowed resource reports
- user activity dashboards
- overdue and inactive account reporting

## 12. Refined System Statement

The refined project should be described as:

> A role-based Hybrid Digital Library Management System for schools that integrates digital resource access, physical book circulation, user and policy management, academic support features, and automated notifications in one centralized platform.

## 13. Final Refinement Summary

Based on the role structure and modules you provided, the whole system should be refined from a basic digital repository into a **policy-driven hybrid library platform** with:

- clear control, operational, academic, and user layers
- full support for both digital and physical library workflows
- strong role-based permissions
- configurable borrowing policies
- academic learning support features
- automated monitoring and notifications

This refined structure matches your current project direction and gives a stronger, more complete system definition for implementation, documentation, and final presentation.
