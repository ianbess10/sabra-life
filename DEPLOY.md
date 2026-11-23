# Production deploy checklist (Vercel + Supabase)

**Live:** [https://sabra-life.vercel.app](https://sabra-life.vercel.app)  
**Team aliases:** [https://sabra-life-ianbess-projects.vercel.app](https://sabra-life-ianbess-projects.vercel.app)  
**Dashboard:** [vercel.com/ianbess-projects/sabra-life](https://vercel.com/ianbess-projects/sabra-life)

The first production build is already up. It runs fully offline in the browser (`רק במכשיר`). Cloud save, login, and the leaderboard stay off until you add a dedicated Supabase project and rebuild.

## What is already done

- Vercel project `sabra-life` (Next.js, Node 22, public — no Vercel Authentication gate)
- Production deployment serving the Hebrew dashboard, map, and Yad2 shop
- App Router RTL (`lang="he"` `dir="rtl"`) and a dynamic `/auth/callback` route ready for magic links

This deploy was a file upload, not a Git integration.

### Git auto-deploys

The Vercel team `ianbess-projects` is **Hobby**. [Vercel for Origin](https://vercel.com/docs/git/vercel-for-origin) is Pro/Enterprise only, and Origin repos are private, so Origin cannot be connected here. GitHub is already installed on the team as **ianbess10**.

To turn on push-to-deploy:

1. Create an empty private GitHub repo named `sabra-life` under `ianbess10` (no README, gitignore, or license): [github.com/new](https://github.com/new).
2. If the Vercel GitHub App is limited to selected repositories, add `sabra-life` at [github.com/settings/installations](https://github.com/settings/installations).
3. Tell the agent — it will push `main` and link that repo to the existing `sabra-life` Vercel project.

Until that repo exists, a new production build has to be a dashboard redeploy or another file deployment.

To use Origin (`ianbess/sabra`) instead of GitHub, upgrade the Vercel team to Pro, then **New Project → Continue with Origin**, or install Vercel from [cursor.com/codebase/settings/apps](https://cursor.com/codebase/settings/apps).

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
