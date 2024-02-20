const DAILY_MEETING_NAMES_CHECK = ['apm', 'daily scrum'];

async function getDailyEventInDate() {

  const timeMin = startOfDay();
  const timeMax = endOfDay();
  console.log('------------------ SYNC EVENTS ------------------');
  console.log('- From:', timeMin);
  console.log('- To:  ', timeMax);
  const calendarId = 'primary';
  // Add query parameters in optionalArgs
  const optionalArgs = {
    timeMin,
    timeMax,
    showDeleted: false,
    singleEvents: true,
    // maxResults: 1,
    orderBy: 'startTime',
    // use other optional query parameter here as needed.
  };
  try {
    const APP_ID =
      PropertiesService.getScriptProperties().getProperty('APP_ID');
    const API_KEY =
      PropertiesService.getScriptProperties().getProperty('API_KEY');
    console.log(APP_ID, API_KEY);
    // call Events.list method to list the calendar events using calendarId optional query parameter
    const response = Calendar.Events.list(calendarId, optionalArgs);
    const events = response.items;
    console.log('- Count of events:', events.length);
    if (events.length === 0) {
      console.log('No events to send!!!');
      return;
    }
    console.log('Found', events.length, 'events (total)');

    const dailyScrumEvents = events.filter((e) =>
      isNameOK(e.summary, DAILY_MEETING_NAMES_CHECK),
    );
    if (dailyScrumEvents.length === 0) {
      console.log('No daily event found!');
      return;
    }
    console.log('Found', dailyScrumEvents.length, 'events (daily scrum)');

    // Print the calendar events
    const data = dailyScrumEvents.map(
      ({
        id,
        recurringEventId,
        attendees,
        summary,
        start,
        end,
        hangoutLink,
        visibility,
        htmlLink,
      }) => ({
        id,
        recurringId: recurringEventId,
        attendees: attendees?.map((a) => ({
          username: a.email,
          status: a.responseStatus,
        })),
        summary,
        // description,
        startedAt: start.dateTime,
        finishedAt: end.dateTime,
        meetingLink: hangoutLink,
        eventLink: htmlLink,
        isPrivate: visibility === 'private',
      }),
    );
    await sendEvents(data);
  } catch (err) {
    // TODO (developer) - Handle exception from Calendar API
    console.log('Failed with error %s', err.message);
  }
  console.log('-------------------------------------------------');
}
