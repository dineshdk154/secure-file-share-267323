# Receiver acceptance flow — TODO

This repository currently contains only a README.md.

To implement “receiver must accept before download” we need application code (backend + optionally frontend). Once the app code exists, implement:

- Persist a `share` record with state: `PENDING` -> `ACCEPTED` (-> `REJECTED` optional)
- On download endpoint, require `share.status === ACCEPTED`
- Add endpoint for receiver acceptance (token-based)
- UI page to accept/reject (optional)

This file exists only to prevent an empty change-set and to track missing implementation requirements.
