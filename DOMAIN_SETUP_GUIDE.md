# 🌐 Custom Domain Setup Guide - casapiñon.co

## **Railway Configuration**

### **Frontend Service (React App)**
- **Current URL**: `https://casapi-on-production.up.railway.app`
- **New Domain**: `https://casapiñon.co`

### **Backend Service (API)**
- **Current URL**: `https://casa-pinon-backend-production.up.railway.app`
- **Keep as is** (or optionally use subdomain like `api.casapiñon.co`)

## **Environment Variables to Update**

### **Frontend Environment Variables**
Update in Railway Dashboard → Frontend Service → Variables:

```env
# Update these in Railway frontend service
VITE_API_URL=https://casa-pinon-backend-production.up.railway.app
# or if you set up API subdomain:
# VITE_API_URL=https://api.casapiñon.co
```

### **Backend Environment Variables**
Update in Railway Dashboard → Backend Service → Variables:

```env
# Update BASE_URL in backend service
BASE_URL=https://casapiñon.co
```

## **DNS Configuration**

### **Domain Registrar Settings**
Add these CNAME records in your domain registrar:

```
Type: CNAME
Name: @ (or leave empty for root)
Value: cname.railway.app
TTL: 3600 (or default)

Type: CNAME  
Name: www
Value: cname.railway.app
TTL: 3600 (or default)
```

## **Files to Update**

### **1. Email Service (server/emailService.js)**
```javascript
// Update frontend URL in emails
const frontendUrl = 'https://casapiñon.co';
```

### **2. MercadoPago Configuration (server/mercadopago-api.js)**
```javascript
// Update back_urls in MercadoPago preference
back_urls: {
  success: 'https://casapiñon.co/checkout-success',
  failure: 'https://casapiñon.co/checkout-success',
  pending: 'https://casapiñon.co/checkout-success'
}
```

### **3. CORS Configuration (server/mercadopago-api.js)**
```javascript
app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://casapiñon.co',
    'https://www.casapiñon.co',
    'https://*.railway.app'
  ],
  // ... rest of config
}));
```

## **Verification Steps**

1. **DNS Propagation**: Wait 5-30 minutes for DNS changes
2. **Test Domain**: Visit `https://casapiñon.co`
3. **Test API**: Check if frontend can connect to backend
4. **Test Payments**: Make a test payment to ensure MercadoPago redirects work
5. **Test Emails**: Verify email links point to correct domain

## **Optional: API Subdomain**

If you want to use `api.casapiñon.co` for your backend:

1. **Add another domain** in Railway backend service
2. **Add DNS record**:
   ```
   Type: CNAME
   Name: api
   Value: cname.railway.app
   ```
3. **Update frontend VITE_API_URL** to `https://api.casapiñon.co`

## **SSL Certificate**

Railway automatically provides SSL certificates for custom domains, so no additional configuration needed.

## **Troubleshooting**

- **DNS not working**: Check DNS propagation with `nslookup casapiñon.co`
- **SSL issues**: Wait up to 24 hours for SSL certificate generation
- **CORS errors**: Ensure domain is added to CORS origins
- **Payment redirects**: Verify MercadoPago back_urls are updated
