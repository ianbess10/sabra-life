# Production deploy checklist (Vercel + Supabase)

Do this after the production Supabase project exists and you have run [`supabase/migrations/0001_initial_schema.sql`](supabase/migrations/0001_initial_schema.sql) in its SQL Editor.

1. **Push the code to a GitHub repository.**  
   Create a GitHub repo (or use the one this project already tracks), then push `main`:

   ```bash
   git remote add origin https://github.com/<you>/<repo>.git   # skip if origin already exists
   git push -u origin main
   ```

2. **Create a Vercel project and link the repository.**  
   In the [Vercel dashboard](https://vercel.com/new), import the GitHub repo. Framework preset: **Next.js**. Leave the build command as `next build` and the output directory as `.next`.

3. **Add production Supabase env vars before the first build.**  
   Vercel → Project → **Settings → Environment Variables**. Add both for Production (and Preview if you want cloud save on preview URLs):

   | Name | Value |
   |---|---|
   | `NEXT_PUBLIC_SUPABASE_URL` | Project URL from Supabase **Project Settings → API** |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `anon` / publishable key from the same page |

   Next.js inlines `NEXT_PUBLIC_*` at **build** time. Set these before you click Deploy, then rebuild if you add them later.

4. **Deploy.**  
   Click **Deploy** in the Vercel import flow, or push to `main` if Git deployments are already connected. Confirm the production URL in the Vercel project **Domains** tab (for example `https://<project>.vercel.app`).

5. **Point Supabase Auth at the Vercel domain.**  
   In the production Supabase dashboard: **Authentication → URL Configuration**.

   - **Site URL:** `https://<your-vercel-domain>` (the production domain from step 4).  
     OAuth and password-reset links use this.
   - **Redirect URLs:** add `https://<your-vercel-domain>/auth/callback` so email confirmation and magic links can return to the app.

   Save, then sign up once on the live site to confirm the confirmation email lands back on Vercel.
