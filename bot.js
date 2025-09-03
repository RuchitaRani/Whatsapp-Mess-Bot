const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const sqlite3 = require('sqlite3').verbose();
const moment = require('moment');
const fs = require('fs');

class WhatsAppExtrasBot {
    constructor() {
        this.client = new Client({
            authStrategy: new LocalAuth({
                dataPath: './whatsapp-session'
            }),
            puppeteer: {
                headless: true,
                args: ['--no-sandbox', '--disable-setuid-sandbox']
            }
        });
        
        this.dbPath = 'extras_bookings.db';
        this.targetGroup = "Extras Booking- Hall 4";
        
        // Time cutoffs
        this.lunchCutoff = { hour: 8, minute: 0 };    // 8:00 AM
        this.dinnerCutoff = { hour: 10, minute: 0 };  // 10:00 AM
        
        // Enhanced food items list - includes menu items from your mess
        this.foodKeywords = [
            // Non-veg items (usually extras)
            'chicken stew', 'chilli chicken', 'roasted chicken', 'ghee roast chicken',
            'fish tikka', 'dahi fish curry', 'mutton biryani', 'basic chicken', 'fish curry',
            'chicken chowmein', 'chicken lolipop', 'chicken fried rice', 'chicken lollipop',
            'butter chicken', 'kalimirch chicken', 'chicken kassa', 'handi chicken',
            'chicken curry', 'fish fry', 'mutton curry', 'egg curry', 'tandoori chicken',

            // Veg extras  
            'paneer tikka', 'paneer momo', 'mushroom curry', 'aloo posto', 'paneer do pyaza',
            'veg chowmein', 'masala pav', 'papdi chat', 'paneer curry', 'paneer bhujiya',
            'shukto', 'arbi patta ki sabzi', 'litti chokha', 'pani puri', 'egg biryani',
            'veg biryani', 'schezwan rice', 'hakka noodles', 'veg noodles', 'egg roll',
            'veg roll', 'paneer fried rice', 'egg fried rice', 'veg fried rice'
        ];
        
        // August 2025 Menu
        this.messMenu = {
            'Monday': {
                lunch: 'Rajma, Aloo Shimla, Nimbu Paani',
                dinner: 'Aalu/Raw Kala Sabzi, Mix dal',
                extra_lunch: 'Fish Curry, Chicken Curry, Paneer Bhujiya, Egg Curry',
                extra_dinner: 'Chicken Biryani, Mutton Biryani, Egg Biryani, Veg Biryani'
            },
            'Tuesday': {
                lunch: 'Jeera Lauki, Dal Makhani, Buttermilk',
                dinner: 'Mix Veg sabzi, Masla Masoor dal',
                extra_lunch: 'Chicken Fried Rice, Paneer Fried Rice, Egg Fried Rice',
                extra_dinner: 'Chicken Noodles, Hakka Noodles, Veg Noodles'
            },
            'Wednesday': {
                lunch: 'Kadhi Pakoda, Aloo Jeera, Black Masoor Dal',
                dinner: 'Paneer Lazeez, Sambhar Dal, Jeera Rice',
                extra_lunch: 'Tandoori Chicken, Fish Fry, Paneer Tikka',
                extra_dinner: 'Schezwan Rice, Chicken Roll, Egg Roll, Veg Roll'
            },
            'Thursday': {
                lunch: 'Paneer Kadhi, Mix veg moong Dal, Nimbu Paani',
                dinner: 'Dosa, Sambhar, Karela Sabzi, Chana',
                extra_lunch: 'Mutton Curry, Chicken Curry, Paneer Curry',
                extra_dinner: 'Chicken Fried Rice, Paneer Momo, Egg Biryani'
            },
            'Friday': {
                lunch: 'Chole, Dam Aloo',
                dinner: 'Aloo Shimli, Archar Dal, Tamarind rice',
                extra_lunch: 'Fish Curry, Chicken Biryani, Paneer Do Pyaza',
                extra_dinner: 'Tandoori Chicken, Mutton Biryani, Veg Biryani'
            },
            'Saturday': {
                lunch: 'Aloo Paratha, Chana Sabzi',
                dinner: 'Aloo Soyabean, Masng Dal, Tehri',
                extra_lunch: 'Chicken Fried Rice, Fish Fry, Paneer Bhujiya',
                extra_dinner: 'Hakka Noodles, Egg Roll, Chicken Noodles'
            },
            'Sunday': {
                lunch: 'Aloo Beans, Archar Dal, Veg Fried Rice',
                dinner: 'Paneer Kadhai, Masoor Dal, French fries',
                extra_lunch: 'Mutton Curry, Chicken Curry, Paneer Tikka',
                extra_dinner: 'Chicken Biryani, Schezwan Rice, Egg Biryani'
            }
        };
        
        this.setupEventHandlers();
        this.initDatabase();
    }

