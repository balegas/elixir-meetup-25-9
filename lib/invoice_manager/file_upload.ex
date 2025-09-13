defmodule InvoiceManager.FileUpload do
  @moduledoc """
  Handles file uploads for invoices using Fly.io object storage in production
  and local storage in development.
  """

  require Logger

  @bucket_name "invoice-files"

  def upload_invoice_file(upload_entry, invoice) do
    case Mix.env() do
      :prod -> upload_to_s3(upload_entry, invoice)
      _ -> upload_locally(upload_entry, invoice)
    end
  end

  def get_download_url(file_path) do
    case Mix.env() do
      :prod -> get_s3_download_url(file_path)
      _ -> get_local_download_url(file_path)
    end
  end

  defp upload_to_s3(upload_entry, invoice) do
    now = DateTime.utc_now()
    # Use the path to reliably get the extension
    # Get the original filename from the path
    client_filename = Path.basename(upload_entry.path)
    # Extract extension from the client_filename
    extension = Path.extname(client_filename)

    # Generate S3 key with organized structure
    s3_key =
      "invoices/#{now.year}/#{String.pad_leading("#{now.month}", 2, "0")}/#{sanitize_filename(invoice.name)}_#{now.year}_#{String.pad_leading("#{now.month}", 2, "0")}#{extension}"

    case File.read(upload_entry.path) do
      {:ok, file_data} ->
        case ExAws.S3.put_object(@bucket_name, s3_key, file_data)
             |> ExAws.request() do
          {:ok, _} ->
            {:ok, s3_key}

          {:error, error} ->
            Logger.error("Failed to upload to S3: #{inspect(error)}")
            {:error, "Upload failed"}
        end

      {:error, error} ->
        Logger.error("Failed to read file: #{inspect(error)}")
        {:error, "File read failed"}
    end
  end

  defp upload_locally(upload_entry, invoice) do
    now = DateTime.utc_now()
    # Use the path to reliably get the extension
    # Get the original filename from the path
    client_filename = Path.basename(upload_entry.path)
    # Extract extension from the client_filename
    extension = Path.extname(client_filename)

    # Create month directory
    month_dir =
      "priv/static/uploads/invoices/#{now.year}/#{String.pad_leading("#{now.month}", 2, "0")}"

    File.mkdir_p!(month_dir)

    # Generate filename
    # The invoice.name is sanitized as the base, then append date and the correct extension
    filename =
      "#{sanitize_filename(invoice.name)}_#{now.year}_#{String.pad_leading("#{now.month}", 2, "0")}#{extension}"

    dest_path = Path.join(month_dir, filename)

    # upload_entry.path is the source
    case File.cp(upload_entry.path, dest_path) do
      :ok ->
        relative_path =
          "/uploads/invoices/#{now.year}/#{String.pad_leading("#{now.month}", 2, "0")}/#{filename}"

        {:ok, relative_path}

      {:error, error} ->
        Logger.error("Failed to copy file locally: #{inspect(error)}")
        {:error, "Local upload failed"}
    end
  end

  defp get_s3_download_url(s3_key) do
    case ExAws.S3.presigned_url(:get, @bucket_name, s3_key, expires_in: 3600)
         |> ExAws.request() do
      {:ok, url} ->
        {:ok, url}

      {:error, error} ->
        Logger.error("Failed to generate presigned URL: #{inspect(error)}")
        {:error, "Could not generate download URL"}
    end
  end

  defp get_local_download_url(file_path) do
    {:ok, file_path}
  end

  defp sanitize_filename(name) do
    name
    |> String.replace(~r/[^\w\-_\.]/, "_")
    |> String.replace(~r/_+/, "_")
    |> String.trim("_")
  end
end
