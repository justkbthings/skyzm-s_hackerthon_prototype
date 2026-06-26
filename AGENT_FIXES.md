# AGENT_FIXES

- Added backend route aliases for the checklist-oriented community and auth entry points.
- Added payment aliases for send, recurring, history, and request flows.
- Added WhatsApp intent parsing and mock reply handling for balance, send, request, and history prompts.
- Added backend and mobile `.env.example` files.
- Added a Firebase seed script for the five test users and demo records.
- Fixed mobile API base URL fallback to support both Expo and plain env naming.
- Added language persistence using SecureStore.
- Replaced the mobile TypeScript config with a standalone Expo-friendly config and silenced TS 6 deprecation warnings.
- Split the mobile navigation shell into auth and main stacks.
- Polished login, home, request, and community screens with card-based layouts and better spacing.
- Verified the live Expo web preview: login succeeded, home rendered, deposit route opened, and a simulated deposit completed.
- Updated the README with demo credentials and a short investor-facing walkthrough.
