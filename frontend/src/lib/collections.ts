import { createCollection, createOptimisticAction } from "@tanstack/react-db";
import { electricCollectionOptions } from "@tanstack/electric-db-collection";
import { config } from "../config";
import { createAuthHeader } from "./auth";
import { type Invoice, invoiceSchema } from "./schema";

import type { ElectricCollectionUtils } from "@tanstack/electric-db-collection";

// Keep a small cache to store originals for delete mutations captured during onMutate
const originalInvoiceById = new Map<string, Invoice>();

// Create the invoices collection without mutation handlers
export const invoicesCollection = createCollection(
  electricCollectionOptions({
    id: "invoices",
    getKey: (item: Invoice) => item.id.toString(),
    shapeOptions: {
      url: `${config.api.baseUrl}/shapes/invoices`,
      headers: {
        Authorization: createAuthHeader(),
        Accept: "application/json",
      },
    },
  })
);

// API function for sending mutations to backend
async function sendMutations(mutations: any[]) {
  const response = await fetch(`${config.api.baseUrl}/writes/ingest`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: createAuthHeader(),
      Accept: "application/json",
    },
    body: JSON.stringify({ mutations }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(
      errorData.error
        ? JSON.stringify(errorData.error)
        : "Failed to ingest mutations"
    );
  }

  const result = await response.json();
  return parseInt(result.txid);
}

// How to handle other types of mutations
// https://github.com/electric-sql/phoenix_sync/blob/main/lib/phoenix/sync/writer/format/tanstack_db.ex
export const createInvoiceAction = createOptimisticAction({
  onMutate: ({ invoiceData }: { invoiceData: Invoice }) => {
    const result = invoiceSchema.safeParse(invoiceData);
    if (!result.success) {
      throw new Error("Invalid invoice data");
    }

    invoicesCollection.insert({
      id: crypto.randomUUID(),
      name: invoiceData.name,
      is_recurring: invoiceData.is_recurring,
      tags: invoiceData.tags,
      amount: invoiceData.amount,
      due_day: invoiceData.due_day,
      description: invoiceData.description,
      file_path: null,
      inserted_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
  },

  mutationFn: async ({ invoiceData }: { invoiceData: Invoice }) => {
    // Build the mutation in the format that the backend expects
    const mutation = {
      modified: invoiceData,
      syncMetadata: {
        relation: ["public", "invoices"],
      },
      type: "insert",
    };

    const txid = await sendMutations([mutation]);

    // Wait for the transaction to be synchronized
    await(invoicesCollection.utils as ElectricCollectionUtils).awaitTxId(txid);

    return { txid };
  },
});

export const deleteInvoiceAction = createOptimisticAction({
  onMutate: ({ invoiceData }: { invoiceData: Invoice }) => {
    invoicesCollection.delete(invoiceData.id);
  },

  mutationFn: async ({ invoiceData }: { invoiceData: Invoice }) => {
    try {
      const mutation = {
        original: invoiceData,
        syncMetadata: {
          relation: ["public", "invoices"],
        },
        type: "delete",
      };

      const txid = await sendMutations([mutation]);

      await (invoicesCollection.utils as ElectricCollectionUtils).awaitTxId(
        txid
      );

      // Cleanup captured original
      originalInvoiceById.delete(invoiceData.id);

      return { txid };
    } catch (error) {
      throw new Error("Failed to delete invoice");
    }
  },
});
