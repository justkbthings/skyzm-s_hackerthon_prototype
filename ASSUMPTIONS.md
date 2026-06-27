# ASSUMPTIONS

- The backend will run in Firebase mode only when `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, and `FIREBASE_PRIVATE_KEY` are present.
- The seed script seeds Firestore and optional Firebase Auth, but it does not fabricate cloud credentials.
- WhatsApp webhook replies are mocked in development by logging or using the existing send helper when credentials are present.
- The current mobile app keeps its existing navigation shape for now; the first pass focuses on stable compilation and high-value demo wiring.
- The product name used in docs is THUMELA.
