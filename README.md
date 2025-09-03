# 📱 WhatsApp Extras Bot - QR Version

A **simple WhatsApp bot** that connects to your phone via **QR code** and manages extras food bookings for "Extras Booking- Hall 4" group. **No API costs, no webhooks, just scan and go!**

## 🎯 **Why This Version?**

- ✅ **No API Costs**: Uses WhatsApp Web (free)
- ✅ **Simple Setup**: Just scan QR code with your phone
- ✅ **GitHub Deploy**: Easy deployment to free hosting
- ✅ **Phone Linked**: Works as WhatsApp Web linked device
- ✅ **All Features**: Complete booking system included

## 🚀 **Quick Start**

### **1. Install**
```bash
git clone your-repo
cd qr-version
npm install
```

### **2. Run Bot**
```bash
npm start
```

### **3. Scan QR Code**
1. QR code will appear in terminal
2. Open WhatsApp on your phone
3. Go to **Settings** → **Linked Devices** → **Link a Device**
4. Scan the QR code
5. ✅ **Bot is now connected to your WhatsApp!**

## 📱 **How It Works**

The bot connects to WhatsApp Web using your phone as the primary device. It acts like WhatsApp Web in your browser, but automated.

**Your phone stays connected to WhatsApp normally** - the bot runs as a linked device.

## 🎯 **Features**

### ✅ **Smart Booking System**
- **Flexible Order**: `Shae Das 241110032 A123 Fish Curry` (any order works)
- **Time Validation**: Lunch closes 8AM, Dinner closes 10AM
- **Missing Info Detection**: Prompts for incomplete bookings
- **SQLite Database**: Stores all bookings locally

### 📋 **Menu System**
- **Menu Commands**: `menu`, `lunch menu`, `dinner menu`
- **Daily Menus**: Shows available extras with prices
- **Auto-Generated**: Creates menu for current date

### 🕐 **Time Management**  
- **Meal Detection**: Auto-detects breakfast/lunch/dinner time
- **Booking Cutoffs**: Enforces time restrictions
- **Real-time Responses**: Current time validation

## 💬 **Usage Examples**

### **Get Menu**
```
User: "menu"
Bot: 🍽️ Lunch Extras Menu - 29 August 2025

• Fish Curry - ₹60
• Chicken Curry - ₹70  
• Mutton Curry - ₹80
• Egg Curry - ₹35
• Paneer Bhujiya - ₹45

📝 How to book:
Send: Name Roll# Room# Dish
Example: Shae Das 241110032 A123 Fish Curry
```

### **Make Booking**
```
User: "Shae Das 241110032 A123 Fish Curry"
Bot: ✅ Booking Confirmed!

👤 Name: Shae Das
🎓 Roll: 241110032  
🏠 Room: A123
🍽️ Dish: Fish Curry
🕐 Meal: Lunch
📅 Date: 29 August 2025
```

### **Missing Info**
```
User: "Shae Das Fish Curry"
Bot: ❌ Missing information: Roll Number, Room Number

📝 Please provide in format:
Name Roll# Room# Dish
Example: Shae Das 241110032 A123 Fish Curry  
```

### **Late Booking**
```
User: "John Doe 241110046 C123 Fish Curry" (sent at 9 AM)
Bot: ❌ Lunch extras booking is closed after 8:00 AM.
Current time: 9:00 AM
```

## 🌐 **GitHub Deployment**

### **Deploy to Railway (Free)**
1. Fork this repository
2. Connect to Railway
3. Deploy automatically
4. Bot runs 24/7 in the cloud

### **Deploy to Render (Free)**
1. Connect GitHub repo to Render
2. Auto-deploys on git push
3. 750 free hours/month

### **Deploy to Heroku**
```bash
git init
git add .
git commit -m "WhatsApp QR Bot"
heroku create your-bot-name
git push heroku main
```

## ⚙️ **Configuration**

### **Group Name**
Change target group in `bot.js`:
```javascript
this.targetGroup = "Extras Booking- Hall 4";
```

### **Time Cutoffs**
Modify booking times:
```javascript  
this.lunchCutoff = { hour: 8, minute: 0 };    // 8:00 AM
this.dinnerCutoff = { hour: 10, minute: 0 };  // 10:00 AM
```

### **Menu Items**
Add/modify menu items in `createMenuItems()` function:
```javascript
lunch: [
    { name: 'Fish Curry', price: 60 },
    { name: 'Chicken Curry', price: 70 },
    // Add more items...
]
```

## 🔧 **Development**

### **Local Development**
```bash
npm run dev  # Uses nodemon for auto-restart
```

### **Database**
- Uses SQLite database (`extras_bookings.db`)
- Auto-creates tables on first run
- Stores bookings and menu items

### **Session Management**  
- WhatsApp session saved in `whatsapp-session/` folder
- Persists between restarts (no need to scan QR again)
- Delete folder to reset connection

## 🚨 **Important Notes**

### **WhatsApp Terms of Service**
- This uses WhatsApp Web automation
- Use responsibly and at your own risk
- WhatsApp may limit or block automated usage

### **Phone Requirements**
- Your phone must stay connected to internet
- WhatsApp must be installed and active
- Bot works as a "Linked Device"

### **Limitations**
- Requires phone to be online
- WhatsApp Web session can expire
- May need occasional re-authentication

## 🔍 **Troubleshooting**

### **QR Code Not Scanning**
- Make sure terminal supports QR display
- Try different terminal app
- Check phone's WhatsApp version

### **Bot Not Responding**
- Check if bot is in correct group  
- Verify group name matches exactly
- Check console for errors

### **Session Expired**
- Delete `whatsapp-session/` folder
- Restart bot and scan QR again

### **Database Issues**
- Delete `extras_bookings.db` file
- Restart bot to recreate database

## 📊 **Monitoring**

### **View Bookings**
Database stores all bookings with:
- Name, Roll Number, Room Number
- Dish, Meal Type, Date, Time
- Unique booking ID

### **Logs**
Bot logs all activities:
- Message processing
- Booking confirmations  
- Database operations
- Connection status

## 🎉 **Ready to Deploy!**

Your **QR-connected WhatsApp bot** is ready to:

1. **Clone/Fork** this repository
2. **Deploy** to free hosting (Railway/Render/Heroku)
3. **Scan QR** with your phone
4. **Start taking bookings** in Hall 4 group!

---

**🔗 Connect your phone, deploy to GitHub, and start serving Hall 4!** 📱✨

No API costs, no complex setup, just simple QR scan deployment! 🚀