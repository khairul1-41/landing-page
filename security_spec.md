# Security Specification for LaunchCraft

## 1. Data Invariants
- A Landing Page cannot be created without a valid UID matching the authenticated requester.
- Slugs must be alphanumeric with hyphens, min 2 chars, max 80 chars, strictly non-colliding.
- Advertisements are strictly write-protected and only manageable by Main Admin (`lofimusic492@gmail.com` or `/admins/{uid}`).
- Normal users are prevented from creating or modifying any advertisement or setting document.
- Private user PII is isolated; users cannot read other users' documents.
- Deleted or disabled landing pages cannot be accessed by public visitors.

## 2. The Dirty Dozen Payloads (Blocked by Security Rules)
1. **Self-Promotion to Admin**: Unauthenticated or normal user sends `{ role: 'admin' }` on user creation -> REJECTED.
2. **Ad Injection by User**: Non-admin attempts to POST / PUT to `/advertisements/malicious-ad` -> PERMISSION_DENIED.
3. **Ghost Field Poisoning**: Creating a landing page with unrecognized `isApproved: true` or `isAdmin: true` -> REJECTED.
4. **ID Poisoning Attack**: Passing a 2KB string or path traversal chars in `{pageId}` -> REJECTED by `isValidId`.
5. **Slug Format Spoofing**: Submitting slug `<script>alert(1)</script>` or `../../etc` -> REJECTED by regex pattern check.
6. **Hijacking Page Ownership**: User B sends update to User A's landing page changing `userId` -> REJECTED by immutable ID check.
7. **Cross-Tenant List Scraping**: Non-admin querying all users without UID constraint -> REJECTED.
8. **Negative Price Poisoning**: Submitting a landing page with `price: -500` -> REJECTED by `price >= 0`.
9. **Tampering with Admin Settings**: Normal user mutating `/settings/global` -> REJECTED.
10. **Unauthenticated Public Write**: Unauthenticated client trying to publish a landing page directly -> REJECTED.
11. **Email Spoofing without Verification**: Calling admin methods with unverified token email -> REJECTED.
12. **Blanket PII Extraction**: Client trying to read `/users` root collection -> REJECTED.
