import Database from 'better-sqlite3';
import path from 'path';

/**
 * Simple SQLite DB wrapper.
 *
 * This app intentionally uses a single-file SQLite DB to keep the template
 * easy to run in all environments while still providing real persistence.
 */
export class AppDb {
    private readonly db: Database.Database;

    constructor() {
        const dbPath = path.join(process.cwd(), 'data.sqlite');
        this.db = new Database(dbPath);
        this.db.pragma('journal_mode = WAL');
        this.migrate();
    }

    private migrate() {
        // Shares represent "sender shared a file with a receiver".
        // Receiver must accept before download can happen.
        this.db.exec(`
            CREATE TABLE IF NOT EXISTS shares (
                id TEXT PRIMARY KEY,
                file_name TEXT NOT NULL,
                file_content_base64 TEXT NOT NULL,

                receiver_email TEXT NOT NULL,
                status TEXT NOT NULL CHECK(status IN ('PENDING','ACCEPTED','REJECTED')),

                share_token TEXT NOT NULL UNIQUE,
                acceptance_token TEXT NOT NULL UNIQUE,

                created_at_iso TEXT NOT NULL,
                accepted_at_iso TEXT
            );

            CREATE INDEX IF NOT EXISTS idx_shares_share_token ON shares(share_token);
            CREATE INDEX IF NOT EXISTS idx_shares_acceptance_token ON shares(acceptance_token);
        `);
    }

    get connection(): Database.Database {
        return this.db;
    }
}
