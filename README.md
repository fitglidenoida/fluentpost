# FitGlide Marketing Tool 🤖

A cost-free AI-powered marketing tool for viral content creation and user acquisition. Built with Next.js, TypeScript, and Tailwind CSS.

## 🚀 Features

- **Cost-Free AI Integration** - Uses GPT Plus without API costs
- **Viral Content Generation** - Blog posts, social media content, topic research
- **Analytics Dashboard** - Track performance and viral coefficients
- **Database Management** - SQLite for development, PostgreSQL ready
- **Modern UI** - Professional dashboard with real-time data

## 💰 Cost-Free AI Workflow

This tool uses a unique copy-paste workflow with GPT Plus to avoid API costs:

### How It Works:

1. **Generate Prompt** - The system creates optimized prompts for GPT Plus
2. **Copy to GPT Plus** - Copy the prompt and paste it into ChatGPT Plus
3. **Paste Response** - Copy the JSON response from GPT Plus back to the system
4. **Use Content** - The system stores and uses the generated content

### Benefits:
- ✅ **Zero API costs** - No OpenAI charges
- ✅ **High-quality content** - Uses GPT Plus capabilities
- ✅ **Full control** - Review and edit before using
- ✅ **Production ready** - Works in both development and production

## 🛠️ Setup

### Prerequisites
- Node.js 18+ 
- npm or yarn
- GPT Plus account (for content generation)

### Installation

1. **Clone and install dependencies:**
```bash
git clone <repository>
cd fitglide-marketing
npm install
```

2. **Set up environment variables:**
```bash
# Create .env.local file
DATABASE_URL="file:./dev.db"
NEXTAUTH_SECRET="your-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"
MOCK_AI_RESPONSES="true"
```

3. **Initialize database:**
```bash
npx prisma db push
```

4. **Start development server:**
```bash
npm run dev
```

5. **Visit the application:**
- Dashboard: `http://localhost:3000`
- AI Admin Panel: `http://localhost:3000/admin`

## 📖 Usage Guide

### 1. Dashboard Overview
- View real-time analytics and metrics
- Monitor viral coefficient and user growth
- Track top-performing content

### 2. AI Content Generation

#### Step 1: Access AI Admin Panel
- Click "AI Admin Panel" in the sidebar
- Or visit `http://localhost:3000/admin`

#### Step 2: Configure Content Parameters
- **Content Type**: Blog post, social media, or topic ideas
- **Topic**: Your content focus (e.g., "HIIT workouts")
- **Platform**: Target social media platform
- **Tone**: Content voice (enthusiastic, professional, etc.)
- **Length**: Content length preference

#### Step 3: Generate Prompt
- Click "Generate Prompt for GPT Plus"
- Copy the generated prompt

#### Step 4: Use GPT Plus
- Open ChatGPT Plus in your browser
- Paste the copied prompt
- Copy the JSON response

#### Step 5: Store Response
- Paste the JSON response back into the admin panel
- Click "Store Response"
- The content is now available for use

### 3. API Endpoints

#### Content Generation
```bash
POST /api/generate
{
  "contentType": "blog",
  "topic": "HIIT workouts",
  "platform": "twitter",
  "tone": "enthusiastic"
}
```

#### Topics Management
```bash
GET /api/topics
POST /api/topics
```

#### Blog Posts
```bash
GET /api/blog-posts
POST /api/blog-posts
```

#### Analytics
```bash
GET /api/analytics
POST /api/analytics
```

## 🗄️ Database Schema

The application uses Prisma with the following models:

- **User** - Authentication and user management
- **Topic** - Content topics and research data
- **BlogPost** - Blog posts with SEO metadata
- **SocialPost** - Social media posts
- **Analytics** - Performance tracking
- **Campaign** - Marketing campaigns
- **ResearchData** - Topic research insights

## 🚀 Production Deployment

### 1. Database Setup
```bash
# Switch to PostgreSQL
DATABASE_URL="postgresql://username:password@host:port/database"
```

### 2. Environment Variables
```bash
# Production environment
NODE_ENV="production"
DATABASE_URL="your-postgresql-url"
NEXTAUTH_SECRET="your-production-secret"
NEXTAUTH_URL="https://yourdomain.com"
```

### 3. Deploy to Vercel
```bash
npm run build
# Deploy to Vercel, Netlify, or your preferred platform
```

## 🔧 Customization

### Adding New Content Types
1. Update `src/lib/ai.ts` with new prompt templates
2. Add new options to the admin panel
3. Update API endpoints as needed

### Custom Analytics
1. Modify `src/lib/utils.ts` for custom metrics
2. Update dashboard components
3. Add new API endpoints

### Styling
- Built with Tailwind CSS
- Customize `tailwind.config.ts` for branding
- Modify components in `src/app/page.tsx`

## 📊 Analytics & Metrics

The dashboard tracks:
- **Total Users** - User acquisition
- **Viral Coefficient** - Content sharing ratio
- **Total Views** - Content reach
- **Total Shares** - Social engagement
- **Top Content** - Best performing posts
- **Recent Activity** - Latest updates

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

MIT License - feel free to use this for your own projects!

## 🆘 Support

For issues or questions:
1. Check the documentation
2. Review the code comments
3. Open an issue on GitHub

---

**Built with ❤️ for cost-effective viral marketing**
