# GridBallr Bug Tracker

## Open

### BUG-001: Google Sign-In Error

- **Status:** IN PROGRESS
- **Reporter:** Beta tester
- **Severity:** High
- **Description:** Google OAuth button throws error. Google Cloud OAuth credentials not yet configured in Supabase.
- **Fix:** Complete Google Cloud OAuth setup and add client ID/secret to Supabase auth providers.

### BUG-002: "Database error saving new user" on Signup

- **Status:** INVESTIGATING
- **Reporter:** Beta tester
- **Severity:** Critical
- **Description:** Email/password signup fails with "Database error saving new user". Likely the `handle_new_user` trigger or profiles table RLS policy issue in Supabase.
- **Repro:** Go to /signup → Enter email + password → Click CREATE_ACCOUNT → Error

---

## Fixed

_(None yet)_

---

## Notes

- Report bugs to the team or add them directly here
- Severity: Critical (blocks usage), High (major feature broken), Medium (workaround exists), Low (cosmetic)
- All fixes get patch notes in CHANGELOG.md
