# SafeMed Deployment Guide

## 🚀 Recommended: Vercel (Best for Next.js)

**Why Vercel?**
- ✅ Made by Next.js creators - perfect compatibility
- ✅ Free tier is generous (100GB bandwidth/month)
- ✅ Automatic deployments from Git
- ✅ Zero-configuration for Next.js
- ✅ Built-in CI/CD
- ✅ Professional URLs (yourproject.vercel.app)
- ✅ Easy environment variable management
- ✅ Preview deployments for every PR

### Step-by-Step Vercel Deployment

#### 1. Prepare Your Code
```bash
# Make sure everything is committed
git add .
git commit -m "Ready for deployment"
git push origin main
```

#### 2. Create Vercel Account
1. Go to [vercel.com](https://vercel.com)
2. Sign up with GitHub/GitLab/Bitbucket
3. Import your SafeMed repository

#### 3. Configure Project
1. **Framework Preset**: Next.js (auto-detected)
2. **Root Directory**: `./` (default)
3. **Build Command**: `npm run build` (auto-detected)
4. **Output Directory**: `.next` (auto-detected)
5. **Install Command**: `npm install` (auto-detected)

#### 4. Set Environment Variables
In Vercel Dashboard → Your Project → Settings → Environment Variables, add:

**Required:**
```
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
OPENAI_API_KEY=your-openai-key
```

**Optional:**
```
GOOGLE_AI_API_KEY=your-google-key
ANTHROPIC_API_KEY=your-anthropic-key
RESEND_API_KEY=your-resend-key
```

#### 5. Deploy
- Click "Deploy"
- Wait 2-3 minutes
- Your app will be live at `safemed.vercel.app`

#### 6. Configure Custom Domain (Optional)
- Go to Settings → Domains
- Add your custom domain
- Update DNS records as instructed

---

## 🌐 Alternative Options

### Option 2: Netlify

**Pros:**
- Free tier (100GB bandwidth)
- Good Next.js support
- Easy Git integration

**Steps:**
1. Sign up at [netlify.com](https://netlify.com)
2. Connect your Git repository
3. Build settings:
   - Build command: `npm run build`
   - Publish directory: `.next`
4. Add environment variables
5. Deploy

**Note:** May need `netlify.toml` for Next.js routing:
```toml
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

---

### Option 3: Railway

**Pros:**
- Simple deployment
- Good for full-stack apps
- $5/month free credit

**Steps:**
1. Sign up at [railway.app](https://railway.app)
2. New Project → Deploy from GitHub
3. Select your repository
4. Add environment variables
5. Deploy

---

### Option 4: Render

**Pros:**
- Free tier available
- Good documentation
- Auto-deploy from Git

**Steps:**
1. Sign up at [render.com](https://render.com)
2. New → Web Service
3. Connect GitHub repository
4. Settings:
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`
5. Add environment variables
6. Deploy

---

## 📋 Pre-Deployment Checklist

### Before Deploying:

- [ ] **Test Build Locally**
  ```bash
  npm run build
  npm start
  ```
  Make sure it builds without errors

- [ ] **Environment Variables**
  - [ ] All Supabase keys configured
  - [ ] At least one AI API key set
  - [ ] Service role key is secure (not exposed)

- [ ] **Supabase Configuration**
  - [ ] Update Supabase Auth redirect URLs
  - [ ] Add production URL to allowed origins
  - [ ] Test database connection

- [ ] **Code Quality**
  - [ ] No console errors
  - [ ] All features tested
  - [ ] Remove any test/debug code

- [ ] **Security**
  - [ ] `.env.local` is in `.gitignore`
  - [ ] No API keys in code
  - [ ] RLS policies are active

---

## 🔧 Post-Deployment Configuration

### 1. Update Supabase Auth Settings

1. Go to Supabase Dashboard → Authentication → URL Configuration
2. Add your production URL to:
   - **Site URL**: `https://yourproject.vercel.app`
   - **Redirect URLs**: 
     - `https://yourproject.vercel.app/auth/confirm`
     - `https://yourproject.vercel.app/auth/reset-password`
     - `https://yourproject.vercel.app/auth/verify-email`
     - `https://yourproject.vercel.app/auth/login`
     - `https://yourproject.vercel.app/**`

### 2. Test Production Build

1. Visit your deployed URL
2. Test signup/login
3. Test medication search
4. Test AI analysis
5. Check console for errors

### 3. Monitor Performance

- Vercel Analytics (built-in)
- Check build logs for errors
- Monitor API usage (OpenAI, Supabase)

---

## 🎓 For Graduation Presentation

### What to Show:

1. **Live Demo**
   - Show the deployed URL
   - Demonstrate core features
   - Show it's accessible from anywhere

2. **Technical Highlights**
   - "Deployed on Vercel (industry standard for Next.js)"
   - "Zero-downtime deployments"
   - "Automatic CI/CD from Git"
   - "Secure environment variable management"

3. **Production Features**
   - Fast loading times
   - Responsive design
   - Error handling
   - Security (RLS, authentication)

---

## 💰 Cost Breakdown

### Free Tier (Vercel):
- ✅ 100GB bandwidth/month
- ✅ Unlimited deployments
- ✅ Preview deployments
- ✅ Automatic SSL
- ✅ Global CDN

### Additional Costs:
- **Supabase**: Free tier (2 projects, 500MB database)
- **OpenAI**: Pay-as-you-go (~$0.01-0.10 per analysis)
- **Domain**: Optional ($10-15/year)

**Total for graduation project: ~$0-5/month**

---

## 🚨 Troubleshooting

### Build Fails:
- Check environment variables are set
- Verify `npm run build` works locally
- Check build logs in Vercel dashboard

### API Errors:
- Verify environment variables in production
- Check Supabase project is active
- Verify API keys are valid

### Routing Issues:
- Next.js App Router should work automatically
- Check middleware configuration
- Verify redirect URLs in Supabase

---

## 📝 Quick Deploy Command

If using Vercel CLI:
```bash
npm i -g vercel
vercel login
vercel
```

Follow prompts to deploy!

---

## ✅ Recommended Setup for Graduation Project

**Best Choice: Vercel**
- Easiest setup
- Best Next.js support
- Professional appearance
- Free tier sufficient
- Great for presentations

**Time to Deploy: ~10 minutes**

Good luck with your presentation! 🎓

