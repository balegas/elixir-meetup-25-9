defmodule InvoiceManager.Invoices.Invoice do
  use Ecto.Schema
  import Ecto.Changeset

  schema "invoices" do
    field :name, :string
    field :is_recurring, :boolean, default: false
    field :tags, {:array, :string}, default: []
    field :amount, :decimal
    field :due_day, :integer
    field :description, :string

    has_many :monthly_invoices, InvoiceManager.Invoices.MonthlyInvoice

    timestamps(type: :utc_datetime)
  end

  @doc false
  def changeset(invoice, attrs) do
    attrs = parse_tags(attrs)
    invoice
    |> cast(attrs, [:name, :is_recurring, :tags, :amount, :due_day, :description])
    |> validate_required([:name])
    |> validate_length(:name, min: 1, max: 255)
    |> validate_number(:amount, greater_than_or_equal_to: 0)
    |> validate_number(:due_day, greater_than_or_equal_to: 1, less_than_or_equal_to: 31)
    |> validate_length(:description, max: 1000)
    |> unique_constraint(:name)
  end

  defp parse_tags(%{"tags" => tags} = attrs) when is_binary(tags) do
    parsed_tags = 
      tags
      |> String.split(",")
      |> Enum.map(&String.trim/1)
      |> Enum.reject(&(&1 == ""))

    Map.put(attrs, "tags", parsed_tags)
  end

  defp parse_tags(attrs), do: attrs

end
end
