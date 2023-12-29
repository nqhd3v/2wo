function startOfDay(ymd) {
  const date = ymd ? new Date(yml) : new Date();
  date.setHours(0, 0, 0, 0).toLocaleString('en-US', { timezone: 'UTC' });

  return date.toISOString();
}

function startOfDay(ymd) {
  const date = ymd ? new Date(yml) : new Date();
  date.setHours(0, 0, 0, 0).toLocaleString('en-US', { timezone: 'UTC' });

  return date.toISOString();
}

function endOfDay(ymd) {
  const date = ymd ? new Date(yml) : new Date();
  date.setHours(23, 59, 59, 999).toLocaleString('en-US', { timezone: 'UTC' });

  return date.toISOString();
}

const createEventsRequest = (API_TOKEN) => async (events) =>
  UrlFetchApp.fetch(`https://work-apis.nqhuy.dev/meetings/daily-scrum`, {
    method: 'POST',
    contentType: 'application/json',
    payload: JSON.stringify({ events }),
    headers: {
      'content-work': API_TOKEN,
    },
  });

const syncMemberOffTodayRequest = (dateOffData) => {
  const API_TOKEN =
    PropertiesService.getScriptProperties().getProperty('API_TOKEN');
  return UrlFetchApp.fetch(
    `https://work-apis.nqhuy.dev/think-working/planning/date-off`,
    {
      method: 'POST',
      contentType: 'application/json',
      payload: JSON.stringify({ data: dateOffData }),
      headers: {
        'content-work': API_TOKEN,
      },
    },
  );
};

async function sendEvents(events) {
  const API_TOKEN =
    PropertiesService.getScriptProperties().getProperty('API_TOKEN');
  console.log(JSON.stringify(events));
  return await createEventsRequest(API_TOKEN)(events);
}

function isNameOK(input, validateStrs) {
  const inputLower = input.toLowerCase();
  const validateLower = validateStrs.map((s) => s.toLowerCase());

  for (let str of validateLower) {
    if (!inputLower.includes(str)) {
      return false;
    }
  }

  return true;
}

function getColumnKey(index) {
  var alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  var key = '';

  if (index < 0) {
    throw new Error('Index cannot be negative');
  }

  do {
    index--;
    var remainder = index % 26;
    key = alphabet[remainder] + key;
    index = (index - remainder) / 26;
  } while (index > 0);

  return key;
}
