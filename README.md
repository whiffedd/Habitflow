# Habitflow

A mobile-first, installable habit tracker built with React and Vite. Track daily habits, see your streaks, and customize the accent color and dark appearance. Habit data and preferences are saved locally in your browser.

## Run locally

```bash
npm install
npm run dev
```

## Build for publishing

```bash
npm run build
npm run preview
```

The production site is written to `dist/`. Deploy it to any static hosting provider (for example, GitHub Pages, Netlify, or Vercel). The app includes a web app manifest and service worker so it can be installed from a supported mobile browser. HTTPS is required for installation and offline support outside localhost.

On iPhone/iPad, open the deployed site in Safari and use **Share → Add to Home Screen**. On Android, use the browser's **Install app** prompt/menu.

## Data and privacy

Habits, completion history, and appearance settings stay in that browser's local storage. There is no account or cloud synchronization in this starter app. Clearing browser data removes the saved habits.
