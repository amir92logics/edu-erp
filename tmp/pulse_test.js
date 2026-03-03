const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { processWhatsAppQueue } = require('../src/lib/whatsapp-worker');

async function pulse() {
    const schoolId = 'cmm92n50r0000w6wkov4rg9l6';
    console.log(`Pulsing school ${schoolId}...`);
    // Note: we can't easily run this because of @/ imports, but let's try calling the server action directly if possible or just use the logic.
    // Actually, I'll just run the launcher again but I'll make sure to KILL any existing chrome processes first.
}

pulse().catch(console.error);
