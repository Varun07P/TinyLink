import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

export const pool = new pg.Pool({
    connectionString: process.env.DATABASE_URL,
});

// Initialize DB
const initDb = async () => {
    try {
        await pool.query(`
      CREATE TABLE IF NOT EXISTS links (
        short_code TEXT PRIMARY KEY,
        original_url TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT NOW(),
        last_clicked_at TIMESTAMP,
        click_count INTEGER DEFAULT 0
      );
    `);
        console.log("Database initialized: links table ready.");
    } catch (err) {
        console.error("Error initializing database:", err);
    }
};

initDb();
