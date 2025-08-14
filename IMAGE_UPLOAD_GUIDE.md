# Image Upload Guide - Casa Piñón Ebanistería

## 🖼️ How to Upload Images for Products

The admin panel now includes a proper image upload feature that saves images to the project folder and makes them visible in products.

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
- Find the "Mesa de Comedor de Piñón" product
- Click the edit button (pencil icon) on the product card
- The edit modal will open

### 4. Upload Images
- In the edit modal, scroll to the "Imágenes del Producto" section
- Click on "Seleccionar Imágenes" button
- Choose one or multiple image files from your computer
- The images will be automatically:
  - **Resized** to 800x800px for optimal performance
  - **Uploaded** to the server
  - **Saved** to `/public/images/` folder
  - **Displayed** in the preview area

### 5. Save the Product
- Click "Guardar Producto" to save the changes
- The images will now be permanently associated with the product

### 6. View the Results
- Navigate to the main products page: `http://localhost:3000/productos`
- The "Mesa de Comedor de Piñón" should now display your uploaded images
- Images will also be visible in the product detail page

## 🔧 Technical Details

### Image Processing
- **Automatic Resizing**: All images are resized to 800x800px
- **Format Support**: JPG, PNG, WebP, and other image formats
- **File Size Limit**: 10MB per image
- **Storage Location**: `/public/images/` folder in the project

### File Naming
- Images are saved with unique names: `image-timestamp-randomnumber.extension`
- Example: `image-1691234567890-123456789.jpg`

### API Endpoint
- **Upload URL**: `POST http://localhost:3001/api/upload/image`
- **Response**: Returns the file path for use in the product

## 🎯 For "Mesa de Comedor de Piñón"

To specifically add images for the "Mesa de Comedor de Piñón":

1. **Edit the Product**: Click edit on the Mesa de Comedor product
2. **Upload Images**: Use the image upload feature
3. **Save Changes**: The images will be saved and visible immediately
4. **Verify**: Check the main products page to see the images

## 🐛 Troubleshooting

### Images Not Showing
- **Check File Path**: Ensure images are saved in `/public/images/`
- **Server Running**: Verify backend server is running on port 3001
- **Browser Cache**: Clear browser cache or hard refresh (Ctrl+F5)

### Upload Errors
- **File Size**: Ensure images are under 10MB
- **File Format**: Use common image formats (JPG, PNG, WebP)
- **Server Logs**: Check server console for error messages

### Permission Issues
- **Folder Permissions**: Ensure `/public/images/` folder is writable
- **Server Permissions**: Check if the server has write access

## 📁 File Structure

After uploading, your project structure should look like:
```
casa-pinon-ebanisteria/
├── public/
│   ├── images/
│   │   ├── image-1691234567890-123456789.jpg
│   │   ├── image-1691234567891-987654321.png
│   │   └── ... (other uploaded images)
│   ├── logo.png
│   └── ...
├── src/
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

The old images will remain in the `/public/images/` folder but won't be associated with the product anymore.

---

**Note**: This feature saves images permanently to the project folder. In production, consider using cloud storage services like AWS S3 or Cloudinary for better scalability and performance.
