import Config

# Fly.io object storage configuration
# This uses Fly's S3-compatible object storage service

if config_env() == :prod do
  # Production configuration for Fly.io object storage
  config :ex_aws,
    access_key_id: System.get_env("AWS_ACCESS_KEY_ID"),
    secret_access_key: System.get_env("AWS_SECRET_ACCESS_KEY"),
    region: System.get_env("AWS_DEFAULT_REGION") || "auto"

  config :ex_aws, :s3,
    scheme: "https://",
    host: System.get_env("BUCKET_HOST") || "fly.storage.tigris.dev",
    port: 443
else
  # Development/test configuration - use local file storage
  config :ex_aws,
    access_key_id: "dummy",
    secret_access_key: "dummy",
    region: "us-east-1"

  config :ex_aws, :s3,
    scheme: "http://",
    host: "localhost",
    port: 9000
end
