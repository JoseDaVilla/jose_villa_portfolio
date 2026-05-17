---
title: "VerifyLead"
year: 2025
tagline: "Lead platform processing thousands of leads daily. Real-time SMTP validation pings the destination mailbox to confirm deliverability and protect sender domain reputation. Paired with email + SMS campaigns, OTP-verified embeddable forms, and intelligent lead scoring."
tags: ["Node.js", "PostgreSQL", "SMTP", "Twilio", "SendGrid"]
category: "selected"
order: 3
role: "Lead Engineer"
coverImage: "../../assets/projects/verifylead/01.png"
gallery:
  - "../../assets/projects/verifylead/02.png"
  - "../../assets/projects/verifylead/03.png"
---

A lead platform that ingests and validates **thousands of leads per day**. The differentiator is real-time SMTP validation: the system actually pings the destination mailbox to confirm a real inbox exists before passing the lead through, protecting the sender domain's reputation from bouncing into spam folders.

On top of validation:

- **OTP-verified embeddable forms** for partner sites
- Automated **email and SMS sequences** via SendGrid and Twilio
- An **intelligent lead scoring** layer that ranks incoming records by propensity to convert

PostgreSQL backs the data, Node.js handles the live validation pipeline.
