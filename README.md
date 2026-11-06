# Flowhy

Flowhy is a mobile-first, installable wellness habit tracker. Check in on gentle daily habits, build consistency over time, and see your flower respond to your recent wellness score. Personalize the accent color and switch to the evening appearance in settings.

## Run locally

```bash
npm install
npm run dev
```

## Build and preview

```bash
npm run build
npm run preview
```

The production site is written to `dist/`. Deploy it to static hosting (such as Vercel, Netlify, or GitHub Pages) to use it as an installable mobile web app. HTTPS is required for installation and offline support outside localhost.

On iPhone/iPad, visit the deployed site in Safari and choose **Share → Add to Home Screen**. On Android, use the browser's **Install app** prompt or menu.

## Wellness score

The flower reflects a seven-day habit-completion score, with a small boost for today's check-ins. It is a motivational visual, not a medical assessment. Habits and preferences are stored locally in the browser; this starter app has no user accounts or cloud sync.
