import { db } from "@/lib/db";
import { getRequiredSchoolId } from "@/lib/session";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const schoolId = await getRequiredSchoolId();

        const session = await db.whatsAppSession.findUnique({
            where: { schoolId }
        });

        if (!session || !session.qrCode) {
            return new NextResponse(
                `<html><body>
                    <h1>No QR Code Found</h1>
                    <p>Status: ${session?.status || 'Unknown'}</p>
                    <p>Try clicking "Link New Session" in the dashboard first.</p>
                </body></html>`,
                { headers: { 'Content-Type': 'text/html' } }
            );
        }

        // Return the QR code as a simple HTML page for easy mobile scanning
        return new NextResponse(
            `<html>
                <head>
                    <title>WhatsApp QR Login</title>
                    <meta name="viewport" content="width=device-width, initial-scale=1">
                    <style>
                        body { font-family: sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; margin: 0; background: #f8fafc; }
                        .card { background: white; padding: 2rem; border-radius: 1.5rem; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1); text-align: center; }
                        img { width: 300px; height: 300px; margin: 1rem 0; }
                        h1 { font-size: 1.25rem; font-weight: 800; color: #0f172a; margin: 0; }
                        p { font-size: 0.875rem; color: #64748b; margin-top: 0.5rem; }
                    </style>
                </head>
                <body>
                    <div class="card">
                        <h1>Scan for WhatsApp Access</h1>
                        <p>Link your device to enable school notifications.</p>
                        <img src="${session.qrCode}" alt="WhatsApp QR" />
                        <p>Status: <strong>${session.status}</strong></p>
                    </div>
                    <script>
                        setTimeout(() => window.location.reload(), 5000); // Auto refresh every 5s
                    </script>
                </body>
            </html>`,
            { headers: { 'Content-Type': 'text/html' } }
        );
    } catch (error) {
        return NextResponse.json({ error: "Unauthorized or Session Expired" }, { status: 401 });
    }
}
