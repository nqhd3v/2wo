const DATE_OFF_SPREADSHEET_ID = '1ckeIdkqT5X8MAEJ5ln1sNV3Qk6woqZoMfil6U3dnRyQ';
const SHEET = 'Sprint Day-Off Plan';

const DATE_OFF_CELL = 'B28';
const DATE_OFF_HALF_CELL = 'B29';
const DATE_WFH_CELL = 'B31';

const getSheetValues = (range) =>
  Sheets.Spreadsheets.Values.get(DATE_OFF_SPREADSHEET_ID, `${SHEET}!${range}`);
/**
 * Function - getSheet
 *
 * @returns { value: any, bgColor: string }[][]
 */
const getSheet = (range, sheetIndex = 0) => {
  const res = Sheets.Spreadsheets.get(DATE_OFF_SPREADSHEET_ID, {
    ranges: [range],
    fields: 'sheets/data/rowData',
  });
  // '0.2901961_0.5254902_0.9098039'
  return res.sheets[sheetIndex].data[0].rowData.map((row) => {
    return row.values.map(({ formattedValue, effectiveFormat }) => ({
      value: formattedValue,
      bgColor: [
        effectiveFormat.backgroundColor.red,
        effectiveFormat.backgroundColor.green,
        effectiveFormat.backgroundColor.blue,
        effectiveFormat.backgroundColor.alpha || undefined,
      ]
        .filter((v) => v !== undefined)
        .join('_'),
    }));
  });
};

/**
 * getMemberOffToday
 *
 * @returns {{ wfh: string[]; full: string[]; half: string[]; date: string }}
 */
function getMemberOffToday() {
  const DATE_OFF_CELL_DEF = getCell(DATE_OFF_CELL);
  const DATE_OFF_HALF_CELL_DEF = getCell(DATE_OFF_HALF_CELL);
  const DATE_WFH_CELL_DEF = getCell(DATE_WFH_CELL);

  const dates = getSheetValues('A2:2').values[0];
  const members = getSheetValues('A3:A26').values.flat();

  const today = new Date();
  const todayFormatted = `${today.getMonth() + 1}/${today.getDate()}`;
  const dateIndex = dates.findIndex((d) => d === todayFormatted);
  const dateColKey = getColumnKey(dateIndex + 1);
  const memberDateOffToday = getSheet(`${dateColKey}3:${dateColKey}26`);

  const membersOffToday = Array.from(memberDateOffToday).reduce(
    (acc, cur, curIndex) => {
      if (cur[0].bgColor === DATE_OFF_CELL_DEF.bgColor) {
        acc.full.push(members[curIndex]);
        return acc;
      }
      if (cur[0].bgColor === DATE_OFF_HALF_CELL_DEF.bgColor) {
        acc.half.push(members[curIndex]);
        return acc;
      }
      if (cur[0].bgColor === DATE_WFH_CELL_DEF.bgColor) {
        acc.wfh.push(members[curIndex]);
        return acc;
      }

      return acc;
    },
    {
      full: [],
      half: [],
      wfh: [],
    },
  );

  return { ...membersOffToday, date: todayFormatted };
}

function getCell(cell) {
  const cell = getSheet(cell)[0][0];

  return cell;
}
