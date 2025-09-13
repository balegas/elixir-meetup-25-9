defmodule InvoiceManager.Repo.Migrations.AddFilePathToInvoices do
  use Ecto.Migration

  def change do
    alter table(:invoices) do
      add :file_path, :string
    end
  end
end
