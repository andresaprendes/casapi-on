# Admin Features - Casa Piñón Ebanistería

## 🎯 Overview

The admin panel provides comprehensive management tools for Casa Piñón Ebanistería, allowing administrators to manage products, orders, and view business metrics.

## 🔐 Authentication

- **Login URL**: `/admin/login`
- **Password**: `CasaPinon2025!`
- **Session**: Persistent login using localStorage

## 📊 Admin Dashboard

**URL**: `/admin`

### Features:
- **Quick Stats**: Overview of products, orders, sales, and customers
- **Navigation Cards**: Easy access to all admin functions
- **Quick Actions**: Fast access to common tasks

## 🛍️ Product Management

**URL**: `/admin/productos`

### Features:
- **View All Products**: Grid view with product images, names, prices, and stock status
- **Search Products**: Filter by name, description, or category
- **Add New Product**: Complete product creation with all details
- **Edit Products**: Modify existing product information
- **Delete Products**: Remove products from catalog
- **Image Management**: Upload, resize, and manage product images

### Product Fields:
- **Basic Info**: Name, description, price, category, subcategory
- **Stock Management**: In stock status, custom product flag
- **Delivery**: Estimated delivery time
- **Images**: Multiple image upload with automatic resizing (800x800px)
- **Materials**: Product materials list
- **Features**: Product features list
- **Specifications**: Technical specifications

### Image Features:
- **Automatic Resizing**: Images are automatically resized to 800x800px
- **Multiple Upload**: Support for multiple image files
- **Preview**: Real-time image preview in edit mode
- **Remove Images**: Delete individual images from products
- **Base64 Storage**: Images stored as base64 for demo (production should use file server)

## 📦 Order Management

**URL**: `/admin/pedidos`

### Features:
- **View All Orders**: Complete order list with customer details
- **Search & Filter**: Filter by status, payment status, payment method
- **Order Details**: Detailed view of each order
- **Status Updates**: Update order and payment status
- **Customer Info**: View customer contact and shipping details
- **Order Items**: See all products in each order
- **Financial Summary**: Subtotal, shipping, tax, and total calculations

### Order Statuses:
- **Pending**: New order awaiting confirmation
- **Confirmed**: Order confirmed and ready for production
- **In Production**: Order being manufactured
- **Ready**: Order completed and ready for delivery
- **Delivered**: Order successfully delivered
- **Cancelled**: Order cancelled

### Payment Statuses:
- **Pending**: Payment not yet received
- **Paid**: Payment completed
- **Failed**: Payment failed
- **Refunded**: Payment refunded

## 🎨 UI/UX Features

### Design:
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Modern Interface**: Clean, professional admin interface
- **Color Scheme**: Consistent with Casa Piñón brand colors
- **Loading States**: Visual feedback for all operations
- **Toast Notifications**: Success and error messages

### Navigation:
- **Breadcrumb Navigation**: Easy navigation between admin sections
- **Quick Access**: Direct links between admin pages
- **Logout**: Secure logout functionality

## 🔧 Technical Implementation

### Frontend:
- **React 18**: Modern React with hooks
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first styling
- **Lucide React**: Beautiful icons
- **React Router**: Client-side routing
- **React Hot Toast**: Toast notifications
- **Framer Motion**: Smooth animations

### State Management:
- **React Context**: Authentication and cart state
- **Local State**: Component-level state management
- **LocalStorage**: Persistent authentication

### Image Processing:
- **Canvas API**: Client-side image resizing
- **File API**: File upload and processing
- **Base64**: Image storage (demo implementation)

## 🚀 Getting Started

1. **Access Admin**: Navigate to `/admin/login`
2. **Login**: Use password `CasaPinon2025!`
3. **Dashboard**: You'll be redirected to the admin dashboard
4. **Navigate**: Use the navigation cards or quick actions

## 📱 Mobile Support

The admin panel is fully responsive and optimized for:
- **Desktop**: Full feature access with side-by-side layouts
- **Tablet**: Adapted layouts for medium screens
- **Mobile**: Touch-friendly interface with stacked layouts

## 🔒 Security Notes

### Current Implementation (Demo):
- Simple password-based authentication
- Client-side state management
- Base64 image storage

### Production Recommendations:
- **Backend Authentication**: JWT tokens with proper session management
- **API Integration**: Connect to backend for data persistence
- **File Storage**: Use cloud storage (AWS S3, Cloudinary) for images
- **Role-Based Access**: Implement user roles and permissions
- **HTTPS**: Secure all communications
- **Input Validation**: Server-side validation for all inputs

## 🛠️ Future Enhancements

### Planned Features:
- **Analytics Dashboard**: Sales reports and business metrics
- **Customer Management**: Customer database and communication
- **Inventory Management**: Stock tracking and alerts
- **Bulk Operations**: Mass product updates
- **Export Functions**: Data export to CSV/Excel
- **Notification System**: Email/SMS notifications
- **Backup System**: Data backup and recovery

### Technical Improvements:
- **Real-time Updates**: WebSocket integration for live updates
- **Offline Support**: PWA capabilities for offline access
- **Advanced Search**: Full-text search with filters
- **Image Optimization**: WebP format and lazy loading
- **Performance**: Code splitting and optimization

---

**Note**: This is a demo implementation. For production use, implement proper backend integration, security measures, and data persistence.
