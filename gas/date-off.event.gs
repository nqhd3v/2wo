async function sendMemberDateOffDaily() {
  try {
    console.log('-- TRIGGER TO SEND MEMBER OFF TODAY --');
    const data = getMemberOffToday('12/29');
    console.log(' -- ', data);
    return syncMemberOffTodayRequest([data]);
  } catch (err) {
    // TODO (developer) - Handle exception from Calendar API
    console.log('Failed with error %s', err.message);
  }
  console.log('-------------------------------------------------');
}
