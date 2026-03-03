const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
// Mocking the required imports to run the worker logic
// We'll just use the logic from whatsapp-worker.ts directly here for testing
const { processWhatsAppQueue } = require('../src/lib/whatsapp-worker');

async function testWorker() {
    const schoolId = 'cmm92n50r0000w6wkov4rg9l6'; // test school
    console.log(`Processing queue for school ${schoolId}...`);
    try {
        const result = await processWhatsAppQueue(schoolId, 1);
        console.log('Result:', JSON.stringify(result, null, 2));
    } catch (e) {
        console.error('Error during processing:', e);
    }
}

// We need to handle the environment if we are running this in a separate process
// But let's see if it works as is.
// Actually, it uses @/ prefixed imports which node doesn't understand.

testWorker()
    .catch(e => console.error(e))
    .finally(() => prisma.$disconnect());