    setupEventHandlers() {
        this.client.on('qr', (qr) => {
            console.log('📱 Scan this QR code with your WhatsApp to link your phone:');
            console.log('='.repeat(60));
            qrcode.generate(qr, { small: true });
            console.log('='.repeat(60));
            console.log('👆 Scan this QR with WhatsApp > Linked Devices > Link a Device');
        });

        this.client.on('ready', () => {
            console.log('✅ WhatsApp client is ready!');
            console.log('🤖 WhatsApp Extras Bot - QR Version');
            console.log('='.repeat(50));
            console.log(`🎯 Target group: "${this.targetGroup}"`);
            console.log(`🕐 Lunch cutoff: ${this.lunchCutoff.hour}:${this.lunchCutoff.minute.toString().padStart(2, '0')} AM`);
            console.log(`🕐 Dinner cutoff: ${this.dinnerCutoff.hour}:${this.dinnerCutoff.minute.toString().padStart(2, '0')} AM`);
            console.log('='.repeat(50));
            console.log('✅ Bot is ready to receive messages!');
        });

        this.client.on('message_create', async (message) => {
            try {
                console.log(`📨 Message: "${message.body}"`);
                
                // Skip messages with bot emoji (bot's own responses)
                if (message.body.includes('🔧')) {
                    console.log('⏭️ Skipping bot response');
                    return;
                }

                // Check if it's from target group
                const chat = await message.getChat();
                console.log(`📨 Group: "${chat.name}"`);
                
                if (!chat.isGroup || chat.name !== this.targetGroup) {
                    console.log('⏭️ Wrong group');
                    return;
                }

                console.log(`✅ Processing: "${message.body}"`);
                
                const response = await this.handleMessage(message);
                if (response) {
                    await message.reply(response);
                    console.log('📤 Sent response');
                }
            } catch (error) {
                console.error('❌ Error:', error);
            }
        });

        this.client.on('authenticated', () => {
            console.log('🔐 WhatsApp authentication successful!');
        });

        this.client.on('auth_failure', (msg) => {
            console.error('❌ Authentication failed:', msg);
        });

        this.client.on('disconnected', (reason) => {
            console.log('🔌 WhatsApp client disconnected:', reason);
        });
    }

    initDatabase() {
        const db = new sqlite3.Database(this.dbPath);
        
        db.serialize(() => {
            // Create bookings table
            db.run(`
                CREATE TABLE IF NOT EXISTS bookings (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    name TEXT NOT NULL,
                    roll_number TEXT NOT NULL,
                    room_number TEXT NOT NULL,
                    dish TEXT NOT NULL,
                    meal_type TEXT NOT NULL,
                    booking_date TEXT NOT NULL,
                    booking_time TEXT NOT NULL,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
                )
            `, (err) => {
                if (err) console.error('❌ Error creating bookings table:', err);
            });

            // Create menu_items table
            db.run(`
                CREATE TABLE IF NOT EXISTS menu_items (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    date TEXT NOT NULL,
                    meal_type TEXT NOT NULL,
                    category TEXT NOT NULL,
                    item_name TEXT NOT NULL,
                    price INTEGER NOT NULL,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
                )
            `, (err) => {
                if (err) {
                    console.error('❌ Error creating menu_items table:', err);
                } else {
                    console.log('✅ Database tables created successfully');
                    // Generate initial menu data after table creation
                    setTimeout(() => this.generateMenuData(), 1000);
                }
            });
        });

        db.close();
    }

