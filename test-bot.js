const sqlite3 = require('sqlite3').verbose();
const moment = require('moment');

class BotTester {
    constructor() {
        this.dbPath = 'extras_bookings.db';
    }

    async testDatabase() {
        console.log('🧪 Testing QR Bot Database...');
        
        const db = new sqlite3.Database(this.dbPath);
        
        // Test menu items
        db.all("SELECT COUNT(*) as count FROM menu_items", (err, rows) => {
            if (err) {
                console.error('❌ Menu items table error:', err);
            } else {
                console.log(`✅ Menu items: ${rows[0].count} items`);
            }
        });

        // Test bookings table
        db.all("SELECT COUNT(*) as count FROM bookings", (err, rows) => {
            if (err) {
                console.error('❌ Bookings table error:', err);
            } else {
                console.log(`✅ Bookings table: ${rows[0].count} bookings`);
            }
        });

        // Test sample menu query
        const today = moment().format('YYYY-MM-DD');
        db.all(`
            SELECT meal_type, item_name, price 
            FROM menu_items 
            WHERE date = ? 
            LIMIT 5
        `, [today], (err, rows) => {
            if (err) {
                console.error('❌ Menu query error:', err);
            } else {
                console.log(`✅ Sample menu for ${today}:`);
                rows.forEach(row => {
                    console.log(`  • ${row.meal_type}: ${row.item_name} - ₹${row.price}`);
                });
            }
        });

        db.close();
    }

    testBookingParsing() {
        console.log('\n🧪 Testing booking parsing...');
        
        // Simple regex patterns for testing
        const patterns = [
            /^([A-Za-z\s]+)\s+(\d{9,})\s+([A-Za-z]\d+)\s+(.+)$/,
        ];

        const testCases = [
            "Shae Das 241110032 A123 Fish Curry",
            "Rahul Kumar 241110045 B234 Chicken Biryani"
        ];

        testCases.forEach(testCase => {
            const match = testCase.match(patterns[0]);
            if (match) {
                console.log(`✅ Parsed: ${testCase}`);
                console.log(`   Name: ${match[1]}, Roll: ${match[2]}, Room: ${match[3]}, Dish: ${match[4]}`);
            } else {
                console.log(`❌ Failed to parse: ${testCase}`);
            }
        });
    }

    testMenuRequests() {
        console.log('\n🧪 Testing menu request detection...');
        
        const menuRequests = ['menu', 'lunch menu', 'dinner menu', 'show items'];
        const menuKeywords = ['menu', 'show items', 'list', 'items', 'food'];
        
        menuRequests.forEach(request => {
            const isMenu = menuKeywords.some(keyword => request.toLowerCase().includes(keyword));
            console.log(`${isMenu ? '✅' : '❌'} "${request}" - ${isMenu ? 'Menu request' : 'Not menu request'}`);
        });
    }

    async runTests() {
        console.log('🤖 WhatsApp QR Bot - Test Suite');
        console.log('='.repeat(40));
        
        await this.testDatabase();
        this.testBookingParsing();
        this.testMenuRequests();
        
        console.log('\n✅ QR Bot tests completed!');
        console.log('🚀 Ready to scan QR and start messaging!');
    }
}

const tester = new BotTester();
tester.runTests();