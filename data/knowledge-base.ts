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
    id: "sdlc-agile",
    title: "Agile",
    category: "sdlc_rule",
    text: "Favored when requirements are expected to evolve, continuous delivery is valued, and security/compliance controls can be embedded into each iteration (threat modeling per feature, automated security testing in CI) rather than handled as a single upfront phase.",
  },
  {
    id: "sdlc-waterfall",
    title: "Waterfall",
    category: "sdlc_rule",
    text: "Favored when requirements are fixed, well understood upfront, low risk, and unlikely to change during the project. Poor fit when requirements are expected to evolve or when early user feedback is needed to validate direction.",
  },
  {
    id: "sdlc-v-model",
    title: "V-Model",
    category: "sdlc_rule",
    text: "Favored for safety- or compliance-critical systems where every requirement must map to an explicit verification/test stage and strong traceability is required, even at the cost of slower iteration.",
  },
  {
    id: "sdlc-spiral",
    title: "Spiral",
    category: "sdlc_rule",
    text: "Favored when project risk or the business case itself is still uncertain. Each cycle includes an explicit risk-analysis phase before committing further investment, making it suited to high-uncertainty, high-risk projects.",
  },
  {
    id: "sdlc-rad",
    title: "RAD",
    category: "sdlc_rule",
    text: "Rapid Application Development fits a tight delivery deadline when the team can assemble reusable components, build modules in parallel, and get frequent stakeholder feedback on working software.",
  },
  {
    id: "sdlc-prototype",
    title: "Prototype",
    category: "sdlc_rule",
    text: "Favored when requirements or user workflows are unclear. Users try an early mockup or working prototype and give feedback to clarify what the production system should do.",
  },
  {
    id: "sdlc-iterative",
    title: "Iterative",
    category: "sdlc_rule",
    text: "Favored when the core requirements are understood but the implementation needs refinement. Build a working version, measure its performance and reliability, and improve it over successive iterations.",
  },
];
