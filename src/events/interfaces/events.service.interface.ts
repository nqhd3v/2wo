export const EVENT_SERVICE = 'EVENT-SERVICE';
export interface IEventService {
  sendDailyScrumMeeting(): Promise<any>;
  sendDailyWorklogSummary(date?: string): Promise<any>;
  // sendDailyDateOffMember(date?: string): Promise<any>;
}
