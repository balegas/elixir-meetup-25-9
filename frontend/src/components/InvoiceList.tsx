import { eq, like, useLiveQuery } from "@tanstack/react-db";
import { useState } from "react";
import { invoicesCollection, deleteInvoiceAction } from "../lib/collections";
import { type Invoice } from "../lib/schema";
import { InvoiceForm } from "./InvoiceForm";

export function InvoiceList() {
  const [filter, setFilter] = useState<"all" | "recurring" | "non-recurring">(
    "all"
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [showForm, setShowForm] = useState(false);

  // Handle delete invoice
  const handleDeleteInvoice = async (invoiceId: string) => {
    try {
      deleteInvoiceAction({ invoiceId });
    } catch (error) {
      alert("Failed to delete invoice. Please try again.");
    }
  };

  const { data: invoices, isLoading } = useLiveQuery(
    (query) => {
      let q = query.from({ invoices: invoicesCollection });

      if (searchTerm) {
        q = q.where(({ invoices }) => like(invoices.name, `%${searchTerm}%`));
      }

      if (filter === "all") {
        return q;
      } else {
        return q.where(({ invoices }) =>
          eq(invoices.is_recurring, filter === "recurring")
        );
      }
    },
    [filter, searchTerm] // Dependencies array
  );

  return (
    <div className="space-y-6">
      {/* Filters */}
      <form className="flex items-center gap-4 mb-6">
        <select
          className="px-3 py-2 border border-gray-300 rounded-md text-sm bg-white text-gray-900"
          value={filter}
          onChange={(e) =>
            setFilter(e.target.value as "all" | "recurring" | "non-recurring")
          }
        >
          <option value="all">All Invoices</option>
          <option value="recurring">Recurring Only</option>
          <option value="non-recurring">Non-Recurring Only</option>
        </select>
        <input
          type="text"
          placeholder="Search invoices..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
          }}
          className="px-3 py-2 border border-gray-300 rounded-md text-sm flex-1 bg-white text-gray-900 placeholder-gray-400"
        />
      </form>

      {/* Add Invoice Button */}
      <div className="mb-6">
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
        >
          Add New Invoice
        </button>
      </div>

      {/* Invoice Form */}
      {showForm && (
        <InvoiceForm
          onClose={() => setShowForm(false)}
          onSuccess={() => {
            setShowForm(false);
          }}
        />
      )}

      {/* Invoice List */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Invoices</h2>
        </div>

        {isLoading ? (
          <div className="px-6 py-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-500 mt-2">Loading invoices...</p>
          </div>
        ) : invoices.length === 0 ? (
          <div className="px-6 py-8 text-center text-gray-500">
            No invoices found. Add your first invoice above!
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {invoices.map((invoice: Invoice) => (
              <div
                key={invoice.id}
                className="px-6 py-4 flex items-center justify-between hover:bg-gray-50"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className="font-medium text-gray-900">
                      {invoice.name}
                    </h3>
                    {invoice.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    {invoice.due_day && `Due: Day ${invoice.due_day}`}
                    {invoice.amount &&
                      ` • $${parseFloat(invoice.amount).toFixed(2)}`}
                  </p>
                  {invoice.description && (
                    <p className="text-sm text-gray-400 mt-1">
                      {invoice.description}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {invoice.file_path ? (
                    <button className="text-green-600 hover:text-green-800 text-sm font-medium">
                      Download
                    </button>
                  ) : (
                    <span className="text-gray-400 text-sm">No file</span>
                  )}
                  <button
                    onClick={() => handleDeleteInvoice(invoice.id)}
                    className="text-red-600 hover:text-red-800 text-sm"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
