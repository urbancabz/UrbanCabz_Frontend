# 🚖 Urban Cabz - Project Handover Document

This document contains critical information for maintaining and scaling the Urban Cabz application.

## 🚀 Deployment Overview
- **Frontend:** Vercel (https://www.urbancabz.com/)
- **Backend:** Render (https://urbancabz-backend.onrender.com)
- **Database:** Supabase (PostgreSQL)

## 🛠 Maintenance & Reliability Fixes

### 1. Preventing Server "Sleep" (Cold Starts)
Render's free tier puts the server to sleep after 15 minutes of inactivity. 
- **Current Solution:** A cron job/ping script is set up to ping the backend every 10 minutes.
- **Recommended Upgrade:** Move the backend to Render's **Starter Plan ($7/mo)** to eliminate cold starts and improve response times for customers.

### 2. Database Connection Pooling (CRITICAL)
Our tests showed that the server can crash if multiple users book a ride at the same time. This is due to Prisma exhausting Supabase's connection limit.
- **Action Required:** 
  1. Go to your **Supabase Dashboard** -> Settings -> Database.
  2. Copy the **Connection String** for **Transaction Mode** (Port 6543).
  3. In your **Render Dashboard**, update the `DATABASE_URL` environment variable to use this pooling string.
  4. Append `?pgbouncer=true` to the end of the URL.

### 3. Scaling for More Users
- **Free Tier Limit:** ~5-10 concurrent users.
- **Production Limit:** With Connection Pooling enabled, the site should handle **50+ concurrent users** without issue.

## 🔑 Administrative Credentials
- **Admin Email:** `urbancabz03@gmail.com`
- **Admin Password:** `Urbancabz@03`
- **B2B Test User:** `kkarm664@gmail.com` / `#Karm2003`

## 📦 Local Development
1. Clone the repository.
2. Run `npm install`.
3. Create a `.env` file with `VITE_API_BASE_URL=https://urbancabz-backend.onrender.com/api/v1`.
4. Run `npm run dev`.

---
*Prepared by Gemini CLI for Urban Cabz Handover.*
