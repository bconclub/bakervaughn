import { z } from "zod";

// Framed as business problems, not product names.
export const SERVICE_OPTIONS = [
  "A website that brings in customers",
  "Winning and converting more customers",
  "Answering calls and taking bookings",
  "HR, payroll and compliance",
  "Stock, sales and accounts",
  "Marketing and brand",
  "Help me choose",
] as const;

export const SERVICE_HINTS: Partial<Record<(typeof SERVICE_OPTIONS)[number], string>> = {
  "A website that brings in customers": "Smartsite: website, leads and conversion",
  "Winning and converting more customers": "AI customer acquisition",
  "Answering calls and taking bookings": "Dialgen.AI, AI receptionist",
  "HR, payroll and compliance": "Rotas, right-to-work, payroll",
  "Stock, sales and accounts": "ERP",
  "Marketing and brand": "Ads, local SEO, branding",
  "Help me choose": "We'll suggest a starting point",
};

export const TIMING_OPTIONS = ["As soon as possible", "In the next 1–3 months", "Just exploring"] as const;

export const enquirySchema = z.object({
  requestId: z.string().uuid(),
  service: z.enum(SERVICE_OPTIONS),
  challenge: z.string().trim().min(10, "Tell us a little more (at least 10 characters).").max(2000),
  timing: z.enum(TIMING_OPTIONS),
  name: z.string().trim().min(2, "Enter your name.").max(120),
  email: z.string().trim().email("Enter a valid email address."),
  company: z.string().trim().min(2, "Enter your business name.").max(160),
  phone: z.string().trim().max(40).optional().or(z.literal("")),
  consent: z.literal(true, { message: "Tick to let us contact you about this enquiry." }),
  website: z.string().max(0).optional().or(z.literal("")), // honeypot
  attribution: z.object({
    ctaSource: z.string().max(80),
    entryPage: z.string().max(500),
    landingPage: z.string().max(500),
    referrer: z.string().max(500),
    utm: z.record(z.string(), z.string().max(200)),
  }),
});

export type Enquiry = z.infer<typeof enquirySchema>;
