import { AuditFlag } from "./types";

// ── Wedding relevance keywords ─────────────────────────────────────────────
const WEDDING_POSITIVE = [
  "wedding", "weddings", "bridal", "bride", "groom", "ceremony", "reception",
  "nuptial", "vow", "rehearsal dinner", "engagement", "event venue", "banquet",
  "celebration", "winery", "vineyard", "estate", "ranch", "resort", "ballroom",
  "golf club", "country club",
];

const CLEARLY_NOT_WEDDING = [
  "go-kart", "go kart", "karting", "trampoline", "bounce", "motocross",
  "dirt bike", "haunted", "halloween", "escape room", "laser tag",
  "indoor racing", "electric racing", "kids birthday", "pump it up",
  "mud run", "obstacle course", "paintball", "arcade", "bowling",
  "comedy club", "strip club", "nightclub", "bar & grill", "sports bar",
  "coffee shop", "cafe", "fast food", "pizza", "sandwich", "nail salon",
  "hair salon", "auto repair", "car wash", "storage unit", "coworking",
  "tech center", "office space", "university collaboration",
];

// Keywords that are only disqualifying if in the NAME (not description/menu text)
const NAME_ONLY_NEGATIVE = [
  "bar & grill", "coffee", "cafe", "pizza", "fast food", "sandwich shop",
  "nail salon", "hair salon", "auto repair", "car wash",
];

// ── Check 1: Wedding relevance ─────────────────────────────────────────────
export function checkWeddingRelevance(venue: {
  name: string;
  venueType: string;
  description?: string | null;
  website?: string | null;
}): AuditFlag[] {
  const flags: AuditFlag[] = [];
  const fullText = `${venue.name} ${venue.venueType} ${venue.description ?? ""}`.toLowerCase();
  const nameAndType = `${venue.name} ${venue.venueType}`.toLowerCase();

  const hasPositive = WEDDING_POSITIVE.some((kw) => fullText.includes(kw));

  // Critical negatives — apply to full text
  const criticalNegativeHits = CLEARLY_NOT_WEDDING
    .filter((kw) => !NAME_ONLY_NEGATIVE.includes(kw))
    .filter((kw) => fullText.includes(kw));

  // Name-only negatives — only flag if in the venue name/type
  const nameNegativeHits = NAME_ONLY_NEGATIVE.filter((kw) => nameAndType.includes(kw));

  const negativeHits = [...criticalNegativeHits, ...nameNegativeHits];

  if (negativeHits.length > 0) {
    flags.push({
      type: "not_wedding_venue",
      severity: "critical",
      field: "name/description",
      detail: `Venue appears unrelated to weddings. Matched: "${negativeHits.slice(0, 3).join('", "')}"`,
      autoFixed: false,
    });
  } else if (!hasPositive) {
    flags.push({
      type: "wedding_relevance_unclear",
      severity: "warning",
      field: "description",
      detail: "No wedding-related keywords found in name, type, or description. Verify this is a legitimate venue.",
      autoFixed: false,
    });
  }

  return flags;
}

