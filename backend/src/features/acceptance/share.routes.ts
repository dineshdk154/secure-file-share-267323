import express from 'express';
import { ShareService, ForbiddenError, NotFoundError, ConflictError } from './share.service';

/**
 * Registers acceptance-based file share routes.
 *
 * API surface:
 * - POST   /api/shares                 create a share request (PENDING)
 * - GET    /api/shares/accept/:token   fetch metadata to show receiver "accept" UI
 * - POST   /api/shares/accept/:token   receiver accepts, returns shareToken
 * - GET    /api/shares/download/:token download file ONLY if ACCEPTED
 */
export function createShareRouter(service: ShareService): express.Router {
    const router = express.Router();

    router.post(
        '/shares',
        (req, res) => {
            const { fileName, fileContentBase64, receiverEmail } = req.body ?? {};
            if (typeof fileName !== 'string' || fileName.length < 1) {
                return res.status(400).json({ error: 'fileName is required.' });
            }
            if (typeof fileContentBase64 !== 'string' || fileContentBase64.length < 1) {
                return res.status(400).json({ error: 'fileContentBase64 is required.' });
            }
            if (typeof receiverEmail !== 'string' || receiverEmail.length < 3) {
                return res.status(400).json({ error: 'receiverEmail is required.' });
            }

            const share = service.createShare({ fileName, fileContentBase64, receiverEmail });

            // NOTE: In a real system you would email the receiver acceptance link.
            res.status(201).json({
                id: share.id,
                status: share.status,
                receiverEmail: share.receiver_email,
                createdAtIso: share.created_at_iso,
                acceptanceToken: share.acceptance_token,
                shareToken: share.share_token, // sender can see it, but download still blocked until accepted
            });
        }
    );

    router.get(
        '/shares/accept/:acceptanceToken',
        (req, res) => {
            try {
                const info = service.getAcceptanceInfo(req.params.acceptanceToken);
                res.json(info);
            } catch (e) {
                if (e instanceof NotFoundError) {
                    return res.status(404).json({ error: e.message });
                }
                return res.status(500).json({ error: 'Internal error.' });
            }
        }
    );

    router.post(
        '/shares/accept/:acceptanceToken',
        (req, res) => {
            try {
                const result = service.accept(req.params.acceptanceToken);
                res.json(result);
            } catch (e) {
                if (e instanceof NotFoundError) {
                    return res.status(404).json({ error: e.message });
                }
                if (e instanceof ConflictError) {
                    return res.status(409).json({ error: e.message });
                }
                return res.status(500).json({ error: 'Internal error.' });
            }
        }
    );

    router.get(
        '/shares/download/:shareToken',
        (req, res) => {
            try {
                const dl = service.getDownloadByShareToken(req.params.shareToken);

                const fileBytes = Buffer.from(dl.fileContentBase64, 'base64');
                res.setHeader('Content-Disposition', `attachment; filename="${dl.fileName}"`);
                res.setHeader('Content-Type', 'application/octet-stream');
                res.status(200).send(fileBytes);
            } catch (e) {
                if (e instanceof NotFoundError) {
                    return res.status(404).json({ error: e.message });
                }
                if (e instanceof ForbiddenError) {
                    return res.status(403).json({ error: e.message });
                }
                return res.status(500).json({ error: 'Internal error.' });
            }
        }
    );

    return router;
}
