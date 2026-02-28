
const mysql = require('mysql2/promise');

async function test() {
    console.log("Connecting to Railway MySQL...");
    try {
        const connection = await mysql.createConnection("mysql://root:fnEwgIgaVrHFAkkHopZoUfwsRfKHqqpL@turntable.proxy.rlwy.net:19709/railway");
        console.log("Connected successfully!");
        const [rows] = await connection.execute('SELECT 1 + 1 AS solution');
        console.log("Query success:", rows[0].solution === 2);
        await connection.end();
    } catch (err) {
        console.error("Connection failed:", err.message);
    }
}

test();
