import { nanoid } from 'nanoid';
import { ShareRepository, ShareRow } from './share.repository';

export class NotFoundError extends Error {}
export class ForbiddenError extends Error {}
export class ConflictError extends Error {}

export class ShareService {
    private readonly repo: ShareRepository;

    constructor(repo: ShareRepository) {
        this.repo = repo;
    }

    createShare(params: { fileName: string; fileContentBase64: string; receiverEmail: string }): ShareRow {
        const id = nanoid();
        const createdAtIso = new Date().toISOString();

        // shareToken is what receiver uses to download, but only after ACCEPTED.
        const shareToken = nanoid(32);

        // acceptanceToken is what receiver uses to accept.
        const acceptanceToken = nanoid(32);

        return this.repo.createShare({
            id,
            fileName: params.fileName,
            fileContentBase64: params.fileContentBase64,
            receiverEmail: params.receiverEmail,
            shareToken,
            acceptanceToken,
            createdAtIso,
        });
    }

    getAcceptanceInfo(acceptanceToken: string): Pick<ShareRow, 'file_name' | 'receiver_email' | 'status' | 'created_at_iso'> {
        const share = this.repo.getByAcceptanceToken(acceptanceToken);
        if (!share) {
            throw new NotFoundError('Share request not found.');
        }
        return {
            file_name: share.file_name,
            receiver_email: share.receiver_email,
            status: share.status,
            created_at_iso: share.created_at_iso,
        };
    }

    accept(acceptanceToken: string): { shareToken: string } {
        const share = this.repo.getByAcceptanceToken(acceptanceToken);
        if (!share) {
            throw new NotFoundError('Share request not found.');
        }
        if (share.status === 'ACCEPTED') {
            return { shareToken: share.share_token };
        }
        if (share.status !== 'PENDING') {
            throw new ConflictError(`Cannot accept share in status ${share.status}.`);
        }

        const acceptedAtIso = new Date().toISOString();
        const updated = this.repo.acceptShareByAcceptanceToken(acceptanceToken, acceptedAtIso);
        if (!updated) {
            throw new Error('Failed to accept share.');
        }
        return { shareToken: updated.share_token };
    }

    getDownloadByShareToken(shareToken: string): { fileName: string; fileContentBase64: string } {
        const share = this.repo.getByShareToken(shareToken);
        if (!share) {
            throw new NotFoundError('Shared file not found.');
        }
        if (share.status !== 'ACCEPTED') {
            throw new ForbiddenError('This share has not been accepted yet.');
        }
        return { fileName: share.file_name, fileContentBase64: share.file_content_base64 };
    }
}
