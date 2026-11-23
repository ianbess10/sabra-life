# Production deploy checklist (Vercel + Supabase)

**Live:** [https://sabra-life.vercel.app](https://sabra-life.vercel.app)  
**Team aliases:** [https://sabra-life-ianbess-projects.vercel.app](https://sabra-life-ianbess-projects.vercel.app)  
**Dashboard:** [vercel.com/ianbess-projects/sabra-life](https://vercel.com/ianbess-projects/sabra-life)

The first production build is already up. It runs fully offline in the browser (`רק במכשיר`). Cloud save, login, and the leaderboard stay off until you add a dedicated Supabase project and rebuild.

## What is already done

- Vercel project `sabra-life` (Next.js, Node 22, public — no Vercel Authentication gate)
- Production deployment serving the Hebrew dashboard, map, and Yad2 shop
- App Router RTL (`lang="he"` `dir="rtl"`) and a dynamic `/auth/callback` route ready for magic links

The public URL currently serves a GitHub-backed production build of `main` (`e0f118a`). Push-to-deploy is wired on a second Vercel project because MCP cannot attach Git to an existing same-name project.

### Git auto-deploys

Source: [github.com/ianbess10/sabra-life](https://github.com/ianbess10/sabra-life) (`main`).

| URL | Vercel project | Git |
|---|---|---|
| [sabra-life.vercel.app](https://sabra-life.vercel.app) | `sabra-life` (`prj_RdKsJKfgHwwuHj3Yp456QCrwuL5O`) | Latest `main` is deployed; new pushes do **not** rebuild this URL |
| [sabra-life-git.vercel.app](https://sabra-life-git.vercel.app) | `sabra-life-git` (`prj_lVugVQwVLOBgsXDsnRtv8ng3Bpel`) | Linked to `ianbess10/sabra-life`. Every push to `main` rebuilds this URL |

The Vercel team `ianbess-projects` is **Hobby**. [Vercel for Origin](https://vercel.com/docs/git/vercel-for-origin) is Pro/Enterprise only, so Origin (`ianbess/sabra`) cannot be the Git provider here.

To make **sabra-life.vercel.app** itself rebuild on push, open [vercel.com/ianbess-projects/sabra-life/settings/git](https://vercel.com/ianbess-projects/sabra-life/settings/git) → **Connect Git Repository** → `ianbess10/sabra-life`. After that, `sabra-life-git` is redundant and can be deleted.

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
