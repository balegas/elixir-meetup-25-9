defmodule InvoiceManager.Invoices.MonthlyInvoice do
  use Ecto.Schema
  import Ecto.Changeset

  schema "monthly_invoices" do
    field :month, :integer
    field :year, :integer
    field :file_path, :string
    field :amount, :decimal
    field :paid, :boolean, default: false
    field :paid_date, :utc_datetime

    belongs_to :invoice, InvoiceManager.Invoices.Invoice

    timestamps(type: :utc_datetime)
  end

  @doc false
  def changeset(monthly_invoice, attrs) do
    monthly_invoice
    |> cast(attrs, [:month, :year, :file_path, :amount, :paid, :paid_date, :invoice_id])
    |> validate_required([:month, :year, :invoice_id])
    |> validate_number(:month, greater_than_or_equal_to: 1, less_than_or_equal_to: 12)
    |> validate_number(:year, greater_than_or_equal_to: 2000, less_than_or_equal_to: 3000)
    |> validate_number(:amount, greater_than_or_equal_to: 0)
    |> unique_constraint([:invoice_id, :month, :year])
    |> foreign_key_constraint(:invoice_id)
  end
end
