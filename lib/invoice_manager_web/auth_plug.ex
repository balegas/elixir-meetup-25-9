defmodule InvoiceManagerWeb.AuthPlug do
  @moduledoc """
  Simple password authentication plug using environment variable.
  """
  import Plug.Conn
  import Phoenix.Controller
  require Logger

  def init(opts), do: opts

  def call(conn, _opts) do
    case get_session(conn, :authenticated) do
      true ->
        # User is already authenticated
        conn

      _ ->
        # Check if this is a login attempt
        case conn.method do
          "POST" -> check_login_attempt(conn)
          _ -> redirect_to_login(conn)
        end
    end
  end

  defp check_login_attempt(conn) do
    case conn.params do
      %{"password" => password} ->
        admin_password = System.get_env("ADMIN_PASSWORD") || "admin123"

        if password == admin_password do
          conn
          |> put_session(:authenticated, true)
          |> put_flash(:info, "Successfully logged in!")
          |> redirect(to: "/")
          |> halt()
        else
          conn
          |> put_flash(:error, "Invalid password")
          |> redirect_to_login()
        end

      _ ->
        redirect_to_login(conn)
    end
  end

  defp redirect_to_login(conn) do
    if conn.request_path != "/login" do
      conn
      |> put_flash(:error, "Please log in to access this area")
      |> redirect(to: "/login")
      |> halt()
    else
      conn
    end
  end
end
