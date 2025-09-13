defmodule InvoiceManagerWeb.PageController do
  use InvoiceManagerWeb, :controller

  def home(conn, _params) do
    render(conn, :home)
  end
end
