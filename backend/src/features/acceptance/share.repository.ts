import { AppDb } from '../../db';

export type ShareStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED';

export interface ShareRow {
    id: string;
    file_name: string;
    file_content_base64: string;
    receiver_email: string;
    status: ShareStatus;
    share_token: string;
    acceptance_token: string;
    created_at_iso: string;
    accepted_at_iso: string | null;
}

export class ShareRepository {
    private readonly db: AppDb;

    constructor(db: AppDb) {
        this.db = db;
    }

    createShare(params: {
        id: string;
        fileName: string;
        fileContentBase64: string;
        receiverEmail: string;
        shareToken: string;
        acceptanceToken: string;
        createdAtIso: string;
    }): ShareRow {
        const stmt = this.db.connection.prepare(`
            INSERT INTO shares (
                id, file_name, file_content_base64, receiver_email,
                status, share_token, acceptance_token, created_at_iso, accepted_at_iso
            )
            VALUES (
                @id, @fileName, @fileContentBase64, @receiverEmail,
                'PENDING', @shareToken, @acceptanceToken, @createdAtIso, NULL
            )
        `);

        stmt.run(params);

        const created = this.getByShareToken(params.shareToken);
        if (!created) {
            throw new Error('Failed to create share.');
        }
        return created;
    }

    getByAcceptanceToken(acceptanceToken: string): ShareRow | null {
        const stmt = this.db.connection.prepare<ShareRow>(`
            SELECT * FROM shares WHERE acceptance_token = ?
        `);
        return (stmt.get(acceptanceToken) as ShareRow | undefined) ?? null;
    }

    getByShareToken(shareToken: string): ShareRow | null {
        const stmt = this.db.connection.prepare<ShareRow>(`
            SELECT * FROM shares WHERE share_token = ?
        `);
        return (stmt.get(shareToken) as ShareRow | undefined) ?? null;
    }

    acceptShareByAcceptanceToken(acceptanceToken: string, acceptedAtIso: string): ShareRow | null {
        const update = this.db.connection.prepare(`
            UPDATE shares
            SET status = 'ACCEPTED', accepted_at_iso = ?
            WHERE acceptance_token = ? AND status = 'PENDING'
        `);
        update.run(acceptedAtIso, acceptanceToken);

        return this.getByAcceptanceToken(acceptanceToken);
    }
}
