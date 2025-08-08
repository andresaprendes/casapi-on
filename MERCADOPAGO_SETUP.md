# MercadoPago Setup Guide - Casa Piñón Ebanistería

## Overview
This project now uses MercadoPago as the primary payment gateway. MercadoPago is a popular payment processor in Latin America that offers competitive rates and excellent integration options.

## Setup Instructions

### 1. Create MercadoPago Account
1. Go to [MercadoPago.com](https://www.mercadopago.com)
2. Click "Crear cuenta" and follow the registration process
3. Complete your business verification
4. Wait for account approval (usually 1-2 business days)

### 2. Get API Credentials
1. Log into your MercadoPago dashboard
2. Go to "Desarrolladores" → "Credenciales"
3. Copy your credentials:
   - **Public Key** (starts with `APP_USR-` for production, `TEST-` for testing)
   - **Access Token** (starts with `APP_USR-` for production, `TEST-` for testing)

### 3. Environment Configuration
1. Copy `env-template.txt` to `.env` in the root directory
2. Update the following variables with your real credentials:

```bash
# Production Keys (replace with your real keys)
MERCADOPAGO_ACCESS_TOKEN=APP_USR-xxxxxxxxxxxxxxxxxxxxxxxxxxxx
MERCADOPAGO_PUBLIC_KEY=APP_USR-xxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Frontend Environment Variable
REACT_APP_MERCADOPAGO_PUBLIC_KEY=APP_USR-xxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### 4. Start the Backend Server
```bash
cd server
npm install
npm run dev
```

The server will start on port 3001.

### 5. Start the Frontend
```bash
npm run dev
```

The frontend will start on port 3000.

## Payment Methods Available

### ✅ Credit/Debit Cards
- Visa, Mastercard, American Express
- Installments up to 12 months
- Real-time validation

### ✅ PSE (Pagos Seguros en Línea)
- 20+ Colombian banks
- Instant transfers
- No additional fees

### ✅ Cash Payments
- Efecty
- Baloto
- Gana
- SuperGIROS
- Punto Red

### ✅ Digital Wallets
- MercadoPago Wallet
- Other digital payment methods

## Testing

### Test Cards
Use these test cards for development:

**Visa:**
- Number: 4509 9535 6623 3704
- Expiry: 11/25
- CVV: 123

**Mastercard:**
- Number: 5031 4332 1540 6351
- Expiry: 11/25
- CVV: 123

### Test PSE
- Use any Colombian bank for testing
- No real money will be charged

## Production Deployment

### 1. Update Environment Variables
Replace test keys with production keys in your `.env` file.

### 2. Update URLs
Update the following URLs in `server/mercadopago-api.js`:
- `notification_url`
- `back_urls.success`
- `back_urls.failure`
- `back_urls.pending`

### 3. Webhook Configuration
1. In your MercadoPago dashboard, go to "Webhooks"
2. Add your webhook URL: `https://yourdomain.com/api/mercadopago/webhook`
3. Select events: `payment.created`, `payment.updated`

## Fees and Costs

### MercadoPago Fees (Colombia)
- **Credit/Debit Cards**: 3.5% + IVA
- **PSE**: 2.5% + IVA
- **Cash Payments**: 3.5% + IVA
- **Digital Wallets**: 2.5% + IVA

### Setup Costs
- **Account Setup**: Free
- **Monthly Fee**: Free
- **Transaction Fees**: Only when you make sales

## Security Features

### ✅ PCI DSS Compliance
- Level 1 PCI DSS certification
- Secure data handling

### ✅ SSL/TLS Encryption
- All data encrypted in transit
- Secure API communications

### ✅ Fraud Protection
- Advanced fraud detection
- Risk scoring for transactions

### ✅ Tokenization
- Card data tokenization
- Secure storage practices

## Support

### MercadoPago Support
- **Email**: soporte@mercadopago.com
- **Phone**: +57 1 381 0000
- **Hours**: 24/7 support
- **Language**: Spanish and English

### Documentation
- [MercadoPago Developers](https://developers.mercadopago.com)
- [API Reference](https://developers.mercadopago.com/es/docs)
- [SDK Documentation](https://github.com/mercadopago/sdk-nodejs)

## Troubleshooting

### Common Issues

**1. "Invalid credentials" error**
- Check your API keys are correct
- Ensure you're using the right environment (test vs production)

**2. Payment not processing**
- Verify your webhook URL is accessible
- Check server logs for errors
- Ensure all required fields are provided

**3. Frontend not loading**
- Check `REACT_APP_MERCADOPAGO_PUBLIC_KEY` is set
- Verify the MercadoPago SDK is loaded

### Debug Mode
Enable debug logging by setting:
```bash
NODE_ENV=development
DEBUG=mercadopago:*
```

## Next Steps

1. **Complete Setup**: Follow all steps above
2. **Test Payments**: Use test cards to verify everything works
3. **Go Live**: Switch to production keys
4. **Monitor**: Check payment success rates and customer feedback
5. **Optimize**: Adjust settings based on performance

## Files Modified

- ✅ Removed Bold payment integration
- ✅ Updated App.tsx routing
- ✅ Created MercadoPagoPayment page
- ✅ Updated server configuration
- ✅ Added environment template
- ✅ Updated package.json files

Your MercadoPago integration is now ready for production! 