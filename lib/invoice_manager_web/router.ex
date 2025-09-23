defmodule InvoiceManagerWeb.Router do
  use InvoiceManagerWeb, :router

  pipeline :browser do
    plug :accepts, ["html"]
    plug :fetch_session
    plug :fetch_live_flash
    plug :put_root_layout, html: {InvoiceManagerWeb.Layouts, :root}
    plug :protect_from_forgery
    plug :put_secure_browser_headers
  end

  pipeline :api do
    plug :accepts, ["json"]
  end

  scope "/", InvoiceManagerWeb do
    pipe_through :browser

    get "/login", AuthController, :login
    post "/login", AuthController, :login
    get "/logout", AuthController, :logout
  end

  scope "/", InvoiceManagerWeb do
    pipe_through [:browser, InvoiceManagerWeb.AuthPlug]

    live "/", InvoiceLive
  end

  if Application.compile_env(:invoice_manager, :dev_routes) do
    import Phoenix.LiveDashboard.Router

    scope "/dev" do
      pipe_through :browser

      live_dashboard "/dashboard", metrics: InvoiceManagerWeb.Telemetry
      forward "/mailbox", Plug.Swoosh.MailboxPreview
    end
  end
end
