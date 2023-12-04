export const EVENT_SERVICE = 'EVENT-SERVICE';
export interface IEventService {
  sendDailyWorklogSummary(date?: string): Promise<any>;
}
