# Bold Payment Gateway Integration Guide

## Overview
This project now includes Bold as an alternative payment gateway alongside ePayco. Bold is a popular Colombian payment processor that offers competitive rates and excellent integration options for e-commerce businesses.

## Why Choose Bold?

### Advantages
- ✅ **Competitive Rates** - Often lower transaction fees than competitors
- ✅ **Multiple Payment Methods** - Cards, PSE, cash, bank transfers
- ✅ **Installment Plans** - Up to 24 months with different banks
- ✅ **Easy Integration** - Well-documented API and SDK
- ✅ **Fast Approval** - Quick merchant account setup
- ✅ **Local Support** - Colombian-based support team
- ✅ **Regulatory Compliance** - Superintendencia Financiera certified

### Payment Methods Supported
- 💳 **Credit Cards** - Visa, Mastercard, American Express
- 💳 **Debit Cards** - All major Colombian banks
- 🏦 **PSE** - Pagos Seguros en Línea (20+ banks)
- 💰 **Cash** - Efecty, Baloto, Gana, SuperGIROS, Punto Red
- 🏦 **Bank Transfers** - Direct bank transfers

## Current Implementation

### Features Implemented
- ✅ **Multi-Method Selection** - Cards, PSE, Cash options
- ✅ **Card Form** - Complete credit/debit card form with validation
- ✅ **PSE Integration** - Colombian bank selection
- ✅ **Cash Payment** - Multiple cash payment points
- ✅ **Installment Plans** - 1, 3, 6, 12, 18, 24 months
- ✅ **Form Validation** - Real-time validation for all fields
- ✅ **Security Notices** - SSL and PCI DSS compliance
- ✅ **Mock Payment Processing** - Simulates the payment flow

## Real Bold Integration

