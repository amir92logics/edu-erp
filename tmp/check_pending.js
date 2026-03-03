const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkQueue() {
    const pending = await prisma.whatsappQueue.findMany({
        where: { status: 'PENDING' },
        include: { school: true }
    });
    console.log('Pending Messages:', JSON.stringify(pending, null, 2));
}

checkQueue()
    .catch(e => console.error(e))
    .finally(() => prisma.$disconnect());
