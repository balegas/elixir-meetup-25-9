defmodule InvoiceManagerWeb.AuthController do
  use InvoiceManagerWeb, :controller

  def login(conn, %{"password" => password}) do
    admin_password = System.get_env("ADMIN_PASSWORD") || "admin123"

    if password == admin_password do
      conn
      |> put_session(:authenticated, true)
      |> put_flash(:info, "Successfully logged in!")
      |> redirect(to: "/")
    else
      conn
      |> put_flash(:error, "Invalid password")
      |> render(:login)
    end
  end

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
