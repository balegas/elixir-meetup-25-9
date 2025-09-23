import { createCollection, createOptimisticAction } from "@tanstack/react-db";
import { electricCollectionOptions } from "@tanstack/electric-db-collection";
import { config } from "../config";
import { createAuthHeader } from "./auth";
import { type Invoice } from "./schema";

// Create the invoices collection using Electric
export const invoicesCollection = createCollection(
  electricCollectionOptions<Invoice>({
    id: "invoices",
    getKey: (item) => item.id,
    shapeOptions: {
      url: `${config.api.baseUrl}/shapes/invoices`,
      headers: {
        Authorization: createAuthHeader(),
        Accept: "application/json",
      },
    },
  })
);

// Optimistic action for creating invoices
export const createInvoiceAction = createOptimisticAction({
  onMutate: (vars: unknown) => {
    const { invoiceData } = vars as { invoiceData: any };

    // Generate a temporary ID for optimistic update
    const randomId = Math.random().toString(36).substring(2, 15);
    const now = new Date().toISOString();

    // Prepare optimistic data
    const optimisticInvoice: Invoice = {
      id: randomId,
      name: invoiceData.name,
      is_recurring: invoiceData.is_recurring.toString(),
      tags: invoiceData.tags,
      amount: invoiceData.amount ? invoiceData.amount.toString() : null,
      due_day: invoiceData.due_day,
      description: invoiceData.description,
      file_path: null,
      inserted_at: now,
      updated_at: now,
    };
    invoicesCollection.insert(optimisticInvoice);
  },

  mutationFn: async (vars: unknown) => {
    const { invoiceData } = vars as { invoiceData: any };

    const response = await fetch(`${config.api.baseUrl}/writes/invoices`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: createAuthHeader(),
        Accept: "application/json",
      },
      body: JSON.stringify({
        transaction: {
          mutations: [
            {
              type: "insert",
              id: invoiceData.id,
              table: "invoices",
              data: invoiceData,
            },
          ],
        },
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.errors
          ? JSON.stringify(errorData.errors)
          : "Failed to create invoice"
      );
    }

    const createdInvoice = await response.json();
    await new Promise((resolve) => setTimeout(resolve, 1000));

    return createdInvoice;
  },
});

// Optimistic action for deleting invoices
export const deleteInvoiceAction = createOptimisticAction({
  onMutate: (vars: unknown) => {
    const { invoiceId } = vars as { invoiceId: string };

    // Optimistically delete the invoice
    invoicesCollection.delete(invoiceId);

    return { invoiceId };
  },

  mutationFn: async (vars: unknown) => {
    const { invoiceId } = vars as { invoiceId: string };

    const response = await fetch(
      `${config.api.baseUrl}/writes/invoices/${invoiceId}`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: createAuthHeader(),
          Accept: "application/json",
        },
        body: JSON.stringify({
          transaction: {
            mutations: [
              {
                type: "delete",
                id: invoiceId,
                table: "invoices",
              },
            ],
          },
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.errors
          ? JSON.stringify(errorData.errors)
          : "Failed to delete invoice"
      );
    }

    const result = await response.json();
    await new Promise((resolve) => setTimeout(resolve, 1000));
    return result;
  },
});
