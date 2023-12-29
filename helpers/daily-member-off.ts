export const generateDailyMemberOff = ({
  full,
  half,
  wfh,
  date,
}: {
  full: string[];
  half: string[];
  wfh: string[];
  date: string;
  noteMessage?: string;
}) => {
  const memOffFull =
    full.length > 0
      ? [
          {
            textParagraph: {
              text: `<b>${full.length} member${
                full.length > 0 ? 's' : ''
              }</b> will be off FULL-DAY today!`,
            },
          },
          {
            textParagraph: {
              text: full.map((m) => `<b> ${m} </b>`).join(', '),
            },
          },
        ]
      : [
          {
            textParagraph: {
              text: 'No one OFF FULL-DAY today!',
            },
          },
        ];
  const memOffHalf =
    half.length > 0
      ? [
          {
            textParagraph: {
              text: `<b>${half.length} member${
                half.length > 0 ? 's' : ''
              }</b> will be off HALF-DAY today!`,
            },
          },
          {
            textParagraph: {
              text: half.map((m) => `<b> ${m} </b>`).join(', '),
            },
          },
        ]
      : [
          {
            textParagraph: {
              text: 'No one OFF HALF-DAY today!',
            },
          },
        ];

  const memWFH =
    wfh.length > 0
      ? [
          {
            textParagraph: {
              text: `<b>${wfh.length} member${
                wfh.length > 0 ? 's' : ''
              }</b> will be WFH today!`,
            },
          },
          {
            textParagraph: {
              text: wfh.map((m) => `<b> ${m} </b>`).join(', '),
            },
          },
        ]
      : [
          {
            textParagraph: {
              text: 'No one WFH today!',
            },
          },
        ];

  return {
    cardsV2: [
      {
        cardId: 'card01',
        card: {
          header: {
            title: 'Member Date-Off Planned',
            subtitle: date,
          },
          sections: [
            {
              widgets: [
                ...memOffFull,
                {
                  divider: {},
                },
                ...memOffHalf,
                {
                  divider: {},
                },
                ...memWFH,
                {
                  divider: {},
                },
                {
                  textParagraph: {
                    text: `<i>Improve this style by creating new Pull Request <a href="https://github.com/ld3v/2wo">here</a></i>`,
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
