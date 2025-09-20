#/usr/bin/env sh

# private key (2048-bit)
openssl genpkey -algorithm RSA -pkeyopt rsa_keygen_bits:2048 -out local/private.pem

# public key (SPKI/PEM)
openssl rsa -in local/private.pem -pubout -out docs/public.pem
