defmodule InvoiceManager.Invoices do
  @moduledoc """
  The Invoices context.
  """

  import Ecto.Query, warn: false
  alias InvoiceManager.Repo
  alias InvoiceManager.Invoices.{Invoice, MonthlyInvoice}

  @doc """
  Returns the list of invoices.
  """
  def list_invoices do
    Repo.all(Invoice)
  end

  @doc """
  Returns the list of recurring invoices.
  """
  def list_recurring_invoices do
    from(i in Invoice, where: i.is_recurring == true)
    |> Repo.all()
  end

  @doc """
  Returns the list of invoices filtered by criteria.
  """
  def list_invoices(filters) do
    query = from(i in Invoice)

    query
    |> filter_by_recurring(filters)
    |> filter_by_month(filters)
    |> filter_by_search(filters)
    |> Repo.all()
  end

  defp filter_by_recurring(query, %{"recurring" => "true"}) do
    from(i in query, where: i.is_recurring == true)
  end

  defp filter_by_recurring(query, %{"recurring" => "false"}) do
    from(i in query, where: i.is_recurring == false)
  end

  defp filter_by_recurring(query, _), do: query

  defp filter_by_month(query, %{"month" => month, "year" => year})
       when is_binary(month) and is_binary(year) do
    {month_int, _} = Integer.parse(month)
    {year_int, _} = Integer.parse(year)

    from(i in query,
      join: mi in MonthlyInvoice,
      on: mi.invoice_id == i.id,
      where: mi.month == ^month_int and mi.year == ^year_int
    )
  end

  defp filter_by_month(query, _), do: query

  defp filter_by_search(query, %{"search" => search}) when is_binary(search) and search != "" do
    search_term = "%#{search}%"
    from(i in query, where: ilike(i.name, ^search_term))
  end

  defp filter_by_search(query, _), do: query

  @doc """
  Gets a single invoice.
  """
  def get_invoice!(id), do: Repo.get!(Invoice, id)

  @doc """
  Creates an invoice.
  """
  def create_invoice(attrs \\ %{}) do
    %Invoice{}
    |> Invoice.changeset(attrs)
    |> Repo.insert()
  end

  @doc """
  Updates an invoice.
  """
  def update_invoice(%Invoice{} = invoice, attrs) do
    invoice
    |> Invoice.changeset(attrs)
    |> Repo.update()
  end

  @doc """
  Deletes an invoice.
  """
  def delete_invoice(%Invoice{} = invoice) do
    Repo.delete(invoice)
  end

  @doc """
  Returns an `%Ecto.Changeset{}` for tracking invoice changes.
  """
  def change_invoice(%Invoice{} = invoice, attrs \\ %{}) do
    Invoice.changeset(invoice, attrs)
  end

  @doc """
  Returns the list of monthly invoices for a given month and year.
  """
  def list_monthly_invoices(month, year) do
    from(mi in MonthlyInvoice,
      where: mi.month == ^month and mi.year == ^year,
      preload: [:invoice]
    )
    |> Repo.all()
  end

  @doc """
  Creates a monthly invoice.
  """
  def create_monthly_invoice(attrs \\ %{}) do
    %MonthlyInvoice{}
    |> MonthlyInvoice.changeset(attrs)
    |> Repo.insert()
  end

  @doc """
  Updates a monthly invoice.
  """
  def update_monthly_invoice(%MonthlyInvoice{} = monthly_invoice, attrs) do
    monthly_invoice
    |> MonthlyInvoice.changeset(attrs)
    |> Repo.update()
  end

  @doc """
  Toggles the paid status of a monthly invoice.
  """
  def toggle_paid(%MonthlyInvoice{} = monthly_invoice) do
    attrs =
      if monthly_invoice.paid do
        %{paid: false, paid_date: nil}
      else
        %{paid: true, paid_date: DateTime.utc_now()}
      end

    update_monthly_invoice(monthly_invoice, attrs)
  end
end
