export const E2E_SUPABASE_URL = "https://sabra-e2e.supabase.co"
export const E2E_USER_ID = "11111111-1111-4111-8111-111111111111"
export const E2E_EMAIL = "oleh@example.com"
export const E2E_PASSWORD = "password123"

const CORS = {
  "access-control-allow-origin": "*",
  "access-control-allow-headers": "*",
  "access-control-allow-methods": "*",
  "access-control-expose-headers": "*",
}

function encodeJwt(payload) {
  const header = Buffer.from(JSON.stringify({ alg: "none", typ: "JWT" })).toString(
    "base64url"
  )
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url")
  return `${header}.${body}.e2e`
}

export function makeUser(overrides = {}) {
  const now = new Date().toISOString()
  return {
    id: E2E_USER_ID,
    aud: "authenticated",
    role: "authenticated",
    email: E2E_EMAIL,
    email_confirmed_at: now,
    phone: "",
    confirmed_at: now,
    last_sign_in_at: now,
    app_metadata: { provider: "email", providers: ["email"] },
    user_metadata: { username: "oleh" },
    identities: [],
    created_at: now,
    updated_at: now,
    ...overrides,
  }
}

export function makeSession(user = makeUser()) {
  const exp = Math.floor(Date.now() / 1000) + 3600
  const access_token = encodeJwt({
    sub: user.id,
    email: user.email,
    role: "authenticated",
    aud: "authenticated",
    exp,
  })
  return {
    access_token,
    token_type: "bearer",
    expires_in: 3600,
    expires_at: exp,
    refresh_token: "e2e-refresh",
    user,
  }
}

export function defaultProfile(overrides = {}) {
  return {
    id: E2E_USER_ID,
    username: "oleh",
    shekels: 200,
    xp: 0,
    location: "tel-aviv",
    completed_missions: [],
    current_streak: 0,
    longest_streak: 0,
    last_mission_date: null,
    updated_at: new Date().toISOString(),
    ...overrides,
  }
}

export function defaultInventory(overrides = {}) {
  return {
    user_id: E2E_USER_ID,
    vehicle: null,
    property: null,
    phone: "basic",
    dining: "street",
    updated_at: new Date().toISOString(),
    ...overrides,
  }
}

function json(route, status, body) {
  return route.fulfill({
    status,
    contentType: "application/json",
    headers: CORS,
    body: JSON.stringify(body),
  })
}

function empty(route, status = 204) {
  return route.fulfill({ status, headers: CORS, body: "" })
}

/**
 * Intercept every call to the fake Supabase host so tests never touch a real project.
 * Mutate `mock.profile` / `mock.inventory` / `mock.session` to change later responses.
 */
export async function mockSupabase(page, options = {}) {
  const user = options.user ?? makeUser()
  const mock = {
    user,
    session: options.session === true ? makeSession(user) : (options.session ?? null),
    profile: defaultProfile(options.profile),
    inventory: defaultInventory(options.inventory),
    writes: [],
  }

  await page.route("https://sabra-e2e.supabase.co/**", async (route) => {
    const request = route.request()
    const url = new URL(request.url())
    const path = url.pathname
    const method = request.method()

    if (method === "OPTIONS") {
      await empty(route, 204)
      return
    }

    if (path.startsWith("/auth/v1/signup") && method === "POST") {
      const body = request.postDataJSON() ?? {}
      mock.user = makeUser({ email: body.email ?? E2E_EMAIL })
      mock.session = makeSession(mock.user)
      mock.profile = defaultProfile({ id: mock.user.id, username: body.email?.split("@")[0] })
      mock.inventory = defaultInventory({ user_id: mock.user.id })
      await json(route, 200, mock.session)
      return
    }

    if (path.startsWith("/auth/v1/token") && method === "POST") {
      const grant = url.searchParams.get("grant_type")
      const body = request.postDataJSON() ?? {}
      if (grant === "password") {
        mock.user = makeUser({ email: body.email ?? E2E_EMAIL })
        mock.session = makeSession(mock.user)
        await json(route, 200, mock.session)
        return
      }
      if (grant === "refresh_token" && mock.session) {
        mock.session = makeSession(mock.user)
        await json(route, 200, mock.session)
        return
      }
      await json(route, 400, { error: "invalid_grant", error_description: "Invalid login" })
      return
    }

    if (path.startsWith("/auth/v1/user") && method === "GET") {
      if (!mock.session) {
        await json(route, 401, { message: "Unauthorized" })
        return
      }
      await json(route, 200, mock.user)
      return
    }

    if (path.startsWith("/auth/v1/logout")) {
      mock.session = null
      await empty(route, 204)
      return
    }

    if (path.startsWith("/auth/v1/")) {
      await json(route, 200, {})
      return
    }

    if (path.startsWith("/rest/v1/profiles")) {
      if (method === "GET") {
        if (!mock.profile) {
          await json(route, 200, [])
          return
        }
        await json(route, 200, [mock.profile])
        return
      }
      if (method === "POST" || method === "PATCH" || method === "PUT") {
        const body = request.postDataJSON() ?? {}
        const row = Array.isArray(body) ? body[0] : body
        mock.profile = { ...mock.profile, ...row, updated_at: new Date().toISOString() }
        mock.writes.push({ table: "profiles", method, row: mock.profile })
        await json(route, 201, mock.profile)
        return
      }
    }

    if (path.startsWith("/rest/v1/inventory")) {
      if (method === "GET") {
        await json(route, 200, mock.inventory ? [mock.inventory] : [])
        return
      }
      if (method === "POST" || method === "PATCH" || method === "PUT") {
        const body = request.postDataJSON() ?? {}
        const row = Array.isArray(body) ? body[0] : body
        mock.inventory = { ...mock.inventory, ...row, updated_at: new Date().toISOString() }
        mock.writes.push({ table: "inventory", method, row: mock.inventory })
        await json(route, 201, mock.inventory)
        return
      }
    }

    if (path.startsWith("/rest/v1/")) {
      await json(route, 200, [])
      return
    }

    await json(route, 200, {})
  })

  return mock
}
