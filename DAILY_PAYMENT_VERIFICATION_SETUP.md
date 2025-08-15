# Daily Payment Verification Setup

This system automatically verifies all pending payments with MercadoPago every day to ensure your database always has the most accurate payment status.

## How It Works

1. **Daily Check**: Every day, the system checks all pending payments in your database
2. **MercadoPago Verification**: For each pending payment, it queries MercadoPago's API directly
3. **Database Update**: Updates your database with the current payment status from MercadoPago
4. **Status Sync**: Ensures your admin panel shows the correct payment status

## Setup Options

### Option 1: Railway Cron Job (Recommended)

If you're using Railway, you can set up a cron job in your `railway.json`:

```json
{
  "cron": {
    "daily-payment-verification": {
      "schedule": "0 6 * * *",
      "command": "node scripts/daily-payment-verification.js"
    }
  }
}
```

This will run the verification every day at 6:00 AM.

### Option 2: External Cron Service

You can use external cron services like:
- **Cron-job.org** (free)
- **EasyCron** (free tier available)
- **SetCronJob** (free tier available)

Set up a cron job to call this URL daily:
```
POST https://casa-pinon-backend-production.up.railway.app/api/mercadopago/verify-all-pending
```

### Option 3: Manual Testing

To test the verification manually, you can:

1. **Visit the endpoint directly**:
   ```
   GET https://casa-pinon-backend-production.up.railway.app/api/mercadopago/verify-all-pending
   ```

2. **Run the script locally**:
   ```bash
   node scripts/daily-payment-verification.js
   ```

## What Gets Verified

The system checks all payments that meet these criteria:
- Payment status is 'pending' in your database
- Order payment status is 'pending' in your database
- Payment was created more than 1 hour ago (to avoid checking very recent payments)

## Status Mapping

| MercadoPago Status | Database Status | Description |
|-------------------|-----------------|-------------|
| `approved` | `paid` | Payment was successful |
| `rejected` | `failed` | Payment was rejected |
| `cancelled` | `failed` | Payment was cancelled |
| `pending` | `pending` | Payment is still pending |

## Benefits

1. **No More False Pending**: Payments that were actually completed will be marked as paid
2. **Automatic Sync**: Your admin panel will always show accurate payment status
3. **No Manual Work**: No need to manually check each payment
4. **Reliable**: Direct API calls are more reliable than webhooks

## Monitoring

The system logs all verification activities. You can monitor:

- **Success rate**: How many payments were successfully verified
- **Error rate**: Any payments that couldn't be verified
- **Status changes**: Which payments changed from pending to paid/failed

## Troubleshooting

### If verification fails:
1. Check the logs for error messages
2. Verify your MercadoPago API credentials
3. Ensure your database is accessible
4. Check if MercadoPago's API is responding

### If payments are still showing as pending:
1. The payment might actually be pending on MercadoPago's side
2. Check the detailed logs to see the actual MercadoPago status
3. Some payment methods (like PSE) can take longer to process

## Security

- The verification endpoint is protected and only accessible from authorized sources
- No sensitive payment data is logged
- Only payment status information is processed

## Cost Considerations

- MercadoPago API calls are free for payment status verification
- The script runs once daily, so API usage is minimal
- No additional costs for this feature
