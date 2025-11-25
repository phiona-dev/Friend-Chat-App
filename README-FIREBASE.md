Firebase Hosting — quick deploy guide

1) Install Firebase CLI (recommended globally):

```bash
npm install -g firebase-tools
```

2) Login to Firebase (interactive):

```bash
firebase login
```

3) Create a Firebase project in the Firebase Console (https://console.firebase.google.com/) and note the project ID.

4) Configure the local repo to use that project ID (replace the placeholder in `.firebaserc` or run):

```bash
firebase use --add
```

5) Build and deploy from the `frontend` folder (script added):

```bash
cd frontend
npm install
npm run deploy:firebase
```

Notes:
- The `deploy:firebase` script runs `npm run build` then `firebase deploy --only hosting`.
- `firebase.json` expects the built site to be in `frontend/build` and contains a rewrite so the app works as an SPA.
- If you prefer the interactive setup, run `firebase init hosting` in the repo root and follow prompts (choose the existing project and set public directory to `frontend/build`).
