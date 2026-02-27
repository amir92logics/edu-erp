import { db } from "@/lib/db";
import { getRequiredSchoolId } from "@/lib/session";
import { startOfMonth, endOfMonth, subMonths } from "date-fns";

export async function getFeeStats() {
    const schoolId = await getRequiredSchoolId();
    const now = new Date();
    const month = now.getMonth() + 1;
    const year = now.getFullYear();

    const collection = await db.transaction.aggregate({
        where: { schoolId, status: "SUCCESS", createdAt: { gte: startOfMonth(now) } },
        _sum: { amount: true }
    });

    const outstanding = await db.fee.aggregate({
        where: { schoolId, status: "PENDING", month, year },
        _sum: { amount: true }
    });

    const pendingCount = await db.fee.count({
        where: { schoolId, status: "PENDING", month, year }
    });

    const paidToday = await db.transaction.aggregate({
        where: {
            schoolId,
            status: "SUCCESS",
            createdAt: { gte: new Date(now.setHours(0, 0, 0, 0)) }
        },
        _sum: { amount: true },
        _count: { id: true }
    });

    return {
        collection: Number(collection._sum.amount) || 0,
        outstanding: Number(outstanding._sum.amount) || 0,
        pendingCount,
        paidTodayAmount: Number(paidToday._sum.amount) || 0,
        paidTodayCount: paidToday._count.id
    };
}
export async function getAdminStats() {
    const schoolId = await getRequiredSchoolId();
    const now = new Date();
    const currentMonthStart = startOfMonth(now);
    const currentMonthEnd = endOfMonth(now);
    const prevMonthStart = startOfMonth(subMonths(now, 1));
    const prevMonthEnd = endOfMonth(subMonths(now, 1));

    // 1. Total Students
    const studentCount = await db.student.count({
        where: { schoolId }
    });

    const prevStudentCount = await db.student.count({
        where: {
            schoolId,
            createdAt: { lt: currentMonthStart }
        }
    });

    const studentGrowth = prevStudentCount === 0 ? 0 : ((studentCount - prevStudentCount) / prevStudentCount) * 100;

    // 2. Monthly Revenue (Paid Fees this month)
    const currentMonthRevenue = await db.transaction.aggregate({
        where: {
            schoolId,
            status: "SUCCESS",
            createdAt: { gte: currentMonthStart, lte: currentMonthEnd }
        },
        _sum: { amount: true }
    });

    const prevMonthRevenue = await db.transaction.aggregate({
        where: {
            schoolId,
            status: "SUCCESS",
            createdAt: { gte: prevMonthStart, lte: prevMonthEnd }
        },
        _sum: { amount: true }
    });

    const revGrowth = Number(prevMonthRevenue._sum.amount) === 0 ? 0
        : ((Number(currentMonthRevenue._sum.amount) - Number(prevMonthRevenue._sum.amount)) / Number(prevMonthRevenue._sum.amount)) * 100;

    // 3. Pending Fees (Count of students with pending fee records for current month)
    const pendingCount = await db.fee.count({
        where: {
            schoolId,
            status: "PENDING",
            month: now.getMonth() + 1,
            year: now.getFullYear()
        }
    });

    // 4. Recent Transactions
    const recentTransactions = await db.transaction.findMany({
        where: { schoolId },
        include: {
            student: {
                select: { name: true, class: { select: { name: true } } }
            }
        },
        orderBy: { createdAt: "desc" },
        take: 5
    });

    return {
        studentCount,
        studentGrowth: studentGrowth.toFixed(1),
        currentMonthRevenue: Number(currentMonthRevenue._sum.amount) || 0,
        revenueGrowth: revGrowth.toFixed(1),
        pendingCount,
        recentTransactions: recentTransactions.map(t => ({
            id: t.id,
            studentName: t.student.name,
            className: t.student.class?.name || "N/A",
            method: t.method,
            amount: Number(t.amount),
            date: t.createdAt.toLocaleDateString(),
            status: t.status
        }))
    };
}
