import { z } from "zod";

// Invoice schema using Zod
export const invoiceSchema = z.object({
  id: z.string(),
  name: z.string(),
  is_recurring: z.string(),
  tags: z.array(z.string()),
  amount: z.string(),
  due_day: z.number().nullable(),
  description: z.string().nullable(),
  file_path: z.string().nullable(),
  inserted_at: z.string(),
  updated_at: z.string(),
});

// TypeScript type derived from schema
export type Invoice = z.infer<typeof invoiceSchema>;

// Schema for creating a new invoice from the form
// This mirrors the payload built in the form prior to submission
export const invoiceCreateSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  is_recurring: z.boolean(),
  tags: z.array(z.string().trim().min(1, "Tag cannot be empty")).default([]),
  amount: z.number().refine((val) => val === null || val >= 0, {
    message: "Amount must be a positive number",
  }),
  due_day: z
    .number()
    .int()
    .min(1, "Due day must be between 1 and 31")
    .max(31, "Due day must be between 1 and 31")
    .nullable(),
  description: z.string().trim().nullable(),
});

export type InvoiceCreate = z.infer<typeof invoiceCreateSchema>;
