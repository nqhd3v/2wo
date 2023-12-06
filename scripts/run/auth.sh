function jira__authenticate () {
  JIRA_MYSELF_API="$1/rest/api/2/myself"
  JIRA_ACCOUNT__RES=$(curl -sS -u $2:$3 -w "%{http_code}" $JIRA_MYSELF_API --progress-bar)
  JIRA_ACCOUNT__RES__STATUS="${JIRA_ACCOUNT__RES:(-3)}"
  JIRA_ACCOUNT__RES="${JIRA_ACCOUNT__RES%???}"

  if [[ $JIRA_ACCOUNT__RES__STATUS -ne 200 ]]; then
    echo "Error: Got status $JIRA_ACCOUNT__RES__STATUS when check account with username & password" >&2  
    exit 1
  fi

  JIRA_ACCOUNT__ID=$(echo $JIRA_ACCOUNT__RES | jq -r '.accountId');
  JIRA_ACCOUNT__NAME=$(echo $JIRA_ACCOUNT__RES | jq -r '.displayName');

  echo "You authorized with" $JIRA_ACCOUNT__NAME "-" $JIRA_ACCOUNT__ID
}