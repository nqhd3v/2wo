export const JIRA_API = {
  user: {
    ME: '/rest/api/2/myself',
    USER: '/rest/api/2/user',
  },
  board: {
    ALL: '/rest/agile/1.0/board',
  },
  sprint: {
    ALL: (boardId: number) => `/rest/agile/1.0/board/${boardId}/sprint`,
    ONE: (sprintId: number) => `/rest/agile/1.0/sprint/${sprintId}`,
  },
  issue: {
    ALL: (sprintId: number) => `/rest/agile/1.0/sprint/${sprintId}/issue`,
  },
  worklog: {
    BY_SPRINT: (sprintId: number) =>
      `/rest/agile/1.0/sprint/${sprintId}/issue?fields=worklog,summary,status,priority,timetracking&maxResults=500`,
    BY_ISSUE: (issueId: number | string) =>
      `/rest/api/2/issue/${issueId}/worklog`,
  },
};
