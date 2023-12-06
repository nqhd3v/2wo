#!/bin/bash

source ./auth.sh

echo "JIRA"
ENV_FILE="../../.env"

if test -f "$ENV_FILE"
then
  echo "Found ENV file in source"
  source $ENV_FILE;
  domain="$BASE_JIRA_API"
  usr="$WORKER_JR_USERNAME"
  pwd="$WORKER_JR_PASSWORD"
  echo "-------------------------------------"
else
  echo "Input your JIRA's username & password:"
  read -p "Jira domain: " domain
  read -p "Username:    " usr
  read -s -p "Password:    " pwd
  echo "-------------------------------------"
fi

# ---------------------------------------------
# Validate account
jira__authenticate $domain $usr $pwd
echo "-------------------------------------"

# ---------------------------------------------
# Validate account