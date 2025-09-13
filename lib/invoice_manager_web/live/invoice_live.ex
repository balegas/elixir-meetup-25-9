defmodule InvoiceManagerWeb.InvoiceLive do
  use InvoiceManagerWeb, :live_view
  alias InvoiceManager.Invoices
  alias InvoiceManager.Invoices.Invoice

  @impl true
  def mount(_params, _session, socket) do
    invoices = Invoices.list_invoices()
    recurring_invoices = Invoices.list_recurring_invoices()

    {:ok,
     socket
     |> assign(:invoices, invoices)
     |> assign(:recurring_invoices, recurring_invoices)
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
        # Handle file upload if present
        socket = handle_file_upload(socket, invoice)

        invoices = Invoices.list_invoices()
        recurring_invoices = Invoices.list_recurring_invoices()

        {:noreply,
         socket
         |> assign(:invoices, invoices)
         |> assign(:recurring_invoices, recurring_invoices)
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
     |> assign(:invoices, invoices)
     |> assign(:filters, filters)}
  end

  @impl true
  def handle_event("delete_invoice", %{"id" => id}, socket) do
    invoice = Invoices.get_invoice!(id)
    {:ok, _} = Invoices.delete_invoice(invoice)

    invoices = Invoices.list_invoices(socket.assigns.filters)
    recurring_invoices = Invoices.list_recurring_invoices()

    {:noreply,
     socket
     |> assign(:invoices, invoices)
     |> assign(:recurring_invoices, recurring_invoices)
     |> put_flash(:info, "Invoice deleted successfully!")}
  end

  @impl true
  def handle_event("validate_upload", _, socket) do
    {:noreply, socket}
  end

  defp handle_file_upload(socket, invoice) do
    consume_uploaded_entries(socket, :invoice_file, fn %{path: path}, entry ->
      # Create month directory
      now = DateTime.utc_now()

      month_dir =
        "priv/static/uploads/invoices/#{now.year}/#{String.pad_leading("#{now.month}", 2, "0")}"

      File.mkdir_p!(month_dir)

      # Generate filename
      extension = Path.extname(entry.client_name)

      filename =
        "#{invoice.name}_#{now.year}_#{String.pad_leading("#{now.month}", 2, "0")}#{extension}"

      dest_path = Path.join(month_dir, filename)

      # Copy file
      File.cp!(path, dest_path)

      # Return the relative path for storage
      relative_path =
        "/uploads/invoices/#{now.year}/#{String.pad_leading("#{now.month}", 2, "0")}/#{filename}"

      {:ok, relative_path}
    end)

    socket
  end

  defp format_currency(nil), do: ""

  defp format_currency(amount) do
    "$#{:erlang.float_to_binary(Decimal.to_float(amount), decimals: 2)}"
  end

  defp format_tags([]), do: ""

  defp format_tags(tags) when is_list(tags) do
    Enum.join(tags, ", ")
  end
end
