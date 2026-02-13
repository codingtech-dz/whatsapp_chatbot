import 'dotenv/config';
import { create } from '@open-wa/wa-automate';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-1.5-flash';

if (!GEMINI_API_KEY) {
  console.error('Missing GEMINI_API_KEY in .env');
  process.exit(1);
}

async function generateAIResponse(text) {
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`,
      {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: `You are a helpful WhatsApp assistant.\n\nUser: ${text}`,
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 200,
        },
      }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Gemini error: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
    return reply || 'Sorry, I had trouble generating a response.';
  } catch (err) {
    console.error('AI response error:', err);
    return 'Sorry, I am having trouble right now.';
  }
}

function start(client) {
  console.log('WhatsApp client is ready. Waiting for messages...');

  client.onMessage(async (message) => {
    try {
      if (!message?.body) return;

      const reply = await generateAIResponse(message.body);
      await client.sendText(message.from, reply);
    } catch (err) {
      console.error('Message handling error:', err);
    }
  });
}

create({
  sessionId: 'openwa-bot',
  multiDevice: true,
  headless: true,
  qrTimeout: 0,
  authTimeout: 60,
  sessionDataPath: './sessions',
}).then(start).catch((err) => {
  console.error('Failed to start WhatsApp client:', err);
  process.exit(1);
});
