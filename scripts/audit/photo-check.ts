/**
 * Photo audit + swap module for the pipeline.
 *
 * For each venue:
 * 1. Vision-score the current primary photo (0-10, wedding venue relevance)
 * 2. If score < 6: fetch all available Google Places photos, score each,
 *    pick the best one, update primaryPhotoUrl
 * 3. If no good photo found in Places, flag for manual review
 */

const PLACES_KEY = process.env.GOOGLE_PLACES_API_KEY;
const PHOTO_BASE = "https://places.googleapis.com/v1";

// Extract Place ID from a photo URL
export function extractPlaceId(photoUrl: string): string | null {
  const match = photoUrl.match(/places\/([\w-]+)\/photos/);
  return match ? match[1] : null;
}

// Build a photo media URL from a photo reference name
export function buildPhotoUrl(photoName: string, key: string): string {
  return `${PHOTO_BASE}/${photoName}/media?maxWidthPx=800&key=${key}`;
}

// Fetch all photo references for a Place ID
export async function fetchPlacePhotos(placeId: string): Promise<string[]> {
  if (!PLACES_KEY) throw new Error("GOOGLE_PLACES_API_KEY not set");
  const resp = await fetch(
    `${PHOTO_BASE}/places/${placeId}?fields=photos&key=${PLACES_KEY}`
  );
  if (!resp.ok) throw new Error(`Places API ${resp.status}`);
  const data = await resp.json() as { photos?: Array<{ name: string }> };
  return (data.photos ?? []).map(p => buildPhotoUrl(p.name, PLACES_KEY));
}

// Vision-score a photo for wedding venue relevance using OpenRouter
export async function scorePhoto(
  photoUrl: string,
  venueName: string,
  openrouterKey: string
): Promise<{ score: number; reason: string }> {
  try {
    // Fetch image and convert to base64
    const imgResp = await fetch(photoUrl);
    if (!imgResp.ok) return { score: 0, reason: `fetch failed ${imgResp.status}` };
    const buf = await imgResp.arrayBuffer();
    const b64 = Buffer.from(buf).toString("base64");
    const mimeType = imgResp.headers.get("content-type") ?? "image/jpeg";

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
            {
              type: "image_url",
              image_url: { url: `data:${mimeType};base64,${b64}` },
            },
            {
              type: "text",
              text: `You are reviewing a photo for a wedding venue directory listing for "${venueName}".

Score this photo 0-10 for how appropriate it is as the PRIMARY photo for a wedding venue listing:
- 9-10: Stunning venue space — ballroom, ceremony setup, outdoor garden, elegant event hall, vineyard, reception space
- 7-8: Good venue shot — building exterior, attractive event space, grounds
- 5-6: Acceptable but not ideal — generic landscape, food, basic room
- 3-4: Poor choice — retail storefront, unrelated object, random street scene
- 0-2: Completely wrong — hotel bed, abstract sculpture, product close-up, concert crowd, logo

Return ONLY JSON: {"score": 0-10, "reason": "one sentence describing what the photo shows"}`,
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
    return { score: parsed.score ?? 0, reason: parsed.reason ?? "" };
  } catch (err) {
    return { score: 0, reason: `error: ${String(err).slice(0, 80)}` };
  }
}

// Scrape images from a venue website and return candidate URLs
export async function scrapeWebsitePhotos(websiteUrl: string): Promise<string[]> {
  try {
    // Fetch the HTML
    const resp = await fetch(websiteUrl, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; GreenBowtie/1.0)" },
      signal: AbortSignal.timeout(8000),
    });
    if (!resp.ok) return [];
    const html = await resp.text();

    // Extract all img src and og:image tags
    const urls: string[] = [];
    const base = new URL(websiteUrl);

    // og:image (best candidate — usually a hero shot)
    const ogMatch = html.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/i)
      ?? html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*property=["']og:image["']/i);
    if (ogMatch?.[1]) urls.push(new URL(ogMatch[1], base).href);

    // Large img tags (skip icons/logos — look for gallery/hero images by src path hints)
    const imgRe = /<img[^>]+src=["']([^"']+)["'][^>]*>/gi;
    let m;
    while ((m = imgRe.exec(html)) !== null) {
      const src = m[1];
      if (!src || src.startsWith("data:")) continue;
      // Skip tiny images, icons, logos, social icons
      if (/icon|logo|favicon|sprite|avatar|button|arrow|star|rating/i.test(src)) continue;
      // Prefer paths that look like gallery/venue photos
      if (/gallery|photo|venue|wedding|event|space|hall|room|outdoor|garden|ceremony|reception/i.test(src)) {
        urls.unshift(new URL(src, base).href); // push to front
      } else {
        urls.push(new URL(src, base).href);
      }
    }

    // Dedupe and limit
    return [...new Set(urls)].slice(0, 8);
  } catch {
    return [];
  }
}