### 1. Get Bold Account
1. Visit [Bold.co](https://bold.co) or contact their sales team
2. Complete merchant application
3. Get your API credentials:
   - `API Key`
   - `Secret Key`
   - `Merchant ID`

### 2. Install Bold SDK
```bash
npm install @boldcommerce/bold-sdk
# or
yarn add @boldcommerce/bold-sdk
```

### 3. Backend Integration

Create a payment endpoint in your backend:

```javascript
// server/routes/bold-payment.js
const BoldSDK = require('@boldcommerce/bold-sdk');

const bold = new BoldSDK({
  apiKey: process.env.BOLD_API_KEY,
  secretKey: process.env.BOLD_SECRET_KEY,
  merchantId: process.env.BOLD_MERCHANT_ID,
  environment: process.env.NODE_ENV === 'production' ? 'live' : 'sandbox'
});

app.post('/api/bold/payment', async (req, res) => {
  try {
    const { 
      cardNumber, 
      cardName, 
      cardExpiry, 
      cardCvv, 
      installments, 
      paymentMethod, 
      bankCode, 
      amount, 
      orderId, 
      customerInfo 
    } = req.body;

    let paymentData;

    if (paymentMethod === 'card') {
      paymentData = {
        amount: amount,
        currency: 'COP',
        order_id: orderId,
        payment_method: 'card',
        card: {
          number: cardNumber.replace(/\s/g, ''),
          exp_month: cardExpiry.split('/')[0],
          exp_year: '20' + cardExpiry.split('/')[1],
          cvc: cardCvv,
          name: cardName
        },
        installments: installments,
        customer: {
          name: customerInfo.firstName + ' ' + customerInfo.lastName,
          email: customerInfo.email,
          phone: customerInfo.phone,
          address: customerInfo.address,
          city: customerInfo.city,
          state: customerInfo.state,
          country: 'CO'
        },
        metadata: {
          order_type: 'furniture',
          business: 'Casa Piñón Ebanistería'
        }
      };
    } else if (paymentMethod === 'pse') {
      paymentData = {
        amount: amount,
        currency: 'COP',
        order_id: orderId,
        payment_method: 'pse',
        bank_code: bankCode,
        customer: {
          name: customerInfo.firstName + ' ' + customerInfo.lastName,
          email: customerInfo.email,
          phone: customerInfo.phone,
          document_type: 'CC',
          document_number: '12345678'
        }
      };
    } else if (paymentMethod === 'cash') {
      paymentData = {
        amount: amount,
        currency: 'COP',
        order_id: orderId,
        payment_method: 'cash',
        customer: {
          name: customerInfo.firstName + ' ' + customerInfo.lastName,
          email: customerInfo.email,
          phone: customerInfo.phone
        },
        cash_payment: {
          provider: 'efecty', // or 'baloto', 'gana', etc.
          reference: `CP-${orderId}`
        }
      };
    }

    const response = await bold.payments.create(paymentData);
    
    if (response.status === 'approved' || response.status === 'pending') {
      res.json({
        success: true,
        transactionId: response.id,
        status: response.status,
        amount: response.amount,
        orderId: response.order_id,
        paymentMethod: paymentMethod
      });
    } else {
      res.status(400).json({
        success: false,
        error: response.error_message || 'Payment failed'
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Webhook for payment status updates
app.post('/api/bold/webhook', async (req, res) => {
  try {
    const { event, data } = req.body;
    
    if (event === 'payment.succeeded') {
      // Update order status to paid
      await updateOrderStatus(data.order_id, 'paid');
    } else if (event === 'payment.failed') {
      // Update order status to failed
      await updateOrderStatus(data.order_id, 'failed');
    }
    
    res.json({ received: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

### 4. Frontend Integration

Update the `BoldPayment.tsx` component:

```typescript
// Replace the mock payment with real API call
const onSubmit = async (data: BoldFormData) => {
  setIsProcessing(true);
  setPaymentStatus('processing');

  try {
    const response = await fetch('/api/bold/payment', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        cardNumber: data.cardNumber,
        cardName: data.cardName,
        cardExpiry: data.cardExpiry,
        cardCvv: data.cardCvv,
        installments: data.installments,
        paymentMethod: selectedPaymentMethod,
        bankCode: data.bankCode,
        amount: amount,
        orderId: orderId,
        customerInfo: customerInfo
      }),
    });

    const result = await response.json();

    if (result.success) {
      setPaymentStatus('success');
      onSuccess(result);
    } else {
      setPaymentStatus('error');
      onError(result.error);
    }
  } catch (error) {
    setPaymentStatus('error');
    onError(error);
  } finally {
    setIsProcessing(false);
  }
};
```

### 5. Environment Variables

Add to your `.env` file:

```env
# Bold Configuration
BOLD_API_KEY=your_api_key_here
BOLD_SECRET_KEY=your_secret_key_here
BOLD_MERCHANT_ID=your_merchant_id_here

# Environment
NODE_ENV=development
```

## Colombian Bank Codes for PSE

```javascript
const colombianBanks = [
  { code: '1007', name: 'Bancolombia' },
  { code: '1012', name: 'Banco de Bogotá' },
  { code: '1019', name: 'Scotiabank Colpatria' },
  { code: '1066', name: 'Banco AV Villas' },
  { code: '1069', name: 'Banco Caja Social' },
  { code: '1080', name: 'Banco Popular' },
  { code: '1082', name: 'Banco de Occidente' },
  { code: '1087', name: 'Banco Colpatria' },
  { code: '1090', name: 'Banco Agrario' },
  { code: '1112', name: 'Banco Santander' },
  { code: '1115', name: 'Banco BBVA Colombia' },
  { code: '1119', name: 'Banco AV Villas' },
  { code: '1121', name: 'Banco Colpatria' },
  { code: '1123', name: 'Banco de Bogotá' },
  { code: '1126', name: 'Banco Caja Social' },
  { code: '1131', name: 'Banco Popular' },
  { code: '1134', name: 'Banco de Occidente' },
  { code: '1137', name: 'Banco Colpatria' },
  { code: '1140', name: 'Banco Agrario' },
  { code: '1142', name: 'Banco Santander' },
  { code: '1145', name: 'Banco BBVA Colombia' }
];
```

## Installment Plans

Bold supports various installment plans:

```javascript
const installmentPlans = [
  { months: 1, interest: 0, description: '1 cuota - Sin interés' },
  { months: 3, interest: 0, description: '3 cuotas - Sin interés' },
  { months: 6, interest: 0, description: '6 cuotas - Sin interés' },
  { months: 12, interest: 0, description: '12 cuotas - Sin interés' },
  { months: 18, interest: 0, description: '18 cuotas - Sin interés' },
  { months: 24, interest: 0, description: '24 cuotas - Sin interés' }
];
```

## Cash Payment Providers

```javascript
const cashProviders = [
  { code: 'efecty', name: 'Efecty' },
  { code: 'baloto', name: 'Baloto' },
  { code: 'gana', name: 'Gana' },
  { code: 'supergiros', name: 'SuperGIROS' },
  { code: 'puntored', name: 'Punto Red' }
];
```

## Security Considerations

### PCI Compliance
- ✅ **Tokenization** - Bold handles card data securely
- ✅ **SSL/TLS** - All communications encrypted
- ✅ **PCI DSS** - Bold is PCI DSS Level 1 certified
- ✅ **No Card Storage** - Never store card data on your servers

### Data Protection
- ✅ **Encryption** - All sensitive data encrypted
- ✅ **Authentication** - Secure API authentication
- ✅ **Audit Logs** - Complete transaction logging
- ✅ **Fraud Protection** - Built-in fraud detection

## Testing

### Test Cards
```javascript
// Test Credit Cards
const testCards = {
  visa: '4111111111111111',
  mastercard: '5555555555554444',
  amex: '378282246310005'
};

