# Secure File Share (Acceptance-Based Transfers)

This project implements an **acceptance-based transfer flow**: a receiver must explicitly accept a share request before they can download the file.

## What’s implemented

- Sender creates a share request (`PENDING`)
- Receiver accepts (`ACCEPTED`)
- Download endpoint blocks access until accepted (403 while `PENDING`)
- Minimal Angular UI for sender + receiver
- Express + SQLite persistence (single-file DB)

## Run locally

From `secure-file-share-267323/`:

```bash
npm install
npm run dev
```

- Frontend: http://localhost:4200
- Backend: http://localhost:3000 (proxied via Angular to `/api`)

## Notes

- For demo simplicity, files are stored as base64 in SQLite.
- In a real implementation, the backend would email the receiver acceptance link.
- Configure env vars via `.env` (see `.env.example`).
