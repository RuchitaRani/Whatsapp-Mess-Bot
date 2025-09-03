# 🚀 GitHub Deployment Guide - QR WhatsApp Bot

Deploy your WhatsApp Extras Bot to **free hosting platforms** directly from GitHub with **zero costs**.

## 🎯 **Free Deployment Options**

### **🚂 Option 1: Railway (RECOMMENDED)**

**Why Railway?**
- ✅ $5 monthly credit (covers small bots)
- ✅ GitHub auto-deploy
- ✅ No credit card required initially
- ✅ Persistent storage for bot session

**Steps:**
1. **Push to GitHub**
   ```bash
   cd qr-version
   git init
   git add .
   git commit -m "WhatsApp QR Bot"
   git remote add origin https://github.com/YOUR_USERNAME/whatsapp-extras-bot
   git push -u origin main
   ```

2. **Deploy to Railway**
   - Go to [railway.app](https://railway.app)
   - Login with GitHub
   - Click "New Project" → "Deploy from GitHub repo"
   - Select your repository
   - Railway auto-detects Node.js and deploys

3. **Bot is Live!**
   - Railway provides a public URL
   - Bot runs 24/7 in the cloud
   - Check logs to see QR code for first-time setup

---

### **🎨 Option 2: Render**

**Why Render?**
- ✅ 750 free hours/month
- ✅ GitHub integration
- ✅ Free SSL certificates
- ✅ Auto-deploy on git push

**Steps:**
1. **Push to GitHub** (same as above)

2. **Deploy to Render**
   - Go to [render.com](https://render.com)
   - Connect GitHub account
   - Create new "Web Service"
   - Select your repository
   - Build command: `npm install`
   - Start command: `node bot.js`

3. **Configure**
   - Environment: `NODE_ENV=production`
   - Region: Choose closest to you
   - Auto-deploy: Enable

---

### **🟣 Option 3: Heroku**

**Setup:**
```bash
# Install Heroku CLI first
heroku create your-whatsapp-bot

# Set Node.js version
echo 'node_modules/
whatsapp-session/' > .gitignore

git add .
git commit -m "Deploy to Heroku"
git push heroku main
```

---

## 📱 **First Time Setup (Any Platform)**

### **1. Check Deployment Logs**
Once deployed, check platform logs to find the QR code:

**Railway:**
- Go to your project → Deployments → Latest deployment
- Check "Deploy Logs" for QR code

**Render:**  
- Go to your service → Logs
- Look for QR code in startup logs

**Heroku:**
```bash
heroku logs --tail -a your-app-name
```

### **2. Connect Your Phone**
1. **Find QR Code** in deployment logs
2. **Open WhatsApp** on your phone
3. **Settings** → **Linked Devices** → **Link a Device**
4. **Scan QR Code** from the logs
5. ✅ **Bot Connected!**

### **3. Test the Bot**
1. Add bot to "Extras Booking- Hall 4" group
2. Send: `menu`
3. Expected: Menu response
4. Send: `John Doe 241110001 A101 Fish Curry`
5. Expected: Booking confirmation

---

## ⚙️ **Environment Configuration**

### **Production Settings**

Add these environment variables in your hosting platform:

**Railway/Render Dashboard:**
```
NODE_ENV=production
TZ=Asia/Kolkata
```

**Heroku:**
```bash
heroku config:set NODE_ENV=production
heroku config:set TZ=Asia/Kolkata
```

---

## 🔄 **Auto-Deployment Setup**

### **GitHub Actions** (Optional)
Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Railway
on:
  push:
    branches: [ main ]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v2
    - name: Deploy to Railway
      run: |
        echo "Deploying to Railway..."
        # Railway auto-deploys on git push
```

---

## 🔧 **Managing Deployed Bot**

### **View Logs**

**Railway:**
- Project → Service → Logs tab
- Real-time log streaming

**Render:**
- Service → Logs section
- Auto-refreshing logs

**Heroku:**
```bash
heroku logs --tail -a your-app-name
```

### **Restart Bot**

**Railway:**
- Project → Settings → Redeploy

**Render:**
- Manual Deploy → Deploy latest commit

**Heroku:**
```bash
heroku restart -a your-app-name
```

### **Scale/Monitor**

**Railway:**
- Project → Settings → Resources
- Monitor CPU/Memory usage

**Render:**
- Service → Metrics tab
- View performance charts

---

## 📊 **Bot Session Management**

### **Session Persistence**
- Bot session stored in `/whatsapp-session/` folder
- Persists between deployments (platform dependent)
- If session lost, check logs for new QR code

### **Re-authentication**
If bot stops working:
1. Check deployment logs
2. Look for new QR code  
3. Re-scan with phone
4. Bot resumes operation

---

## ⚠️ **Important Considerations**

### **Phone Requirements**
- ✅ Keep phone connected to internet
- ✅ WhatsApp must stay active on phone
- ✅ Phone acts as primary device, bot as secondary

### **Platform Limitations**
- **Railway**: $5 credit limit
- **Render**: 750 hour limit (31+ days)
- **Heroku**: May sleep if inactive

### **Session Management**
- Some platforms may clear session data
- Monitor logs for re-authentication needs
- Keep phone available for QR scanning

---

## 🎉 **Deployment Complete!**

Your WhatsApp Extras Bot is now:

✅ **Deployed** to free cloud hosting  
✅ **Connected** to your WhatsApp via QR  
✅ **Auto-deploying** from GitHub  
✅ **Running 24/7** in the cloud  
✅ **Taking bookings** for Hall 4  

### **Next Steps:**
1. **Monitor logs** for QR codes/errors
2. **Test functionality** in WhatsApp group  
3. **Share with students** in Hall 4
4. **Scale up** if usage grows

---

**🚀 Your free WhatsApp bot is live and serving Hall 4!** 📱

**GitHub → Deploy → Scan QR → Start Booking!** ✨