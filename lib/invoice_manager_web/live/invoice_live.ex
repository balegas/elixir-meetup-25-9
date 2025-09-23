defmodule InvoiceManagerWeb.InvoiceLive do
  use InvoiceManagerWeb, :live_view
  alias InvoiceManager.Invoices
  alias InvoiceManager.Invoices.Invoice
  alias InvoiceManager.FileUpload
  require Logger

  @impl true
  def mount(_params, _session, socket) do
    invoices = Invoices.list_invoices()

    {:ok,
     socket
     |> stream(:invoices, invoices)
     |> assign(:filters, %{})
     |> assign(:form, to_form(Invoices.change_invoice(%Invoice{})))
     |> assign(:show_form, false)
     |> assign(:uploaded_files, [])
     |> allow_upload(:invoice_file,
       accept: ~w(.pdf .jpg .jpeg .png),
       max_entries: 1,
       max_file_size: 10_000_000
     )}
  end

  @impl true
  def handle_event("toggle_form", _, socket) do
    {:noreply, assign(socket, :show_form, !socket.assigns.show_form)}
  end

  @impl true
  def handle_event("validate_invoice", %{"invoice" => invoice_params}, socket) do
    changeset =
      %Invoice{}
      |> Invoices.change_invoice(invoice_params)
      |> Map.put(:action, :validate)

    {:noreply, assign(socket, :form, to_form(changeset))}
  end

  @impl true
  def handle_event("save_invoice", %{"invoice" => invoice_params}, socket) do
    case Invoices.create_invoice(invoice_params) do
      {:ok, invoice} ->
        updated_invoice = handle_file_upload(socket, invoice)

        {:noreply,
         socket
         |> stream_insert(:invoices, updated_invoice)
         |> assign(:form, to_form(Invoices.change_invoice(%Invoice{})))
         |> assign(:show_form, false)
         |> put_flash(:info, "Invoice created successfully!")}

      {:error, %Ecto.Changeset{} = changeset} ->
        {:noreply, assign(socket, :form, to_form(changeset))}
    end
  end

  @impl true
  def handle_event("filter", %{"filters" => filters}, socket) do
    invoices = Invoices.list_invoices(filters)

    {:noreply,
     socket
     |> stream(:invoices, invoices, reset: true)
     |> assign(:filters, filters)}
  end

  @impl true
  def handle_event("delete_invoice", %{"id" => id}, socket) do
    invoice = Invoices.get_invoice!(id)
    {:ok, _} = Invoices.delete_invoice(invoice)

    {:noreply,
     socket
     |> stream_delete(:invoices, invoice)
     |> put_flash(:info, "Invoice deleted successfully!")}
  end

  @impl true
  def handle_event("cancel-upload", %{"ref" => ref}, socket) do
    {:noreply, cancel_upload(socket, :invoice_file, ref)}
  end

  @impl true
  def handle_event("validate", _, socket) do
    {:noreply, socket}
  end

  @impl true
  def handle_event("download_file", %{"id" => invoice_id}, socket) do
    invoice = Invoices.get_invoice!(invoice_id)

    case invoice.file_path do
      nil ->
        {:noreply, put_flash(socket, :error, "No file attached to this invoice")}

      file_path ->
        case FileUpload.get_download_url(file_path) do
          {:ok, download_url} ->
            {:noreply, push_event(socket, "download", %{url: download_url})}

          {:error, reason} ->
            Logger.error(
              "Failed to generate download URL for invoice #{invoice_id}: #{inspect(reason)}"
            )

            {:noreply, put_flash(socket, :error, "Download failed: #{reason}")}
        end
    end
  end

  defp handle_file_upload(socket, invoice) do
    uploaded_files =
      consume_uploaded_entries(socket, :invoice_file, fn %{path: _path} = entry, _upload ->
        case FileUpload.upload_invoice_file(entry, invoice) do
          {:ok, file_path} ->
            case Invoices.update_invoice(invoice, %{file_path: file_path}) do
              {:ok, updated_invoice} -> {:ok, updated_invoice}
              {:error, _changeset} -> {:postpone, :error}
            end

          {:error, reason} ->
            {:postpone, reason}
        end
      end)

    case uploaded_files do
      [updated_invoice] -> updated_invoice
      [] -> invoice
      _ -> invoice
    end
  end

  defp format_currency(nil), do: ""

  defp format_currency(amount) do
    "$#{:erlang.float_to_binary(Decimal.to_float(amount), decimals: 2)}"
  end
end
