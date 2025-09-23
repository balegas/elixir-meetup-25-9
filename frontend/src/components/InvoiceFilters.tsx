interface InvoiceFiltersProps {
  filter: "all" | "recurring" | "non-recurring";
  onFilterChange: (filter: "all" | "recurring" | "non-recurring") => void;
  searchTerm: string;
  onSearchChange: (term: string) => void;
}

export function InvoiceFilters({
  filter,
  onFilterChange,
  searchTerm,
  onSearchChange,
}: InvoiceFiltersProps) {
  return (
    <div className="bg-white p-4 rounded-lg border border-gray-200 space-y-4">
      {/* Search */}
      <div>
        <label
          htmlFor="search"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Search invoices
        </label>
        <input
          type="text"
          id="search"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search by name, description, or tags..."
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      {/* Filter buttons */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Filter by type
        </label>
        <div className="flex space-x-2">
          <button
            onClick={() => onFilterChange("all")}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              filter === "all"
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            All Invoices
          </button>
          <button
            onClick={() => onFilterChange("recurring")}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              filter === "recurring"
                ? "bg-green-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Recurring
          </button>
          <button
            onClick={() => onFilterChange("non-recurring")}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              filter === "non-recurring"
                ? "bg-orange-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            One-time
          </button>
        </div>
      </div>
    </div>
  );
}