// ── Check 2: Text quality (encoding, garbage, truncation) ─────────────────
export function checkTextQuality(venue: {
  name: string;
  description?: string | null;
}): { flags: AuditFlag[]; fixes: Record<string, string> } {
  const flags: AuditFlag[] = [];
  const fixes: Record<string, string> = {};

  // HTML entities
  const htmlEntities = /&(?:amp|lt|gt|quot|apos|mdash|ndash|#\d+|[a-z]+);/gi;
  // Bad encoding artifacts
  const badEncoding = /â€™|â€œ|â€|Ã©|Ã¨|Ã |Ã¢|Ã®|Ã´|Ã»|â€¦/g;
  // Truncation patterns
  const truncated = /\.\.\.$|…$|→$|more$/i;
  // ALL CAPS names (not acronyms)
  const allCaps = /^[A-Z\s]{5,}$/;

  for (const [field, value] of Object.entries({ name: venue.name, description: venue.description ?? "" })) {
    if (!value) continue;

    if (badEncoding.test(value)) {
      const fixed = value
        .replace(/â€™/g, "'").replace(/â€œ/g, '"').replace(/â€/g, '"')
        .replace(/Ã©/g, "é").replace(/Ã¨/g, "è").replace(/Ã /g, "à")
        .replace(/â€¦/g, "...");
      fixes[field] = fixed;
      flags.push({
        type: "bad_encoding",
        severity: "warning",
        field,
        detail: `Encoding artifacts detected (e.g. â€™ → '). Auto-fixed.`,
        autoFixed: true,
        fixDetail: "Replaced common UTF-8 mojibake sequences",
      });
    }

    if (htmlEntities.test(value)) {
      const fixed = (fixes[field] ?? value)
        .replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">")
        .replace(/&quot;/g, '"').replace(/&apos;/g, "'")
        .replace(/&mdash;/g, "—").replace(/&ndash;/g, "–")
        .replace(/&#8211;/g, "–").replace(/&#8212;/g, "—")
        .replace(/&#8216;/g, "'").replace(/&#8217;/g, "'")
        .replace(/&#8220;/g, '"').replace(/&#8221;/g, '"')
        .replace(/&[a-z]+;/gi, " ");
      fixes[field] = fixed;
      flags.push({
        type: "html_entities",
        severity: "warning",
        field,
        detail: `HTML entities found in text (e.g. &mdash; &#8211;). Auto-fixed.`,
        autoFixed: true,
        fixDetail: "Decoded HTML entities to plain text",
      });
    }

    if (field === "description" && truncated.test(value.trim())) {
      flags.push({
        type: "truncated_description",
        severity: "warning",
        field,
        detail: `Description appears to be truncated or scraped ("${value.trim().slice(-40)}").`,
        autoFixed: false,
      });
    }

    if (field === "name" && allCaps.test(value.trim())) {
      flags.push({
        type: "all_caps_name",
        severity: "info",
        field: "name",
        detail: `Venue name is ALL CAPS: "${value}". Consider title-casing for presentation.`,
        autoFixed: false,
      });
    }

    // Scraped nav/menu junk — long description that's really website navigation
    if (field === "description" && value.length > 50) {
      const navPatterns = /skip to content|skip to main|navigation|menu items|copyright|all rights reserved|powered by|terms of service|privacy policy/i;
      if (navPatterns.test(value)) {
        flags.push({
          type: "scraped_navigation_text",
          severity: "warning",
          field: "description",
          detail: `Description contains scraped website navigation text (e.g. "Skip to Content", "All Rights Reserved").`,
          autoFixed: false,
        });
      }
    }

    // Description is just the venue name repeated or very short
    if (field === "description" && value.length > 0 && value.length < 30) {
      flags.push({
        type: "description_too_short",
        severity: "info",
        field: "description",
        detail: `Description is very short (${value.length} chars): "${value}"`,
        autoFixed: false,
      });
    }
  }

  return { flags, fixes };
}

// ── Check 3: URL validation ────────────────────────────────────────────────
export async function checkUrl(url: string | null | undefined, timeoutMs = 8000): Promise<AuditFlag[]> {
  if (!url) return [];
  const flags: AuditFlag[] = [];

  // Basic format check
  try {
    const parsed = new URL(url);
    if (!["http:", "https:"].includes(parsed.protocol)) {
      flags.push({
        type: "invalid_url_protocol",
        severity: "warning",
        field: "website",
        detail: `URL uses non-HTTP protocol: ${url}`,
        autoFixed: false,
      });
      return flags;
    }
  } catch {
    flags.push({
      type: "malformed_url",
      severity: "critical",
      field: "website",
      detail: `URL is malformed and cannot be parsed: "${url}"`,
      autoFixed: false,
    });
    return flags;
  }

  // HTTP fetch check
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    const resp = await fetch(url, {
      method: "HEAD",
      signal: controller.signal,
      redirect: "follow",
      headers: { "User-Agent": "GreenBowtieBot/1.0 (venue quality check; contact@greenbowtie.com)" },
    });
    clearTimeout(timer);

    if (resp.status === 404) {
      flags.push({ type: "url_404", severity: "critical", field: "website", detail: `Website returns 404 Not Found: ${url}`, autoFixed: false });
    } else if (resp.status === 403) {
      // 403 often means blocked, not actually down — treat as info
      flags.push({ type: "url_blocked", severity: "info", field: "website", detail: `Website blocks automated checks (403). Manually verify: ${url}`, autoFixed: false });
    } else if (resp.status >= 500) {
      flags.push({ type: "url_server_error", severity: "warning", field: "website", detail: `Website returns server error ${resp.status}: ${url}`, autoFixed: false });
    }
    // 200, 301, 302 = fine
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.includes("abort") || msg.includes("timeout")) {
      flags.push({ type: "url_timeout", severity: "warning", field: "website", detail: `Website timed out after ${timeoutMs / 1000}s: ${url}`, autoFixed: false });
    } else {
      flags.push({ type: "url_unreachable", severity: "critical", field: "website", detail: `Website unreachable: ${url} (${msg.slice(0, 80)})`, autoFixed: false });
    }
  }

  return flags;
}

// ── Check 4: Missing critical fields ──────────────────────────────────────
export function checkCompleteness(venue: {
  name: string;
  description?: string | null;
  website?: string | null;
  primaryPhotoUrl?: string | null;
  venueType: string;
  city: string;
}): AuditFlag[] {
  const flags: AuditFlag[] = [];

  if (!venue.description || venue.description.trim().length < 20) {
    flags.push({ type: "missing_description", severity: "warning", field: "description", detail: "No meaningful description. Brides searching this venue get no context.", autoFixed: false });
  }
  if (!venue.website) {
    flags.push({ type: "missing_website", severity: "warning", field: "website", detail: "No website URL. Brides can't learn more or book.", autoFixed: false });
  }
  if (!venue.primaryPhotoUrl) {
    flags.push({ type: "missing_photo", severity: "warning", field: "primaryPhotoUrl", detail: "No photo. Listings without images perform significantly worse.", autoFixed: false });
  }

  return flags;
}

// ── Check 5: VenueType coherence ─────────────────────────────────────────
export function checkTypeCoherence(venue: {
  name: string;
  venueType: string;
  description?: string | null;
}): AuditFlag[] {
  const flags: AuditFlag[] = [];
  const text = `${venue.name} ${venue.description ?? ""}`.toLowerCase();

  // Type mismatches
  const typeMismatches: Array<[string, string[], string]> = [
    ["Golf Club", ["golf", "course", "links", "fairway", "par ", "tee"], "venueType is 'Golf Club' but no golf-related terms found"],
    ["Vineyard & Winery", ["wine", "vineyard", "winery", "vino", "cellar", "barrel", "grape"], "venueType is 'Vineyard & Winery' but no wine-related terms found"],
    ["Barn / Ranch", ["barn", "ranch", "farm", "rustic", "rural", "country"], "venueType is 'Barn / Ranch' but no rural/rustic terms found"],
  ];

  for (const [type, keywords, message] of typeMismatches) {
    if (venue.venueType === type && !keywords.some((kw) => text.includes(kw))) {
      flags.push({
        type: "venue_type_mismatch",
        severity: "info",
        field: "venueType",
        detail: message,
        autoFixed: false,
      });
    }
  }

  // Obvious wrong type assignments
  if (venue.venueType === "Golf Club" && text.includes("fairground")) {
    flags.push({ type: "venue_type_wrong", severity: "warning", field: "venueType", detail: `"${venue.name}" appears to be a fairground, not a Golf Club.`, autoFixed: false });
  }
  if (venue.venueType === "Outdoor / Park" && text.includes("haunted")) {
    flags.push({ type: "venue_type_wrong", severity: "critical", field: "venueType", detail: `"${venue.name}" is a haunted attraction, not a park/outdoor venue.`, autoFixed: false });
  }

  return flags;
}

// ── Score calculator ───────────────────────────────────────────────────────
export function calculateAuditScore(flags: AuditFlag[]): number {
  let score = 100;
  for (const flag of flags) {
    if (flag.autoFixed) continue; // auto-fixed issues don't penalize
    if (flag.severity === "critical") score -= 30;
    else if (flag.severity === "warning") score -= 10;
    else if (flag.severity === "info") score -= 3;
  }
  return Math.max(0, score);
}

export function statusFromScore(score: number, flags: AuditFlag[]): import("./types").AuditStatus {
  const hasCritical = flags.some((f) => f.severity === "critical" && !f.autoFixed);
  if (hasCritical || score < 40) return "flagged";
  if (score < 75) return "needs_review";
  return "clean";
}
