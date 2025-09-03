const WhatsAppExtrasBot = require('./bot');

// Create bot instance for testing
const bot = new WhatsAppExtrasBot();

// Mock message object
function createMockMessage(body, from = '919876543210@c.us', author = 'Test User') {
    return {
        body: body,
        from: from,
        author: author
    };
}

async function testMessages() {
    console.log('🧪 Testing Updated Bot Messages\n');
    
    const testCases = [
        {
            name: 'Valid Booking (should be silent)',
            message: 'Shae Das 241110032 A123 Fish Curry'
        },
        {
            name: 'Missing Roll Number',
            message: 'John Doe A123 Fish Curry'
        },
        {
            name: 'Missing Room Number', 
            message: 'Jane Smith 241110045 Chicken Biryani'
        },
        {
            name: 'Missing Both Roll and Room',
            message: 'Bob Johnson Fish Fry'
        },
        {
            name: 'Menu Request',
            message: 'menu'
        },
        {
            name: 'Help Request',
            message: 'help'
        },
        {
            name: 'Test Command',
            message: 'test'
        },
        {
            name: 'Non-booking Message',
            message: 'Hello how are you?'
        }
    ];
    
    for (const testCase of testCases) {
        console.log(`📝 Testing: ${testCase.name}`);
        console.log(`Input: "${testCase.message}"`);
        
        try {
            const mockMessage = createMockMessage(testCase.message);
            const response = await bot.handleMessage(mockMessage);
            
            if (response) {
                console.log(`✅ Response:\n${response}\n`);
            } else {
                console.log(`✅ No response (silent booking)\n`);
            }
        } catch (error) {
            console.log(`❌ Error: ${error.message}\n`);
        }
        
        console.log('-'.repeat(50));
    }
    
    console.log('🎉 Message testing completed!');
}

// Run tests
testMessages();