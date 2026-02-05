# LMS Server - AI Coding Agent Guide

## Project Overview
This is a Node.js Express backend for a Learning Management System (LMS). The server uses:
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT tokens (stored in HTTP-only cookies)
- **Password Security**: bcrypt hashing
- **Runtime**: ES modules (type: "module" in package.json)

## Architecture

### Directory Structure
- **index.js**: Express server initialization and MongoDB connection startup
- **models/user.model.js**: Mongoose schema defining User document structure (fields: name, email, password, role, enrolledCourses, photoUrl, timestamps)
- **controllers/userController.js**: Authentication handlers (register, login) - note: currently incomplete with syntax errors
- **database/db.js**: MongoDB connection wrapper using dotenv for MONGO_URI
- **utils/generateToken.js**: JWT token generation with 1-day expiration, sets HTTP-only cookie

### Data Flow
1. Client sends registration/login request → userController processes → User model validates/creates → generateToken returns JWT cookie
2. Enrolled courses stored as ObjectId references in User.enrolledCourses array (not yet implemented in controllers)

## Common Tasks & Patterns

### Adding New Routes
1. Create handler in controllers/ (follow register/login pattern: validation → model operation → response)
2. Use standard response format: `{success: boolean, message: string, ...data}`
3. Wrap in try-catch; return 400 for validation errors, 500 for server errors
4. Reference: [userController.js](controllers/userController.js)

### Working with User Model
- User schema fields: name (required), email (required, unique), password (required), role (enum: "instructor"/"student", default: "student"), enrolledCourses (array of Course ObjectIds), photoUrl (string, default: ""), timestamps (auto-created)
- Always hash passwords with bcrypt before saving: `bcrypt.hash(password, 10)`
- Reference: [user.model.js](models/user.model.js)

### Environment Setup
Create `.env` file with: `MONGO_URI=<mongodb_connection_string>` and `SECRET_KEY=<jwt_secret>`

### Development Commands
- `npm run dev` - Start server with nodemon (auto-reload on changes)
- `npm test` - Not yet configured

## Known Issues to Fix
- **userController.js**: Syntax errors: typo `findOnde` should be `findOne`, syntax error in generateToken call
- **generateToken.js**: Syntax error in jwt.sign options object
- Missing CORS middleware configuration in index.js
- Missing route definitions (controllers exist but not wired to routes)
- No error handling middleware setup

## Code Conventions
- Use async/await with try-catch for async operations
- Response objects: always include `success` (boolean) and `message` fields
- Use consistent HTTP status codes: 201 (created), 400 (validation error), 500 (server error)
- Capitalize mongoose model exports: `export const User = mongoose.model(...)`
- Field-level validation in schema (required, unique, enum) preferred over controller validation for data integrity