// Test CVV
const testCvv = '123';

// Test Expiry (future date)
const testExpiry = '12/25';
```

### Test Environment
- Use Bold's sandbox environment for testing
- Test all payment methods (card, PSE, cash)
- Test different installment plans
- Test error scenarios

## Production Deployment

### Checklist
- [ ] **SSL Certificate** installed and configured
- [ ] **Environment Variables** set for production
- [ ] **Webhook Endpoints** configured and tested
- [ ] **Error Handling** implemented and tested
- [ ] **Logging** configured for payment events
- [ ] **Monitoring** set up for payment failures
- [ ] **Backup Procedures** in place
- [ ] **Security Headers** configured
- [ ] **Rate Limiting** implemented

### Monitoring
- Monitor payment success/failure rates
- Set up alerts for payment errors
- Track transaction volumes by payment method
- Monitor response times

## Bold vs ePayco Comparison

| Feature | Bold | ePayco |
|---------|------|--------|
| **Transaction Fees** | 2.9% + $0.30 | 3.5% + $0.30 |
| **Setup Time** | 1-2 days | 3-5 days |
| **PSE Support** | ✅ | ✅ |
| **Cash Payments** | ✅ | ✅ |
| **Installments** | Up to 24 months | Up to 12 months |
| **API Documentation** | Excellent | Good |
| **Support** | Colombian team | Colombian team |
| **Mobile SDK** | ✅ | ✅ |

## Support Resources

### Bold Resources
- [Bold Documentation](https://docs.bold.co)
- [Bold Support](https://bold.co/soporte)
- [API Reference](https://docs.bold.co/api)
- [SDK Downloads](https://github.com/boldcommerce)

### Colombian Regulations
- Ensure compliance with Superintendencia Financiera
- Follow Colombian e-commerce regulations
- Implement proper KYC procedures if required

## Next Steps

1. **Contact Bold** - Get merchant account and API credentials
2. **Set Up Backend** - Implement payment endpoints
3. **Update Frontend** - Replace mock with real API calls
4. **Configure Webhooks** - Set up payment status notifications
5. **Test Thoroughly** - Test all payment scenarios
6. **Deploy to Production** - Follow security checklist
7. **Monitor & Optimize** - Track performance and optimize

## Benefits for Casa Piñón

### Business Advantages
- **Lower Fees** - Save on transaction costs
- **More Payment Options** - Reach more customers
- **Installment Plans** - Increase average order value
- **Better Approval Rates** - Reduce cart abandonment
- **Local Support** - Get help in Spanish

### Customer Benefits
- **Multiple Payment Methods** - Pay how they prefer
- **Installment Options** - Spread payments over time
- **Security** - PCI DSS certified protection
- **Convenience** - Fast and easy checkout

The Bold integration provides a robust, cost-effective payment solution specifically designed for the Colombian market, offering Casa Piñón Ebanistería a competitive advantage in the local e-commerce space.

