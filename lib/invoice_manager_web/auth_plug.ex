defmodule InvoiceManagerWeb.AuthPlug do
  @moduledoc """
  Unified authentication plug that handles both validation and response formatting.
  Supports both session-based auth and HTTP Basic Auth via headers.
  Automatically detects response format (JSON vs HTML) and responds accordingly.
  """
  import Plug.Conn
  import Phoenix.Controller
  require Logger

  def init(opts), do: opts

  def call(conn, _opts) do
    case authenticate(conn) do
      {:ok, conn} ->
        # User is authenticated, continue
        conn

      {:error, reason} ->
        # User not authenticated, handle response based on content type
        handle_auth_failure(conn, reason)
    end
  end

  defp authenticate(conn) do
    # Try session-based auth first
    case get_session(conn, :authenticated) do
      true ->
        {:ok, conn}

      _ ->
        # Try HTTP Basic Auth
        case get_basic_auth(conn) do
          {:ok, username, password} ->
            validate_basic_auth(username, password, conn)

          :error ->
            {:error, :unauthorized}
        end
    end
  end

  defp get_basic_auth(conn) do
    case get_req_header(conn, "authorization") do
      ["Basic " <> encoded] ->
        case Base.decode64(encoded) do
          {:ok, decoded} ->
            case String.split(decoded, ":", parts: 2) do
              [username, password] -> {:ok, username, password}
              _ -> :error
            end

          :error ->
            :error
        end

      _ ->
        :error
    end
  end

  defp validate_basic_auth(username, password, conn) do
    admin_password = System.get_env("ADMIN_PASSWORD") || "admin123"
    admin_username = System.get_env("ADMIN_USERNAME") || "admin"

    if username == admin_username and password == admin_password do
      Logger.info("🔐 Basic Auth successful for user: #{username}")
      {:ok, conn}
    else
      Logger.warning("🔐 Basic Auth failed for user: #{username}")
      {:error, :invalid_credentials}
    end
  end

  defp handle_auth_failure(conn, reason) do
    # Determine response format based on accept header or content type
    case get_response_format(conn) do
      :json ->
        handle_json_auth_failure(conn, reason)

      :html ->
        handle_html_auth_failure(conn, reason)
    end
  end

  defp get_response_format(conn) do
    case get_req_header(conn, "accept") do
      [accept_header | _] ->
        cond do
          String.contains?(accept_header, "application/json") -> :json
          String.contains?(accept_header, "text/html") -> :html
          # Default to HTML
          true -> :html
        end

      _ ->
        # Check content type as fallback
        case get_req_header(conn, "content-type") do
          [content_type | _] ->
            cond do
              String.contains?(content_type, "application/json") -> :json
              String.contains?(content_type, "text/html") -> :html
              true -> :html
            end

          _ ->
            # Default to HTML
            :html
        end
    end
  end

  defp handle_json_auth_failure(conn, reason) do
    error_response = get_json_error_response(reason)

    conn
    |> put_status(error_response.status)
    |> json(error_response.body)
    |> halt()
  end

  defp handle_html_auth_failure(conn, _reason) do
    case conn.method do
      "POST" -> check_login_attempt(conn)
      _ -> redirect_to_login(conn)
    end
  end

  defp get_json_error_response(:unauthorized) do
    %{
      status: :unauthorized,
      body: %{
        error: "Authentication required",
        message: "Please provide valid credentials",
        auth_methods: ["session", "basic_auth"],
        basic_auth_header: "Authorization: Basic base64(username:password)"
      }
    }
  end

  defp get_json_error_response(:invalid_credentials) do
    %{
      status: :unauthorized,
      body: %{
        error: "Invalid credentials",
        message: "Username or password is incorrect",
        auth_methods: ["session", "basic_auth"]
      }
    }
  end

  defp get_json_error_response(_) do
    %{
      status: :unauthorized,
      body: %{
        error: "Authentication failed",
        message: "Please provide valid credentials"
      }
    }
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
