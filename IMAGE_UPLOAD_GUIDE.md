# Image Upload Guide - Casa Piñón Ebanistería

## 🖼️ How to Upload Images for Products

The admin panel now includes a proper image upload feature that converts images to base64 and stores them directly in the database, ensuring they persist across deployments.

## 📋 Prerequisites

1. **Backend Server Running**: Make sure the backend server is running on port 3001
2. **Admin Access**: Login to the admin panel with password `CasaPinon2025!`
3. **Image Files**: Have the image files ready on your computer

## 🚀 Step-by-Step Instructions

### 1. Access the Admin Panel
- Navigate to: `http://localhost:3000/admin/login`
- Login with password: `CasaPinon2025!`
- You'll be redirected to the admin dashboard

### 2. Go to Product Management
- Click on "Gestión de Productos" or navigate to `/admin/productos`
- You'll see all current products in a grid layout

### 3. Edit a Product
- Find the product you want to edit
- Click the edit button (pencil icon) on the product card
- The edit modal will open

### 4. Upload Images
- In the edit modal, scroll to the "Imágenes del Producto" section
- Click on "Seleccionar Imágenes" button
- Choose one or multiple image files from your computer
- The images will be automatically:
  - **Resized** to 800x800px for optimal performance
  - **Converted** to base64 format
  - **Stored** directly in the database
  - **Displayed** in the preview area

### 5. Save the Product
- Click "Guardar Producto" to save the changes
- The images will now be permanently associated with the product in the database

### 6. View the Results
- Navigate to the main products page: `http://localhost:3000/productos`
- The product should now display your uploaded images
- Images will also be visible in the product detail page

## 🔧 Technical Details

### Image Processing
- **Automatic Resizing**: All images are resized to 800x800px
- **Base64 Conversion**: Images are converted to base64 data URLs
- **Database Storage**: Images are stored as JSONB in PostgreSQL database
- **Format Support**: JPG, PNG, WebP, and other image formats
- **File Size Limit**: 10MB per image (before conversion)

### Data URL Format
- Images are stored as: `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==`
- This format includes the MIME type and base64 data
- No external file dependencies

### API Endpoint
- **Upload URL**: `POST http://localhost:3001/api/upload/image`
- **Response**: Returns the base64 data URL for use in the product

## 🎯 Benefits of Base64 Storage

### ✅ Advantages:
- **Persistent**: Images survive deployments and server restarts
- **Self-contained**: No external file dependencies
- **Database-backed**: Images are backed up with the database
- **Version control**: Images are included in git commits
- **No file system**: No need to manage file uploads or storage

### ⚠️ Considerations:
- **Database size**: Base64 images increase database size
- **Performance**: Slightly larger data transfer (but no file I/O)
- **Memory usage**: Images are loaded into memory

## 🛠️ Converting Existing Images

If you have existing image files that need to be converted to base64:

### 1. Convert Images to Base64
```bash
npm run convert-images
```

### 2. Update Products with Base64 Images
```bash
npm run update-products
```

### 3. Sync to Railway
```bash
npm run sync-db
```

## 🐛 Troubleshooting

### Images Not Showing
- **Check Database**: Verify images are stored in the database
- **Server Running**: Verify backend server is running on port 3001
- **Browser Cache**: Clear browser cache or hard refresh (Ctrl+F5)

### Upload Errors
- **File Size**: Ensure images are under 10MB
- **File Format**: Use common image formats (JPG, PNG, WebP)
- **Server Logs**: Check server console for error messages

### Database Issues
- **Storage Space**: Ensure database has enough space for base64 images
- **Connection**: Verify database connection is working

## 📁 File Structure

After conversion, your project structure includes:
```
casa-pinon-ebanisteria/
├── src/
│   └── data/
│       ├── base64Images.js          # Converted base64 images
│       └── imageMapping.js          # Image filename mapping
├── scripts/
│   ├── convert-images-to-base64.js  # Conversion script
│   └── update-products-with-base64.js # Update script
└── ...
```

## 🎨 Image Recommendations

For best results:
- **Resolution**: Use high-resolution images (will be resized automatically)
- **Aspect Ratio**: Square images work best (1:1 ratio)
- **File Format**: JPG for photos, PNG for graphics with transparency
- **File Size**: Keep under 10MB before upload
- **Content**: Show the product clearly with good lighting

## 🔄 Updating Existing Images

To update images for an existing product:
1. Edit the product
2. Remove old images by clicking the X button on each image
3. Upload new images
4. Save the product

The old base64 images will be replaced in the database.

---

**Note**: This system stores images as base64 in the database, making them persistent across deployments and ensuring they're always available with the product data.
