# Quick Reference Guide

## File Locations Quick Map

### Core Files
| File | Purpose |
|------|---------|
| `prisma/schema.prisma` | Database models |
| `middleware.ts` | Route protection |
| `.env.example` | Environment variables template |

### Authentication
| File | Endpoint | Purpose |
|------|----------|---------|
| `app/api/auth/register/route.ts` | POST /api/auth/register | User registration |
| `app/api/auth/login/route.ts` | POST /api/auth/login | User login |
| `app/api/auth/logout/route.ts` | POST /api/auth/logout | User logout |

### Bot Management
| File | Endpoint | Purpose |
|------|----------|---------|
| `app/api/bots/route.ts` | GET/POST /api/bots | Get/create bot |
| `app/api/bots/update/route.ts` | PUT /api/bots/update | Update bot config |
| `app/api/bots/connect-whatsapp/route.ts` | POST /api/bots/connect-whatsapp | Connect WhatsApp |

### Webhooks
| File | Endpoint | Purpose |
|------|----------|---------|
| `app/api/webhooks/whatsapp/route.ts` | GET/POST /api/webhooks/whatsapp | Receive messages |

### Pages
| File | URL | Purpose |
|------|-----|---------|
| `app/page.tsx` | / | Landing page |
| `app/login/page.tsx` | /login | Login page |
| `app/register/page.tsx` | /register | Registration page |
| `app/dashboard/bot/page.tsx` | /dashboard/bot | Bot dashboard |
| `app/dashboard/bot/connect/page.tsx` | /dashboard/bot/connect | WhatsApp connection |

### Libraries
| File | Purpose |
|------|---------|
| `lib/auth.ts` | JWT token management |
| `lib/prisma.ts` | Database client singleton |
| `lib/openai.ts` | OpenAI API integration |
| `lib/whatsapp.ts` | WhatsApp API utilities |
| `lib/encryption.ts` | Token encryption/decryption |

---

## Common Commands

### Development
```bash
# Start dev server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# View database
npx prisma studio

# Generate Prisma client
npx prisma generate

# Sync schema with database
npx prisma db push
```

### Database
```bash
# View Prisma Studio
npx prisma studio
# Opens at http://localhost:5555

# Reset database (warning: deletes all data)
npx prisma db push --force-reset

# View database migrations
npx prisma migrate status
```

### Testing
```bash
# Test API with curl
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Test webhook verification
curl -X GET "http://localhost:3000/api/webhooks/whatsapp?hub.mode=subscribe&hub.challenge=test&hub.verify_token=TOKEN"
```

---

## Environment Variables

### Minimal Setup (Testing)
```
DATABASE_URL=mongodb+srv://user:pass@localhost/test
JWT_SECRET=dev-secret-key-12345678901234567890
ENCRYPTION_KEY=dev-encryption-key-1234567890123456
OPENAI_API_KEY=sk-test
WHATSAPP_WEBHOOK_SECRET=test-secret
WEBHOOK_VERIFY_TOKEN=test-token
```

### Production Setup
```
DATABASE_URL=mongodb+srv://prod-user:prod-pass@prod-cluster.mongodb.net/prod_db
JWT_SECRET=$(openssl rand -base64 32)
ENCRYPTION_KEY=$(openssl rand -base64 32)
OPENAI_API_KEY=sk-your-real-key
WHATSAPP_API_TOKEN=EAA...
WHATSAPP_BUSINESS_ACCOUNT_ID=your-waba-id
WHATSAPP_WEBHOOK_SECRET=production-webhook-secret
WEBHOOK_VERIFY_TOKEN=production-verify-token
NODE_ENV=production
```

---

## Data Models Overview

### User Model
```typescript
{
  id: string (ObjectId)
  email: string (unique)
  passwordHash: string
  createdAt: Date
  updatedAt: Date
  bots: Bot[] // relation
}
```

### Bot Model
```typescript
{
  id: string (ObjectId)
  userId: string (ObjectId, foreign key)
  name: string
  goal: string
  systemPrompt: string
  rules: string
  knowledgeText: string
  isActive: boolean
  phoneNumberId: string (unique, nullable)
  wabaId: string (nullable)
  accessToken: string (encrypted, nullable)
  createdAt: Date
  updatedAt: Date
  conversations: Conversation[] // relation
}
```

### Conversation Model
```typescript
{
  id: string (ObjectId)
  botId: string (ObjectId, foreign key)
  fromNumber: string (WhatsApp phone)
  lastMessage: string
  createdAt: Date
  updatedAt: Date
}
```

---

