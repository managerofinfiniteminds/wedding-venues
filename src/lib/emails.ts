import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
const SITE_URL = process.env.SITE_URL ?? "https://greenbowtie.com";
const FROM = "Green Bowtie <hello@greenbowtie.com>";

function base(content: string) {
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<style>
  body { margin:0; padding:0; background:#f8f7f5; font-family:'Helvetica Neue',Arial,sans-serif; color:#1a1a1a; }
  .wrap { max-width:600px; margin:0 auto; background:#ffffff; }
  .header { background:#3b6341; padding:28px 40px; }
  .header-logo { color:#ffffff; font-size:22px; font-weight:700; letter-spacing:-0.3px; text-decoration:none; }
  .body { padding:40px; }
  .footer { padding:24px 40px; background:#f0f4f0; text-align:center; }
  .footer p { margin:0; font-size:12px; color:#6b7280; }
  .footer a { color:#3b6341; text-decoration:none; }
  h1 { font-size:24px; font-weight:700; margin:0 0 16px; color:#1a1a1a; line-height:1.3; }
  p { font-size:15px; line-height:1.6; color:#374151; margin:0 0 16px; }
  .btn { display:inline-block; background:#3b6341; color:#ffffff !important; font-size:15px; font-weight:600; padding:14px 28px; border-radius:100px; text-decoration:none; margin:8px 0 24px; }
  .data-row { display:flex; gap:8px; padding:10px 0; border-bottom:1px solid #f3f4f6; }
  .data-label { font-size:13px; color:#6b7280; width:130px; flex-shrink:0; }
  .data-value { font-size:14px; color:#111827; font-weight:500; }
  .box { background:#f0f4f0; border:1px solid #d1e0d4; border-radius:12px; padding:20px 24px; margin:20px 0; }
  .badge { display:inline-block; background:#dcfce7; color:#166534; font-size:12px; font-weight:600; padding:4px 10px; border-radius:100px; }
</style>
</head>
<body>
<div class="wrap">
  <div class="header">
    <a href="${SITE_URL}" class="header-logo">🌿 Green Bowtie</a>
  </div>
  <div class="body">${content}</div>
  <div class="footer">
    <p><a href="${SITE_URL}">greenbowtie.com</a> &nbsp;·&nbsp; The best wedding venue directory in the world</p>
    <p style="margin-top:8px">You received this because you submitted an inquiry through Green Bowtie.</p>
  </div>
</div>
</body>
</html>`;
}

export async function sendCoupleConfirmation({
  toEmail,
  coupleName,
  venueName,
  venueSlug,
  venueState,
  weddingDate,
  guestCount,
  budgetMin,
  budgetMax,
}: {
  toEmail: string;
  coupleName: string;
  venueName: string;
  venueSlug: string;
  venueState: string;
  weddingDate?: Date | null;
  guestCount?: number | null;
  budgetMin?: number | null;
  budgetMax?: number | null;
}) {
  if (!resend) { console.warn("[emails] RESEND_API_KEY not set — skipping couple confirmation"); return; }

  const venueUrl = `${SITE_URL}/venues/${venueState}/${venueSlug}`;
  const dateStr = weddingDate ? new Date(weddingDate).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }) : null;
  const budgetStr = budgetMin && budgetMax ? `$${budgetMin.toLocaleString()} – $${budgetMax.toLocaleString()}` : budgetMin ? `$${budgetMin.toLocaleString()}+` : null;

  const html = base(`
    <span class="badge">Inquiry Sent ✓</span>
    <h1 style="margin-top:16px">Your inquiry has been sent to ${venueName} 💚</h1>
    <p>Hi ${coupleName},</p>
    <p>We've forwarded your inquiry to <strong>${venueName}</strong>. They'll reach out to you directly at this email address.</p>

    <div class="box">
      <p style="margin:0 0 12px;font-size:13px;font-weight:600;color:#3b6341;text-transform:uppercase;letter-spacing:0.5px">Your Inquiry Summary</p>
      ${dateStr ? `<div class="data-row"><span class="data-label">Wedding date</span><span class="data-value">${dateStr}</span></div>` : ""}
      ${guestCount ? `<div class="data-row"><span class="data-label">Guest count</span><span class="data-value">${guestCount} guests</span></div>` : ""}
      ${budgetStr ? `<div class="data-row"><span class="data-label">Budget range</span><span class="data-value">${budgetStr}</span></div>` : ""}
      <div class="data-row" style="border:none"><span class="data-label">Venue</span><span class="data-value">${venueName}</span></div>
    </div>

    <p style="font-size:14px;color:#6b7280">While you wait, you can save other venues to compare. Keep an eye on your inbox for a response from ${venueName}.</p>
    <a href="${venueUrl}" class="btn">View Venue Listing →</a>
  `);

  await resend.emails.send({
    from: FROM,
    to: toEmail,
    subject: `Your inquiry to ${venueName} has been sent 💚`,
    html,
  });
}

export async function sendVenueNotification({
  venueEmail,
  venueName,
  venueSlug,
  venueState,
  coupleName,
  partnerName,
  coupleEmail,
  couplePhone,
  weddingDate,
  weddingDateFlexible,
  guestCount,
  budgetMin,
  budgetMax,
  message,
  preferredContact,
  inquiryId,
}: {
  venueEmail: string;
  venueName: string;
  venueSlug: string;
  venueState: string;
  coupleName: string;
  partnerName?: string | null;
  coupleEmail: string;
  couplePhone?: string | null;
  weddingDate?: Date | null;
  weddingDateFlexible?: boolean;
  guestCount?: number | null;
  budgetMin?: number | null;
  budgetMax?: number | null;
  message: string;
  preferredContact?: string;
  inquiryId: string;
}) {
  if (!resend) { console.warn("[emails] RESEND_API_KEY not set — skipping venue notification"); return; }

  const claimUrl = `${SITE_URL}/claim/${venueSlug}?ref=inquiry&id=${inquiryId}`;
  const names = [coupleName, partnerName].filter(Boolean).join(" & ");
  const dateStr = weddingDate ? new Date(weddingDate).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }) : weddingDateFlexible ? "Flexible date" : "Date not specified";
  const budgetStr = budgetMin && budgetMax ? `$${budgetMin.toLocaleString()} – $${budgetMax.toLocaleString()}` : "Not specified";

  const html = base(`
    <h1>New inquiry from ${names} 💌</h1>
    <p>A couple found <strong>${venueName}</strong> on Green Bowtie and wants to connect with you.</p>

    <div class="box">
      <p style="margin:0 0 12px;font-size:13px;font-weight:600;color:#3b6341;text-transform:uppercase;letter-spacing:0.5px">Inquiry Details</p>
      <div class="data-row"><span class="data-label">Names</span><span class="data-value">${names}</span></div>
      <div class="data-row"><span class="data-label">Email</span><span class="data-value"><a href="mailto:${coupleEmail}" style="color:#3b6341">${coupleEmail}</a></span></div>
      ${couplePhone ? `<div class="data-row"><span class="data-label">Phone</span><span class="data-value">${couplePhone}</span></div>` : ""}
      <div class="data-row"><span class="data-label">Wedding date</span><span class="data-value">${dateStr}</span></div>
      <div class="data-row"><span class="data-label">Guest count</span><span class="data-value">${guestCount ? `${guestCount} guests` : "Not specified"}</span></div>
      <div class="data-row"><span class="data-label">Budget</span><span class="data-value">${budgetStr}</span></div>
      <div class="data-row"><span class="data-label">Preferred contact</span><span class="data-value">${preferredContact ?? "Email"}</span></div>
      <div class="data-row" style="border:none;flex-direction:column;gap:4px">
        <span class="data-label">Their message</span>
        <span style="font-size:14px;color:#111827;font-style:italic;line-height:1.6">"${message}"</span>
      </div>
    </div>

    <p><strong>Reply directly</strong> to ${names} at <a href="mailto:${coupleEmail}" style="color:#3b6341">${coupleEmail}</a>${couplePhone ? ` or call ${couplePhone}` : ""}.</p>

    <p style="font-size:14px;color:#6b7280">Want to manage all your inquiries in one place? Claim your listing on Green Bowtie — it's free.</p>
    <a href="${claimUrl}" class="btn">Claim Your Listing & Manage Inquiries →</a>
  `);

  await resend.emails.send({
    from: FROM,
    to: venueEmail,
    subject: `New inquiry from ${names} for ${dateStr} — Green Bowtie`,
    html,
    replyTo: coupleEmail,
  });
}

export async function sendMagicLink({
  toEmail,
  venueName,
  magicLink,
}: {
  toEmail: string;
  venueName: string;
  magicLink: string;
}) {
  if (!resend) { console.warn("[emails] RESEND_API_KEY not set — skipping magic link"); return; }

  const html = base(`
    <h1>Sign in to your Green Bowtie dashboard</h1>
    <p>Click the button below to sign in and manage <strong>${venueName}</strong> on Green Bowtie. This link expires in 1 hour.</p>
    <a href="${magicLink}" class="btn">Sign In to Dashboard →</a>
    <p style="font-size:13px;color:#9ca3af">If you didn't request this, you can safely ignore this email. This link will expire automatically.</p>
    <p style="font-size:12px;color:#d1d5db;word-break:break-all">${magicLink}</p>
  `);

  await resend.emails.send({
    from: FROM,
    to: toEmail,
    subject: `Sign in to Green Bowtie — ${venueName}`,
    html,
  });
}
