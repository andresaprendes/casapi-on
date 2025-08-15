# 🔍 Payment Verification Testing Guide

## 📋 Overview

This document outlines how to test and verify that the payment verification system is working correctly and updating in real-time when payments are processed.

## 🎯 Testing Objectives

1. **Verify API endpoints** are responding correctly
2. **Test real-time updates** when payment status changes
3. **Monitor verification timing** and accuracy
4. **Ensure fallback methods** work when primary fails
5. **Validate user experience** during verification process

## 🧪 Testing Methods

### **1. API Endpoint Testing**

#### **Test Verification Endpoints**
```bash
# Test order-based verification
curl -X POST https://casa-pinon-backend-production.up.railway.app/api/mercadopago/verify-payment/ORD-123456789

# Test payment ID verification
curl -X POST https://casa-pinon-backend-production.up.railway.app/api/mercadopago/verify-payment-by-id/123456789
```

#### **Expected Responses**
```json
// Success Response
{
  "success": true,
  "paymentStatus": "approved|pending|rejected",
  "orderStatus": "paid|pending|failed",
  "paymentId": "123456789",
  "externalReference": "ORD-123456789",
  "amount": 50000,
  "timestamp": "2024-01-15T10:30:00Z"
}

// Error Response
{
  "success": false,
  "error": "Payment not found",
  "message": "No payment found with the provided ID"
}
```

### **2. Real-Time Testing**

#### **Test Payment Flow**
1. **Create a test payment** using MercadoPago sandbox
2. **Monitor browser console** for verification logs
3. **Check network requests** in browser DevTools
4. **Verify status updates** in real-time

#### **Console Logs to Monitor**
```javascript
// Expected console output during verification
🔍 Verifying payment at: https://api-url/api/mercadopago/verify-payment/ORD-123
🔍 Verification result: {success: true, paymentStatus: "pending"}
🔍 Payment status: pending
🔄 Payment still pending, will check again in 30 seconds

// When payment is approved
🔍 Payment status: approved
✅ Payment approved, redirecting to success page
```

### **3. MercadoPago Webhook Testing**

#### **Test Webhook Delivery**
```bash
# Use ngrok to test webhooks locally
ngrok http 3001

# Update webhook URL in MercadoPago dashboard
# Test with sample payment events
```

#### **Webhook Event Types to Monitor**
- `payment.created`
- `payment.updated`
- `payment.approved`
- `payment.rejected`

### **4. Database Verification**

#### **Check Payment Status in Database**
```sql
-- Check payment status
SELECT 
  external_reference,
  payment_status,
  order_status,
  created_at,
  updated_at
FROM orders 
WHERE external_reference = 'ORD-123456789';

-- Check payment updates
SELECT 
  payment_id,
  status,
  external_reference,
  created_at
FROM mercadopago_payments 
WHERE external_reference = 'ORD-123456789';
```

## 🔧 Monitoring Setup

### **1. Frontend Monitoring**

#### **Add Verification Logging**
```javascript
// Enhanced logging in CheckoutPending.tsx
const verifyPaymentStatus = async () => {
  const startTime = Date.now();
  console.log(`🕐 [${new Date().toISOString()}] Starting verification attempt ${retryCount + 1}`);
  
  try {
    // ... verification logic ...
    
    const endTime = Date.now();
    console.log(`✅ [${new Date().toISOString()}] Verification completed in ${endTime - startTime}ms`);
  } catch (error) {
    console.error(`❌ [${new Date().toISOString()}] Verification failed:`, error);
  }
};
```

#### **Add Performance Metrics**
```javascript
// Track verification performance
const verificationMetrics = {
  totalAttempts: 0,
  successfulVerifications: 0,
  failedVerifications: 0,
  averageResponseTime: 0,
  lastVerificationTime: null
};
```

### **2. Backend Monitoring**

