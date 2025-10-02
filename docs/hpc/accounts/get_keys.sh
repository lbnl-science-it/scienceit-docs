#!/usr/bin/env bash

echo -n "Username: "
read user

echo -n "Password: "
read -s password
echo -ne "\n"
echo -n "MFA: "
read mfa

echo "Requesting cert..."
ret=$(curl --silent -o out.json --write-out "%{http_code}" https://localhost/v1/cert -d "{\"username\":\"$user\",\"password\":\"$password\",\"mfa\":\"$mfa\"}")
[[ $ret != "201" ]] && {
  echo "auth failed - status code: $ret"
  cat out.json
  echo -ne "\n"
  rm out.json
  exit
}

q() {
  python3 -c "import sys, json; print(json.load(sys.stdin)['$1'].strip())"
}

key_id=$(cat out.json | q "key_id")
cat out.json | q "public_key" > $key_id.pub
cat out.json | q "private_key" > $key_id
chmod 600 $key_id
cat out.json | q "signed_public_key" > $key_id-cert.pub

echo "wrote key $key_id"
rm out.json
