import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import "dotenv/config";

const prisma = new PrismaClient();

async function main() {
    console.log('--- Starting Seeding Process (MySQL/Railway) ---');

    // 1. Create a Platform Super Admin
    const adminEmail = 'superadmin@edupro.com';
    const adminPassword = 'adminpassword123';
    const hashedAdminPassword = await bcrypt.hash(adminPassword, 10);

    const superAdmin = await prisma.user.upsert({
        where: { email: adminEmail },
        update: {},
        create: {
            email: adminEmail,
            password: hashedAdminPassword,
            name: 'Platform Owner',
            role: 'SUPER_ADMIN',
        },
    });

    console.log(`✅ Super Admin created: ${superAdmin.email}`);
    console.log(`🔑 Password: ${adminPassword}`);

    // 2. Create a Default Trial School for testing
    const school = await prisma.school.upsert({
        where: { slug: 'trial-school' },
        update: {},
        create: {
            name: 'Demo Trial School',
            slug: 'trial-school',
            status: 'TRIAL',
            subscriptionPlan: 'PRO',
            address: '123 Education Lane, Digital City',
            contactEmail: 'demo@trialschool.edu',
            isWhatsAppApproved: true,
            trialEndsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        },
    });

    console.log(`✅ Demo School created: ${school.name} (Slug: ${school.slug})`);

    // 3. Create a School Admin for the Demo School
    const schoolAdminEmail = 'admin@trialschool.edu';
    const schoolAdminPassword = 'schooladmin123';
    const hashedSchoolAdminPassword = await bcrypt.hash(schoolAdminPassword, 10);

    const schoolAdmin = await prisma.user.upsert({
        where: { email: schoolAdminEmail },
        update: {},
        create: {
            email: schoolAdminEmail,
            password: hashedSchoolAdminPassword,
            name: 'Principal John Doe',
            role: 'SCHOOL_ADMIN',
            schoolId: school.id,
        },
    });

    console.log(`✅ School Admin created: ${schoolAdmin.email}`);
    console.log(`🔑 Password: ${schoolAdminPassword}`);

    console.log('--- Seeding Completed Successfully ---');
}

main()
    .catch((e) => {
        console.error('❌ Seeding failed:');
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
