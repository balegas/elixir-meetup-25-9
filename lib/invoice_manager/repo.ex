defmodule InvoiceManager.Repo do
  use Ecto.Repo,
    otp_app: :invoice_manager,
    adapter: Ecto.Adapters.SQLite3
end