## API Response Codes

| Code | Meaning | Example |
|------|---------|---------|
| 200 | Success | Bot retrieved |
| 201 | Created | Bot/User created |
| 400 | Bad Request | Missing fields |
| 401 | Unauthorized | Invalid token |
| 404 | Not Found | Bot not found |
| 409 | Conflict | Email exists |
| 500 | Server Error | Database error |

---

## Debugging Tips

### Enable Verbose Logging
```bash
# Start dev server with debugging
DEBUG=* npm run dev

# Prisma debugging
PRISMA_DEBUG=all npm run dev
```

### Check Database
```bash
# Open Prisma Studio
npx prisma studio

# Query directly
npx prisma db execute --stdin < query.sql
```

### Test Endpoints
```bash
# Install HTTP client
npm install -g httpie

# Test login
http POST http://localhost:3000/api/auth/login \
  email=test@example.com password=password123

# Get bot
http GET http://localhost:3000/api/bots \
  Authorization:"Bearer YOUR_TOKEN"
```

### View Logs
```bash
# Real-time logs
npm run dev

# Check Next.js build errors
npm run build

# View Prisma errors
npx prisma validate
```

---

## Performance Optimization

### Database Optimization
```bash
# Check indexes
npx prisma studio
# Look for green checkmarks on indexed fields

# Add indexes if needed
# Edit prisma/schema.prisma
# Run: npx prisma db push
```

### API Optimization
- Cache bot configurations in Redis
- Implement request debouncing
- Use database connection pooling
- Limit OpenAI API calls

### Frontend Optimization
- Next.js automatic code splitting
- Image optimization with `next/image`
- Dynamic imports for large components
- CSS minification with Tailwind

---

## Troubleshooting Guide

### Issue: "Can't find module"
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Generate Prisma client
npx prisma generate
```

### Issue: Database connection failed
```bash
# Check connection string
echo $DATABASE_URL

# Test MongoDB Atlas IP whitelist
# Add your IP or 0.0.0.0/0 (testing only)
```

### Issue: Webhook signature invalid
```bash
# Verify WHATSAPP_WEBHOOK_SECRET matches Meta App
# Check webhook body is raw JSON
# Verify X-Hub-Signature-256 header present
```

### Issue: OpenAI API errors
```bash
# Check API key is correct
curl https://api.openai.com/v1/models \
  -H "Authorization: Bearer $OPENAI_API_KEY"

# Check account has credits/billing
# Verify model name is correct (gpt-4o-mini, etc)
```

---

## Useful Links

- Next.js Docs: https://nextjs.org/docs
- Prisma Docs: https://www.prisma.io/docs
- MongoDB Docs: https://docs.mongodb.com
- OpenAI Docs: https://platform.openai.com/docs
- Meta Developers: https://developers.facebook.com
- WhatsApp API: https://developers.facebook.com/docs/whatsapp

---

## Key Concepts

### Multi-Tenant
- Each user is isolated
- User can only access own bot
- Data is segregated by `userId`
- Middleware enforces access control

### Webhook Verification
- Meta sends POST with message
- We verify signature with `WHATSAPP_WEBHOOK_SECRET`
- Signature is SHA256 HMAC of request body
- Must match `X-Hub-Signature-256` header

### Token Encryption
- Access tokens encrypted before storage
- Uses AES encryption with `ENCRYPTION_KEY`
- Decrypted when sending to WhatsApp API
- Never exposed in API responses

### JWT Authentication
- Tokens expire after 24 hours
- Stored in HttpOnly cookie
- Can also use Bearer header
- Verified by middleware on protected routes

### AI Prompt Engineering
- System prompt defines bot behavior
- Goal explains what bot helps with
- Rules define tone/style
- Knowledge base provides context
- Combined with user message for OpenAI

---

## Production Checklist (Quick)

- [ ] .env.local created with real values
- [ ] MongoDB Atlas cluster created
- [ ] OpenAI API key obtained
- [ ] Meta app configured
- [ ] Webhook URL set in Meta app
- [ ] npm run build succeeds
- [ ] User registration works
- [ ] WhatsApp message sends
- [ ] Error logging configured
- [ ] Database backups enabled

---

## Next Steps

1. **Setup**: Follow docs/SETUP_GUIDE.md
2. **Test**: Create account, bot, send message
3. **Deploy**: Follow docs/DEPLOYMENT_CHECKLIST.md
4. **Monitor**: Set up error tracking
5. **Scale**: Plan for more users/messages

---

**Last Updated:** February 3, 2026
**Status:** Production Ready ✅