// Main: audit and optionally fix a venue's photo
export async function auditAndFixPhoto(
  venue: { id: string; name: string; primaryPhotoUrl: string | null; website?: string | null },
  openrouterKey: string,
  dryRun = false
): Promise<{
  action: "ok" | "swapped" | "no-good-photo" | "no-photo" | "error";
  oldUrl: string | null;
  newUrl: string | null;
  oldScore: number;
  newScore: number;
  reason: string;
}> {
  if (!venue.primaryPhotoUrl) {
    return { action: "no-photo", oldUrl: null, newUrl: null, oldScore: 0, newScore: 0, reason: "no photo URL" };
  }

  // Score current photo
  const current = await scorePhoto(venue.primaryPhotoUrl, venue.name, openrouterKey);

  if (current.score >= 6) {
    return { action: "ok", oldUrl: venue.primaryPhotoUrl, newUrl: null, oldScore: current.score, newScore: current.score, reason: current.reason };
  }

  // Current photo is bad — try to find a better one from Places
  const placeId = extractPlaceId(venue.primaryPhotoUrl);
  if (!placeId) {
    return { action: "no-good-photo", oldUrl: venue.primaryPhotoUrl, newUrl: null, oldScore: current.score, newScore: 0, reason: `bad photo (${current.score}/10): ${current.reason}. No Place ID to fetch alternatives.` };
  }

  let allPhotos: string[] = [];
  try {
    allPhotos = await fetchPlacePhotos(placeId);
  } catch {
    return { action: "error", oldUrl: venue.primaryPhotoUrl, newUrl: null, oldScore: current.score, newScore: 0, reason: "Places API fetch failed" };
  }

  // Remove the current photo from candidates
  const candidates = allPhotos.filter(u => u !== venue.primaryPhotoUrl);

  // Score up to 5 alternates (skip the ones that are clearly bad by checking in batches of 3)
  let bestUrl: string | null = null;
  let bestScore = current.score;
  let bestReason = current.reason;

  for (const url of candidates.slice(0, 6)) {
    const result = await scorePhoto(url, venue.name, openrouterKey);
    if (result.score > bestScore) {
      bestScore = result.score;
      bestUrl = url;
      bestReason = result.reason;
    }
    if (bestScore >= 8) break; // good enough, stop scanning
    await new Promise(r => setTimeout(r, 300));
  }

  if (bestUrl && bestScore > current.score) {
    return {
      action: "swapped",
      oldUrl: venue.primaryPhotoUrl,
      newUrl: bestUrl,
      oldScore: current.score,
      newScore: bestScore,
      reason: `Replaced from Places (${current.score}→${bestScore}/10): ${bestReason}`,
    };
  }

  // Still no good photo from Places — try venue website
  if (venue.website) {
    let websitePhotos: string[] = [];
    try { websitePhotos = await scrapeWebsitePhotos(venue.website); } catch { /* silent */ }

    for (const url of websitePhotos.slice(0, 5)) {
      const result = await scorePhoto(url, venue.name, openrouterKey);
      if (result.score > bestScore) {
        bestScore = result.score;
        bestUrl = url;
        bestReason = result.reason;
      }
      if (bestScore >= 7) break;
      await new Promise(r => setTimeout(r, 200));
    }

    if (bestUrl && bestScore > current.score) {
      return {
        action: "swapped",
        oldUrl: venue.primaryPhotoUrl,
        newUrl: bestUrl,
        oldScore: current.score,
        newScore: bestScore,
        reason: `Replaced from website (${current.score}→${bestScore}/10): ${bestReason}`,
      };
    }
  }

  return {
    action: "no-good-photo",
    oldUrl: venue.primaryPhotoUrl,
    newUrl: null,
    oldScore: current.score,
    newScore: bestScore,
    reason: `All sources weak (Places + website). Best: ${bestScore}/10. Manual review needed.`,
  };
}
