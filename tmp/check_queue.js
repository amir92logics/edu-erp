const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkQueue() {
    const stats = await prisma.whatsappQueue.groupBy({
        by: ['status'],
        _count: { id: true }
    });
    console.log('Queue Stats:', JSON.stringify(stats, null, 2));

    const schools = await prisma.school.findMany({
        select: {
            id: true,
            name: true,
            isWhatsAppApproved: true,
            whatsappSentToday: true,
            maxWhatsappPerDay: true
        }
    });
    console.log('Schools:', JSON.stringify(schools, null, 2));

    const failedMessages = await prisma.whatsappQueue.findMany({
        where: { status: 'FAILED' },
        take: 5,
        orderBy: { updatedAt: 'desc' }
    });
    console.log('Recent Failed Messages:', JSON.stringify(failedMessages, null, 2));
}

checkQueue()
    .catch(e => console.error(e))
    .finally(() => prisma.$disconnect());
