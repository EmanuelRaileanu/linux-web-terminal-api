export interface ITimezoneService {
    getAllTimezones(): Promise<string[]>;

    validateTimezone(timezone: string): Promise<string>;
}