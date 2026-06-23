import { LegalPage, LegalSection } from "@/components/legal-page";

const sections: LegalSection[] = [
  {
    heading: "Information We Collect",
    body:
      "We collect information you provide directly: your name, email address, password (stored encrypted), and any content you create in the App (such as resumes, interview practice answers, calendar entries). We also collect basic device information (model, operating system, app version) and usage data (features used, session duration, crash reports).",
  },
  {
    heading: "How We Use Your Information",
    body:
      "We use your data to: provide and improve the App's features; authenticate you and secure your account; send service-related communications (such as email verification and password reset); analyze usage trends to improve the product; and comply with legal obligations.",
  },
  {
    heading: "Legal Basis (GDPR / LGPD)",
    body:
      "We process your data based on: (a) the contract between you and NATTA when you create an account; (b) your consent for optional features like analytics; (c) our legitimate interest in keeping the App secure and improving it; and (d) legal obligations when applicable.",
  },
  {
    heading: "Sharing Your Information",
    body:
      "We do not sell your personal data. We share data only with service providers that help us run the App (such as Firebase for authentication and Google Cloud for hosting), and only to the extent necessary. All providers are bound by confidentiality and data-protection agreements.",
  },
  {
    heading: "AI Features",
    body:
      "Some features may use AI models to assist you (e.g., resume suggestions or interview feedback). Content you submit to AI features may be processed by third-party AI providers under strict data-processing agreements. We do not use your personal content to train public AI models.",
  },
  {
    heading: "Data Retention",
    body:
      "We retain your account data for as long as your account is active. If you delete your account, we will remove or anonymize your personal data within 30 days, except where retention is required for legal, accounting, or fraud-prevention purposes.",
  },
  {
    heading: "Your Rights",
    body:
      "You have the right to: access the data we hold about you; correct inaccurate data; delete your account and associated data; export your data in a portable format; withdraw consent at any time; and lodge a complaint with a data-protection authority (such as ANPD in Brazil or your local EU authority). To exercise any of these rights, email contato@natta.pro.",
  },
  {
    heading: "Security",
    body:
      "We use industry-standard measures to protect your data, including encryption in transit (HTTPS) and at rest, secure password hashing, and limited internal access. No system is 100% secure, so we encourage you to use a strong, unique password.",
  },
  {
    heading: "Children's Privacy",
    body:
      "NATTA is not intended for children under 16. We do not knowingly collect personal data from children. If you believe a child has provided us with personal data, please contact us so we can delete it.",
  },
  {
    heading: "International Data Transfers",
    body:
      "Your data may be stored and processed in countries other than your own, including the United States and the European Union. We use standard contractual clauses and equivalent safeguards to protect your data during international transfers.",
  },
  {
    heading: "Changes to This Policy",
    body:
      "We may update this Privacy Policy from time to time. Material changes will be communicated through the App or by email. The \"Last updated\" date at the top reflects the most recent revision.",
  },
  {
    heading: "Contact Us",
    body:
      "If you have any questions, requests, or complaints regarding this policy or your data, please contact our team at contato@natta.pro. We will respond within 30 days.",
  },
];

export default function PrivacyScreen() {
  return (
    <LegalPage
      title="Privacy Policy"
      lastUpdated="May 14, 2026"
      intro="This Privacy Policy explains how NATTA collects, uses, and protects your personal information when you use our mobile application. Your privacy matters to us."
      sections={sections}
    />
  );
}
