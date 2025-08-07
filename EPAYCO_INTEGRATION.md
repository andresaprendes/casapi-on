# ePayco Integration Guide

## Overview
This project includes a complete ePayco payment integration for Casa Piñón Ebanistería. The current implementation includes a mock payment flow that simulates the ePayco payment process.

## Current Implementation

### Features Implemented
- ✅ **Payment Form** - Complete credit card form with validation
- ✅ **Card Type Detection** - Automatically detects Visa, Mastercard, Amex
- ✅ **Form Validation** - Real-time validation for all fields
- ✅ **Installment Options** - 1, 3, 6, 12 months without interest
- ✅ **Security Notices** - SSL and PCI DSS compliance information
- ✅ **Payment Methods Info** - Shows all available payment options
- ✅ **Mock Payment Processing** - Simulates the payment flow

### Payment Methods Supported
- 💳 **Credit Cards** - Visa, Mastercard, American Express
- 💳 **Debit Cards** - All major Colombian banks
- 🏦 **PSE** - Pagos Seguros en Línea
- 💰 **Cash** - Efectivo en puntos de pago

## Real ePayco Integration

### 1. Get ePayco Credentials
1. Sign up at [ePayco.co](https://epayco.co)
2. Get your API credentials:
   - `Public Key`
   - `Private Key`
   - `Client ID`

### 2. Install ePayco SDK
```bash
npm install epayco-sdk-node
# or
yarn add epayco-sdk-node
```

### 3. Backend Integration

Create a payment endpoint in your backend:

```javascript
// server/routes/payment.js
const ePayco = require('epayco-sdk-node')({
  apiKey: process.env.EPAYCO_PUBLIC_KEY,
  privateKey: process.env.EPAYCO_PRIVATE_KEY,
  lang: 'ES',
  test: process.env.NODE_ENV !== 'production'
});

app.post('/api/payment/process', async (req, res) => {
  try {
    const { cardNumber, cardName, cardExpiry, cardCvv, amount, orderId, customerInfo } = req.body;

    const paymentData = {
      card: {
        number: cardNumber.replace(/\s/g, ''),
        exp_year: '20' + cardExpiry.split('/')[1],
        exp_month: cardExpiry.split('/')[0],
        cvc: cardCvv
      },
      customer: {
        name: customerInfo.firstName + ' ' + customerInfo.lastName,
        email: customerInfo.email,
        phone: customerInfo.phone
      },
      amount: amount,
      currency: 'COP',
      doc_type: 'CC',
      doc_number: '12345678',
      description: `Orden ${orderId} - Casa Piñón Ebanistería`,
      invoice: orderId,
      base_iva: amount * 0.19, // 19% IVA
      iva: amount * 0.19,
      base0: amount * 0.81,
      extra1: customerInfo.address,
      extra2: customerInfo.city,
      extra3: customerInfo.state
    };

    const response = await ePayco.charge.create(paymentData);
    
    if (response.success) {
      res.json({
        success: true,
        transactionId: response.data.x_ref_payco,
        status: response.data.x_status,
        amount: response.data.x_amount,
        orderId: response.data.x_invoice
      });
    } else {
      res.status(400).json({
        success: false,
        error: response.error
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});
```

### 4. Frontend Integration

Update the `EPaycoPayment.tsx` component:

```typescript
// Replace the mock payment with real API call
const onSubmit = async (data: EPaycoFormData) => {
  setIsProcessing(true);
  setPaymentStatus('processing');

  try {
    const response = await fetch('/api/payment/process', {
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

Create a `.env` file:

```env
# ePayco Configuration
EPAYCO_PUBLIC_KEY=your_public_key_here
EPAYCO_PRIVATE_KEY=your_private_key_here
EPAYCO_CLIENT_ID=your_client_id_here

# Environment
NODE_ENV=development
```

## Security Considerations

### PCI Compliance
- ✅ **Never store card data** on your servers
- ✅ **Use ePayco's secure form** or tokenization
- ✅ **Implement proper SSL/TLS** encryption
- ✅ **Follow PCI DSS guidelines**

### Data Protection
- ✅ **Encrypt sensitive data** in transit and at rest
- ✅ **Implement proper authentication** and authorization
- ✅ **Log security events** for monitoring
- ✅ **Regular security audits**

## Testing

### Test Cards
ePayco provides test cards for development:

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
- Use ePayco's sandbox environment for testing
- Test all payment scenarios (success, failure, pending)
- Test different payment methods
- Test error handling

## Production Deployment

### Checklist
- [ ] **SSL Certificate** installed and configured
- [ ] **Environment Variables** set for production
- [ ] **Error Handling** implemented and tested
- [ ] **Logging** configured for payment events
- [ ] **Monitoring** set up for payment failures
- [ ] **Backup Procedures** in place
- [ ] **Security Headers** configured
- [ ] **Rate Limiting** implemented

### Monitoring
- Monitor payment success/failure rates
- Set up alerts for payment errors
- Track transaction volumes
- Monitor response times

## Support

### ePayco Resources
- [ePayco Documentation](https://docs.epayco.co)
- [ePayco Support](https://epayco.co/soporte)
- [API Reference](https://docs.epayco.co/reference)

### Colombian Payment Regulations
- Ensure compliance with Colombian financial regulations
- Follow Superintendencia Financiera guidelines
- Implement proper KYC procedures if required

## Next Steps

1. **Get ePayco Account** - Sign up and get API credentials
2. **Set Up Backend** - Implement the payment endpoint
3. **Update Frontend** - Replace mock with real API calls
4. **Test Thoroughly** - Test all payment scenarios
5. **Deploy to Production** - Follow security checklist
6. **Monitor & Optimize** - Track performance and optimize

The current implementation provides a solid foundation for ePayco integration. The UI/UX is complete and ready for production use once the real API integration is implemented.