    generateMenuData() {
        const db = new sqlite3.Database(this.dbPath);
        
        // Check if menu data exists
        db.get("SELECT COUNT(*) as count FROM menu_items", (err, row) => {
            if (err) {
                console.error('❌ Error checking menu data:', err);
                console.log('🔄 Creating menu data anyway...');
                this.createMenuItems();
                db.close();
                return;
            }
            
            if (row.count === 0) {
                console.log('📋 Generating menu data...');
                this.createMenuItems();
            } else {
                console.log(`✅ Menu data loaded (${row.count} items)`);
            }
            db.close();
        });
    }

    createMenuItems() {
        const extrasMenu = {
            breakfast: [
                { name: 'Extra Omlette', price: 15 },
                { name: 'Bread Omlette', price: 20 },
                { name: 'Paneer Paratha', price: 25 },
                { name: 'Aloo Paratha', price: 20 },
                { name: 'Butter Toast', price: 15 },
                { name: 'Corn Flakes', price: 25 },
                { name: 'Poha', price: 20 },
                { name: 'Upma', price: 18 },
                { name: 'Idli Sambhar', price: 25 },
                { name: 'Dosa', price: 30 }
            ],
            lunch: [
                { name: 'Fish Curry', price: 60 },
                { name: 'Chicken Curry', price: 70 },
                { name: 'Mutton Curry', price: 80 },
                { name: 'Egg Curry', price: 35 },
                { name: 'Paneer Curry', price: 50 },
                { name: 'Paneer Bhujiya', price: 45 },
                { name: 'Egg Bhujiya', price: 35 },
                { name: 'Egg Fried Rice', price: 40 },
                { name: 'Veg Fried Rice', price: 35 },
                { name: 'Paneer Fried Rice', price: 45 },
                { name: 'Chicken Fried Rice', price: 55 },
                { name: 'Mixed Veg', price: 30 }
            ],
            dinner: [
                { name: 'Chicken Biryani', price: 85 },
                { name: 'Mutton Biryani', price: 95 },
                { name: 'Egg Biryani', price: 65 },
                { name: 'Veg Biryani', price: 55 },
                { name: 'Chicken Fried Rice', price: 55 },
                { name: 'Schezwan Rice', price: 50 },
                { name: 'Hakka Noodles', price: 45 },
                { name: 'Veg Noodles', price: 40 },
                { name: 'Chicken Noodles', price: 55 },
                { name: 'Tandoori Chicken', price: 80 },
                { name: 'Fish Fry', price: 65 },
                { name: 'Egg Roll', price: 35 }
            ]
        };

        const db = new sqlite3.Database(this.dbPath);
        const stmt = db.prepare(`
            INSERT INTO menu_items (date, meal_type, category, item_name, price)
            VALUES (?, ?, ?, ?, ?)
        `);

        let inserted = 0;
        const today = moment().format('YYYY-MM-DD');
        
        // Add today's menu
        Object.entries(extrasMenu).forEach(([mealType, items]) => {
            items.forEach(item => {
                stmt.run([today, mealType, 'extras', item.name, item.price]);
                inserted++;
            });
        });

        stmt.finalize((err) => {
            if (err) {
                console.error('❌ Error creating menu:', err);
            } else {
                console.log(`✅ Generated ${inserted} menu items for today`);
            }
        });

        db.close();
    }

    getCurrentDayAndTime() {
        const now = new Date();
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const currentDay = days[now.getDay()];
        const currentHour = now.getHours();
        const currentMinute = now.getMinutes();
        const currentTime = currentHour * 100 + currentMinute; // Convert to HHMM format
        
        return {
            day: currentDay,
            time: currentTime,
            hour: currentHour,
            date: now.getDate(),
            month: now.getMonth() + 1,
            year: now.getFullYear()
        };
    }

