import { useState } from "react";
import { createInvoiceAction } from "../lib/collections";
import { invoiceSchema } from "../lib/schema";

interface InvoiceFormProps {
  onClose: () => void;
  onSuccess: () => void;
}

interface FormData {
  name?: string;
  is_recurring: boolean;
  tags: string;
  amount?: number;
  due_day: string;
  description: string;
}

export function InvoiceForm({ onClose, onSuccess }: InvoiceFormProps) {
  const [formData, setFormData] = useState<FormData>({
    is_recurring: false,
    tags: "",
    due_day: "",
    description: "",
  });

  const [globalError, setGlobalError] = useState<string>("");

  const handleInputChange = (
    field: keyof FormData,
    value: string | boolean
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setGlobalError(""); // Clear global error on input change
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name) {
      setGlobalError("Name is required");
      return;
    }
    if (!formData.amount) {
      setGlobalError("Amount is required");
      return;
    }

    // Validate with Zod schema directly
    const validationResult = invoiceSchema.safeParse({
      id: crypto.randomUUID(),
      name: formData.name,
      is_recurring: formData.is_recurring.toString(),
      tags: formData.tags
        ? formData.tags
            .split(",")
            .map((tag) => tag.trim())
            .filter(Boolean)
        : [],
      amount: formData.amount.toString(),
      due_day: formData.due_day ? parseInt(formData.due_day) : null,
      description: formData.description || null,
      file_path: null,
      inserted_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    if (!validationResult.success) {
      const errorMessage = validationResult.error.message;
      setGlobalError(errorMessage);
      return;
    }

    try {
      // Use the optimistic action
      createInvoiceAction({
        invoiceData: validationResult.data,
      });

      onSuccess();
      onClose();
    } catch (error) {
      console.log("❌ Invoice creation failed:", error);
      setGlobalError("Failed to create invoice. Please try again.");
    }
  };

  return (
    <div className="mb-8 bg-white rounded-lg border border-gray-200 p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">
        Add New Invoice
      </h3>

      {globalError && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-600">{globalError}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Invoice Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              placeholder="e.g., Electricity Bill"
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm bg-white text-gray-900 placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Amount
            </label>
            <input
              type="number"
              step="0.01"
              value={formData.amount}
              onChange={(e) => handleInputChange("amount", e.target.value)}
              placeholder="0.00"
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm bg-white text-gray-900 placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Due Day (1-31)
            </label>
            <input
              type="number"
              min="1"
              max="31"
              value={formData.due_day}
              onChange={(e) => handleInputChange("due_day", e.target.value)}
              placeholder="15"
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm bg-white text-gray-900 placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tags (comma separated)
            </label>
            <input
              type="text"
              value={formData.tags}
              onChange={(e) => handleInputChange("tags", e.target.value)}
              placeholder="utilities, monthly"
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm bg-white text-gray-900 placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => handleInputChange("description", e.target.value)}
            placeholder="Optional description..."
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm bg-white text-gray-900 placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={formData.is_recurring}
              onChange={(e) =>
                handleInputChange("is_recurring", e.target.checked)
              }
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <span className="ml-2 text-sm text-gray-700">
              This is a recurring invoice
            </span>
          </label>
        </div>

        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Create Invoice
          </button>
        </div>
      </form>
    </div>
  );
}
