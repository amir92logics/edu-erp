import { PrismaClient } from "@prisma/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import * as mariadb from "mariadb";

declare global {
    var prisma: PrismaClient | undefined;
}

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
    throw new Error("DATABASE_URL is not defined in environment variables.");
}

console.log("Initializing Prisma with MariaDB adapter...");
console.log("Connection String:", connectionString.replace(/:[^@/]+@/, ":****@")); // Mask password

const adapter = new PrismaMariaDb(connectionString);
console.log("Adapter created successfully");

export const db = global.prisma || new PrismaClient({
    adapter,
    log: ['query', 'error', 'warn']
});

if (process.env.NODE_ENV !== "production") global.prisma = db;
console.log("Prisma Client exported");