    checkMultiPersonBooking(messageText) {
        // Look for multiple names pattern (more than 2 proper names)
        const namePattern = /\b[A-Z][a-z]+(\s+[A-Z][a-z]+)*\b/g;
        const rollPattern = /\b(\d{6,12}|2x\d{7,10})\b/g;
        const roomPattern = /\b[A-Z]\d{2,4}\b/gi;
        
        const names = messageText.match(namePattern) || [];
        const rolls = messageText.match(rollPattern) || [];
        const rooms = messageText.match(roomPattern) || [];
        
        // Filter out food names that might match name pattern
        const actualNames = names.filter(name => 
            !this.foodKeywords.some(food => 
                food.toLowerCase().includes(name.toLowerCase()) || 
                name.toLowerCase().includes(food.toLowerCase())
            )
        );
        
        console.log(`👥 Multi-person check: Names:${actualNames.length}, Rolls:${rolls.length}, Rooms:${rooms.length}`);
        
        // Consider it multi-person if there are 2+ names
        if (actualNames.length >= 2) {
            const totalPeople = actualNames.length;
            const missing = [];
            
            if (rolls.length < totalPeople) {
                missing.push(`${totalPeople - rolls.length} roll number(s)`);
            }
            if (rooms.length < totalPeople) {
                missing.push(`${totalPeople - rooms.length} room number(s)`);
            }
            
            if (missing.length > 0) {
                const peopleList = actualNames.join(', ');
                return {
                    isMultiPerson: true,
                    hasErrors: true,
                    errorMessage: `❌ Multiple people booking detected: ${peopleList}\n\nMissing: ${missing.join(' and ')}\n\nFor ${totalPeople} people, provide:\n${totalPeople} names, ${totalPeople} roll numbers, ${totalPeople} room numbers + dish\n\nExample:\nJohn Doe 2x9211420 A123\nJane Smith 2x9211421 B456\nChicken Curry 🔧`
                };
            } else {
                return {
                    isMultiPerson: true,
                    hasErrors: false
                };
            }
        }
        
        return {
            isMultiPerson: false,
            hasErrors: false
        };
    }

