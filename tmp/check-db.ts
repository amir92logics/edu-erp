
import { PrismaClient } from '@prisma/client';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import "dotenv/config";

async function checkUser() {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) throw new Error("DATABASE_URL not set");

    const adapter = new PrismaMariaDb(connectionString);
    const prisma = new PrismaClient({ adapter });

    try {
        const users = await prisma.user.findMany();
        console.log("Found users:", users.length);
        users.forEach(u => {
            console.log(`- Email: ${u.email}, Role: ${u.role}`);
        });

        const superAdmin = await prisma.user.findUnique({
            where: { email: 'superadmin@edupro.com' }
        });

        if (superAdmin) {
            console.log("✅ Super Admin found!");
        } else {
            console.log("❌ Super Admin NOT found!");
        }
    } catch (e) {
        console.error("Database check failed:", e);
    } finally {
        await prisma.$disconnect();
    }
}

checkUser();
