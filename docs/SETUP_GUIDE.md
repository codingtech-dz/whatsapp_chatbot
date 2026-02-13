# Complete Setup Guide

## Prerequisites

Before you start, you need:

1. **Node.js 18+** - Download from [nodejs.org](https://nodejs.org)
2. **MongoDB Database** - Create free cluster at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
3. **OpenAI API Key** - Get from [OpenAI Platform](https://platform.openai.com/api-keys)
4. **Meta Business Account** - Create at [Meta Business Suite](https://business.facebook.com)
5. **WhatsApp Business Access** - Apply at [Meta for Business](https://www.facebook.com/business)

## Step 1: Database Setup (MongoDB Atlas)

### Create MongoDB Cluster

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Sign up or log in
3. Create a new project
4. Click "Build a Database" → Select "Free" tier
5. Choose AWS, N. Virginia region
6. Click "Create"
7. Set username and password
8. Add your IP address to Network Access (or 0.0.0.0/0 for development)
9. Click "Connect"
10. Choose "Drivers" → "Node.js"
11. Copy the connection string

### Connection String Format

```
mongodb+srv://username:password@cluster.mongodb.net/whatsapp_saas?retryWrites=true&w=majority
```

## Step 2: OpenAI Setup

### Get API Key

1. Go to [OpenAI Platform](https://platform.openai.com)
2. Sign up or log in
3. Click your profile → "API Keys"
4. Click "Create new secret key"
5. Copy and save securely (you won't see it again)

### Check Credits

- Free tier: $5 in credits (expires after 3 months)
- Go to "Billing" → "Overview" to check usage
- Add payment method for production

## Step 3: Meta/WhatsApp Setup

### Create Meta App

1. Go to [Meta Developers](https://developers.facebook.com)
2. Click "My Apps" → "Create App"
3. Choose "Business" as app type
4. Enter app name, email, and phone
5. Click "Create App"

### Add WhatsApp Product

1. In your app, click "Add Product"
2. Find "WhatsApp" and click "Set Up"
3. Follow the setup wizard

### Get Phone Number ID and WABA ID

1. Navigate to "WhatsApp" → "Getting Started"
2. You'll see "Phone Number ID" and "WABA ID"
3. Save these values

### Create System User & Token

1. Go to [Business Settings](https://business.facebook.com/settings)
2. Select your business account
3. Go to "Users" → "System Users"
4. Click "Create System User"
5. Enter name, choose "Admin" role
6. Click "Create System User"
7. Click on the user you just created
8. Click "Generate Token"
9. Select your app
10. Select scopes: `whatsapp_business_messaging`
11. Click "Generate Token"
12. Copy and save the token securely

### Get App ID and Secret

1. Go back to your app
2. Copy "App ID" and "App Secret" from Settings → Basic

## Step 4: Project Setup

### Clone and Install

```bash
cd your-project-folder
npm install
```

### Create `.env.local` File

```bash
cp .env.example .env.local
```

### Fill in Environment Variables

Edit `.env.local` with your actual values:

```
# Database
DATABASE_URL="mongodb+srv://username:password@cluster.mongodb.net/whatsapp_saas?retryWrites=true&w=majority"

# JWT & Security
JWT_SECRET="generate-a-random-secret-min-32-chars"
ENCRYPTION_KEY="generate-another-random-key-min-32-chars"

# OpenAI
OPENAI_API_KEY="sk-your-key-here"
OPENAI_MODEL="gpt-4o-mini"

# WhatsApp
WHATSAPP_API_TOKEN="your-system-user-access-token"
WHATSAPP_BUSINESS_ACCOUNT_ID="your-waba-id"
WHATSAPP_WEBHOOK_SECRET="your-webhook-secret"
WEBHOOK_VERIFY_TOKEN="your-webhook-token"

NODE_ENV="development"
```

### Generate Random Secrets

For `JWT_SECRET` and `ENCRYPTION_KEY`, generate random strings:

```bash
# On Mac/Linux
openssl rand -base64 32

# On Windows (PowerShell)
[System.Convert]::ToBase64String([System.Security.Cryptography.RandomNumberGenerator]::GetBytes(32))
```

## Step 5: Initialize Database

### Push Schema to MongoDB

```bash
npx prisma generate
npx prisma db push
```

This will:
- Generate Prisma client
- Create collections in MongoDB
- Set up indexes

### Open Database Studio (Optional)

```bash
npx prisma studio
```

Browse your database at `http://localhost:5555`

## Step 6: Configure Webhook in Meta

### Get Your Webhook URL

For local development:
- Use [ngrok](https://ngrok.com) to expose localhost
- Download and run: `ngrok http 3000`
- Copy the forwarded URL (e.g., `https://abc123.ngrok.io`)

For production:
- Use your actual domain (e.g., `https://app.example.com`)

### Configure in Meta App

1. Go to your Meta App
2. Navigate to WhatsApp → Configuration
3. In "Webhooks" section, click "Edit"
4. Set Callback URL: `{YOUR_URL}/api/webhooks/whatsapp`
5. Set Verify Token: (value from your `WEBHOOK_VERIFY_TOKEN`)
6. Click "Verify and Save"

### Subscribe to Events

1. Click "Subscribe" button under Webhook fields
2. Select both:
   - `messages`
   - `message_status`
3. Click "Subscribe"

## Step 7: Run Development Server

```bash
npm run dev
```

Open `http://localhost:3000` in your browser

## Step 8: Test the Platform

### 1. Create Account

1. Go to `/register`
2. Enter email and password (min 8 chars)
3. Click "Sign Up"

### 2. Create Bot

1. Click "Create Bot"
2. Enter bot details:
   - **Name**: "Customer Support"
   - **Goal**: "Help customers with product questions"
   - **System Prompt**: "You are a helpful customer service bot"
   - **Rules**: "Be professional and concise"
   - **Knowledge**: "Add product info here"
3. Click "Save Changes"

### 3. Connect WhatsApp

1. Click "Connect WhatsApp"
2. Enter your credentials:
   - Phone Number ID
   - WABA ID
   - Access Token
3. Click "Connect WhatsApp"

### 4. Send Test Message

1. Send a message to your WhatsApp Business number from any WhatsApp account
2. Your bot should respond automatically!

## Troubleshooting

### Database Connection Error

```
Error: connect ECONNREFUSED
```

- Check MongoDB Atlas is running
- Verify `DATABASE_URL` is correct
- Check IP whitelist includes your IP

### Webhook Verification Failed

```
Error: Invalid signature
```

- Verify `WEBHOOK_VERIFY_TOKEN` matches Meta App
- Check `WHATSAPP_WEBHOOK_SECRET` is correct
- Webhook URL must be publicly accessible

### OpenAI API Errors

```
Error: Invalid API key
```

- Verify `OPENAI_API_KEY` starts with `sk-`
- Check API key hasn't expired
- Verify you have credits/payment method

### WhatsApp Messages Not Sending

```
Error: No access token
```

- Verify token is decrypted correctly
- Check token hasn't expired
- Verify phone number format (with country code)

## Next Steps

1. **Customize Bot**: Edit system prompt, goal, rules in dashboard
2. **Add Knowledge**: Add product/FAQ information to knowledge base
3. **Monitor**: Check webhook logs for debugging
4. **Scale**: Deploy to production with proper monitoring
5. **Enhance**: Add more message types (images, files, etc.)

## Production Deployment

### Before Going Live

- [ ] Change `NODE_ENV` to "production"
- [ ] Use strong `JWT_SECRET` (min 32 chars)
- [ ] Set up proper error logging
- [ ] Enable database backups
- [ ] Configure rate limiting
- [ ] Add monitoring/alerting
- [ ] Use CDN for static assets
- [ ] Enable HTTPS only

### Recommended Hosting

- **Vercel**: Easiest for Next.js
- **AWS**: Full control and scaling
- **DigitalOcean**: Good balance of cost and features
- **Railway/Render**: Simple deployment

### Deploy to Vercel

```bash
npm install -g vercel
vercel
```

Then:
1. Connect your Git repository
2. Add environment variables
3. Deploy

## Support

- Check `README.md` for API documentation
- See `docs/WEBHOOK_PAYLOADS.md` for webhook examples
- Check logs: `npm run dev` shows real-time output
- Open browser DevTools (F12) for client errors
