# Product Categories Feature

This document explains the new product categories feature that has been implemented in the ecommerce application.

## Features Implemented

### Backend Changes

1. **Updated Category Model** (`backend/models/Category.js`)
   - Added `image` field (required) for category pictures
   - Added `description` field (optional) for category descriptions
   - Maintains existing `categoryName` field

2. **Enhanced Category Controller** (`backend/controllers/categoryController.js`)
   - `createCategory`: Now handles image uploads and descriptions
   - `getCategories`: Returns categories sorted by creation date
   - `updateCategory`: New endpoint for updating categories with optional image updates
   - `deleteCategory`: Existing delete functionality

3. **Updated Category Routes** (`backend/routes/category.js`)
   - Added multer middleware for image uploads
   - All admin operations (create, update, delete) require admin authentication
   - Public read access for all users

4. **File Upload Configuration**
   - Created `uploads/` directory for storing category images
   - Static file serving configured in `app.js`
   - Multer middleware handles image validation and storage

### Frontend Changes

1. **Categories Component** (`frontend/src/components/Categories.jsx`)
   - Displays all categories in a responsive grid layout
   - Shows category images, names, and descriptions
   - Handles loading states and errors
   - Public component - accessible to all users

2. **AdminCategories Component** (`frontend/src/components/AdminCategories.jsx`)
   - Admin-only interface for managing categories
   - Add new categories with images and descriptions
   - Edit existing categories
   - Delete categories with confirmation
   - Modal form for add/edit operations

3. **Updated App.js**
   - Categories component now displays after the navbar
   - Clean, modern UI with responsive design

## API Endpoints

### Public Endpoints (No Authentication Required)
- `GET /api/categories` - Get all categories

### Admin Endpoints (Require Admin Authentication)
- `POST /api/categories` - Create new category
  - Body: FormData with `categoryName`, `description` (optional), and `image` file
- `PUT /api/categories/:id` - Update category
  - Body: FormData with `categoryName`, `description` (optional), and `image` file (optional)
- `DELETE /api/categories/:id` - Delete category

## Usage Instructions

### For Regular Users
1. Categories are automatically displayed on the homepage after the navbar
2. Users can view all categories with their images and descriptions
3. No special permissions required

### For Admin Users
1. **Adding a Category:**
   - Click "Add New Category" button
   - Fill in category name (required)
   - Add description (optional)
   - Upload an image (required)
   - Click "Create Category"

2. **Editing a Category:**
   - Click "Edit" button on any category
   - Modify name, description, or image
   - Click "Update Category"

3. **Deleting a Category:**
   - Click "Delete" button on any category
   - Confirm deletion in the popup dialog

## Security Features

- **Admin-only Operations**: Only users with `role: 'admin'` can create, update, or delete categories
- **Authentication Required**: All admin operations require valid JWT token
- **Image Validation**: Only image files (jpg, jpeg, png, gif) are accepted
- **File Size Limits**: Multer handles file size restrictions

## File Structure

```
backend/
├── uploads/                    # Category images storage
├── models/Category.js          # Updated category model
├── controllers/categoryController.js  # Enhanced controller
├── routes/category.js          # Updated routes with auth
└── middleware/
    ├── authMiddleware.js       # Admin role verification
    └── uploadMiddleware.js     # Image upload handling

frontend/src/
├── components/
│   ├── Categories.jsx          # Public categories display
│   ├── Categories.css          # Categories styling
│   ├── AdminCategories.jsx     # Admin management interface
│   └── AdminCategories.css     # Admin interface styling
└── App.js                      # Updated to show categories
```

## Dependencies Added

- **Backend**: `multer` for file upload handling
- **Frontend**: No new dependencies required

## Testing

1. Start the backend server: `cd backend && npm run dev`
2. Start the frontend: `cd frontend && npm start`
3. Create an admin user or update an existing user's role to 'admin'
4. Test category creation, editing, and deletion as admin
5. Test category viewing as a regular user

## Notes

- Category images are stored in the `backend/uploads/` directory
- Images are served statically from `/uploads/` endpoint
- The system handles image loading errors gracefully with placeholder images
- All operations are responsive and work on mobile devices 