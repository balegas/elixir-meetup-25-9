import { type Invoice } from "../lib/schema";

interface InvoiceCardProps {
  invoice: Invoice;
}

export function InvoiceCard({ invoice }: InvoiceCardProps) {
  const formatAmount = (amount: string | null) => {
    if (!amount) return "N/A";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(parseFloat(amount));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {invoice.name}
          </h3>

          {invoice.description && (
            <p className="text-gray-600 text-sm mb-3 line-clamp-2">
              {invoice.description}
            </p>
          )}

          <div className="flex items-center space-x-4 text-sm text-gray-500 mb-3">
            {invoice.amount && (
              <span className="font-medium text-green-600">
                {formatAmount(invoice.amount)}
              </span>
            )}

            {invoice.due_day && <span>Due: Day {invoice.due_day}</span>}
          </div>

          {invoice.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-3">
              {invoice.tags.map((tag, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {invoice.is_recurring && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Recurring
                </span>
              )}

              {invoice.file_path && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                  📎 File
                </span>
              )}
            </div>

            <span className="text-xs text-gray-400">
              {formatDate(invoice.updated_at)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
