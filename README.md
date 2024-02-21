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

## Setup app

In this application, below is the structure, to describe how this app works:

<img width="925" alt="image" src="https://github.com/nqhd3v/2wo/assets/106160187/510a54a2-a0f6-42ce-aba0-7ef85c3a0d25">


- **DAILY SCRUM MEETING:**
  - Everyday, GAS will call to your Calendar to check if today has a DS meeting or not, if exists -> It send a HTTP request to NodeJS server to create/update it (this info will be saved to the Firestore).
  - I have a job on NodeJS server to check event on Firestore and send a message to GChat with webhook
- **DAILY LOGWORK REPORT:** Everyday, NodeJS server has a job to call to JIRA (with JIRA APIs) to summary worklog and send a message to GChat with webhook.

### Firebase

Setup firebase app and update `.env` file

### Server

```bash
$ npm install

$ npm run start:dev

$ npm run start
```

Expose an IP, or hostname to allow to call API from outside.

Open terminal and run this cURL to get pass (`headers[content-work]`): (Replace `API_PASS` with your API_PASS in `.env` file)

```bash
curl --location 'http://localhost:5010/meetings/daily-scrum' \
--header '-x-content-work-example: {API_PASS}'
```

on your server should log a line like this

```log
[Nest] 4785  - 02/18/2024, 3:39:20 PM     LOG PASS - "$2a$15$SZ.SOMETHING.SOMETHING.4q"
```

And now, `$2a$15$SZ.SOMETHING.SOMETHING.4q` is your API TOKEN. Set it as header property (`content-work`) to send request for the next time.

### Google App Script

1. Open GAS and create a new project
2. Copy and paste files in folder `gas`
3. In Google App Script, go to `Trigger` section and set time to run `getDailyEventInDate` function (daily, hourly,...).

In your project:

- open `utils.gs` file, update API URL at line `23` and `36`.
- Open `Settings` section and create a new Script Property:
  - Field `API_TOKEN` with value is your API token (setup in the before section).

## API references

- [JIRA Cloud Platform - REST API v2](https://developer.atlassian.com/cloud/jira/platform/rest/v2/intro/)
- [JIRA Software Cloud - REST API](https://developer.atlassian.com/cloud/jira/software/rest/intro)