    async handleMessage(message) {
        const messageText = message.body;
        const currentInfo = this.getCurrentDayAndTime();
        
        // Regular expressions for different patterns  
        const rollNumberPattern = /\b(\d{6,12}|2x\d{7,10})\b/; // Roll numbers like 241110032 or 2x9211420
        const roomNumberPattern = /\b[A-Z]\d{2,4}\b/i; // Room like B307, A123, etc.
        const namePattern = /\b[A-Z][a-z]+(\s+[A-Z][a-z]+)*\b/; // Name pattern
        
        // Check if message contains booking components
        const hasRollNumber = rollNumberPattern.test(messageText);
        const hasRoomNumber = roomNumberPattern.test(messageText);
        const hasName = namePattern.test(messageText);
        
        // Check for food items (case insensitive)
        const containsFoodItem = this.foodKeywords.some(food => 
            messageText.toLowerCase().includes(food.toLowerCase())
        );
        
        console.log(`🔍 Analysis: Roll:${hasRollNumber}, Room:${hasRoomNumber}, Name:${hasName}, Food:${containsFoodItem}`);
        
        // Check if it's a booking attempt (has food item)
        if (containsFoodItem) {
            // Check for multiple people booking
            const multiPersonCheck = this.checkMultiPersonBooking(messageText);
            if (multiPersonCheck.isMultiPerson) {
                if (multiPersonCheck.hasErrors) {
                    return multiPersonCheck.errorMessage;
                }
                // If multi-person booking is complete, continue processing
            } else {
                // Single person booking - check for missing components
                const missing = [];
                if (!hasRollNumber) missing.push('roll number');
                if (!hasRoomNumber) missing.push('room number');
                
                // If missing critical info, show error
                if (missing.length > 0) {
                    return `❌ Missing ${missing.join(' and ')}\n\nFormat: Name Roll Room Dish\nExample: Angry Bird 2x9211420 X420 Food 🔧`;
                }
            }
        }
        
        // If it looks like a booking message (has all components + food)
        const bookingComponents = [hasRollNumber, hasRoomNumber, hasName].filter(Boolean).length;
        
        if (bookingComponents >= 3 && containsFoodItem) {
            console.log('Booking message detected!');
            
            // Extract information
            const rollNumber = messageText.match(rollNumberPattern)?.[0] || '';
            const roomNumber = messageText.match(roomNumberPattern)?.[0] || '';
            const name = messageText.match(namePattern)?.[0] || 'Student';
            const foodItem = this.foodKeywords.find(food => 
                messageText.toLowerCase().includes(food.toLowerCase())
            ) || 'food item';
            
            console.log(`📝 Extracted - Name: "${name}", Roll: "${rollNumber}", Room: "${roomNumber}", Food: "${foodItem}"`);
            
            let shouldBlock = false;
            let blockMessage = '';
            
            // Determine meal type based on current time
            let mealType = '';
            let timeLimit = '';
            let currentMenu = '';
            let extraMenu = '';
            
            if (currentInfo.time < 1500) { // Before 3 PM = Lunch booking
                mealType = 'Lunch';
                timeLimit = '8:00 AM';
                currentMenu = this.messMenu[currentInfo.day]?.lunch || 'Menu not available';
                extraMenu = this.messMenu[currentInfo.day]?.extra_lunch || 'No extra available';
                
                if (currentInfo.time >= 800) { // After 8 AM
                    shouldBlock = true;
                }
            } else { // After 3 PM = Dinner booking
                mealType = 'Dinner';
                timeLimit = '10:00 AM';
                currentMenu = this.messMenu[currentInfo.day]?.dinner || 'Menu not available';
                extraMenu = this.messMenu[currentInfo.day]?.extra_dinner || 'No extra available';
                
                if (currentInfo.time >= 1000) { // After 10 AM (same day dinner booking)
                    shouldBlock = true;
                }
            }
            
            if (shouldBlock) {
                return `❌ *${mealType} extras booking closed*\n\n${name}, you're too late! ${mealType} booking closed at ${timeLimit}.\n\nYour booking: ${foodItem}\nCurrent time: ${currentInfo.hour}:${String(currentInfo.time % 100).padStart(2, '0')}\n\nNext time book before ${timeLimit} for ${mealType.toLowerCase()} extras. 🔧`;
            } else {
                // Save successful booking to database (no confirmation message)
                await this.saveBooking({
                    name: name,
                    rollNumber: rollNumber,
                    roomNumber: roomNumber,
                    dish: foodItem,
                    mealType: mealType,
                    bookingDate: moment().format('YYYY-MM-DD'),
                    bookingTime: moment().format('HH:mm:ss')
                });
                
                // No confirmation message for successful bookings
                return null;
            }
        }
        
        // Handle simple test
        if (messageText.toLowerCase() === 'test') {
            console.log('Test command detected!');
            return `Working fine.\n\nTime: ${currentInfo.hour}:${String(currentInfo.time % 100).padStart(2, '0')}\nDay: ${currentInfo.day} 🔧`;
        }
        
        // Handle menu queries
        if (messageText.toLowerCase().includes('menu')) {
            console.log('Menu request detected!');
            const todayMenu = this.messMenu[currentInfo.day];
            if (todayMenu) {
                return `*${currentInfo.day} Menu*\n\nLunch:\n${todayMenu.lunch}\n\nDinner:\n${todayMenu.dinner}\n\nExtras available:\nLunch - ${todayMenu.extra_lunch || 'None today'}\nDinner - ${todayMenu.extra_dinner || 'None today'}\n\nLunch extras: book before 8 AM\nDinner extras: book before 10 AM 🔧`;
            }
        }
        
        // Handle help command
        if (messageText.toLowerCase().includes('help')) {
            console.log('Help request detected!');
            return `Hall 4 extras booking\n\nCommands:\n• menu - today's menu\n• help - this message\n\nBooking format:\nName Roll Room Dish\n\nExample:\nShae Das 241110032 A123 Fish Curry\n\nRules:\nLunch extras - book before 8 AM\nDinner extras - book before 10 AM\n\nToday is ${currentInfo.day}, ${currentInfo.date}/${currentInfo.month} 🔧`;
        }

        return null;
    }

    isMenuRequest(messageText) {
        const menuKeywords = ['menu', 'show items', 'list', 'items', 'food'];
        const mealKeywords = ['breakfast', 'lunch', 'dinner'];
        
        return menuKeywords.some(keyword => messageText.includes(keyword)) ||
               mealKeywords.some(keyword => messageText.includes(keyword));
    }

