import { invoiceCreateSchema, type InvoiceCreate } from "./schema";

export type FieldErrors = Record<string, string>;

// Convenience function that combines building and validation
export function createInvoice(input: {
  name: string;
  is_recurring: boolean;
  tags: string;
  amount: string;
  due_day: string;
  description: string;
}):
  | { success: true; value: InvoiceCreate }
  | { success: false; errors: FieldErrors } {
  const errors: FieldErrors = {};

  // Parse/normalize inputs first and capture parse errors immediately
  const tags = input.tags
    .split(",")
    .map((tag) => tag.trim())
    .filter((tag) => tag.length > 0);

  let amount: number | null = null;
  if (input.amount !== "") {
    const num = Number(input.amount);
    if (Number.isNaN(num)) {
      errors.amount = "Amount must be a number";
    } else {
      amount = num;
    }
  }

  let due_day: number | null = null;
  if (input.due_day !== "") {
    const num = Number(input.due_day);
    if (Number.isNaN(num)) {
      errors.due_day = "Due day must be a number";
    } else if (!Number.isInteger(num)) {
      errors.due_day = "Due day must be an integer";
    } else {
      due_day = num;
    }
  }

  const description = input.description || null;

  if (Object.keys(errors).length > 0) {
    return { success: false, errors };
  }

  const candidate: InvoiceCreate = {
    name: input.name,
    is_recurring: input.is_recurring,
    tags,
    amount,
    due_day,
    description,
  };

  // Single schema validation pass on the normalized object
  const parsed = invoiceCreateSchema.safeParse(candidate);
  if (parsed.success) {
    return { success: true, value: parsed.data };
  }

  const fieldErrors: FieldErrors = {};
  for (const issue of parsed.error.issues) {
    const path = issue.path[0];
    const key = typeof path === "string" ? path : "form";
    const mappedKey = key === undefined ? "form" : key;
    fieldErrors[mappedKey] = fieldErrors[mappedKey]
      ? `${fieldErrors[mappedKey]} ${issue.message}`
      : issue.message;
  }
  return { success: false, errors: fieldErrors };
}
