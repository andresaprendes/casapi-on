# 🚀 Railway Production Environment Setup Guide

## 📋 Required Environment Variables

### **Frontend Environment Variables (Railway Dashboard)**
Set these in your Railway frontend service:

```bash
# API Configuration
VITE_API_URL=https://casa-pinon-backend-production.up.railway.app

# MercadoPago Configuration (if needed on frontend)
VITE_MERCADOPAGO_PUBLIC_KEY=APP_USR-xxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### **Backend Environment Variables (Railway Dashboard)**
Set these in your Railway backend service:

```bash
# MercadoPago Production Credentials
MERCADOPAGO_ACCESS_TOKEN=APP_USR-xxxxxxxxxxxxxxxxxxxxxxxxxxxx
MERCADOPAGO_PUBLIC_KEY=APP_USR-xxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Webhook Configuration
MERCADOPAGO_WEBHOOK_SECRET=your-webhook-secret-here

# URL Configuration
BASE_URL=https://casa-pinon-ebanisteria-production.up.railway.app
API_URL=https://casa-pinon-backend-production.up.railway.app

# Server Configuration
PORT=3001
NODE_ENV=production
```

## 🔧 Railway Service Configuration

### **Frontend Service**
- **Service Name**: `casa-pinon-ebanisteria-production`
- **Build Command**: `npm run build`
- **Start Command**: `npm start`
- **Health Check**: `/` (returns 200 OK)

### **Backend Service**
- **Service Name**: `casa-pinon-backend-production`
- **Build Command**: `npm ci --only=production`
- **Start Command**: `npm start`
- **Health Check**: `/api/mercadopago/test` (returns JSON response)

## 🌐 Domain Configuration

### **Frontend Domain**
- **Production URL**: `https://casa-pinon-ebanisteria-production.up.railway.app`
- **Custom Domain**: Configure in Railway dashboard if needed

### **Backend Domain**
- **Production URL**: `https://casa-pinon-backend-production.up.railway.app`
- **API Endpoints**: All API calls should use this URL

## 🔗 MercadoPago Webhook Configuration

### **Webhook URL**
```
https://casa-pinon-backend-production.up.railway.app/api/mercadopago/webhook
```

### **Webhook Events to Subscribe**
- `payment.created`
- `payment.updated`
- `payment.pending`
- `payment.approved`
- `payment.rejected`

## ✅ Verification Checklist

### **Before Deployment**
- [ ] All environment variables set in Railway dashboard
- [ ] MercadoPago production credentials configured
- [ ] Webhook URL configured in MercadoPago dashboard
- [ ] Frontend and backend services deployed
- [ ] Health checks passing

### **After Deployment**
- [ ] Frontend accessible at production URL
- [ ] Backend API responding to health check
- [ ] MercadoPago test payment working
- [ ] Webhook receiving notifications
- [ ] Order creation working
- [ ] Payment verification working

## 🐛 Troubleshooting

### **Common Issues**
1. **CORS Errors**: Check that frontend URL is in backend CORS configuration
2. **API 404**: Verify backend service is running and health check passes
3. **Payment Failures**: Check MercadoPago credentials and webhook configuration
4. **Environment Variables**: Ensure all variables are set in Railway dashboard

### **Debug Commands**
```bash
# Check frontend health
curl https://casa-pinon-ebanisteria-production.up.railway.app

# Check backend health
curl https://casa-pinon-backend-production.up.railway.app/api/mercadopago/test

# Test order creation
curl -X POST https://casa-pinon-backend-production.up.railway.app/api/orders \
  -H "Content-Type: application/json" \
  -d '{"test": "data"}'
```

## 📞 Support
If you encounter issues:
1. Check Railway logs in dashboard
2. Verify environment variables are set correctly
3. Test endpoints manually
4. Check MercadoPago dashboard for payment status
