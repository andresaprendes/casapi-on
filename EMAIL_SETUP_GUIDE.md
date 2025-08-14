# 📧 Email Setup Guide - Casa Piñón Ebanistería

## Overview
This guide explains how to set up email notifications for order confirmations and payment status updates using Gmail SMTP.

## Email Flow

### 1. Payment Status Email
- **When**: When payment status changes (approved, pending, rejected, cancelled)
- **Content**: Order details, payment details, status-specific message, next steps
- **Status**: Sent for all payment status changes via webhook or API verification
- **Triggers**: 
  - Payment approved → Success email with order processing info
  - Payment pending → Pending email with processing time info
  - Payment rejected/cancelled → Rejection email with retry instructions

## Gmail Setup

### Step 1: Enable 2-Factor Authentication
1. Go to your Google Account settings
2. Navigate to Security
3. Enable 2-Step Verification

### Step 2: Generate App Password
1. Go to Google Account settings
2. Navigate to Security → 2-Step Verification
3. Click "App passwords"
4. Select "Mail" and "Other (Custom name)"
5. Name it "Casa Piñón API"
6. Copy the generated 16-character password

### Step 3: Railway Environment Variables
Add these variables to your Railway backend service:

```bash
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-16-character-app-password
```

## Email Templates

### Payment Status Email Template
- **Subject**: `[Status] Pedido #ORD-XXXXX - Casa Piñón Ebanistería`
- **Status-specific subjects**:
  - `✅ ¡Pago Confirmado! Pedido #ORD-XXXXX - Casa Piñón Ebanistería`
  - `⏳ Pago Pendiente Pedido #ORD-XXXXX - Casa Piñón Ebanistería`
  - `❌ Pago Rechazado Pedido #ORD-XXXXX - Casa Piñón Ebanistería`
- **Includes**:
  - Status-specific header and message
  - Order details (number, date, products, total)
  - Payment details (ID, method, date, amount)
  - Customer and shipping information
  - Status-specific next steps
  - Contact information

## Testing Email Setup

### 1. Check Environment Variables
```bash
# In Railway dashboard, verify these are set:
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
```

### 2. Test Payment Status Emails
1. Complete a test payment (approved)
2. Check webhook logs for payment status email
3. Verify confirmation email is received

### 3. Test Different Payment Statuses
1. Test pending payment (PSE method)
2. Test rejected payment (if possible)
3. Verify appropriate emails are sent for each status

## Troubleshooting

### Common Issues

#### 1. "Email credentials not configured"
- **Cause**: Missing EMAIL_USER or EMAIL_PASSWORD
- **Solution**: Add both environment variables in Railway

#### 2. "Invalid login" error
- **Cause**: Wrong password or 2FA not enabled
- **Solution**: 
  - Enable 2-Factor Authentication
  - Generate new app password
  - Update EMAIL_PASSWORD in Railway

#### 3. "Less secure app access" error
- **Cause**: Gmail blocking less secure apps
- **Solution**: Use app password instead of regular password

#### 4. Emails not sending
- **Cause**: Network issues or Gmail rate limits
- **Solution**: 
  - Check Railway logs for specific errors
  - Verify Gmail account settings
  - Check for rate limiting

### Log Messages to Look For

#### Success Messages:
```
✅ Payment approved email sent: <message-id>
✅ Payment pending email sent: <message-id>
✅ Payment rejected email sent: <message-id>
```

#### Warning Messages:
```
⚠️ Email credentials not configured, skipping email send
⚠️ Failed to send payment approved email: <error>
⚠️ Failed to send payment pending email: <error>
⚠️ Failed to send payment rejected email: <error>
```

## Security Notes

### Gmail App Passwords
- App passwords are more secure than regular passwords
- They can be revoked individually
- They don't require disabling 2FA
- They're specific to the application

### Environment Variables
- Never commit email credentials to code
- Use Railway's environment variable system
- Rotate app passwords regularly
- Monitor for unauthorized access

## Email Content Customization

### Branding
- Update contact information in email templates
- Modify colors and styling
- Add company logo (requires image hosting)
- Customize footer content

### Language
- Currently in Spanish
- Can be modified in `server/emailService.js`
- Supports HTML formatting
- Responsive design for mobile

## Monitoring

### Railway Logs
Monitor these log patterns:
- Email sending success/failure
- Payment status changes
- Webhook processing
- Order creation

### Email Delivery
- Check spam folders
- Monitor bounce rates
- Track open rates (if needed)
- Verify customer email addresses

## Next Steps

### Potential Enhancements
1. **Email Templates**: Add more sophisticated HTML templates
2. **Attachments**: Include order PDF or invoice
3. **Tracking**: Add email tracking and analytics
4. **Automation**: Set up follow-up emails for abandoned carts
5. **Localization**: Support multiple languages
6. **Customization**: Allow admin to customize email content

### Integration Options
1. **Email Service Providers**: Consider services like SendGrid, Mailgun
2. **Template Engines**: Use Handlebars or EJS for dynamic templates
3. **Queue System**: Implement email queuing for better reliability
4. **Analytics**: Add email tracking and delivery confirmation
