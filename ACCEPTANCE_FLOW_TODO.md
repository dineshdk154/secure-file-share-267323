# Receiver acceptance flow — implemented

This repository now implements an end-to-end **acceptance-based transfer flow**:

- Sender creates a **share request** → share status starts as `PENDING`
- Receiver opens acceptance link and clicks **Accept** → status becomes `ACCEPTED`
- Download endpoint enforces: **only `ACCEPTED` shares can be downloaded**
  - If `PENDING`, backend returns **403**

## Where the feature lives (isolated feature structure)

### Backend
- `backend/src/features/acceptance/share.repository.ts`
- `backend/src/features/acceptance/share.service.ts`
- `backend/src/features/acceptance/share.routes.ts`

### Frontend
- `frontend/src/app/features/acceptance/acceptance.api.ts`
- `frontend/src/app/features/acceptance/sender-create-share.page.ts`
- `frontend/src/app/features/acceptance/receiver-accept.page.ts`

## How to run (dev)

1. Install deps:
   - `npm install` from `secure-file-share-267323/`

2. Start:
   - `npm run dev`

3. Flow:
   - Open `http://localhost:4200/`
   - Create a share request → copy the generated receiver acceptance link
   - Open the link → Accept → Download
