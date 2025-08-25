# Social Media API Setup Guide

## 🚀 **Complete API Setup for Automated Posting**

You need **API access** for each platform to enable automatic posting. Here's how to get it:

## 📋 **Required API Access**

### **1. Twitter/X API**
**Cost**: Free tier available, paid plans for higher limits

#### **Setup Steps:**
1. **Go to Twitter Developer Portal**: https://developer.twitter.com/
2. **Apply for Developer Account** (free)
3. **Create a Project/App**
4. **Get API Keys**:
   - API Key (Consumer Key)
   - API Secret (Consumer Secret)
   - Access Token
   - Access Token Secret

#### **Required Permissions:**
- `tweet.read`
- `tweet.write`
- `users.read`

#### **API Limits:**
- **Free**: 1,500 tweets/month
- **Basic ($100/month)**: 3,000 tweets/month
- **Pro ($5,000/month)**: 300,000 tweets/month

---

### **2. Facebook API**
**Cost**: Free (with app verification)

#### **Setup Steps:**
1. **Go to Facebook Developers**: https://developers.facebook.com/
2. **Create App** (you're already doing this)
3. **Complete App Verification** (required for production)
4. **Get App Credentials**:
   - App ID
   - App Secret
   - Access Token

#### **Required Permissions:**
- `pages_manage_posts`
- `pages_read_engagement`
- `publish_to_groups`

#### **API Limits:**
- **Development**: 200 calls/hour
- **Production**: Based on app usage

---

### **3. LinkedIn API**
**Cost**: Free

#### **Setup Steps:**
1. **Go to LinkedIn Developers**: https://www.linkedin.com/developers/
2. **Create App**
3. **Configure OAuth 2.0**
4. **Get Credentials**:
   - Client ID
   - Client Secret
   - Access Token

#### **Required Permissions:**
- `w_member_social`
- `w_organization_social`

#### **API Limits:**
- 25 posts/day per user
- 100 API calls/day

---

### **4. Instagram API**
**Cost**: Free (via Facebook Graph API)

#### **Setup Steps:**
1. **Use Facebook App** (Instagram is owned by Meta)
2. **Add Instagram Basic Display**
3. **Get Access Token** (via Facebook OAuth)

#### **Required Permissions:**
- `instagram_basic`
- `instagram_content_publish`

#### **API Limits:**
- 25 posts/day
- 100 API calls/hour

---

## 🔧 **Environment Variables Setup**

Add these to your `.env.local`:

```env
# Twitter API
TWITTER_CLIENT_ID="your-twitter-client-id"
TWITTER_CLIENT_SECRET="your-twitter-client-secret"

# Facebook API
NEXT_PUBLIC_FACEBOOK_APP_ID="your-facebook-app-id"
FACEBOOK_APP_SECRET="your-facebook-app-secret"

# LinkedIn API
LINKEDIN_CLIENT_ID="your-linkedin-client-id"
LINKEDIN_CLIENT_SECRET="your-linkedin-client-secret"

# Base URL
NEXTAUTH_URL="http://localhost:3000"
```

## 🎯 **Quick Start Guide**

### **Step 1: Choose Your Platforms**
Start with **2-3 platforms** for testing:
- **Twitter** (easiest to set up)
- **Facebook** (you're already working on this)
- **LinkedIn** (good for B2B content)

### **Step 2: Get API Access**
1. **Twitter**: Apply for developer account
2. **Facebook**: Complete app verification
3. **LinkedIn**: Create developer app

### **Step 3: Add Credentials**
1. **Update `.env.local`** with your API keys
2. **Restart your development server**
3. **Test connections** in Settings

### **Step 4: Test Posting**
1. **Connect accounts** via Settings
2. **Create a social post**
3. **Watch it post automatically**

## 💰 **Cost Breakdown**

### **Free Tier (Recommended for Start)**
- **Twitter**: 1,500 tweets/month
- **Facebook**: Free (with verification)
- **LinkedIn**: 25 posts/day
- **Instagram**: 25 posts/day

### **Total Monthly Cost**: $0

### **Paid Plans (When You Scale)**
- **Twitter Basic**: $100/month
- **Twitter Pro**: $5,000/month
- **Facebook**: Free (with usage limits)
- **LinkedIn**: Free (with limits)

## ⚡ **Implementation Priority**

### **Phase 1: Basic Setup (Week 1)**
1. ✅ Facebook app verification (in progress)
2. 🔄 Twitter developer account
3. 🔄 LinkedIn developer app
4. 🔄 Test basic posting

### **Phase 2: Production Ready (Week 2)**
1. 🔄 Complete all app verifications
2. 🔄 Implement OAuth flows
3. 🔄 Add error handling
4. 🔄 Test with real content

### **Phase 3: Advanced Features (Week 3)**
1. 🔄 Content scheduling
2. 🔄 Analytics tracking
3. 🔄 A/B testing
4. 🔄 Multi-platform optimization

## 🚨 **Important Notes**

### **API Rate Limits**
- **Don't exceed limits** - implement proper queuing
- **Monitor usage** - track API calls
- **Handle errors** - implement retry logic

### **Security Best Practices**
- **Never expose secrets** in client-side code
- **Use environment variables** for all API keys
- **Implement proper OAuth flows**
- **Store tokens securely** (encrypted in database)

### **Legal Compliance**
- **Follow platform terms** of service
- **Respect user privacy** and data protection
- **Implement proper consent** mechanisms
- **Monitor for policy changes**

## 🎯 **Next Steps**

1. **Complete Facebook app verification** (you're working on this)
2. **Apply for Twitter developer account**
3. **Create LinkedIn developer app**
4. **Add API credentials** to environment
5. **Test the connection flow**

## 📞 **Support Resources**

- **Twitter Developer Support**: https://developer.twitter.com/en/support
- **Facebook Developer Support**: https://developers.facebook.com/support/
- **LinkedIn Developer Support**: https://developer.linkedin.com/support
- **Instagram Developer Support**: https://developers.facebook.com/docs/instagram-api/

---

**Status**: 🔄 Facebook verification in progress
**Next**: 🎯 Get Twitter and LinkedIn API access
**Timeline**: 1-2 weeks for full setup
