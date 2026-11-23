# Production deploy checklist (Vercel + Supabase)

**Live:** [https://sabra-life.vercel.app](https://sabra-life.vercel.app)  
**Team aliases:** [https://sabra-life-ianbess-projects.vercel.app](https://sabra-life-ianbess-projects.vercel.app)  
**Dashboard:** [vercel.com/ianbess-projects/sabra-life](https://vercel.com/ianbess-projects/sabra-life)

The first production build is already up. It runs fully offline in the browser (`רק במכשיר`). Cloud save, login, and the leaderboard stay off until you add a dedicated Supabase project and rebuild.

## What is already done

- Vercel project `sabra-life` (Next.js, Node 22, public — no Vercel Authentication gate)
- Production deployment serving the Hebrew dashboard, map, and Yad2 shop
- App Router RTL (`lang="he"` `dir="rtl"`) and a dynamic `/auth/callback` route ready for magic links

This deploy was a file upload, not a Git integration. Pushes to Origin will not auto-deploy until you connect Origin (or GitHub) in the Vercel team's Git settings and link the repo.

## Cloud save (do this next)

1. **Create a new production Supabase project.** Do not reuse another app's keys.
2. **Run the schema.** In that project's SQL Editor, paste and run [`supabase/migrations/0001_initial_schema.sql`](supabase/migrations/0001_initial_schema.sql).
3. **Add env vars on Vercel**, then **redeploy** so Next.js can inline them at build time:

   | Name | Value |
   |---|---|
   | `NEXT_PUBLIC_SUPABASE_URL` | Project URL from Supabase **Project Settings → API** |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `anon` / publishable key from the same page |

   Vercel → `sabra-life` → **Settings → Environment Variables**. Target **Production** (and Preview if you want cloud save on preview URLs). After saving, **Deployments → … → Redeploy**.

4. **Point Supabase Auth at the live domain.** Authentication → URL Configuration:

   - **Site URL:** `https://sabra-life.vercel.app`
   - **Redirect URLs:** `https://sabra-life.vercel.app/auth/callback`

   If you also use the team alias, add `https://sabra-life-ianbess-projects.vercel.app/auth/callback`.

5. Sign up once on the live site. The HUD should switch from **רק במכשיר** to **נשמר** after a successful save.

## Auto-deploys on git push (optional)

In the Vercel dashboard for this team: **Settings → Git**, connect **Cursor Origin** (or GitHub if you push a GitHub copy). Then link the Sabra Life repository to project `sabra-life` so `main` builds on every push.

Until that link exists, a new production build has to be a dashboard redeploy or another file deployment.
