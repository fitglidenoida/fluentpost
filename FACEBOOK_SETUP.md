# Facebook API Setup & App Verification Guide

## 🚀 **Current Status: App Verification Required**

You're at the crucial Facebook app verification stage. Here's how to complete the setup:

## 📋 **Step-by-Step Setup**

### **Step 1: Add Facebook App ID to Environment**

Add this to your `.env.local` file:
```env
# Facebook API Configuration
NEXT_PUBLIC_FACEBOOK_APP_ID="your-actual-facebook-app-id"
FACEBOOK_APP_SECRET="your-actual-facebook-app-secret"
```

### **Step 2: Facebook App Configuration**

1. **Go to Facebook Developers Console**
   - Visit: https://developers.facebook.com/
   - Select your app

2. **Add Your Domain**
   - Go to **App Settings** → **Basic**
   - Add `localhost` to **App Domains**
   - Add `http://localhost:3000` to **Site URL**

3. **Configure OAuth Settings**
   - Go to **Facebook Login** → **Settings**
   - Add `http://localhost:3000` to **Valid OAuth Redirect URIs**
   - Add `http://localhost:3000/auth/facebook/callback` for callback

### **Step 3: App Verification Process**

#### **Why Verification is Required:**
- Facebook requires app verification for production use
- Unverified apps have limited API access
- Verification ensures your app follows Facebook's policies

#### **Verification Steps:**

1. **Complete App Setup**
   - Fill out all required app information
   - Add privacy policy URL
   - Add terms of service URL
   - Upload app icon and screenshots

2. **Submit for Review**
   - Go to **App Review** → **Permissions and Features**
   - Request permissions you need:
     - `pages_manage_posts` (for posting to pages)
     - `pages_read_engagement` (for reading page insights)
     - `publish_to_groups` (if posting to groups)

3. **Provide Documentation**
   - Explain how your app uses Facebook data
   - Describe your app's functionality
   - Provide test accounts if requested

### **Step 4: Testing Your Integration**

#### **Test the Facebook SDK:**
1. **Start your development server:**
   ```bash
   npm run dev
   ```

2. **Open browser console** and check for:
   ```
   Facebook SDK initialized successfully
   ```

3. **Test Facebook Login:**
   - The SDK should be loaded
   - Check for any JavaScript errors

#### **Test Events Tracking:**
1. **Navigate through your app**
2. **Check Facebook Events Manager**
3. **Wait 20+ minutes** for events to appear
4. **Verify page view events** are being tracked

### **Step 5: Production Deployment**

#### **Before Going Live:**
1. **Update domain settings** in Facebook app
2. **Add production domain** to allowed domains
3. **Update OAuth redirect URIs**
4. **Complete app verification** (required for production)

#### **Environment Variables for Production:**
```env
NEXT_PUBLIC_FACEBOOK_APP_ID="your-production-app-id"
FACEBOOK_APP_SECRET="your-production-app-secret"
NEXTAUTH_URL="https://yourdomain.com"
```

## 🔧 **Troubleshooting**

### **Common Issues:**

1. **"App not verified" error**
   - Complete app verification process
   - Use test accounts during development

2. **Events not appearing**
   - Wait 20+ minutes
   - Check browser console for errors
   - Verify app ID is correct

3. **SDK not loading**
   - Check network tab for script loading
   - Verify app ID in environment variables
   - Check for JavaScript errors

### **Development vs Production:**

#### **Development Mode:**
- Use `localhost` domains
- Limited API access
- No verification required for basic testing

#### **Production Mode:**
- Requires app verification
- Full API access
- Must follow Facebook policies

## 📊 **Monitoring & Analytics**

### **Facebook Events Manager:**
- Track page views
- Monitor user interactions
- Analyze conversion events

### **App Insights:**
- Monitor API usage
- Track error rates
- Analyze user engagement

## 🎯 **Next Steps After Verification**

1. **Implement Facebook Login**
2. **Add page posting functionality**
3. **Implement content scheduling**
4. **Add analytics tracking**
5. **Test with real Facebook pages**

## ⚠️ **Important Notes**

### **App Verification Timeline:**
- **Review process**: 1-7 business days
- **Additional requests**: May require more documentation
- **Rejection**: Common, but fixable with feedback

### **API Limits:**
- **Development**: 200 API calls per hour
- **Production**: Based on app usage and verification
- **Rate limiting**: Implement proper error handling

### **Security:**
- **Never expose app secret** in client-side code
- **Use environment variables** for sensitive data
- **Implement proper authentication**

## 📞 **Support Resources**

- **Facebook Developer Documentation**: https://developers.facebook.com/docs/
- **App Review Guidelines**: https://developers.facebook.com/docs/app-review/
- **Community Support**: https://developers.facebook.com/community/

---

**Status**: ✅ Facebook SDK integrated
**Next**: 🔄 Complete app verification
**Timeline**: 1-7 business days for review
