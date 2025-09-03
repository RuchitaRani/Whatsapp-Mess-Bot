# 📱 WhatsApp Extras Bot - QR Version

A **simple WhatsApp bot** that connects to your phone via **QR code** and manages extras food bookings for "Extras Booking- Hall 4" group. **No API costs, no webhooks, just scan and go!**


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

