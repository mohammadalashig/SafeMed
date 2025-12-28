# SafeMed - Medication Safety Platform

A production-ready medication safety platform that prevents dangerous drug interactions through AI-powered barcode scanning, intelligent drug recognition, and personalized medication management.

## Features

- 🔐 **Authentication System** - Secure email/password authentication (email confirmation disabled for development)
- 📷 **Advanced Barcode Scanner** - Camera-based scanning with multiple format support
- 🤖 **AI Medication Analysis** - AI-powered medication analysis with Turkish equivalency matching
- 📊 **Dashboard** - Comprehensive medication management dashboard
- 📜 **Medication History** - Track and manage your medication history
- ⏰ **Medication Schedule** - Set up reminders and manage medication schedules
- ⚙️ **Settings** - Comprehensive settings and preferences management

## Technology Stack

- **Next.js** 16.0.4 (App Router)
- **React** 19.2.0
- **TypeScript** ^5
- **Tailwind CSS** ^4
- **Supabase** - Backend and database
- **Framer Motion** - Animations
- **html5-qrcode** - Barcode scanning
- **Zod** - Validation

## Getting Started

### Prerequisites

- Node.js 18+
- Supabase account
- At least one AI provider API key (OpenAI, Google AI, or Anthropic)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd SafeMed
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.local.example .env.local
```

Edit `.env.local` and add your:
- Supabase URL and keys
- At least one AI provider API key

4. Set up the database:
- Database schema is automatically created via migrations
- Profile auto-creation is configured via trigger
- RLS policies are included in migrations

5. Configure Supabase Auth:
- Go to Supabase Dashboard → Authentication → Providers → Email
- **Disable "Confirm email"** (currently disabled for faster development)
- Users can sign up and login immediately without email verification

5. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Database Schema

The application requires the following tables:
- `profiles`
- `medications`
- `fda_medications`
- `clinical_interactions`
- `user_medications`
- `drug_allergies`
- `medication_reminders`
- `audit_logs`
- `user_settings`

See the project documentation for the complete SQL schema.

## Environment Variables

Required environment variables:
- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Your Supabase anonymous key
- `SUPABASE_SERVICE_ROLE_KEY` - Your Supabase service role key
- At least one AI provider key:
  - `OPENAI_API_KEY` - OpenAI API key
  - `GOOGLE_AI_API_KEY` - Google AI API key
  - `ANTHROPIC_API_KEY` - Anthropic API key

## Project Structure

```
src/
├── app/              # Next.js app router pages
├── components/       # React components
├── lib/              # Utility functions and helpers
├── contexts/         # React contexts
└── middleware.ts     # Route protection middleware
```

## Design System

The application uses a dark theme with:
- **Electric Blue** (#00a3ff) - Primary accent color
- **Champion Gold** (#fbbf24) - Secondary accent color
- **Glass Morphism** - Modern UI effects
- **Smooth Animations** - Framer Motion powered

## License

MIT

