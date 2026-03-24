# Miroko

**Miroko** is a premium, minimalist platform designed specifically for managing production workflows, tasks, and communications between administrators and their network of producers.

Crafted by **Lethal Labs**, this application features a breathtaking, Apple-inspired aesthetic (with flawless dark/light modes, frosted glassmorphism, and responsive micro-animations).

## 🚀 Features

- **Pristine Role-Based Architecture:** Secure layouts uniquely designed for Admins vs Producers.
- **Task Management & Drop-box Integration:** Seamless handling of assignments with public link submission.
- **Internal Messaging Matrix:** Producers can message the Admin securely, while the Admin can globally broadcast or direct message anyone.
- **Transparent Payments & Awards:** Clear tracking of preferred payment channels alongside a Gamified Leaderboard for Daily/Monthly MVPs.
- **Fully Serverless:** Engineered entirely on Next.js 14 App Router and Supabase, enabling $0/month production hosting on Vercel.

## ⚙️ Tech Stack

- **Frontend:** Next.js (App Router), React, Vanilla CSS (Glass UI)
- **Backend & Database:** Supabase (PostgreSQL, Edge Functions)
- **Authentication:** Supabase Auth (SSR Integration)
- **Deployment:** Vercel (Auto-SSL, Global Edge CDN)

## 🛠 Getting Started

### 1. Database Setup
Ensure you have a Supabase project initialized. Execute the SQL definitions found in `supabase/schema.sql` via your Supabase SQL Editor.

### 2. Environment Variables
Copy the `.env.example` into a new `.env.local` file and set the required identifiers:
```env
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### 3. Installation
Install dependencies in your terminal:
```bash
npm install
```

### 4. Running Locally
Start your ultra-fast Turbopack dev server:
```bash
npm run dev
```

## ⚖️ License
Proprietary software structure. Proudly designed and developed by [Lethal Labs](https://github.com/openthot).
