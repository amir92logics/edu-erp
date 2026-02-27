const mariadb = require('mariadb');
require('dotenv').config();

async function check() {
    const connStr = process.env.DATABASE_URL;
    console.log("Checking connection to:", connStr.replace(/:[^@/]+@/, ":****@"));
    try {
        const pool = mariadb.createPool(connStr);
        const conn = await pool.getConnection();
        console.log("SUCCESS: Connected to database!");
        await conn.end();
        await pool.end();
        process.exit(0);
    } catch (err) {
        console.error("FAILURE: Could not connect to database.");
        console.error(err);
        process.exit(1);
    }
}

check();
