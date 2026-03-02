import { db } from "../src/lib/db";
import { processWhatsAppQueue } from "../src/lib/whatsapp-worker";

/**
 * Background Service Launcher
 * Processes pending WhatsApp messages across all schools in batches.
 * Usage: npx tsx scripts/launcher.ts
 */
async function run() {
    console.log("-----------------------------------------");
    console.log("WhatsApp Background Worker Started");
    console.log("Time:", new Date().toISOString());
    console.log("-----------------------------------------");

    while (true) {
        try {
            // 1. Find all schools with PENDING or PROCESSING messages in the queue
            const activeSchools = await db.whatsappQueue.findMany({
                where: {
                    status: { in: ["PENDING", "PROCESSING", "FAILED"] },
                    retryCount: { lt: 3 },
                    scheduledAt: { lte: new Date() }
                },
                distinct: ['schoolId'], // Process each school sequentially in round-robin fashion
                select: { schoolId: true }
            });

            if (activeSchools.length === 0) {
                // Sleep for 30 seconds if nothing to do
                await new Promise(resolve => setTimeout(resolve, 30000));
                continue;
            }

            for (const { schoolId } of activeSchools) {
                console.log(`[Worker] Pulsing queue for school: ${schoolId}`);

                // Process a batch of 5-10 for this school
                const result: any = await processWhatsAppQueue(schoolId, 5);

                if (result.success) {
                    console.log(`[Worker] School ${schoolId}: Processed ${result.processed}, Failed ${result.failed}`);
                } else {
                    console.log(`[Worker] School ${schoolId} skipped: ${result.error}`);
                }

                // Short wait between schools to avoid sudden spikes
                await new Promise(resolve => setTimeout(resolve, 2000));
            }

            // Wait 15 seconds before checking all schools again
            await new Promise(resolve => setTimeout(resolve, 15000));

        } catch (error) {
            console.error("[Worker CRITICAL ERROR]:", error);
            // Sleep 1 minute on error to prevent CPU burnout
            await new Promise(resolve => setTimeout(resolve, 60000));
        }
    }
}

run().catch(console.error);