    async handleMenuRequest(messageText) {
        const today = moment().format('YYYY-MM-DD');
        let mealType = this.getCurrentMealType();

        // Check for specific meal requests
        if (messageText.includes('breakfast')) mealType = 'breakfast';
        else if (messageText.includes('lunch')) mealType = 'lunch';
        else if (messageText.includes('dinner')) mealType = 'dinner';

        const menu = await this.getMenuForDate(today, mealType);
        return this.formatMenuResponse(menu, mealType, today);
    }

    parseBookingMessage(messageText) {
        const text = messageText.trim();
        
        // Patterns to match different orders of: Name, Roll, Room, Dish
        const patterns = [
            /^([A-Za-z\s]+)\s+(\d{9,})\s+([A-Za-z]\d+)\s+(.+)$/,        // Name Roll Room Dish
            /^([A-Za-z\s]+)\s+([A-Za-z]\d+)\s+(\d{9,})\s+(.+)$/,        // Name Room Roll Dish
            /^(\d{9,})\s+([A-Za-z\s]+)\s+([A-Za-z]\d+)\s+(.+)$/,        // Roll Name Room Dish
            /^([A-Za-z]\d+)\s+([A-Za-z\s]+)\s+(\d{9,})\s+(.+)$/,        // Room Name Roll Dish
            /^(\d{9,})\s+([A-Za-z]\d+)\s+([A-Za-z\s]+)\s+(.+)$/,        // Roll Room Name Dish
            /^([A-Za-z]\d+)\s+(\d{9,})\s+([A-Za-z\s]+)\s+(.+)$/         // Room Roll Name Dish
        ];

        for (const pattern of patterns) {
            const match = text.match(pattern);
            if (match) {
                const parts = match.slice(1, 5);
                
                let name, rollNumber, roomNumber, dish;
                
                // Identify which part is which based on pattern
                for (const part of parts) {
                    if (/^\d{9,}$/.test(part)) {
                        rollNumber = part;
                    } else if (/^[A-Za-z]\d+$/.test(part)) {
                        roomNumber = part;
                    } else if (/^[A-Za-z\s]+$/.test(part) && !name) {
                        name = part.trim();
                    } else {
                        dish = part.trim();
                    }
                }

                if (name && rollNumber && roomNumber && dish) {
                    return { name, rollNumber, roomNumber, dish };
                }
            }
        }

        // Check for missing information
        const hasName = /[A-Za-z\s]+/.test(text);
        const hasRoll = /\d{9,}/.test(text);
        const hasRoom = /[A-Za-z]\d+/.test(text);
        
        if (hasName || hasRoll || hasRoom) {
            const missing = [];
            if (!hasName) missing.push('Name');
            if (!hasRoll) missing.push('Roll Number');
            if (!hasRoom) missing.push('Room Number');
            
            return { 
                error: 'missing_info', 
                missing: missing,
                provided: text
            };
        }

        return null;
    }

    async handleBooking(bookingData, senderName) {
        if (bookingData.error === 'missing_info') {
            return this.formatMissingInfoResponse(bookingData.missing);
        }

        // Time validation
        const timeCheck = this.validateBookingTime();
        if (!timeCheck.allowed) {
            return timeCheck.message;
        }

        const mealType = timeCheck.mealType;
        const today = moment().format('YYYY-MM-DD');
        const currentTime = moment().format('HH:mm:ss');

        // Save booking to database
        const saved = await this.saveBooking({
            name: bookingData.name,
            rollNumber: bookingData.rollNumber,
            roomNumber: bookingData.roomNumber,
            dish: bookingData.dish,
            mealType: mealType,
            bookingDate: today,
            bookingTime: currentTime
        });

        if (saved) {
            return this.formatBookingConfirmation(bookingData, mealType, today);
        } else {
            return "❌ Sorry, there was an error processing your booking. Please try again.";
        }
    }

