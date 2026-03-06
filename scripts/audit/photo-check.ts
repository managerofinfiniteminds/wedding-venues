/**
 * Photo audit + swap module for the pipeline.
 *
 * Priority order for photos:
 * 1. Venue website (og:image + wedding/gallery/event image paths)
 * 2. Google Places photos (fallback only — random quality)
 *
 * For each venue:
 * 1. Vision-score the current primary photo (0-10, wedding venue relevance)
 * 2. If score < 7: try website photos first, then Places as fallback
 * 3. Pick the highest-scoring replacement
 */

const PLACES_KEY = process.env.GOOGLE_PLACES_API_KEY;
const PHOTO_BASE = "https://places.googleapis.com/v1";

// Extract Place ID from a Google Places photo URL
export function extractPlaceId(photoUrl: string): string | null {
  const match = photoUrl.match(/places\/([\w-]+)\/photos/);
  return match ? match[1] : null;
}

// Build a Places photo media URL from a photo reference name
export function buildPhotoUrl(photoName: string, key: string): string {
  return `${PHOTO_BASE}/${photoName}/media?maxWidthPx=800&key=${key}`;
}

// Fetch all photo references for a Place ID (Places fallback)
export async function fetchPlacePhotos(placeId: string): Promise<string[]> {
  if (!PLACES_KEY) return [];
  try {
    const resp = await fetch(
      `${PHOTO_BASE}/places/${placeId}?fields=photos&key=${PLACES_KEY}`
    );
    if (!resp.ok) return [];
    const data = await resp.json() as { photos?: Array<{ name: string }> };
    return (data.photos ?? []).map(p => buildPhotoUrl(p.name, PLACES_KEY!));
  } catch {
    return [];
  }
}

// Scrape images from a venue website — prioritize wedding/gallery/event paths
export async function scrapeWebsitePhotos(websiteUrl: string): Promise<string[]> {
  try {
    const resp = await fetch(websiteUrl, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; GreenBowtie/1.0)" },
      signal: AbortSignal.timeout(8000),
    });
    if (!resp.ok) return [];
    const html = await resp.text();
    const base = new URL(websiteUrl);
    const urls: string[] = [];

    // og:image — usually the hero/marketing shot, best candidate
    const ogMatch =
      html.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/i) ??
      html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*property=["']og:image["']/i);
    if (ogMatch?.[1] && !ogMatch[1].startsWith("data:")) {
      try { urls.push(new URL(ogMatch[1], base).href); } catch { /* skip bad URLs */ }
    }

    // Also try the weddings/events subpage for a better hero
    const weddingPageMatch = html.match(/href=["']([^"']*(?:wedding|event|venue)[^"']*)["']/i);
    if (weddingPageMatch?.[1]) {
      try {
        const weddingUrl = new URL(weddingPageMatch[1], base).href;
        if (weddingUrl.startsWith(base.origin)) {
          const wr = await fetch(weddingUrl, {
            headers: { "User-Agent": "Mozilla/5.0" },
            signal: AbortSignal.timeout(6000),
          });
          if (wr.ok) {
            const wh = await wr.text();
            const wog =
              wh.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/i) ??
              wh.match(/<meta[^>]*content=["']([^"']+)["'][^>]*property=["']og:image["']/i);
            if (wog?.[1]) {
              try { urls.unshift(new URL(wog[1], base).href); } catch { /* skip */ }
            }
          }
        }
      } catch { /* sub-page fetch failed, continue */ }
    }

    // img src paths that look like gallery/venue shots
    const imgRe = /<img[^>]+src=["']([^"']+)["'][^>]*>/gi;
    let m;
    while ((m = imgRe.exec(html)) !== null) {
      const src = m[1];
      if (!src || src.startsWith("data:")) continue;
      if (/icon|logo|favicon|sprite|avatar|button|arrow|star|rating|thumb/i.test(src)) continue;
      try {
        const full = new URL(src, base).href;
        if (/gallery|photo|venue|wedding|event|space|hall|room|outdoor|garden|ceremony|reception/i.test(src)) {
          urls.splice(1, 0, full); // insert after og:image
        } else {
          urls.push(full);
        }
      } catch { /* skip */ }
    }

    return [...new Set(urls)].slice(0, 10);
  } catch {
    return [];
  }
}

// Vision-score a photo for wedding venue relevance using Gemini Flash
export async function scorePhoto(
  photoUrl: string,
  venueName: string,
  openrouterKey: string
): Promise<{ score: number; reason: string }> {
  try {
    const imgResp = await fetch(photoUrl, { signal: AbortSignal.timeout(10000) });
    if (!imgResp.ok) return { score: 0, reason: `fetch failed ${imgResp.status}` };
    const buf = await imgResp.arrayBuffer();
    const b64 = Buffer.from(buf).toString("base64");
    const mimeType = imgResp.headers.get("content-type") ?? "image/jpeg";
    if (!mimeType.startsWith("image/")) return { score: 0, reason: "not an image" };

    const resp = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${openrouterKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://greenbowtie.com",
        "X-Title": "Green Bowtie Photo Audit",
      },
      body: JSON.stringify({
        model: "google/gemini-2.0-flash-001",
        messages: [{
          role: "user",
          content: [
            { type: "image_url", image_url: { url: `data:${mimeType};base64,${b64}` } },
            {
              type: "text",
              text: `Rate this photo as the primary listing image for wedding venue "${venueName}".

Score 0-10:
9-10: Stunning — ceremony setup, ballroom, vineyard lawn, reception hall, outdoor garden with decor
7-8: Good — attractive building exterior, event space, grounds, patio setup
5-6: Acceptable — generic landscape, food, basic interior room
3-4: Poor — retail storefront, unrelated object, street scene, abstract art
0-2: Wrong — hotel bed, conference room, product shot, concert crowd, logo, screenshot

Return ONLY JSON: {"score":0-10,"reason":"one sentence describing what the photo shows"}`,
            },
          ],
        }],
        max_tokens: 100,
        temperature: 0,
      }),
    });

    if (!resp.ok) throw new Error(`Vision API ${resp.status}`);
    const data = await resp.json() as { choices?: Array<{ message: { content: string } }> };
    const raw = (data.choices?.[0]?.message?.content ?? "")
      .replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    const parsed = JSON.parse(raw) as { score: number; reason: string };
    return { score: Number(parsed.score) ?? 0, reason: parsed.reason ?? "" };
  } catch (err) {
    return { score: 0, reason: `error: ${String(err).slice(0, 80)}` };
  }
}

