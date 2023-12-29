# WoWo - Workers-for-Working

An application was created to use for Working purpose only.

> Please note that, this application don't store any data from the outside, it just store the data, which support to filter, check for the next data at the tomorrow.
>
> Example, it will store the events (which was receive from Google App Script) to remind me to join it, or check if today has Daily Meeting, it will trigger an event to random hosted member to host that meeting.

```
npm install
```

```
npm run start
```

```
npm run dev
```

## Environment setup

Example, I have this URL: **https://twoline.atlassian.net/jira/software/c/projects/ABC/boards/123/backlog?issueLimit=100&view=detail** to view my Jira.

1. Type `cp .env.example .env` to create your own `.env` file.
2. Update other fields in `.env`:
   - `WORKER_JR_USERNAME` - Your Jira username
   - `WORKER_JR_PASSWORD` - Your Jira password (or your API token)
   - `WORKER_JR_BOARD_ID` - Your Jira board ID, Ex: `123` in example URL.
   - `JIRA_BOARD_NAME_FILTER` - Filter your board name, Ex: `ABC` in the example URL.
   - `BASE_JIRA_API` - Your org Jira domain, Ex: `https://twoline.atlassian.net` in the example URL.

> To create your API token, go to [Manage API tokens for your Atlassian account](https://support.atlassian.com/atlassian-account/docs/manage-api-tokens-for-your-atlassian-account/) to read more about your own API token.

In `.env` file, I have a field `API_PASS`, this is a password to allow third-party call to this application.

## Personal use

I developed some APIs to support for personal case:

- Summary your worklog by date or by member: `[POST] - /worklog-summary/:boardID?date={DATE}&accountId={ACCOUNT_ID}`.
- Some others is in Development mode

In your request's body, pls send with your authenticate data:

```json
{
  "username": "JIRA_USERNAME",
  "accessToken": "JIRA_PASSWORD_OR_API_TOKEN"
}
```

## API references

- [JIRA Cloud Platform - REST API v2](https://developer.atlassian.com/cloud/jira/platform/rest/v2/intro/)
- [JIRA Software Cloud - REST API](https://developer.atlassian.com/cloud/jira/software/rest/intro)
