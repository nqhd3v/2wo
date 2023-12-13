import * as dayjs from 'dayjs';
import { TSummaryWorklog } from 'src/jira/interfaces';
import { secsToString } from './time.transform';

export const generateWorklogReportByDate = (
  worklogByMembers: TSummaryWorklog[],
  date?: string,
) => {
  const now = dayjs();
  const content = worklogByMembers.map((mem) => {
    return {
      header: mem.name,
      widgets: [
        {
          decoratedText: {
            startIcon: {
              knownIcon: 'CLOCK',
            },
            text: secsToString(mem.secsSpent),
          },
        },
        {
          textParagraph: {
            text: Object.keys(mem.details)
              .map(
                (issueKey) =>
                  `<b>${issueKey}</b> (${secsToString(mem.details[issueKey])})`,
              )
              .join(', '),
          },
        },
      ],
    };
  });
  return {
    cardsV2: [
      {
        cardId: 'card01',
        card: {
          header: {
            title: 'Worklog Summary Report',
            subtitle: date || now.format('DD/MM/YYYY'),
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
