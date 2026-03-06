/**
 * Shared R2 upload helper — used by both pipeline.ts and migrate-to-r2.ts
 * Returns null if R2 is not configured (graceful fallback).
 */
import { S3Client, PutObjectCommand, HeadObjectCommand } from "@aws-sdk/client-s3";
import crypto from "crypto";

let _r2: S3Client | null = null;

function getR2Client(): S3Client | null {
  if (!process.env.R2_ACCOUNT_ID || !process.env.R2_ACCESS_KEY_ID || !process.env.R2_SECRET_ACCESS_KEY) {
    return null;
  }
  if (!_r2) {
    _r2 = new S3Client({
      region: "auto",
      endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId:     process.env.R2_ACCESS_KEY_ID,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
      },
    });
  }
  return _r2;
}

function r2Key(venueSlug: string, sourceUrl: string, mimeType: string): string {
  const ext  = mimeType.includes("png") ? "png" : mimeType.includes("webp") ? "webp" : "jpg";
  const hash = crypto.createHash("md5").update(sourceUrl).digest("hex").slice(0, 8);
  return `venues/${venueSlug}/${hash}.${ext}`;
}

/**
 * Download a photo from sourceUrl and upload to R2.
 * Returns the stable public CDN URL, or null if R2 is not configured / upload fails.
 */
export async function mirrorPhotoToR2(
  sourceUrl: string,
  venueSlug: string
): Promise<string | null> {
  const r2 = getR2Client();
  if (!r2) return null; // R2 not configured — caller keeps original URL

  const bucket    = process.env.R2_BUCKET;
  const publicUrl = process.env.R2_PUBLIC_URL?.replace(/\/$/, "");
  if (!bucket || !publicUrl) return null;

  // Already on R2 — return as-is
  if (sourceUrl.startsWith(publicUrl)) return sourceUrl;

  try {
    const resp = await fetch(sourceUrl, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; GreenBowtie/1.0)" },
      signal: AbortSignal.timeout(15000),
    });
    if (!resp.ok) return null;

    const contentType = resp.headers.get("content-type") ?? "image/jpeg";
    if (!contentType.startsWith("image/")) return null;

    const key = r2Key(venueSlug, sourceUrl, contentType);

    // Check if already exists (idempotent)
    try {
      await r2.send(new HeadObjectCommand({ Bucket: bucket, Key: key }));
      return `${publicUrl}/${key}`; // already uploaded
    } catch { /* doesn't exist yet, continue */ }

    const buf = Buffer.from(await resp.arrayBuffer());
    await r2.send(new PutObjectCommand({
      Bucket:       bucket,
      Key:          key,
      Body:         buf,
      ContentType:  contentType,
      CacheControl: "public, max-age=31536000, immutable",
      Metadata:     { "source-url": sourceUrl.slice(0, 512), "venue-slug": venueSlug },
    }));

    return `${publicUrl}/${key}`;
  } catch {
    return null; // fail silently — caller keeps original URL
  }
}
