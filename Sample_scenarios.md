1. Refunds & fraud (matches your training data closely — good first test)

We need a payment gateway for e-commerce merchants that processes card payments, supports refunds under $50 for staff without approval while anything above needs owner sign-off, and needs to comply with PCI-DSS by routing card data through a processor like Stripe. Fraud attempts should auto-block an account after 5 failed payment attempts for 30 minutes.

2. Subscription billing

Build a subscription billing system for a SaaS product that charges customers monthly via credit card, automatically retries failed payments up to 3 times before cancelling the subscription, and sends the customer an email receipt after every successful charge. Admins need a dashboard to see churned vs active subscribers.

3. Cross-border remittance

We're building a mobile app that lets users send money internationally between the US and India. It needs to support USD and INR, show the live exchange rate before confirming a transfer, comply with AML/KYC by verifying user identity before their first transfer over $1000, and keep transaction records for at least 5 years for audit purposes.

4. In-store POS

Design a point-of-sale system for a retail chain that accepts card and contactless payments, syncs inventory in real time across 20 store locations, lets managers issue same-day refunds without a receipt for purchases made in the last 7 days, and needs 99.9% uptime since it's the only way stores can complete a sale.

5. Marketplace payouts (heavier compliance/risk profile — good for seeing "High risk" flags)

We're building a two-sided marketplace where buyers pay via card and sellers get paid out weekly via bank transfer. The platform must hold funds in escrow until the buyer confirms delivery, support disputes/chargebacks with a manual review process, verify seller identity before they can receive payouts, and comply with both PCI-DSS and applicable money-transmitter regulations.