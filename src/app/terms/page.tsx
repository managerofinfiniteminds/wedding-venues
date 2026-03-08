import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms of Service | Green Bowtie",
  description: "Green Bowtie Terms of Service — the rules governing your use of our platform.",
};

const EFFECTIVE_DATE = "March 8, 2026";
const COMPANY = "El Salvador Imports, LLC";
const DBA = "Green Bowtie";
const EMAIL = "legal@greenbowtie.com";
const GOVERNING_LAW = "California";

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

export default function TermsPage() {
  return (
    <div style={{ minHeight: "100vh", background: "#fafaf9", fontFamily: "'Nunito Sans', sans-serif", color: "#1a1a1a" }}>

      {/* Header */}
      <div style={{ background: "#3b6341", padding: "32px 24px" }}>
        <div style={{ maxWidth: 800, margin: "0 auto" }}>
          <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: 10, textDecoration: "none", marginBottom: 24 }}>
            <Image src="/greenbowtie-logo.svg" alt="Green Bowtie" width={36} height={36} style={{ filter: "brightness(0) invert(1)" }} />
            <span style={{ fontFamily: "'Tenor Sans', serif", color: "#fff", fontSize: 20, fontWeight: 700 }}>Green Bowtie</span>
          </Link>
          <h1 style={{ fontFamily: "'Tenor Sans', serif", color: "#fff", fontSize: 32, fontWeight: 700, margin: "0 0 8px" }}>Terms of Service</h1>
          <p style={{ color: "rgba(255,255,255,0.7)", margin: 0, fontSize: 14 }}>Effective Date: {EFFECTIVE_DATE}</p>
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: 800, margin: "0 auto", padding: "48px 24px 80px" }}>
        <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #e5e7eb", padding: "32px 40px" }}>

          <p style={{ fontSize: 15, lineHeight: 1.8, color: "#374151", marginBottom: 32 }}>
            These Terms of Service ("Terms") govern your access to and use of the website greenbowtie.com and related services (collectively, the "Service") operated by {COMPANY}, doing business as {DBA} ("Green Bowtie," "we," "us," or "our"). By accessing or using the Service, you agree to be bound by these Terms. If you do not agree, do not use the Service.
          </p>

          <Section title="1. Eligibility">
            <p>You must be at least 18 years old to use the Service. By using the Service, you represent and warrant that you are at least 18 years of age and have the legal capacity to enter into these Terms.</p>
          </Section>

          <Section title="2. Description of Service">
            <p>Green Bowtie is an online directory that connects engaged couples with wedding venues across the United States. The Service allows:</p>
            <ul style={{ paddingLeft: 20 }}>
              <li><strong>Couples</strong> to search, browse, and submit inquiries to wedding venues.</li>
              <li><strong>Venue owners and managers</strong> to claim, manage, and enhance their venue listing.</li>
            </ul>
            <p>Green Bowtie is a <strong>marketplace and directory service only.</strong> We are not a party to any transaction, agreement, or relationship between couples and venues. We do not guarantee the availability, quality, accuracy, safety, or legality of any venue listed on the Service.</p>
          </Section>

          <Section title="3. User Accounts and Venue Claims">
            <p><strong>Venue owner accounts:</strong> Venue owners may claim their listing by verifying their identity through the process described on the Service. You represent that you are authorized to manage and represent the venue you claim.</p>
            <p><strong>Account security:</strong> You are responsible for maintaining the confidentiality of your login credentials and for all activity under your account. Notify us immediately at {EMAIL} if you suspect unauthorized access.</p>
            <p><strong>Accurate information:</strong> You agree to provide accurate, current, and complete information and to keep it updated. We reserve the right to suspend or terminate accounts that contain false or misleading information.</p>
          </Section>

          <Section title="4. Acceptable Use">
            <p>You agree not to use the Service to:</p>
            <ul style={{ paddingLeft: 20 }}>
              <li>Submit false, fraudulent, or misleading inquiries or venue information.</li>
              <li>Harass, threaten, or harm any person.</li>
              <li>Scrape, crawl, or extract data from the Service without our written permission.</li>
              <li>Interfere with or disrupt the integrity or performance of the Service.</li>
              <li>Attempt to gain unauthorized access to any part of the Service or its related systems.</li>
              <li>Use the Service for any illegal purpose or in violation of any applicable law or regulation.</li>
              <li>Upload or transmit viruses or any other malicious code.</li>
              <li>Post spam, unsolicited communications, or promotional content through the inquiry system.</li>
              <li>Impersonate any person or entity or falsely represent your affiliation with any person or entity.</li>
            </ul>
          </Section>

          <Section title="5. Venue Listings and Content">
            <p><strong>Accuracy of listings:</strong> Green Bowtie populates venue data from public sources. While we make reasonable efforts to ensure accuracy, we do not warrant that listing information (including pricing, capacity, availability, or amenities) is current, complete, or error-free. Couples should independently verify all information directly with venues before making any booking decisions.</p>
            <p><strong>Venue owner content:</strong> Venue owners who claim their listing may submit edits, photos, and other content ("Venue Content"). By submitting Venue Content, you grant Green Bowtie a non-exclusive, worldwide, royalty-free, perpetual license to display, reproduce, and distribute that content in connection with the Service.</p>
            <p><strong>Content standards:</strong> Venue Content must be accurate, not misleading, and must not infringe any third party's intellectual property rights. We reserve the right to remove or modify any content that violates these Terms or our content policies.</p>
            <p><strong>AI moderation:</strong> Venue content submissions may be reviewed by automated systems including artificial intelligence. Submissions that violate our content policies may be rejected automatically or held for manual review.</p>
          </Section>

          <Section title="6. Inquiries">
            <p>When you submit an inquiry through the Service, you authorize Green Bowtie to transmit your inquiry and contact information to the relevant venue or venue owner. You understand that:</p>
            <ul style={{ paddingLeft: 20 }}>
              <li>Green Bowtie is not responsible for the venue's response or lack thereof.</li>
              <li>Submitting an inquiry does not constitute a reservation or booking.</li>
              <li>You may receive follow-up communications from venues in response to your inquiry.</li>
              <li>If you opt in, you may receive marketing communications from Green Bowtie (you may opt out at any time).</li>
            </ul>
          </Section>

          <Section title="7. Fees and Payments">
            <p>Basic venue listings and inquiry features are currently available at no charge. Premium features for venue owners (including featured placement and enhanced analytics) are available via paid subscription plans.</p>
            <p><strong>Billing:</strong> Paid plans are billed monthly or annually. By subscribing, you authorize us to charge your payment method on a recurring basis. All fees are in U.S. dollars.</p>
            <p><strong>Cancellation:</strong> You may cancel your subscription at any time. Cancellation takes effect at the end of the current billing period. We do not provide refunds for partial billing periods.</p>
            <p><strong>Price changes:</strong> We may change our pricing with 30 days' notice. Continued use of a paid plan after the price change takes effect constitutes acceptance of the new pricing.</p>
            <p><strong>Payment processing:</strong> Payments are processed by Stripe. By providing payment information, you agree to Stripe's terms of service. We do not store your full payment card information.</p>
          </Section>

          <Section title="8. Intellectual Property">
            <p><strong>Our content:</strong> The Service and its original content, features, and functionality are owned by {COMPANY} and are protected by copyright, trademark, and other intellectual property laws.</p>
            <p><strong>Green Bowtie trademarks:</strong> "Green Bowtie" and our logo are trademarks of {COMPANY}. You may not use our trademarks without our prior written consent.</p>
            <p><strong>Third-party content:</strong> Venue names, logos, and descriptions may be trademarks or copyrighted works of their respective owners. Their presence on the Service does not imply any affiliation with or endorsement by Green Bowtie.</p>
            <p><strong>Feedback:</strong> If you provide feedback or suggestions about the Service, we may use that feedback without obligation to you.</p>
          </Section>

          <Section title="9. Disclaimers">
            <p style={{ fontWeight: 600 }}>THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.</p>
            <p>We do not warrant that:</p>
            <ul style={{ paddingLeft: 20 }}>
              <li>The Service will be uninterrupted, error-free, or secure.</li>
              <li>Any venue listing information is accurate, complete, or current.</li>
              <li>The results obtained from using the Service will meet your requirements.</li>
              <li>Any venue will respond to your inquiry or be available on your desired date.</li>
            </ul>
            <p>Green Bowtie is a directory service. We are not responsible for the conduct of venues, venue owners, or other users of the Service.</p>
          </Section>

          <Section title="10. Limitation of Liability">
            <p style={{ fontWeight: 600 }}>TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, IN NO EVENT SHALL GREEN BOWTIE, ITS AFFILIATES, OFFICERS, DIRECTORS, EMPLOYEES, OR AGENTS BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING BUT NOT LIMITED TO LOSS OF PROFITS, DATA, GOODWILL, OR OTHER INTANGIBLE LOSSES, ARISING OUT OF OR IN CONNECTION WITH YOUR USE OF THE SERVICE.</p>
            <p>Our total liability to you for any claims arising out of or related to these Terms or the Service shall not exceed the greater of (a) the amount you paid to us in the twelve months preceding the claim or (b) one hundred dollars ($100).</p>
            <p>Some jurisdictions do not allow the exclusion or limitation of certain damages. In such jurisdictions, our liability is limited to the maximum extent permitted by law.</p>
          </Section>

          <Section title="11. Indemnification">
            <p>You agree to indemnify, defend, and hold harmless Green Bowtie and its affiliates, officers, directors, employees, and agents from and against any claims, liabilities, damages, judgments, awards, losses, costs, expenses, or fees (including reasonable attorneys' fees) arising out of or relating to: (a) your use of the Service; (b) your violation of these Terms; (c) your Venue Content; or (d) your violation of any third party's rights.</p>
          </Section>

          <Section title="12. Dispute Resolution and Arbitration">
            <p><strong>Informal resolution:</strong> Before initiating any formal dispute, you agree to contact us at {EMAIL} and attempt to resolve the dispute informally. We will attempt to resolve the dispute within 30 days.</p>
            <p><strong>Binding arbitration:</strong> If informal resolution fails, any dispute arising out of or relating to these Terms or the Service shall be resolved by binding arbitration administered by JAMS under its Streamlined Arbitration Rules, except that either party may seek emergency injunctive relief in court. The arbitration shall be conducted in {GOVERNING_LAW}, and judgment on the award may be entered in any court having jurisdiction. <strong>YOU AND GREEN BOWTIE EACH WAIVE THE RIGHT TO A JURY TRIAL AND TO PARTICIPATE IN A CLASS ACTION.</strong></p>
            <p><strong>Exception:</strong> Either party may bring an individual action in small claims court for disputes within that court's jurisdiction.</p>
          </Section>

          <Section title="13. Governing Law">
            <p>These Terms are governed by the laws of the State of {GOVERNING_LAW}, without regard to its conflict of law provisions. Subject to the arbitration clause above, you consent to the exclusive jurisdiction of the state and federal courts located in {GOVERNING_LAW}.</p>
          </Section>

          <Section title="14. Termination">
            <p>We may suspend or terminate your access to the Service at any time, with or without cause, with or without notice. Upon termination, your right to use the Service ceases immediately.</p>
            <p>Sections 4, 5, 8, 9, 10, 11, 12, and 13 survive termination of these Terms.</p>
          </Section>

          <Section title="15. Changes to Terms">
            <p>We may update these Terms from time to time. When we make material changes, we will post the updated Terms on this page and update the effective date. Your continued use of the Service after changes take effect constitutes your acceptance of the revised Terms. We encourage you to review these Terms periodically.</p>
          </Section>

          <Section title="16. Miscellaneous">
            <p><strong>Entire agreement:</strong> These Terms, together with our Privacy Policy, constitute the entire agreement between you and Green Bowtie regarding the Service.</p>
            <p><strong>Severability:</strong> If any provision of these Terms is found unenforceable, the remaining provisions continue in full force.</p>
            <p><strong>Waiver:</strong> Our failure to enforce any provision of these Terms does not constitute a waiver of that provision.</p>
            <p><strong>Assignment:</strong> You may not assign your rights under these Terms. We may assign our rights without restriction.</p>
            <p><strong>No agency:</strong> Nothing in these Terms creates an agency, partnership, joint venture, or employment relationship between you and Green Bowtie.</p>
          </Section>

          <Section title="17. Contact Us">
            <p>Questions about these Terms? Contact us:</p>
            <div style={{ background: "#f8f7f4", borderRadius: 10, padding: "16px 20px", marginTop: 12 }}>
              <p style={{ margin: 0 }}><strong>{COMPANY}</strong><br />
              d/b/a {DBA}<br />
              {GOVERNING_LAW}, United States<br />
              Email: <a href={`mailto:${EMAIL}`} style={{ color: "#3b6341" }}>{EMAIL}</a>
              </p>
            </div>
          </Section>

        </div>

        <div style={{ textAlign: "center", marginTop: 32 }}>
          <Link href="/privacy" style={{ color: "#3b6341", fontSize: 14, marginRight: 24 }}>Privacy Policy</Link>
          <Link href="/" style={{ color: "#6b7280", fontSize: 14 }}>← Back to Green Bowtie</Link>
        </div>
      </div>
    </div>
  );
}
