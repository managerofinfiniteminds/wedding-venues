/**
 * LLM-powered audit checks via OpenRouter.
 * Used for nuanced wedding relevance and description quality assessment.
 */
import { AuditFlag } from "./types";

const OPENROUTER_KEY = process.env.OPENROUTER_API_KEY;
const MODEL = "google/gemini-flash-1.5"; // fast + cheap for bulk

async function callLLM(prompt: string): Promise<string> {
  if (!OPENROUTER_KEY) throw new Error("OPENROUTER_API_KEY not set");
  const resp = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${OPENROUTER_KEY}`,
      "Content-Type": "application/json",
      "HTTP-Referer": "https://greenbowtie.com",
      "X-Title": "Green Bowtie Venue Audit",
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [{ role: "user", content: prompt }],
      max_tokens: 400,
      temperature: 0,
    }),
  });
  if (!resp.ok) {
    const err = await resp.text();
    throw new Error(`OpenRouter error ${resp.status}: ${err.slice(0, 200)}`);
  }
  const data = await resp.json();
  return data.choices?.[0]?.message?.content ?? "";
}

/**
 * LLM wedding relevance check — nuanced assessment beyond keyword matching.
 * Returns flags array (may be empty if venue looks fine).
 */
export async function llmWeddingRelevanceCheck(venue: {
  name: string;
  venueType: string;
  description?: string | null;
  website?: string | null;
}): Promise<AuditFlag[]> {
  const flags: AuditFlag[] = [];

  const prompt = `You are a quality auditor for a wedding venue directory called Green Bowtie.

Assess whether this listing belongs on a wedding venue directory. Answer in JSON only.

Venue: ${venue.name}
Type: ${venue.venueType}
Description: ${venue.description?.slice(0, 300) ?? "none"}
Website: ${venue.website ?? "none"}

Respond with ONLY this JSON (no markdown):
{
  "isWeddingVenue": true|false,
  "confidence": "high"|"medium"|"low",
  "reason": "one sentence explanation",
  "suggestedAction": "keep"|"review"|"unpublish"
}`;

  try {
    const raw = await callLLM(prompt);
    const json = JSON.parse(raw.trim());

    if (!json.isWeddingVenue && json.confidence !== "low") {
      flags.push({
        type: "llm_not_wedding_venue",
        severity: json.confidence === "high" ? "critical" : "warning",
        field: "name/description",
        detail: `LLM assessment: NOT a wedding venue (${json.confidence} confidence). ${json.reason} Suggested action: ${json.suggestedAction}.`,
        autoFixed: false,
      });
    } else if (!json.isWeddingVenue && json.confidence === "low") {
      flags.push({
        type: "llm_wedding_relevance_uncertain",
        severity: "info",
        field: "description",
        detail: `LLM uncertain about wedding relevance. ${json.reason}`,
        autoFixed: false,
      });
    }
  } catch (err) {
    // LLM check failed — don't block the audit, just note it
    flags.push({
      type: "llm_check_failed",
      severity: "info",
      field: "description",
      detail: `LLM relevance check could not complete: ${String(err).slice(0, 80)}`,
      autoFixed: false,
    });
  }

  return flags;
}

/**
 * LLM description quality check — detects scraped junk, poor quality, irrelevant text.
 */
export async function llmDescriptionQualityCheck(venue: {
  name: string;
  description?: string | null;
}): Promise<{ flags: AuditFlag[]; improvedDescription?: string }> {
  if (!venue.description || venue.description.length < 30) {
    return { flags: [] }; // handled by completeness check
  }

  const prompt = `You are a quality auditor for a wedding venue directory.

Review this venue description for quality issues: scraped website junk, navigation text, irrelevant content, HTML artifacts, truncation, or poor writing that would embarrass a wedding directory.

Venue: ${venue.name}
Description: ${venue.description.slice(0, 500)}

Respond with ONLY this JSON (no markdown):
{
  "quality": "good"|"poor"|"junk",
  "issues": ["list of specific problems found, or empty array"],
  "improvedDescription": "rewritten description if quality is poor or junk, else null"
}`;

  try {
    const raw = await callLLM(prompt);
    const json = JSON.parse(raw.trim());
    const flags: AuditFlag[] = [];

    if (json.quality === "junk") {
      flags.push({
        type: "description_junk",
        severity: "warning",
        field: "description",
        detail: `Description is scraped junk. Issues: ${json.issues.join("; ")}`,
        autoFixed: json.improvedDescription != null,
        fixDetail: json.improvedDescription ? "LLM rewrote description" : undefined,
      });
      return { flags, improvedDescription: json.improvedDescription ?? undefined };
    }

    if (json.quality === "poor" && json.issues.length > 0) {
      flags.push({
        type: "description_poor_quality",
        severity: "info",
        field: "description",
        detail: `Description quality issues: ${json.issues.join("; ")}`,
        autoFixed: false,
      });
    }

    return { flags };
  } catch {
    return { flags: [] };
  }
}
