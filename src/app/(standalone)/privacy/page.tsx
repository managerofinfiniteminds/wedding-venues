import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy | Green Bowtie",
  description: "Green Bowtie Privacy Policy — how we collect, use, and protect your information.",
};

const EFFECTIVE_DATE = "March 8, 2026";
const COMPANY = "Green Bowtie";
const DBA = "Green Bowtie";
const EMAIL = "privacy@greenbowtie.com";
const ADDRESS = "California, United States";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section style={{ marginBottom: 40 }}>
      <h2 style={{ fontSize: 20, fontWeight: 700, color: "#1a1a1a", marginBottom: 12, borderBottom: "1px solid #e5e7eb", paddingBottom: 8 }}>
        {title}
      </h2>
      <div style={{ fontSize: 15, lineHeight: 1.8, color: "#374151" }}>
        {children}
      </div>
    </section>
  );
}

export default function PrivacyPage() {
  return (
    <div style={{ minHeight: "100vh", background: "#fafaf9", fontFamily: "'Nunito Sans', sans-serif", color: "#1a1a1a" }}>

      {/* Header */}
      <div style={{ background: "#3b6341", padding: "32px 24px" }}>
        <div style={{ maxWidth: 800, margin: "0 auto" }}>
          <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: 10, textDecoration: "none", marginBottom: 24 }}>
            <Image src="/greenbowtie-logo.svg" alt="Green Bowtie" width={36} height={36} style={{ filter: "brightness(0) invert(1)" }} />
            <span style={{ fontFamily: "'Tenor Sans', serif", color: "#fff", fontSize: 20, fontWeight: 700 }}>Green Bowtie</span>
          </Link>
          <h1 style={{ fontFamily: "'Tenor Sans', serif", color: "#fff", fontSize: 32, fontWeight: 700, margin: "0 0 8px" }}>Privacy Policy</h1>
          <p style={{ color: "rgba(255,255,255,0.7)", margin: 0, fontSize: 14 }}>Effective Date: {EFFECTIVE_DATE}</p>
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: 800, margin: "0 auto", padding: "48px 24px 80px" }}>

        <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #e5e7eb", padding: "32px 40px" }}>

          <p style={{ fontSize: 15, lineHeight: 1.8, color: "#374151", marginBottom: 32 }}>
            This Privacy Policy describes how {COMPANY} ("Green Bowtie," "we," "us," or "our"), collects, uses, discloses, and protects information about you when you use our website at greenbowtie.com (the "Service"). By using the Service, you agree to the collection and use of information in accordance with this policy.
          </p>

          <Section title="1. Information We Collect">
            <p><strong>Information you provide directly:</strong></p>
            <ul style={{ paddingLeft: 20, marginBottom: 16 }}>
              <li>When you submit an inquiry form: your name, partner's name, email address, phone number (optional), wedding date, guest count, budget range, and message.</li>
              <li>When you sign up for our email list: your email address.</li>
              <li>When you claim a venue listing: your name, business email address, and business phone number.</li>
            </ul>
            <p><strong>Information collected automatically:</strong></p>
            <ul style={{ paddingLeft: 20, marginBottom: 16 }}>
              <li>Log data including your IP address, browser type, pages visited, time spent, and referring URLs.</li>
              <li>Device information including hardware model, operating system, and browser version.</li>
              <li>Cookies and similar tracking technologies (see Section 7).</li>
            </ul>
            <p><strong>Information we do not collect:</strong></p>
            <ul style={{ paddingLeft: 20 }}>
              <li>We do not collect payment card numbers or financial information directly. Payments are processed by Stripe, a third-party processor.</li>
              <li>We do not collect government-issued ID numbers.</li>
            </ul>
          </Section>

          <Section title="2. How We Use Your Information">
            <p>We use the information we collect to:</p>
            <ul style={{ paddingLeft: 20 }}>
              <li>Transmit your inquiry to the venue or venue owner you contacted.</li>
              <li>Send you a confirmation email when you submit an inquiry.</li>
              <li>Send you marketing communications if you opted in (you may opt out at any time).</li>
              <li>Process venue owner claims and verify identity.</li>
              <li>Improve and operate the Service, diagnose technical problems, and analyze usage trends.</li>
              <li>Comply with applicable laws and protect our legal rights.</li>
              <li>Prevent fraud, spam, and abuse.</li>
            </ul>
            <p style={{ marginTop: 16 }}>
              <strong>We do not sell your personal information.</strong> We do not share your personal information with third parties for their own marketing purposes without your explicit consent.
            </p>
          </Section>

          <Section title="3. How We Share Your Information">
            <p><strong>With venue owners:</strong> When you submit an inquiry, your name, email, phone number, wedding details, and message are shared with the owner or manager of the venue you contacted. This is the core purpose of the Service.</p>
            <p><strong>With service providers:</strong> We share information with vendors who help us operate the Service, including:</p>
            <ul style={{ paddingLeft: 20, marginBottom: 16 }}>
              <li><strong>SendGrid (Twilio)</strong> — email delivery</li>
              <li><strong>Klaviyo</strong> — email marketing and list management</li>
              <li><strong>Neon</strong> — database hosting</li>
              <li><strong>Cloudflare</strong> — DNS, CDN, and security</li>
              <li><strong>Vercel</strong> — website hosting</li>
              <li><strong>Stripe</strong> — payment processing (when applicable)</li>
            </ul>
            <p>These providers are contractually obligated to protect your information and may only use it to provide services to us.</p>
            <p><strong>For legal reasons:</strong> We may disclose your information if required by law, legal process, or to protect the rights, property, or safety of Green Bowtie, our users, or others.</p>
            <p><strong>Business transfers:</strong> If Green Bowtie is acquired or merges with another company, your information may be transferred as part of that transaction. We will notify you before your personal information is transferred and becomes subject to a different privacy policy.</p>
          </Section>

          <Section title="4. Data Retention">
            <p>We retain your personal information for as long as necessary to provide the Service and fulfill the purposes described in this policy, unless a longer retention period is required by law.</p>
            <ul style={{ paddingLeft: 20 }}>
              <li>Inquiry data: retained for 3 years from submission.</li>
              <li>Email subscription data: retained until you unsubscribe.</li>
              <li>Venue owner account data: retained for the duration of the account plus 2 years.</li>
              <li>Analytics data: retained in aggregated, anonymized form indefinitely.</li>
            </ul>
          </Section>

          <Section title="5. Your Rights and Choices">
            <p><strong>Email opt-out:</strong> You may unsubscribe from marketing emails at any time by clicking the "Unsubscribe" link in any email we send or by contacting us at {EMAIL}.</p>
            <p><strong>Access and correction:</strong> You may request access to or correction of your personal information by contacting us at {EMAIL}.</p>
            <p><strong>Deletion:</strong> You may request deletion of your personal information by contacting us at {EMAIL}. We will honor deletion requests except where we are required to retain information by law or have a legitimate interest in doing so (e.g., fraud prevention).</p>
            <p><strong>California residents (CCPA):</strong> California residents have the right to know what personal information we collect, the right to delete personal information, the right to opt out of the sale of personal information (we do not sell personal information), and the right to non-discrimination for exercising these rights. To exercise these rights, contact us at {EMAIL}.</p>
            <p><strong>Nevada residents:</strong> Nevada residents may opt out of the sale of personal information. We do not sell personal information.</p>
          </Section>

          <Section title="6. Security">
            <p>We implement reasonable technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. These measures include SSL/TLS encryption in transit, encrypted storage, access controls, and regular security reviews.</p>
            <p>However, no method of transmission over the Internet or method of electronic storage is 100% secure. While we strive to use commercially acceptable means to protect your personal information, we cannot guarantee its absolute security.</p>
          </Section>

          <Section title="7. Cookies and Tracking">
            <p>We use cookies and similar tracking technologies to operate the Service, remember your preferences, and analyze usage. Types of cookies we use:</p>
            <ul style={{ paddingLeft: 20 }}>
              <li><strong>Essential cookies:</strong> Required for the Service to function (e.g., session management for venue owners).</li>
              <li><strong>Analytics cookies:</strong> Help us understand how visitors use the Service (e.g., Plausible Analytics — privacy-friendly, no cross-site tracking).</li>
            </ul>
            <p>You can control cookies through your browser settings. Disabling certain cookies may affect the functionality of the Service.</p>
          </Section>

          <Section title="8. Third-Party Links">
            <p>The Service contains links to third-party websites, including venue websites. This Privacy Policy does not apply to those sites. We encourage you to review the privacy policies of any third-party sites you visit.</p>
          </Section>

          <Section title="9. Children's Privacy">
            <p>The Service is not directed to children under the age of 13. We do not knowingly collect personal information from children under 13. If we learn we have collected personal information from a child under 13, we will delete it promptly. If you believe we may have collected information from a child under 13, please contact us at {EMAIL}.</p>
          </Section>

          <Section title="10. Changes to This Policy">
            <p>We may update this Privacy Policy from time to time. When we make material changes, we will post the updated policy on this page and update the effective date. We encourage you to review this policy periodically. Your continued use of the Service after any changes constitutes your acceptance of the updated policy.</p>
          </Section>

          <Section title="11. Contact Us">
            <p>If you have questions, concerns, or requests regarding this Privacy Policy or our privacy practices, please contact us:</p>
            <div style={{ background: "#f8f7f4", borderRadius: 10, padding: "16px 20px", marginTop: 12 }}>
              <p style={{ margin: 0 }}><strong>{COMPANY}</strong><br />
              {ADDRESS}<br />
              Email: <a href={`mailto:${EMAIL}`} style={{ color: "#3b6341" }}>{EMAIL}</a>
              </p>
            </div>
          </Section>

        </div>

        <div style={{ textAlign: "center", marginTop: 32 }}>
          <Link href="/terms" style={{ color: "#3b6341", fontSize: 14, marginRight: 24 }}>Terms of Service</Link>
          <Link href="/" style={{ color: "#6b7280", fontSize: 14 }}>← Back to Green Bowtie</Link>
        </div>
      </div>
    </div>
  );
}
