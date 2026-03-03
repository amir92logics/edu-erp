const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { sendWhatsAppMessage } = require('../src/lib/whatsapp');

async function testSend() {
    const schoolId = 'cmm92n50r0000w6wkov4rg9l6';
    console.log(`Sending test message for school ${schoolId}...`);
    // Again, @/ imports... but sendWhatsAppMessage is in src/lib/whatsapp.
    // I'll try to run it via npx tsx.
}

testSend().catch(console.error);
