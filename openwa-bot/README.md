# OpenWA WhatsApp Bot (AI Replies)

This is a standalone Node.js bot that connects to WhatsApp Web using `@open-wa/wa-automate`, listens for incoming messages, sends them to an AI function, and replies back.

## Features
- QR code login in the terminal
- Persistent session (no re-scan after restart)
- Message listener and auto-replies
- OpenAI API integration
- Simple `.env` config

## Setup

1. Install dependencies:
```bash
cd openwa-bot
npm install
```

2. Create `.env` from the example:
```bash
cp .env.example .env
```

3. Set your Gemini API key in `.env`:
```
GEMINI_API_KEY="your_key"
GEMINI_MODEL="gemini-1.5-flash"
```

## Run

```bash
npm start
```

On first run, a QR code will appear in the terminal. Scan it with WhatsApp to connect.

## Files
- `src/index.js` main bot logic
- `.env.example` environment template
- `sessions/` auto-created session storage

## Notes
- Keep the bot running to receive messages.
- Session data is stored in `sessions/` so you won't need to scan again.
