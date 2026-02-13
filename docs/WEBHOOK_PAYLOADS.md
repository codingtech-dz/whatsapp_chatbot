# WhatsApp Webhook Payload Examples

## Message Received Webhook

### Sample Payload

```json
{
  "object": "whatsapp_business_account",
  "entry": [
    {
      "id": "215360707XXXXX",
      "changes": [
        {
          "field": "messages",
          "value": {
            "messaging_product": "whatsapp",
            "metadata": {
              "display_phone_number": "1234567890",
              "phone_number_id": "123456789012345"
            },
            "messages": [
              {
                "from": "1234567890",
                "id": "wamid.HBEUGVFDkgQ_AgHqW_Jz3p7pwAQ",
                "timestamp": "1671791486",
                "text": {
                  "body": "Hello, how can I help you?"
                },
                "type": "text"
              }
            ]
          }
        }
      ]
    }
  ]
}
```

### Key Fields

| Field | Description |
|-------|-------------|
| `object` | Always "whatsapp_business_account" |
| `entry[].changes[].value.metadata.phone_number_id` | Your phone number ID (used to identify bot) |
| `entry[].changes[].value.messages[].from` | Sender's phone number (without +) |
| `entry[].changes[].value.messages[].text.body` | Message text |
| `entry[].changes[].value.messages[].type` | Message type (text, image, etc.) |
| `entry[].changes[].value.messages[].timestamp` | Unix timestamp |

## Status Update Webhook

```json
{
  "object": "whatsapp_business_account",
  "entry": [
    {
      "id": "215360707XXXXX",
      "changes": [
        {
          "field": "message_status",
          "value": {
            "messaging_product": "whatsapp",
            "metadata": {
              "display_phone_number": "1234567890",
              "phone_number_id": "123456789012345"
            },
            "statuses": [
              {
                "id": "wamid.HBEUGVFDkgQ_AgHqW_Jz3p7pwAQ",
                "recipient_id": "1234567890",
                "status": "delivered",
                "timestamp": "1671791486"
              }
            ]
          }
        }
      ]
    }
  ]
}
```

## Webhook Verification (GET Request)

When you set up your webhook in Meta App, Meta will send a GET request:

```
GET /api/webhooks/whatsapp?hub.mode=subscribe&hub.challenge=CHALLENGE_TOKEN&hub.verify_token=YOUR_TOKEN
```

Your endpoint should return the `hub.challenge` value to verify ownership.

## Testing with cURL

### Verify Webhook

```bash
curl -X GET "http://localhost:3000/api/webhooks/whatsapp?hub.mode=subscribe&hub.challenge=test_challenge&hub.verify_token=your_token"
```

### Send Test Message

```bash
curl -X POST http://localhost:3000/api/webhooks/whatsapp \
  -H "Content-Type: application/json" \
  -H "X-Hub-Signature-256: sha256=your_signature" \
  -d '{
    "object": "whatsapp_business_account",
    "entry": [{
      "id": "123",
      "changes": [{
        "field": "messages",
        "value": {
          "messaging_product": "whatsapp",
          "metadata": {
            "phone_number_id": "123456789012345"
          },
          "messages": [{
            "from": "1234567890",
            "id": "wamid.test",
            "timestamp": "1671791486",
            "text": {"body": "Hello!"},
            "type": "text"
          }]
        }
      }]
    }]
  }'
```

## Message Type Support

Current implementation supports:
- ✅ `text` - Text messages

Can be extended to support:
- 📷 `image` - Image messages
- 📄 `document` - File/document messages
- 🎵 `audio` - Audio messages
- ✓️ `reaction` - Message reactions
