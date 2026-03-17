#!/usr/bin/env bash

echo -n "Username: "
read user

echo -n "Password: "
read -s password
echo -ne "\n"
echo -n "MFA: "
read mfa
echo -n "Cert: "
read cert

echo "Revoking cert..."
curl -ik https://localhost:31337/v1/revoke -d "{\"username\":\"$user\",\"password\":\"$password\",\"mfa\":\"$mfa\",\"cert_id\":\"$cert\"}"
echo -ne "\n"
