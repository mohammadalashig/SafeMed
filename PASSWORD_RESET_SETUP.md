# Password Reset Setup Guide

This guide explains how to configure the password reset flow for SafeMed using Supabase PKCE flow.

## How It Works

1. User requests password reset on `/auth/forgot-password`
2. Supabase sends an email with a reset link
3. User clicks the link which goes directly to `/auth/reset-password` with token
4. The reset password page verifies the token and establishes a session
5. User enters new password and submits
6. Password is updated and user is redirected to login

## Required Configuration in Supabase Dashboard

You need to update the **Reset Password** email template in your Supabase project to use the correct URL format.

### Steps:

1. Go to your Supabase Dashboard: https://app.supabase.com
2. Navigate to: **Authentication** → **Email Templates** → **Reset Password**
3. Copy the HTML from one of the template files in `email-templates/` folder:
   - **`email-templates/reset-password.html`** - Full-featured, styled template (recommended)
   - **`email-templates/reset-password-simple.html`** - Simple, minimal template
4. Paste the HTML into the Supabase email template editor

### Template Files:

The HTML templates are located in the `email-templates/` folder in your project:

- **`reset-password.html`** - Professional, styled template with:
  - Modern design with gradient header
  - Clear call-to-action button
  - Security warnings
  - Fallback text link
  - Responsive layout

- **`reset-password-simple.html`** - Minimal template for quick setup

Both templates use the correct URL format:
```
{{ .SiteURL }}/auth/reset-password?token_hash={{ .TokenHash }}&type=recovery
```

### Important Notes:

- The `token_hash` parameter contains the secure token from Supabase
- The `type=recovery` parameter tells Supabase this is a password reset flow
- The `next=/auth/reset-password` parameter tells our app where to redirect after token exchange
- Make sure `{{ .SiteURL }}/auth/confirm` is included in your **Redirect URLs** list

### Redirect URL Configuration:

1. Go to: **Authentication** → **URL Configuration**
2. Under **Redirect URLs**, make sure you have:
   - `http://localhost:3000/auth/reset-password` (for local development)
   - `https://yourdomain.com/auth/reset-password` (for production)
   - Or use a wildcard: `https://yourdomain.com/auth/*`

## Testing the Flow

1. Go to `/auth/forgot-password`
2. Enter your email address
3. Check your email for the reset link
4. Click the link (should go directly to `/auth/reset-password`)
5. Enter your new password
6. You should be redirected to login

## Troubleshooting

### Link redirects to forgot-password page instead of showing reset form

- Check that the email template uses `/auth/reset-password?token_hash=...&type=recovery` format
- Verify the redirect URL is configured in Supabase dashboard
- Check browser console for errors
- Ensure the token hasn't expired (tokens expire after 1 hour)

### "Invalid or expired reset link" error

- Reset links expire after 1 hour by default
- Request a new reset link
- Check that the email template format is correct

### Token verification fails

- Check that the token_hash parameter is present in the URL
- Verify the type parameter is set to "recovery"
- Ensure Supabase environment variables are set correctly
- Check browser console for detailed error messages

