defmodule InvoiceManager.Repo.Migrations.CreateInvoicesAndMonthlyInvoices do
  use Ecto.Migration

  def change do
    create table(:invoices) do
      add :name, :string, null: false
      add :is_recurring, :boolean, default: false, null: false
      add :tags, {:array, :string}, default: []
      add :amount, :decimal, precision: 10, scale: 2
      add :due_day, :integer
      add :description, :text

      timestamps(type: :utc_datetime)
    end

    create table(:monthly_invoices) do
      add :invoice_id, references(:invoices, on_delete: :delete_all), null: false
      add :month, :integer, null: false
      add :year, :integer, null: false
      add :file_path, :string
      add :amount, :decimal, precision: 10, scale: 2
      add :paid, :boolean, default: false, null: false
      add :paid_date, :utc_datetime

      timestamps(type: :utc_datetime)
    end

    create index(:invoices, [:name])
    create index(:invoices, [:is_recurring])
    create index(:invoices, [:tags])
    create index(:monthly_invoices, [:invoice_id])
    create index(:monthly_invoices, [:month, :year])
    create index(:monthly_invoices, [:paid])
    create unique_index(:monthly_invoices, [:invoice_id, :month, :year])
  end
end
