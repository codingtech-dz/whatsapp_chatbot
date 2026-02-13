# Deployment Checklist

## Pre-Deployment Review

### Code Quality
- [ ] All TypeScript errors resolved
- [ ] No console errors in browser
- [ ] No unhandled promise rejections
- [ ] Environment variables properly configured
- [ ] Sensitive data not committed to git

### Security
- [ ] JWT_SECRET is strong (32+ random characters)
- [ ] ENCRYPTION_KEY is strong (32+ random characters)
- [ ] Database credentials are secure
- [ ] OPENAI_API_KEY is protected
- [ ] WHATSAPP_WEBHOOK_SECRET is strong
- [ ] No secrets in .env are pushed to version control
- [ ] HTTPS enforced in production
- [ ] CORS properly configured if needed

### Database
- [ ] MongoDB Atlas cluster created
- [ ] Network access whitelist configured
- [ ] Backup policy configured
- [ ] Connection string tested
- [ ] Prisma migrations applied
- [ ] Database indexes verified

### External Services
- [ ] OpenAI API key created and tested
- [ ] OpenAI account has billing setup
- [ ] Meta app created in developers.facebook.com
- [ ] WhatsApp Business Account approved
- [ ] System User created with correct permissions
- [ ] Access token generated and secured

### Testing Completed
- [ ] User registration works
- [ ] User login works
- [ ] Bot creation works
- [ ] Bot editing works
- [ ] WhatsApp connection works
- [ ] Webhook verification works
- [ ] Message sending/receiving works
- [ ] Logout works

---

## Environment Variables Checklist

### Required Variables
```
✅ DATABASE_URL=mongodb+srv://user:pass@cluster.mongodb.net/db
✅ JWT_SECRET=<32+ random chars>
✅ ENCRYPTION_KEY=<32+ random chars>
✅ OPENAI_API_KEY=sk-<your-key>
✅ OPENAI_MODEL=gpt-4o-mini
✅ WHATSAPP_API_TOKEN=EAA<your-token>
✅ WHATSAPP_BUSINESS_ACCOUNT_ID=<your-waba-id>
✅ WHATSAPP_WEBHOOK_SECRET=<your-secret>
✅ WEBHOOK_VERIFY_TOKEN=<your-token>
✅ NODE_ENV=production
```

### Optional Variables (Recommended for Production)
```
SENTRY_DSN=<for error tracking>
LOG_LEVEL=error
MAX_RETRIES=3
TIMEOUT=30
```

---

## Deployment Steps

### Step 1: Choose Hosting Platform

#### Option A: Vercel (Recommended for Next.js)
```bash
npm install -g vercel
vercel login
vercel
```

1. Connect your Git repository
2. Add environment variables
3. Deploy
4. Configure custom domain

#### Option B: AWS Amplify
1. Connect Git repository
2. Select Next.js build settings
3. Add environment variables
4. Deploy

#### Option C: DigitalOcean App Platform
1. Connect Git repository
2. Select Next.js
3. Add environment variables
4. Deploy

#### Option D: Self-Hosted (VPS)
```bash
# SSH into server
ssh user@server.com

# Clone repository
git clone <repo-url>
cd wp_cb

# Install dependencies
npm install

# Build
npm run build

# Create environment file
nano .env.local
# Add all production environment variables

# Use PM2 for process management
npm install -g pm2
pm2 start npm --name "whatsapp-bot" -- start

# Set up reverse proxy with Nginx
# Configure SSL with Let's Encrypt
```

### Step 2: Configure Database

#### MongoDB Atlas
1. Create production cluster (M2 or higher)
2. Enable daily backups
3. Configure white-list with server IP
4. Update connection string in env variables

#### Backup Strategy
```bash
# Daily automated backups (MongoDB Atlas)
# Weekly snapshots
# Monthly archives
```

### Step 3: Configure Webhook

#### Update Meta App Settings

1. Go to https://developers.facebook.com
2. Select your app
3. Go to WhatsApp → Configuration
4. Update Callback URL:
   ```
   https://your-production-domain.com/api/webhooks/whatsapp
   ```
5. Update Verify Token to your `WEBHOOK_VERIFY_TOKEN`
6. Subscribe to events: `messages`, `message_status`

#### Webhook URL Testing

```bash
# Test webhook verification
curl -X GET "https://your-domain.com/api/webhooks/whatsapp?hub.mode=subscribe&hub.challenge=test&hub.verify_token=YOUR_TOKEN"

# Should return: test
```

### Step 4: Set Up Monitoring

#### Option A: Sentry (Error Tracking)
```bash
npm install @sentry/nextjs
```

Update `next.config.js`:
```javascript
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: 1.0,
});
```

#### Option B: Vercel Analytics
Built-in if deployed on Vercel.

#### Option C: Self-Hosted Monitoring
- Set up error logging to database
- Create admin dashboard for logs
- Set up alerts for critical errors

### Step 5: Set Up Logging

#### Production Logs

