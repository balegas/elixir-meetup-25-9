defmodule InvoiceManagerWeb.AuthController do
  use InvoiceManagerWeb, :controller

  def login(conn, _params) do
    render(conn, :login)
  end

  def logout(conn, _params) do
    conn
    |> put_session(:authenticated, false)
    |> put_flash(:info, "Successfully logged out!")
    |> redirect(to: "/login")
  end
end
