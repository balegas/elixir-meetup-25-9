import { useState } from "react";
import { createInvoiceAction } from "../lib/collections";
import { createInvoice } from "../lib/validation";

interface InvoiceFormProps {
  onClose: () => void;
  onSuccess: () => void;
}

interface FormData {
  name: string;
  is_recurring: boolean;
  tags: string;
  amount: string;
  due_day: string;
  description: string;
}

export function InvoiceForm({ onClose, onSuccess }: InvoiceFormProps) {
  const [formData, setFormData] = useState<FormData>({
    name: "",
    is_recurring: false,
    tags: "",
    amount: "",
    due_day: "",
    description: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (
    field: keyof FormData,
    value: string | boolean
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => {
      const next = { ...prev };
      if (next[field as string]) {
        delete next[field as string];
      }
      return next;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Build payload in the exact shape expected by the API and schema
    try {
      const result = createInvoice({
        name: formData.name,
        is_recurring: formData.is_recurring,
        tags: formData.tags,
        amount: formData.amount,
        due_day: formData.due_day,
        description: formData.description,
      });

      if (!result.success) {
        setErrors(result.errors);
        return;
      }

      // Use the optimistic action
      createInvoiceAction({ invoiceData: result.value });

      onSuccess();
      onClose();
    } catch (error) {
      console.log("❌ Invoice creation failed:", error);
    }
  };

  return (
    <div className="mb-8 bg-white rounded-lg border border-gray-200 p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">
        Add New Invoice
      </h3>

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
              className={`w-full px-3 py-2 border rounded-md text-sm bg-white text-gray-900 placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500 ${
                errors.name
                  ? "border-red-400 focus:border-red-500 focus:ring focus:ring-red-300"
                  : "border-gray-300"
              }`}
              required
            />
            {errors.name && (
              <p className="text-sm text-red-600 mt-1">{errors.name}</p>
            )}
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
              className={`w-full px-3 py-2 border rounded-md text-sm bg-white text-gray-900 placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500 ${
                errors.amount
                  ? "border-red-400 focus:border-red-500 focus:ring focus:ring-red-300"
                  : "border-gray-300"
              }`}
            />
            {errors.amount && (
              <p className="text-sm text-red-600 mt-1">{errors.amount}</p>
            )}
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
              className={`w-full px-3 py-2 border rounded-md text-sm bg-white text-gray-900 placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500 ${
                errors.due_day
                  ? "border-red-400 focus:border-red-500 focus:ring focus:ring-red-300"
                  : "border-gray-300"
              }`}
            />
            {errors.due_day && (
              <p className="text-sm text-red-600 mt-1">{errors.due_day}</p>
            )}
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
              className={`w-full px-3 py-2 border rounded-md text-sm bg-white text-gray-900 placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500 ${
                errors.tags
                  ? "border-red-400 focus:border-red-500 focus:ring focus:ring-red-300"
                  : "border-gray-300"
              }`}
            />
            {errors.tags && (
              <p className="text-sm text-red-600 mt-1">{errors.tags}</p>
            )}
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
            className={`w-full px-3 py-2 border rounded-md text-sm bg-white text-gray-900 placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500 ${
              errors.description
                ? "border-red-400 focus:border-red-500 focus:ring focus:ring-red-300"
                : "border-gray-300"
            }`}
          />
          {errors.description && (
            <p className="text-sm text-red-600 mt-1">{errors.description}</p>
          )}
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