#### **Add API Logging**
```javascript
// Enhanced API logging
app.post('/api/mercadopago/verify-payment/:orderNumber', async (req, res) => {
  const startTime = Date.now();
  console.log(`🔍 [${new Date().toISOString()}] Verification request for order: ${req.params.orderNumber}`);
  
  try {
    // ... verification logic ...
    
    const endTime = Date.now();
    console.log(`✅ [${new Date().toISOString()}] Verification completed in ${endTime - startTime}ms`);
    res.json(result);
  } catch (error) {
    console.error(`❌ [${new Date().toISOString()}] Verification error:`, error);
    res.status(500).json({ success: false, error: error.message });
  }
});
```

### **3. Database Monitoring**

#### **Track Payment Status Changes**
```sql
-- Create audit log for payment status changes
CREATE TABLE payment_status_audit (
  id SERIAL PRIMARY KEY,
  order_number VARCHAR(50),
  payment_id VARCHAR(50),
  old_status VARCHAR(20),
  new_status VARCHAR(20),
  changed_at TIMESTAMP DEFAULT NOW(),
  verification_source VARCHAR(50)
);
```

## 🧪 Test Scenarios

### **Scenario 1: PSE Payment Flow**
1. **Initiate PSE payment** → Should redirect to pending page
2. **Wait 15-30 minutes** → Should show pending status
3. **Complete bank payment** → Should detect approval within 30 seconds
4. **Redirect to success** → Should show confirmation

### **Scenario 2: Credit Card Payment**
1. **Enter test card** → Should process immediately
2. **Payment approved** → Should redirect to success within 5 seconds
3. **Check email** → Should receive confirmation email

### **Scenario 3: Failed Payment**
1. **Use declined card** → Should redirect to failure page
2. **Show error details** → Should display specific error message
3. **Provide retry option** → Should allow payment retry

### **Scenario 4: Network Issues**
1. **Disconnect internet** → Should show error message
2. **Reconnect internet** → Should resume verification
3. **Fallback method** → Should use alternative verification

## 📊 Success Metrics

### **Performance Metrics**
- ✅ **Verification Response Time**: < 5 seconds
- ✅ **Real-time Update Delay**: < 30 seconds
- ✅ **Success Rate**: > 95%
- ✅ **Error Recovery**: < 3 retries

### **User Experience Metrics**
- ✅ **Page Load Time**: < 3 seconds
- ✅ **Status Update Frequency**: Every 30 seconds
- ✅ **Clear Status Messages**: 100% of cases
- ✅ **Email Delivery**: Within 5 minutes

## 🚨 Troubleshooting

### **Common Issues**

#### **1. Verification Not Working**
```bash
# Check API endpoints
curl -X POST https://api-url/api/mercadopago/verify-payment/test-order

# Check server logs
tail -f server.log | grep "verification"

# Check database
SELECT * FROM orders WHERE external_reference = 'test-order';
```

#### **2. Infinite Verification Loop**
- Check retry limit (max 20 attempts)
- Verify API response format
- Check for network errors
- Monitor console logs

#### **3. Status Not Updating**
- Verify MercadoPago webhooks
- Check database updates
- Monitor API response times
- Test fallback methods

### **Debug Commands**
```bash
# Test API health
curl https://api-url/health

# Check payment status
curl -X POST https://api-url/api/mercadopago/verify-payment/ORDER-ID

# Monitor logs
tail -f logs/app.log | grep -E "(verification|payment|webhook)"
```

## 📈 Continuous Monitoring

### **1. Set Up Alerts**
- API response time > 10 seconds
- Verification failure rate > 5%
- Webhook delivery failures
- Database connection issues

### **2. Regular Testing**
- **Daily**: Test payment flow with sandbox
- **Weekly**: Test all payment methods
- **Monthly**: Performance review and optimization

### **3. User Feedback**
- Monitor support tickets
- Track user complaints
- Analyze payment abandonment rates
- Review user session recordings

## 🎯 Next Steps

1. **Implement enhanced logging** in both frontend and backend
2. **Set up monitoring dashboard** for real-time metrics
3. **Create automated tests** for payment verification
4. **Establish alert system** for verification failures
5. **Document troubleshooting procedures** for support team

---

**Last Updated**: January 2024  
**Version**: 1.0  
**Status**: Ready for Implementation
