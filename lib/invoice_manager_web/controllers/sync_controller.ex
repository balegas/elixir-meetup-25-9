defmodule InvoiceManagerWeb.SyncController do
  use InvoiceManagerWeb, :controller
  import Phoenix.Sync.Controller
  import Ecto.Query, only: [from: 2]
  import Plug.Conn
  require Logger

  alias InvoiceManager.Invoices.Invoice

  @doc """
  Sync invoices filtered by recurring status.

  Parameters:
  - recurring: "true" for recurring invoices, "false" for non-recurring, or omit for all
  """
  def invoices_by_recurring(conn, %{"recurring" => recurring} = params)
      when recurring in ["true", "false"] do
    is_recurring = recurring == "true"
    query = from(i in Invoice, where: i.is_recurring == ^is_recurring)
    sync_render(conn, params, fn -> query end)
  end

  def invoices_by_recurring(conn, params) do
    sync_render(conn, params, fn -> Invoice end)
  end
end
