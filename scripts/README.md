# Database Sync Script

This script allows you to synchronize the product database between your local development environment and the Railway production environment.

## 🚀 Quick Start

```bash
# Run the sync script
npm run sync-db

# Or run directly
node scripts/sync-database.js
```

## 📋 Available Options

### 1. 📤 Upload Local Database → Railway
- Fetches all products from your local server
- Uploads them to Railway, replacing existing data
- **Use this when you want Railway to match your local changes**

### 2. 📥 Download Railway Database → Local
- Fetches all products from Railway
- Downloads them to your local server
- **Use this when you want local to match Railway changes**

### 3. 🔄 Sync Local Database to Railway (Reset)
- Calls Railway's sync endpoint to reset to default products
- **Use this to reset Railway to the default product list**

### 4. 📋 Show Local Database
- Displays all products currently in your local database
- Shows product names, prices, categories, and image counts

### 5. 📋 Show Railway Database
- Displays all products currently in Railway database
- Shows product names, prices, categories, and image counts

### 6. 💾 Save Railway Database to File
- Downloads Railway database and saves it as a JSON file
- Useful for backups or manual editing
- Files are saved in the `scripts/` directory with timestamps

### 7. 📂 Load Database from File
- Loads a previously saved database file
- Can upload to either local or Railway
- Useful for restoring from backups

## 🔧 Prerequisites

### Before running the script:

1. **Start your local server:**
   ```bash
   # Terminal 1: Start frontend
   npm run dev
   
   # Terminal 2: Start backend
   cd server && npm start
   ```

2. **Ensure Railway is deployed:**
   - Check that your Railway backend is running
   - URL: `https://casa-pinon-backend-production.up.railway.app`

## 🎯 Common Use Cases

### Scenario 1: You made changes locally and want them on Railway
```bash
npm run sync-db
# Choose option 1: Upload Local Database → Railway
```

### Scenario 2: Someone else made changes on Railway and you want them locally
```bash
npm run sync-db
# Choose option 2: Download Railway Database → Local
```

### Scenario 3: You want to reset Railway to default products
```bash
npm run sync-db
# Choose option 3: Sync Local Database to Railway (Reset)
```

### Scenario 4: You want to backup Railway database
```bash
npm run sync-db
# Choose option 6: Save Railway Database to File
```

## ⚠️ Important Notes

- **Backup before syncing**: The script will replace existing data
- **Images**: Product images are stored separately and may need manual upload
- **Confirmation**: The script asks for confirmation before making changes
- **Error handling**: The script shows detailed error messages if something goes wrong

## 🔍 Troubleshooting

### "Local server is not running"
- Make sure both frontend and backend are started
- Check that backend is running on port 3001

### "Failed to fetch products"
- Check your internet connection
- Verify Railway backend is accessible
- Check Railway logs for any errors

### "Upload failed"
- Check that Railway backend is running
- Verify the sync endpoint is working
- Check Railway logs for detailed error messages

## 📁 File Structure

```
scripts/
├── sync-database.js          # Main sync script
├── README.md                 # This file
├── railway-database-*.json   # Backup files (created by script)
└── ...
```

## 🛠️ Configuration

The script uses these URLs by default:
- **Local API**: `http://localhost:3001`
- **Railway API**: `https://casa-pinon-backend-production.up.railway.app`

To change these URLs, edit the constants at the top of `sync-database.js`.
