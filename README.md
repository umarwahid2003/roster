# Course Reminders (v1)

Track deadlines for your courses, see them on a clean dashboard, and get a browser
push notification 24 hours and 1 hour before something is due.

## How it works

- You (the admin) add deadlines on the `/admin` page.
- Classmates sign in, join their courses on `/courses`, and turn on reminders.
- A background job checks every ~15 minutes for anything due soon and sends a push
  notification to everyone subscribed in that course.

## One-time setup

### 1. Run the database schema
In your Supabase project: **SQL Editor → New query**, paste the contents of
`supabase/schema.sql`, and click **Run**. This creates all the tables, locks them
down with row-level security, and adds your 3 courses.

### 2. Make yourself an admin
- Run the app locally (see below) and sign in once with your own email.
- In Supabase: **Table Editor → profiles**, find your row, change `role` from
  `student` to `admin`.

### 3. Generate VAPID keys (for push notifications)
In this project folder, run:
```
npx web-push generate-vapid-keys
```
This prints a public key and a private key. You'll use both below.

### 4. Fill in your environment variables
Copy `.env.local.example` to a new file called `.env.local` and fill in:

| Variable | Where to find it |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Project Settings → Data API → Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → Project Settings → API Keys → Publishable key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Project Settings → API Keys → Secret key (keep this private, never in frontend code) |
| `NEXT_PUBLIC_VAPID_PUBLIC_KEY` | from step 3 |
| `VAPID_PRIVATE_KEY` | from step 3 |
| `CRON_SECRET` | make up any random string yourself, e.g. `openssl rand -hex 16` |

## Run it locally
```
npm install
npm run dev
```
Visit http://localhost:3000 — sign in with your email, you'll get a magic link
in your inbox.

To test the reminder job without waiting hours, add a schedule item due ~1 hour
from now, then manually visit (with your real CRON_SECRET):
```
curl -H "Authorization: Bearer YOUR_CRON_SECRET" http://localhost:3000/api/cron/send-reminders
```

## Deploy
1. Push this folder to a **private** GitHub repo.
2. Import that repo into Vercel.
3. In Vercel's project settings, add every variable from your `.env.local`.
4. Vercel will pick up the cron job in `vercel.json` automatically. If your plan's
   free tier doesn't allow 15-minute crons, use a free external pinger like
   cron-job.org instead, hitting:
   `https://your-app.vercel.app/api/cron/send-reminders`
   every 15 minutes with header `Authorization: Bearer YOUR_CRON_SECRET`.

## Known limitations (intentional, for v1)
- iPhone users must "Add to Home Screen" first — Safari won't deliver push
  notifications to a plain browser tab.
- Only admins can add schedule items — that's you, for now, on purpose.
- No calendar view, just a sorted list grouped by "this week" / "later".

These are deliberate cuts to get something real in front of classmates quickly,
not oversights. Scaling decisions (more admins, more courses, other notification
channels) come later, on purpose, once this version proves useful.