// Main: audit and fix a venue's photo
// Priority: website → Google Places → flag for manual review
export async function auditAndFixPhoto(
  venue: { id: string; name: string; primaryPhotoUrl: string | null; website?: string | null },
  openrouterKey: string,
  forceRescan = false  // re-check even if current photo scores OK
): Promise<{
  action: "ok" | "swapped" | "no-good-photo" | "no-photo" | "error";
  source: "website" | "places" | "existing" | "none";
  oldUrl: string | null;
  newUrl: string | null;
  oldScore: number;
  newScore: number;
  reason: string;
}> {
  // Score current photo
  let currentScore = 0;
  let currentReason = "no photo";

  if (venue.primaryPhotoUrl) {
    const current = await scorePhoto(venue.primaryPhotoUrl, venue.name, openrouterKey);
    currentScore = current.score;
    currentReason = current.reason;

    // If already good and not forcing rescan, leave it
    if (currentScore >= 7 && !forceRescan) {
      return { action: "ok", source: "existing", oldUrl: venue.primaryPhotoUrl, newUrl: null, oldScore: currentScore, newScore: currentScore, reason: currentReason };
    }
  }

  let bestUrl: string | null = null;
  let bestScore = currentScore;
  let bestReason = currentReason;
  let bestSource: "website" | "places" | "existing" | "none" = "none";

  // ── 1. Try website first ─────────────────────────────────────────────────
  if (venue.website) {
    const websitePhotos = await scrapeWebsitePhotos(venue.website);
    for (const url of websitePhotos.slice(0, 6)) {
      if (url === venue.primaryPhotoUrl) continue;
      const result = await scorePhoto(url, venue.name, openrouterKey);
      if (result.score > bestScore) {
        bestScore = result.score;
        bestUrl = url;
        bestReason = result.reason;
        bestSource = "website";
      }
      if (bestScore >= 8) break; // good enough
      await new Promise(r => setTimeout(r, 200));
    }
  }

  // ── 2. Fallback to Google Places only if website didn't get us to 7 ──────
  if (bestScore < 7 && venue.primaryPhotoUrl) {
    const placeId = extractPlaceId(venue.primaryPhotoUrl);
    if (placeId) {
      const placePhotos = await fetchPlacePhotos(placeId);
      for (const url of placePhotos.slice(0, 6)) {
        if (url === venue.primaryPhotoUrl) continue;
        const result = await scorePhoto(url, venue.name, openrouterKey);
        if (result.score > bestScore) {
          bestScore = result.score;
          bestUrl = url;
          bestReason = result.reason;
          bestSource = "places";
        }
        if (bestScore >= 7) break;
        await new Promise(r => setTimeout(r, 300));
      }
    }
  }

  // ── Result ────────────────────────────────────────────────────────────────
  if (bestUrl && bestScore > currentScore) {
    return {
      action: "swapped",
      source: bestSource,
      oldUrl: venue.primaryPhotoUrl,
      newUrl: bestUrl,
      oldScore: currentScore,
      newScore: bestScore,
      reason: `[${bestSource}] ${currentScore}→${bestScore}/10: ${bestReason}`,
    };
  }

  if (bestScore >= 7) {
    // Current photo is fine (we didn't find better, but it's already good)
    return { action: "ok", source: "existing", oldUrl: venue.primaryPhotoUrl, newUrl: null, oldScore: currentScore, newScore: currentScore, reason: currentReason };
  }

  return {
    action: "no-good-photo",
    source: "none",
    oldUrl: venue.primaryPhotoUrl,
    newUrl: null,
    oldScore: currentScore,
    newScore: bestScore,
    reason: `All sources weak. Best: ${bestScore}/10. ${bestReason}`,
  };
}
