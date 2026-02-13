# API Documentation

## Authentication Endpoints

### Register User

```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepassword123"
}
```

**Response (201):**
```json
{
  "message": "Registration successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "email": "user@example.com"
  }
}
```

**Response (409):**
```json
{
  "error": "Email already exists"
}
```

### Login User

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepassword123"
}
```

**Response (200):**
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "email": "user@example.com"
  }
}
```

**Response (401):**
```json
{
  "error": "Invalid email or password"
}
```

### Logout User

```http
POST /api/auth/logout
```

**Response (200):**
```json
{
  "message": "Logout successful"
}
```

---

## Bot Management Endpoints

### Get User's Bot

```http
GET /api/bots
Authorization: Bearer {token}
```

**Response (200):**
```json
{
  "id": "507f1f77bcf86cd799439011",
  "userId": "507f1f77bcf86cd799439012",
  "name": "Customer Support Bot",
  "goal": "Help customers with product questions",
  "systemPrompt": "You are a helpful customer service bot",
  "rules": "Be professional and concise",
  "knowledgeText": "Product information...",
  "isActive": true,
  "phoneNumberId": "1234567890",
  "wabaId": "123456789",
  "createdAt": "2024-02-03T10:00:00Z",
  "updatedAt": "2024-02-03T10:00:00Z"
}
```

**Response (200):** `null` if user has no bot yet

---

### Create Bot

```http
POST /api/bots
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Customer Support Bot",
  "goal": "Help customers with product questions",
  "systemPrompt": "You are a helpful customer service bot",
  "rules": "Be professional and concise",
  "knowledgeText": "Product information here"
}
```

**Response (201):**
```json
{
  "id": "507f1f77bcf86cd799439011",
  "userId": "507f1f77bcf86cd799439012",
  "name": "Customer Support Bot",
  "goal": "Help customers with product questions",
  "systemPrompt": "You are a helpful customer service bot",
  "rules": "Be professional and concise",
  "knowledgeText": "Product information here",
  "isActive": false,
  "phoneNumberId": null,
  "wabaId": null,
  "createdAt": "2024-02-03T10:00:00Z",
  "updatedAt": "2024-02-03T10:00:00Z"
}
```

**Response (400):**
```json
{
  "error": "You already have a bot. Edit your existing bot instead."
}
```

---

### Update Bot

```http
PUT /api/bots/update
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Updated Bot Name",
  "goal": "New goal",
  "systemPrompt": "New system prompt",
  "rules": "New rules",
  "knowledgeText": "Updated knowledge",
  "isActive": true
}
```

**Response (200):**
```json
{
  "id": "507f1f77bcf86cd799439011",
  "userId": "507f1f77bcf86cd799439012",
  "name": "Updated Bot Name",
  "goal": "New goal",
  "systemPrompt": "New system prompt",
  "rules": "New rules",
  "knowledgeText": "Updated knowledge",
  "isActive": true,
  "phoneNumberId": "1234567890",
  "wabaId": "123456789",
  "createdAt": "2024-02-03T10:00:00Z",
  "updatedAt": "2024-02-03T10:00:00Z"
}
```

---

### Connect WhatsApp

```http
POST /api/bots/connect-whatsapp
Authorization: Bearer {token}
Content-Type: application/json

{
  "phoneNumberId": "1234567890",
  "wabaId": "123456789",
  "accessToken": "EAA..."
}
```

**Response (200):**
```json
{
  "message": "WhatsApp account connected successfully",
  "bot": {
    "id": "507f1f77bcf86cd799439011",
    "userId": "507f1f77bcf86cd799439012",
    "name": "Customer Support Bot",
    "goal": "Help customers with product questions",
    "systemPrompt": "You are a helpful customer service bot",
    "rules": "Be professional and concise",
    "knowledgeText": "Product information...",
    "isActive": true,
    "phoneNumberId": "1234567890",
    "wabaId": "123456789",
    "createdAt": "2024-02-03T10:00:00Z",
    "updatedAt": "2024-02-03T10:00:00Z"
  }
}
```

**Response (404):**
```json
{
  "error": "Bot not found. Create a bot first."
}
```

---

## Webhook Endpoints

### Webhook Verification (GET)

Called by Meta during webhook setup to verify ownership.

```http
GET /api/webhooks/whatsapp?hub.mode=subscribe&hub.challenge=CHALLENGE&hub.verify_token=TOKEN
```

**Response (200):**
Returns the challenge value as plain text.

---

### Receive Messages (POST)

Called by Meta when messages arrive.

```http
POST /api/webhooks/whatsapp
X-Hub-Signature-256: sha256=signature
Content-Type: application/json

{
  "object": "whatsapp_business_account",
  "entry": [
    {
      "id": "123",
      "changes": [
        {
          "field": "messages",
          "value": {
            "messaging_product": "whatsapp",
            "metadata": {
              "phone_number_id": "1234567890"
            },
            "messages": [
              {
                "from": "1234567890",
                "id": "wamid.123",
                "timestamp": "1671791486",
                "text": {
                  "body": "Hello!"
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

**Response (200):**
```json
{
  "success": true
}
```

**Response (403):**
```json
{
  "error": "Invalid signature"
}
```

---

## Authentication

All protected endpoints require JWT token in one of two ways:

### Option 1: Cookie (Set automatically on login)
```
Cookie: token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Option 2: Authorization Header
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## Error Responses

### 400 Bad Request
```json
{
  "error": "Missing required fields"
}
```

### 401 Unauthorized
```json
{
  "error": "Unauthorized"
}
```

### 404 Not Found
```json
{
  "error": "Bot not found"
}
```

### 409 Conflict
```json
{
  "error": "Email already exists"
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal server error"
}
```

---

## Rate Limiting

Currently no rate limiting implemented. For production:
- Recommend implementing rate limiting on webhook endpoint
- Limit to 100 requests/minute per IP
- Implement exponential backoff on client side

---

## Pagination

Not yet implemented. For future releases:
- Add pagination to bot conversations
- Add pagination to user history

---

## Webhooks

### Supported Events

#### Messages
Fired when a message arrives from a WhatsApp user.

Event field: `messages`
Message types supported: `text`

#### Message Status
Fired when message delivery status changes.

Event field: `message_status`
Statuses: `sent`, `delivered`, `read`, `failed`

---

## Testing

### Using cURL

```bash
# Register
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Get bot
curl -X GET http://localhost:3000/api/bots \
  -H "Authorization: Bearer TOKEN"

# Create bot
curl -X POST http://localhost:3000/api/bots \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name":"My Bot",
    "goal":"Help customers",
    "systemPrompt":"Be helpful",
    "rules":"Be concise",
    "knowledgeText":""
  }'
```