    validateBookingTime() {
        const now = moment();
        const currentHour = now.hour();

        // Determine current meal type
        if (currentHour >= 6 && currentHour < 11) {
            return { allowed: true, mealType: 'breakfast' };
        } else if (currentHour >= 11 && currentHour < 17) {
            // Check lunch cutoff
            const lunchCutoffTime = moment().hour(this.lunchCutoff.hour).minute(this.lunchCutoff.minute);
            if (now.isAfter(lunchCutoffTime)) {
                return {
                    allowed: false,
                    message: `❌ Lunch extras booking is closed after ${this.lunchCutoff.hour}:${this.lunchCutoff.minute.toString().padStart(2, '0')} AM.\nCurrent time: ${now.format('h:mm A')}`
                };
            }
            return { allowed: true, mealType: 'lunch' };
        } else {
            // Check dinner cutoff
            const dinnerCutoffTime = moment().hour(this.dinnerCutoff.hour).minute(this.dinnerCutoff.minute);
            if (now.isAfter(dinnerCutoffTime)) {
                return {
                    allowed: false,
                    message: `❌ Dinner extras booking is closed after ${this.dinnerCutoff.hour}:${this.dinnerCutoff.minute.toString().padStart(2, '0')} AM.\nCurrent time: ${now.format('h:mm A')}`
                };
            }
            return { allowed: true, mealType: 'dinner' };
        }
    }

    getCurrentMealType() {
        const hour = moment().hour();
        
        if (hour >= 6 && hour < 11) return 'breakfast';
        else if (hour >= 11 && hour < 17) return 'lunch';
        else return 'dinner';
    }

    async getMenuForDate(date, mealType) {
        return new Promise((resolve, reject) => {
            const db = new sqlite3.Database(this.dbPath);
            
            db.all(`
                SELECT item_name, price 
                FROM menu_items 
                WHERE date = ? AND meal_type = ? AND category = 'extras'
                ORDER BY item_name
            `, [date, mealType], (err, rows) => {
                if (err) {
                    console.error('Database error:', err);
                    reject(err);
                } else {
                    resolve(rows);
                }
                db.close();
            });
        });
    }

    async saveBooking(booking) {
        return new Promise((resolve, reject) => {
            const db = new sqlite3.Database(this.dbPath);
            
            db.run(`
                INSERT INTO bookings (name, roll_number, room_number, dish, meal_type, booking_date, booking_time)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            `, [
                booking.name, booking.rollNumber, booking.roomNumber, 
                booking.dish, booking.mealType, booking.bookingDate, booking.bookingTime
            ], function(err) {
                if (err) {
                    console.error('❌ Error saving booking:', err);
                    resolve(false);
                } else {
                    console.log('✅ Booking saved with ID:', this.lastID);
                    resolve(true);
                }
                db.close();
            });
        });
    }

    formatMenuResponse(menuItems, mealType, date) {
        if (!menuItems || menuItems.length === 0) {
            return `🍽️ No ${mealType} extras menu available for ${moment(date).format('DD MMMM YYYY')}`;
        }

        let response = `🍽️ ${mealType.charAt(0).toUpperCase() + mealType.slice(1)} Extras Menu - ${moment(date).format('DD MMMM YYYY')}\n\n`;
        
        menuItems.forEach(item => {
            response += `• ${item.item_name} - ₹${item.price}\n`;
        });

        response += '\n📝 How to book:\nSend: Name Roll# Room# Dish\nExample: Shae Das 241110032 A123 Fish Curry';
        
        return response;
    }

    formatBookingConfirmation(booking, mealType, date) {
        return `✅ Booking Confirmed!\n\n👤 Name: ${booking.name}\n🎓 Roll: ${booking.rollNumber}\n🏠 Room: ${booking.roomNumber}\n🍽️ Dish: ${booking.dish}\n🕐 Meal: ${mealType.charAt(0).toUpperCase() + mealType.slice(1)}\n📅 Date: ${moment(date).format('DD MMMM YYYY')}`;
    }

    formatMissingInfoResponse(missing) {
        return `❌ Missing information: ${missing.join(', ')}\n\n📝 Please provide in format:\nName Roll# Room# Dish\nExample: Shae Das 241110032 A123 Fish Curry`;
    }

    start() {
        console.log('🚀 Starting WhatsApp Extras Bot - QR Version...');
        this.client.initialize();
    }
}

// Start the bot
const bot = new WhatsAppExtrasBot();
bot.start();

// Handle process termination
process.on('SIGINT', () => {
    console.log('🛑 Stopping bot...');
    process.exit(0);
});

module.exports = WhatsAppExtrasBot;
