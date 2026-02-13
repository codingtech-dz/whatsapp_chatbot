import axios from 'axios';
import crypto from 'crypto';

const WHATSAPP_API_VERSION = 'v18.0';
const WHATSAPP_BUSINESS_ACCOUNT_ID = process.env.WHATSAPP_BUSINESS_ACCOUNT_ID;
const WHATSAPP_API_TOKEN = process.env.WHATSAPP_API_TOKEN;
const WEBHOOK_VERIFY_TOKEN = process.env.WEBHOOK_VERIFY_TOKEN || 'whatsapp_webhook_token';

export interface WhatsAppMessage {
  from: string;
  id: string;
  text: {
    body: string;
  };
}

export interface WhatsAppWebhookEvent {
  entry: Array<{
    changes: Array<{
      value: {
        messages?: WhatsAppMessage[];
        metadata?: {
          phone_number_id: string;
        };
      };
    }>;
  }>;
}

export function verifyWebhookSignature(
  body: string,
  signature: string | null
): boolean {
  if (!signature) return false;

  const hash = crypto
    .createHmac('sha256', process.env.WHATSAPP_WEBHOOK_SECRET || 'webhook_secret')
    .update(body)
    .digest('hex');

  return `sha256=${hash}` === signature;
}

export async function sendWhatsAppMessage(
  phoneNumberId: string,
  to: string,
  message: string,
  accessToken: string
): Promise<void> {
  if (!accessToken) {
    throw new Error('Access token is required');
  }

  try {
    await axios.post(
      `https://graph.instagram.com/${WHATSAPP_API_VERSION}/${phoneNumberId}/messages`,
      {
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: to.replace(/\D/g, ''),
        type: 'text',
        text: {
          body: message,
        },
      },
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error('Failed to send WhatsApp message:', error);
    throw error;
  }
}

export function parseWhatsAppWebhook(body: WhatsAppWebhookEvent) {
  const messages: Array<{
    phoneNumberId: string;
    from: string;
    text: string;
  }> = [];

  body.entry?.forEach((entry) => {
    entry.changes?.forEach((change) => {
      const { messages: msgs, metadata } = change.value;
      if (msgs && metadata) {
        msgs.forEach((msg) => {
          messages.push({
            phoneNumberId: metadata.phone_number_id,
            from: msg.from,
            text: msg.text.body,
          });
        });
      }
    });
  });

  return messages;
}

export { WEBHOOK_VERIFY_TOKEN };
