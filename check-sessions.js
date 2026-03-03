const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

(async () => {
    try {
        const sessions = await prisma.whatsAppSession.findMany();
        console.log("WhatsApp Sessions in DB:");
        console.log(JSON.stringify(sessions, null, 2));
    } catch (err) {
        console.error("Error fetching sessions:", err);
    } finally {
        await prisma.$disconnect();
    }
})();
