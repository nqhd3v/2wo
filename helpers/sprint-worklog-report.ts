import * as dayjs from 'dayjs';
import { TSummaryWorkLogResponse } from 'src/jira/interfaces';
import { TSprintJira } from 'types/jira';
import { secsToString } from './time.transform';

export const generateWorklogReport = (
  sprint: TSprintJira,
  worklog: { [date: string]: TSummaryWorkLogResponse },
) => {
  const now = dayjs();
  const content = Object.keys(worklog)
    .sort((date1, date2) =>
      dayjs(date1, 'DD/MM/YYYY').isAfter(dayjs(date2, 'DD/MM/YYYY')) ? -1 : 1,
    )
    .map((date) => {
      const worklogByDay = worklog[date];
      const dataContent = {
        header: date,
        widgets: [],
        collapsible: true,
      };
      Object.keys(worklogByDay).forEach((accountId) => {
        const { details: worklogsByAccount, name } = worklogByDay[accountId];
        const worklogsItem = Object.keys(worklogsByAccount)
          .map(
            (issueKey) =>
              `[${issueKey}] ${
                worklogsByAccount[issueKey].summary
              } (${secsToString(
                worklogsByAccount[issueKey].timeSpentSeconds,
              )})`,
          )
          .join('\r\n');

        dataContent.widgets.push({
          decoratedText: {
            topLabel: name,
            text: worklogsItem,
          },
        });
      });

      return dataContent;
    });
  return {
    cardsV2: [
      {
        cardId: 'card01',
        card: {
          header: {
            title: 'Worklog Summary Report',
            subtitle: sprint.name,
          },
          sections: [
            ...content,
            {
              widgets: [
                {
                  textParagraph: {
                    text: `<i>Generated at <b>${now.format(
                      'DD/MM/YYYY - HH:mm:ss',
                    )}</b></i>`,
                  },
                },
              ],
            },
          ],
        },
      },
    ],
  };
};
