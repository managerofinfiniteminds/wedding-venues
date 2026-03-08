/**
 * Klaviyo integration — list management & subscriber sync
 *
 * Lists:
 *   - "Couples" — people planning weddings (signup from site)
 *   - "Venue Owners" — venue owners who claim/interact with listings
 *
 * Usage:
 *   subscribeCouple({ email, firstName?, lastName?, weddingDate?, city?, state? })
 *   subscribeVenueOwner({ email, firstName?, lastName?, venueName?, city?, state? })
 */

const API_KEY = process.env.KLAVIYO_API_KEY;
const BASE = "https://a.klaviyo.com/api";

// List IDs — created on first use via ensureList()
// After first deploy, hard-code these for performance
let coupleListId: string | null = null;
let venueOwnerListId: string | null = null;

const COUPLES_LIST_NAME = "Couples";
const VENUE_OWNERS_LIST_NAME = "Venue Owners";

async function klaviyoFetch(path: string, options: RequestInit = {}) {
  if (!API_KEY) throw new Error("KLAVIYO_API_KEY not set");
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: {
      "Authorization": `Klaviyo-API-Key ${API_KEY}`,
      "Content-Type": "application/json",
      "revision": "2024-10-15",
      ...(options.headers ?? {}),
    },
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Klaviyo API error ${res.status}: ${body}`);
  }
  // 204 No Content
  if (res.status === 204) return null;
  return res.json();
}

async function getLists(): Promise<Array<{ id: string; attributes: { name: string } }>> {
  const data = await klaviyoFetch("/lists/");
  return data?.data ?? [];
}

async function createList(name: string): Promise<string> {
  const data = await klaviyoFetch("/lists/", {
    method: "POST",
    body: JSON.stringify({ data: { type: "list", attributes: { name } } }),
  });
  return data.data.id;
}

async function ensureList(name: string, cachedId: string | null): Promise<string> {
  if (cachedId) return cachedId;
  const lists = await getLists();
  const existing = lists.find((l) => l.attributes.name === name);
  if (existing) return existing.id;
  return createList(name);
}

async function upsertProfile(properties: Record<string, unknown>): Promise<string> {
  const data = await klaviyoFetch("/profiles/", {
    method: "POST",
    body: JSON.stringify({
      data: {
        type: "profile",
        attributes: properties,
      },
    }),
  });
  return data.data.id;
}

async function addProfilesToList(listId: string, profileIds: string[]): Promise<void> {
  await klaviyoFetch(`/lists/${listId}/relationships/profiles/`, {
    method: "POST",
    body: JSON.stringify({
      data: profileIds.map((id) => ({ type: "profile", id })),
    }),
  });
}

async function subscribeToList(listId: string, email: string, properties: Record<string, unknown> = {}): Promise<void> {
  await klaviyoFetch("/profile-subscription-bulk-create-jobs/", {
    method: "POST",
    body: JSON.stringify({
      data: {
        type: "profile-subscription-bulk-create-job",
        attributes: {
          list_id: listId,
          subscriptions: [
            {
              channels: { email: ["MARKETING"] },
              profile: {
                data: {
                  type: "profile",
                  attributes: { email, ...properties },
                },
              },
            },
          ],
        },
      },
    }),
  });
}

// ─── Public API ──────────────────────────────────────────────────────────────

export async function subscribeCouple({
  email,
  firstName,
  lastName,
  weddingDate,
  city,
  state,
}: {
  email: string;
  firstName?: string;
  lastName?: string;
  weddingDate?: string;
  city?: string;
  state?: string;
}) {
  if (!API_KEY) { console.warn("[klaviyo] KLAVIYO_API_KEY not set — skipping"); return; }
  try {
    coupleListId = await ensureList(COUPLES_LIST_NAME, coupleListId);
    await subscribeToList(coupleListId, email, {
      ...(firstName && { first_name: firstName }),
      ...(lastName && { last_name: lastName }),
      ...(weddingDate && { properties: { wedding_date: weddingDate } }),
      ...(city && { location: { city, region: state } }),
    });
    console.log(`[klaviyo] Subscribed couple: ${email}`);
  } catch (err) {
    console.error("[klaviyo] subscribeCouple error:", err);
    // Don't throw — email signup failure should never break the main flow
  }
}

export async function subscribeVenueOwner({
  email,
  firstName,
  lastName,
  venueName,
  city,
  state,
}: {
  email: string;
  firstName?: string;
  lastName?: string;
  venueName?: string;
  city?: string;
  state?: string;
}) {
  if (!API_KEY) { console.warn("[klaviyo] KLAVIYO_API_KEY not set — skipping"); return; }
  try {
    venueOwnerListId = await ensureList(VENUE_OWNERS_LIST_NAME, venueOwnerListId);
    await subscribeToList(venueOwnerListId, email, {
      ...(firstName && { first_name: firstName }),
      ...(lastName && { last_name: lastName }),
      ...(venueName && { organization: venueName }),
      ...(city && { location: { city, region: state } }),
    });
    console.log(`[klaviyo] Subscribed venue owner: ${email}`);
  } catch (err) {
    console.error("[klaviyo] subscribeVenueOwner error:", err);
  }
}
