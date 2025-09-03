const WhatsAppExtrasBot = require('./bot');

// Create bot instance for testing
const bot = new WhatsAppExtrasBot();

async function testMultiPersonBooking() {
    console.log('🧪 Testing Multi-Person Booking Detection\n');
    
    const testCases = [
        {
            name: 'Single Person - Complete',
            message: 'John Doe 2x9211420 A123 Fish Curry'
        },
        {
            name: 'Single Person - Missing Roll',
            message: 'John Doe A123 Fish Curry'
        },
        {
            name: 'Two People - Complete',
            message: 'John Doe 2x9211420 A123 Jane Smith 2x9211421 B456 Fish Curry'
        },
        {
            name: 'Two People - Missing One Roll',
            message: 'John Doe 2x9211420 A123 Jane Smith B456 Fish Curry'
        },
        {
            name: 'Three People - Missing Two Rooms',
            message: 'John Doe 2x9211420 Jane Smith 2x9211421 Bob Wilson 2x9211422 A123 Fish Curry'
        },
        {
            name: 'Four People - All Missing Rolls',
            message: 'John Doe A123 Jane Smith B456 Bob Wilson C789 Alice Brown D101 Chicken Biryani'
        },
        {
            name: 'Four People - Complete Info',
            message: 'John Doe 2x9211420 A123 Jane Smith 2x9211421 B456 Bob Wilson 2x9211422 C789 Alice Brown 2x9211423 D101 Chicken Biryani'
        }
    ];
    
    for (const testCase of testCases) {
        console.log(`📝 Testing: ${testCase.name}`);
        console.log(`Input: "${testCase.message}"`);
        
        try {
            const mockMessage = { body: testCase.message };
            const response = await bot.handleMessage(mockMessage);
            
            if (response) {
                console.log(`✅ Response:\n${response}\n`);
            } else {
                console.log(`✅ No response (valid booking)\n`);
            }
        } catch (error) {
            console.log(`❌ Error: ${error.message}\n`);
        }
        
        console.log('-'.repeat(60));
    }
    
    console.log('🎉 Multi-person booking tests completed!');
}

testMultiPersonBooking();