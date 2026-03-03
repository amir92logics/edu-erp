const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fixAndPulse() {
    console.log('--- Approving WhatsApp for all schools ---');
    const updated = await prisma.school.updateMany({
        where: { isWhatsAppApproved: false },
        data: { isWhatsAppApproved: true }
    });
    console.log(`Updated ${updated.count} schools.`);

    const pending = await prisma.whatsappQueue.count({ where: { status: 'PENDING' } });
    console.log(`Total Pending Messages: ${pending}`);
}

fixAndPulse()
    .catch(e => console.error(e))
    .finally(() => prisma.$disconnect());
