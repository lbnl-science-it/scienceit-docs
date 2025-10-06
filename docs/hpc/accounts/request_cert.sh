#!/usr/bin/env bash
set -uo pipefail

HOST="https://msm.scs.lbl.gov"
OUTPUT_DIR="."
LIFETIME="12h"
KEY_NAME=""
SERVICE_USER=""
PRESET=""



usage() {
    echo "Usage: $0 [-a HOST] [-o OUTPUT_DIR] [-l LIFETIME] [-s SERVICE_USER] [-p PRESET ]" 1>&2
    echo "  -a HOST           MSM server host (default: https://msm.lbl.gov:8443)" 1>&2
    echo "  -o OUTPUT_DIR     Directory to store keys (default: current directory)" 1>&2
    echo "  -n KEY_NAME       Filename to store key as (default: key ID)" 1>&2
    echo "  -l LIFETIME       Certificate lifetime (default: 12h)" 1>&2
    echo "  -s SERVICE_USER   Service User to request cert for (default: none)" 1>&2
    echo "  -p PRESET         Use a pre-defined preset: lrc (default: none)" 1>&2
    exit 1
}



while getopts "a:o:l:n:s:p:h" opt; do
    case $opt in
        a) HOST="$OPTARG" ;;
        o) OUTPUT_DIR="$OPTARG" ;;
        l) LIFETIME="$OPTARG" ;;
        n) KEY_NAME="$OPTARG" ;;
        s) SERVICE_USER="$OPTARG" ;;
        p) PRESET="$OPTARG" ;;
        h|\?) usage ;;
        *) usage ;;
    esac
done



# Handle Presets
if [[ $PRESET == "lrc" ]]; then
  LRC_OUTPUT_DIR="$HOME/.ssh/ssh_certs/"
  LRC_KEY_NAME="lrc_cert"
  SSH_DIR="$HOME/.ssh"

  # Check if the location LRC_OUTPUT_DIR exists
  # and create the directory if it doesn't
  if [[ ! -d $LRC_OUTPUT_DIR ]]; then
    mkdir -p $LRC_OUTPUT_DIR
  fi
  # enforce file perm 700 for .ssh
  sshdir_fileperm=$(stat -L -c "%a" $SSH_DIR)
  if [[ $sshdir_fileperm != 700 ]]; then
    chmod 700 $SSH_DIR
  fi

  OUTPUT_DIR=$LRC_OUTPUT_DIR
  KEY_NAME=$LRC_KEY_NAME

fi



gen_cert() {

  echo -n "Username: "
  read -r user
  echo -n "PIN: "
  read -rs password
  echo -ne "\n"
  echo -n "OTP: "
  read -r mfa
  
  echo "Requesting cert..."
  ret=-1
  [[ -z "$SERVICE_USER" ]] && { 
    ret=$(curl --silent -o out.json --write-out "%{http_code}" "$HOST/v1/cert" -d "{\"username\":\"$user\",\"password\":\"$password\",\"mfa\":\"$mfa\", \"lifetime\":\"$LIFETIME\"}")
  } || {
    ret=$(curl --silent -o out.json --write-out "%{http_code}" "$HOST/v1/service_cert" -d "{\"username\":\"$user\",\"password\":\"$password\",\"mfa\":\"$mfa\",\"service_user\":\"$SERVICE_USER\", \"lifetime\":\"$LIFETIME\"}")
  }
  
  [[ $ret != "201" ]] && {
    echo "auth failed - status code: $ret"
    cat out.json
    echo -ne "\n"
    rm out.json
    exit
  }
  
  # low-key jq
  q() {
    python3 -c "import sys, json; print(json.load(sys.stdin)['$1'].strip())"
  }
  
  # convert to local timezone
  t() {
    python3 -c "from datetime import datetime; import sys; print(datetime.fromisoformat(sys.stdin.read().strip()).astimezone().strftime('%Y-%m-%d %H:%M:%S %Z'))";
  }
  
  key_id=$(cat out.json | q "key_id")
  echo "key id: $key_id"
  [[ -z "$KEY_NAME" ]] && KEY_NAME="$key_id"
  
  cat out.json | q "public_key" > "$OUTPUT_DIR/$KEY_NAME.pub"
  cat out.json | q "private_key" > "$OUTPUT_DIR/$KEY_NAME"
  cat out.json | q "signed_public_key" > "$OUTPUT_DIR/$KEY_NAME-cert.pub"
  expires_at=$(cat out.json | q "expires_at" | t)
  
  chmod 600 "$OUTPUT_DIR/$KEY_NAME"
  echo "wrote key $OUTPUT_DIR/$KEY_NAME"
  echo "key expires at $expires_at"
  echo "Usage: ssh -i $OUTPUT_DIR/$KEY_NAME lrc-login.lbl.gov"
  rm out.json

  echo "Done"
}



## Generate CERT
if [[ $PRESET == "lrc" ]]; then
  ## Check if there's an existing Certificate
  # Renew cert if it's older than 12 hours
  if find $OUTPUT_DIR -name $KEY_NAME -mmin -720 | grep -q .; then
    echo "Cert is less than 12 hours old.";
    echo "No need to renew."
  else
    #echo "Cert is older than 12 hours.";
    #echo "Renewing..."
    gen_cert
  fi
else
  # Default
  gen_cert
fi
