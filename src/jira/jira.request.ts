import {
  ISSUE_TYPE__STORY_ID,
  ISSUE_TYPE__SUB_IMP_ID,
  STATUS_TYPE__TODO_ID,
} from 'common/constant';

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
    ALL_STORIES_TODO: (boardId: number) =>
      `/rest/agile/1.0/board/${boardId}/issue?fields=summary,parent,timetracking,assignee&maxResults=500&jql=issuetype=${ISSUE_TYPE__STORY_ID}+AND+status=${STATUS_TYPE__TODO_ID}`,
    ALL_SUB_IMP_BY_BOARD: (boardId: number, storyIds?: number[]) =>
      `/rest/agile/1.0/board/${boardId}/issue?fields=summary,status,timetracking,assignee,issuetype,parent&maxResults=500&jql=issuetype=${ISSUE_TYPE__SUB_IMP_ID}${
        storyIds ? `+AND+parent in (${storyIds.join(', ')})` : ''
      }`,
  },
  worklog: {
    BY_SPRINT: (sprintId: number) =>
      `/rest/agile/1.0/sprint/${sprintId}/issue?fields=worklog,summary,status,priority,timetracking&maxResults=500`,
    BY_ISSUE: (issueId: number | string) =>
      `/rest/api/2/issue/${issueId}/worklog`,
  },
};
