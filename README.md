# TRU - Job Tracker for Tradies

A premium job tracking app built with React, TypeScript, and Capacitor. Track jobs, expenses, and budgets with AI-powered receipt scanning.

## Features

- Job management with budget tracking
- Real-time expense monitoring
- AI-powered receipt scanning (powered by Google Gemini)
- Photo attachment for receipts
- Export job summaries
- Offline-first with local storage
- iOS and Android support via Capacitor

## Setup

**Prerequisites:** Node.js 16+

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up Google Gemini API key:
   - Get your free API key from [Google AI Studio](https://makersuite.google.com/app/apikey)
   - Add it to `.env`:
     ```
     VITE_GEMINI_API_KEY=your_actual_api_key_here
     ```

3. Run the development server:
   ```bash
   npm run dev
   ```

## AI Receipt Scanning

The app includes AI-powered receipt scanning that automatically extracts items and prices from photos:

1. Open any job
2. Click the "Scan" button (purple gradient)
3. Take a photo of your receipt
4. The AI will automatically extract all items and add them as expenses

**Free Tier Limits:** Google Gemini offers 1,500 requests per day for free.

## Building for Mobile

**iOS:**
```bash
npm run build
npx cap sync ios
npx cap open ios
```

**Android:**
```bash
npm run build
npx cap sync android
npx cap open android
```

## Tech Stack

- React 19 + TypeScript
- Vite
- Tailwind CSS v4
- Capacitor (iOS/Android)
- Google Gemini API (AI vision)

## License

MIT
