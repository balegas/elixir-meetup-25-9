defmodule InvoiceManagerWeb.WriteController do
  use Phoenix.Controller, formats: [:json]

  alias Phoenix.Sync.Writer
  alias Phoenix.Sync.Writer.Format
  alias InvoiceManager.Repo
  alias InvoiceManager.Invoices.Invoice

  def ingest(conn, %{"mutations" => mutations} = _params) do
    IO.inspect(mutations, label: "Raw mutations received")

    case Writer.new()
         |> Writer.allow(Invoice,
           accept: [:insert, :update, :delete],
           validate: &Invoice.changeset/2,
           load: &load_invoice/1
         )
         |> Writer.apply(mutations, Repo, format: Format.TanstackDB) do
      {:ok, txid, _changes} ->
        json(conn, %{txid: Integer.to_string(txid)})

      {:error, _failed_operation, failed_value, _changes_so_far} ->
        error_message = extract_error_message(failed_value)

        conn
        |> put_status(:bad_request)
        |> json(%{error: error_message})
    end
  rescue
    error ->
      IO.inspect(error, label: "Error in ingest")

      conn
      |> put_status(:internal_server_error)
      |> json(%{error: "Internal server error: #{inspect(error)}"})
  end

  defp load_invoice(%{"id" => id}) when is_binary(id) do
    case Repo.get(Invoice, id) do
      nil -> {:error, :not_found}
      invoice -> {:ok, invoice}
    end
  end

  defp load_invoice(%{id: id}) when is_binary(id) do
    case Repo.get(Invoice, id) do
      nil -> {:error, :not_found}
      invoice -> {:ok, invoice}
    end
  end

  defp load_invoice(_), do: {:ok, %Invoice{}}

  defp extract_error_message(%Ecto.Changeset{} = changeset) do
    Ecto.Changeset.traverse_errors(changeset, fn {msg, opts} ->
      Regex.replace(~r"%{(\w+)}", msg, fn _, key ->
        opts |> Keyword.get(String.to_existing_atom(key), key) |> to_string()
      end)
    end)
  end

  defp extract_error_message(error), do: to_string(error)
end
