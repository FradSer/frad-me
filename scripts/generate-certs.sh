#!/bin/bash

# Create certificates directory
mkdir -p scripts/certificates
cd scripts/certificates

# Generate self-signed certificate for localhost
openssl req -x509 -out localhost.pem -keyout localhost-key.pem \
  -newkey rsa:2048 -nodes -sha256 \
  -subj '/CN=localhost' -extensions EXT -config <( \
   printf "[dn]\nCN=localhost\n[req]\ndistinguished_name = dn\n[EXT]\nsubjectAltName=DNS:localhost\nkeyUsage=keyEncipherment,dataEncipherment\nextendedKeyUsage=serverAuth")

echo "✅ SSL certificates generated for localhost"
echo "📁 Certificates saved in scripts/certificates/"
echo "🔒 Run 'pnpm dev:https' to start HTTPS development server"