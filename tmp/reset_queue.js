const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function resetQueue() {
    console.log('--- Resetting WhatsApp Queue ---');
    const updated = await prisma.whatsappQueue.updateMany({
        where: { status: { in: ['PENDING', 'FAILED', 'PROCESSING'] } },
        data: {
            status: 'PENDING',
            scheduledAt: new Date(),
            retryCount: 0,
            errorMessage: null
        }
    });
    console.log(`Updated ${updated.count} messages to PENDING.`);
}

resetQueue()
    .catch(e => console.error(e))
    .finally(() => prisma.$disconnect());
