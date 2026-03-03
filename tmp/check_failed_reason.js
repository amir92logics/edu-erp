const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkFailed() {
    const failed = await prisma.whatsappQueue.findMany({
        where: { status: 'FAILED' },
        orderBy: { updatedAt: 'desc' },
        take: 1
    });
    console.log('Last Failed Message:', JSON.stringify(failed, null, 2));
}

checkFailed()
    .catch(e => console.error(e))
    .finally(() => prisma.$disconnect());
