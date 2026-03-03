const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkSessions() {
    const sessions = await prisma.whatsAppSession.findMany({
        select: {
            schoolId: true,
            status: true,
            school: { select: { name: true } }
        }
    });
    console.log('Sessions:', JSON.stringify(sessions, null, 2));
}

checkSessions()
    .catch(e => console.error(e))
    .finally(() => prisma.$disconnect());
