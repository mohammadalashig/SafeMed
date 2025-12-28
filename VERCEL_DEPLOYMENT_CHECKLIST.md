# Vercel Deployment Checklist

## ✅ Pre-Deployment Steps

### 1. Code is Ready ✅
- [x] Build passes locally (`npm run build`)
- [x] All TypeScript errors resolved
- [x] No critical warnings

### 2. Environment Variables to Set in Vercel

Go to **Vercel Dashboard → Your Project → Settings → Environment Variables** and add:

#### Required Variables:

```
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
OPENAI_API_KEY=your-openai-api-key
```

#### Optional Variables (if using):

```
GOOGLE_AI_API_KEY=your-google-ai-key
ANTHROPIC_API_KEY=your-anthropic-key
RESEND_API_KEY=your-resend-key
```

**⚠️ IMPORTANT:**
- Set these for **Production**, **Preview**, and **Development** environments
- Never commit `.env.local` to Git (already in `.gitignore`)

### 3. Supabase Configuration

**After deployment**, update Supabase redirect URLs:

1. Go to **Supabase Dashboard → Authentication → URL Configuration**

2. **Site URL**: `https://yourproject.vercel.app`

3. **Redirect URLs** - Add these:
   ```
   https://yourproject.vercel.app/auth/confirm
   https://yourproject.vercel.app/auth/reset-password
   https://yourproject.vercel.app/auth/verify-email
   https://yourproject.vercel.app/auth/login
   https://yourproject.vercel.app/**
   ```

### 4. Update Email Templates in Supabase

1. Go to **Supabase Dashboard → Authentication → Email Templates → Reset Password**

2. Update the template to use:
   ```
   {{ .SiteURL }}/auth/reset-password?token_hash={{ .TokenHash }}&type=recovery
   ```

   Or use the template from: `email-templates/reset-password.html`

---

## 🚀 Deployment Steps

### Option 1: Deploy via Vercel Dashboard (Recommended)

1. **Push to GitHub/GitLab/Bitbucket** (if not already done)
   ```bash
   git add .
   git commit -m "Ready for Vercel deployment"
   git push
   ```

2. **Connect to Vercel:**
   - Go to [vercel.com](https://vercel.com)
   - Sign up/Login with GitHub
   - Click "Add New Project"
   - Import your SafeMed repository

3. **Configure Project:**
   - Framework Preset: **Next.js** (auto-detected)
   - Root Directory: `./` (default)
   - Build Command: `npm run build` (auto-detected)
   - Output Directory: `.next` (auto-detected)

4. **Add Environment Variables:**
   - Click "Environment Variables"
   - Add all required variables (see section 2 above)
   - Select all environments (Production, Preview, Development)

5. **Deploy:**
   - Click "Deploy"
   - Wait 2-3 minutes
   - Your app will be live at `safemed.vercel.app` (or your chosen name)

### Option 2: Deploy via Vercel CLI

1. **Install Vercel CLI:**
   ```bash
   npm i -g vercel
   ```

2. **Login:**
   ```bash
   vercel login
   ```

3. **Deploy:**
   ```bash
   vercel
   ```
   
   Follow the prompts:
   - Link to existing project or create new
   - Set environment variables when prompted

4. **Deploy to Production:**
   ```bash
   vercel --prod
   ```

---

## 🧪 Post-Deployment Testing

After deployment, test these features:

1. **Homepage**: Visit `https://yourproject.vercel.app`
   - [ ] Page loads correctly
   - [ ] No console errors

2. **Authentication**:
   - [ ] Sign up works
   - [ ] Login works
   - [ ] Password reset flow works
   - [ ] Email verification works

3. **Core Features**:
   - [ ] Medication search works
   - [ ] AI analysis works (check API key is set)
   - [ ] Dashboard loads
   - [ ] Medication history works
   - [ ] Scheduling works

4. **Check Browser Console:**
   - [ ] No errors in console
   - [ ] All API calls succeed

---

## 🔧 Troubleshooting

### Build Fails in Vercel:

1. **Check Build Logs:**
   - Go to Vercel Dashboard → Your Project → Deployments → Click failed deployment
   - Check build logs for errors

2. **Common Issues:**
   - Missing environment variables → Add them in Settings
   - TypeScript errors → Fix locally, push again
   - Dependency issues → Delete `node_modules`, run `npm install`, push

### API Errors in Production:

1. **Check Environment Variables:**
   - Verify all variables are set in Vercel
   - Make sure they're set for Production environment

2. **Check Supabase:**
   - Verify redirect URLs are updated
   - Check Supabase project is active
   - Verify API keys are correct

### Authentication Issues:

1. **Redirect URLs:**
   - Make sure all auth redirect URLs are added in Supabase
   - Include both with and without trailing slash

2. **CORS Issues:**
   - Verify Site URL in Supabase matches your Vercel URL
   - Check that redirect URLs include your Vercel domain

---

## 📝 Files Ready for Deployment

✅ **All source code** is ready
✅ **Configuration files** are correct
✅ **Environment variables** documented
✅ **Build** passes successfully
✅ **.gitignore** excludes sensitive files

---

## 🎯 Quick Reference

**Your Vercel URL will be:** `https://safemed.vercel.app` (or custom name)

**Required Environment Variables:**
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `OPENAI_API_KEY` (or alternative AI provider)

**After Deployment:**
1. Update Supabase redirect URLs
2. Update email templates
3. Test all features
4. Monitor for errors

---

**You're ready to deploy! 🚀**

