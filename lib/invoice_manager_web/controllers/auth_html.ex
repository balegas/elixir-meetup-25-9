defmodule InvoiceManagerWeb.AuthHTML do
  @moduledoc """
  This module contains pages rendered by AuthController.
  """
  use InvoiceManagerWeb, :html

  embed_templates "auth_html/*"
end
