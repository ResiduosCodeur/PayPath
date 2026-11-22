// Small, hand-written knowledge base for retrieval-grounded generation.
// Each entry: id, title, category ("regulation" | "sdlc_rule"), text.
// This is original summary text, not copied from any regulation's actual wording.

export type KBDoc = { id: string; title: string; category: "regulation" | "sdlc_rule"; text: string };

export const KNOWLEDGE_BASE: KBDoc[] = [
  {
    id: "reg-pci-dss",
    title: "PCI-DSS (Payment Card Industry Data Security Standard)",
    category: "regulation",
    text: "Applies to any system that stores, processes, or transmits cardholder data. Requires encryption of card data at rest and in transit, network segmentation, restricted access to cardholder data on a need-to-know basis, and regular security testing. Routing card data through a certified third-party processor (e.g. Stripe, Braintree) can keep a merchant out of full PCI scope.",
  },
  {
    id: "reg-psd2-sca",
    title: "PSD2 / Strong Customer Authentication (SCA)",
    category: "regulation",
    text: "European regulation requiring multi-factor authentication (something the user knows, has, and is) for most electronic payments above a low-value threshold. Step-up authentication (e.g. 3D Secure 2) is a common implementation. Exemptions exist for low-risk or low-value transactions.",
  },
  {
    id: "reg-aml-kyc",
    title: "AML / KYC (Anti-Money Laundering / Know Your Customer)",
    category: "regulation",
    text: "Requires verifying customer identity before allowing significant financial activity, monitoring transactions for suspicious patterns, and retaining transaction records (commonly 5-7 years depending on jurisdiction) for audit and regulatory reporting. Applies broadly to payment platforms, marketplaces with payouts, and money-transmission services.",
  },
  {
    id: "reg-gdpr",
    title: "GDPR (General Data Protection Regulation)",
    category: "regulation",
    text: "Applies to personal data of EU residents. Requires data minimization, a lawful basis for processing, the ability to fulfil deletion/export requests, and can require EU-region data residency along with a data processing agreement with any sub-processors handling that data.",
  },
  {
    id: "reg-chargeback",
    title: "Card network chargeback rules",
    category: "regulation",
    text: "When a cardholder disputes a transaction, funds are typically held or reversed pending investigation. Merchants must be able to respond with evidence within a network-defined window. Systems handling disputes should automatically freeze the disputed amount and notify the merchant.",
  },
  {
    id: "reg-audit-trail",
    title: "Audit trail / record-keeping expectations",
    category: "regulation",
    text: "Financial systems are generally expected to maintain an immutable log of administrative actions (refunds, account changes, overrides) including who performed the action and when, with role-based access controls on who can view or export that log.",
  },
  {
    id: "sdlc-agile-devsecops",
    title: "Agile / DevSecOps selection guidance",
    category: "sdlc_rule",
    text: "Favored when requirements are expected to evolve, continuous delivery is valued, and security/compliance controls can be embedded into each iteration (threat modeling per feature, automated security testing in CI) rather than handled as a single upfront phase.",
  },
  {
    id: "sdlc-waterfall",
    title: "Waterfall selection guidance",
    category: "sdlc_rule",
    text: "Favored when requirements are fixed, well understood upfront, low risk, and unlikely to change during the project. Poor fit when requirements are expected to evolve or when early user feedback is needed to validate direction.",
  },
  {
    id: "sdlc-v-model",
    title: "V-Model selection guidance",
    category: "sdlc_rule",
    text: "Favored for safety- or compliance-critical systems where every requirement must map to an explicit verification/test stage and strong traceability is required, even at the cost of slower iteration.",
  },
  {
    id: "sdlc-spiral",
    title: "Spiral selection guidance",
    category: "sdlc_rule",
    text: "Favored when project risk or the business case itself is still uncertain. Each cycle includes an explicit risk-analysis phase before committing further investment, making it suited to high-uncertainty, high-risk projects.",
  },
  {
    id: "sdlc-rad",
    title: "Rapid Application Development (RAD) selection guidance",
    category: "sdlc_rule",
    text: "Favored when a working prototype is needed quickly to validate a concept with stakeholders, and requirements are relatively low-risk. Not suited to heavily regulated or safety-critical work.",
  },
  {
    id: "sdlc-kanban",
    title: "Kanban selection guidance",
    category: "sdlc_rule",
    text: "Favored for ongoing operational work or maintenance with a continuous stream of small changes rather than a project with a fixed scope and end date.",
  },
];