Create `lib/logger.ts`:
```typescript
export const logEvent = async (level: string, message: string, context?: any) => {
  console.log(`[${level}] ${message}`, context);
  // Optional: Send to external service
};
```

#### Log Rotation
Configure log rotation for production server:
```bash
# Using logrotate on Linux
sudo apt-get install logrotate
```

---

## Post-Deployment

### Verify Deployment

```bash
# Test homepage
curl https://your-domain.com

# Test API
curl -X POST https://your-domain.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test@123456"}'

# Test webhook
curl -X GET "https://your-domain.com/api/webhooks/whatsapp?hub.mode=subscribe&hub.challenge=123&hub.verify_token=TOKEN"
```

### Monitor First 24 Hours

- [ ] Check error logs
- [ ] Monitor API response times
- [ ] Verify webhook receiving messages
- [ ] Check database connection
- [ ] Monitor OpenAI API usage
- [ ] Test user registration flow
- [ ] Test WhatsApp bot response

### Set Up Alerts

```
Configure alerts for:
- Database connection errors
- API error rate > 1%
- Response time > 1s
- OpenAI API errors
- Webhook failures
- Low disk space
- High CPU usage
```

---

## Scaling Plan

### Phase 1: Single Instance (0-100 users)
- Single server deployment
- MongoDB shared cluster
- No caching

### Phase 2: Multiple Instances (100-1000 users)
- Load balancer
- Horizontal scaling with multiple instances
- Redis for session caching
- MongoDB dedicated cluster

### Phase 3: Enterprise (1000+ users)
- CDN for static assets
- Database sharding
- Message queue (Bull)
- Rate limiting per user
- Advanced monitoring
- Incident response team

---

## Maintenance Schedule

### Daily
- [ ] Check error logs
- [ ] Monitor uptime
- [ ] Check API performance

### Weekly
- [ ] Review user feedback
- [ ] Check database size
- [ ] Verify backups completed

### Monthly
- [ ] Security updates
- [ ] Dependency updates
- [ ] Performance optimization
- [ ] Cost review
- [ ] User analytics review

### Quarterly
- [ ] Full security audit
- [ ] Database optimization
- [ ] Architecture review
- [ ] Roadmap update

---

## Rollback Plan

### If Deployment Fails

#### On Vercel
```bash
vercel rollback
```

#### On AWS Amplify
1. Go to Amplify Console
2. Select previous deployment
3. Click "Deploy"

#### On Self-Hosted
```bash
# Revert to previous build
git revert HEAD
npm run build
pm2 restart whatsapp-bot
```

---

## Troubleshooting Deployment

### Application Won't Start
```bash
# Check logs
npm run dev

# Test build
npm run build

# Check Node version (should be 18+)
node --version
```

### Database Connection Failed
```bash
# Verify connection string
echo $DATABASE_URL

# Test connection
mongodb+srv://user:pass@cluster.mongodb.net/db?retryWrites=true

# Check IP whitelist in MongoDB Atlas
```

### Webhook Not Receiving Messages
```bash
# Verify webhook URL is publicly accessible
curl https://your-domain.com/api/webhooks/whatsapp

# Check webhook verification token
# Check webhook signature verification

# Test with ngrok locally first
ngrok http 3000
```

### High OpenAI API Costs
```bash
# Review usage
# Reduce model from gpt-4 to gpt-4o-mini
# Implement rate limiting
# Add usage monitoring
```

---

## Security Hardening

### Production Checklist

- [ ] HTTPS enforced
- [ ] Secrets in environment variables only
- [ ] Rate limiting enabled
- [ ] CORS properly configured
- [ ] SQL/NoSQL injection prevented (Prisma)
- [ ] XSS protection enabled (Next.js)
- [ ] CSRF tokens implemented
- [ ] Helmet middleware added (recommended)
- [ ] API authentication required
- [ ] Sensitive fields encrypted
- [ ] Logs don't contain secrets
- [ ] Backup encryption enabled
- [ ] VPN/firewall configured

### Add Security Headers

Update `next.config.js`:
```javascript
async headers() {
  return [
    {
      source: '/:path*',
      headers: [
        { key: 'X-Content-Type-Options', value: 'nosniff' },
        { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
        { key: 'X-XSS-Protection', value: '1; mode=block' },
        { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
      ],
    },
  ];
}
```

---

## Success Criteria

Your deployment is successful when:

✅ Website loads without errors
✅ User registration works
✅ User login works
✅ Bot creation works
✅ Webhook receives messages
✅ Bot sends responses
✅ No critical errors in logs
✅ Response time < 1s
✅ 100% uptime after 24h
✅ Users can connect WhatsApp

---

## Next Steps After Deployment

1. Send launch announcement
2. Enable monitoring and alerting
3. Set up support channel
4. Create user onboarding guide
5. Plan Phase 2 features
6. Set up feedback collection
7. Create analytics dashboard

---

**Deployment Status:** Ready for production ✅
