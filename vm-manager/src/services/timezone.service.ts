import { Injectable } from "@nestjs/common";
import { ExecService } from "./exec.service";
import { ITimezoneService } from "../entities/ITimezoneService";
import { TimezoneMatchesMultipleItems, TimezoneNotFoundError, TimezoneServiceError } from "../errors";

@Injectable()
export class TimezoneService implements ITimezoneService {
    private timezones: string[] = [];

    constructor(private readonly execService: ExecService) {}

    public async getAllTimezones(): Promise<string[]> {
        if (this.timezones.length) {
            return this.timezones;
        }
        const { stdout, stderr } = await this.execService.run("timedatectl list-timezones");
        if (stderr) {
            throw new TimezoneServiceError(stderr);
        }
        return this.timezones = stdout.split("\n").filter(tz => tz !== "");
    }

    public async validateTimezone(timezone: string): Promise<string> {
        if (this.timezones.length) {
            return this.validateCachedTimezone(timezone);
        }
        const { stdout, stderr } = await this.execService.run("timedatectl list-timezones | grep " + timezone);
        if (stderr) {
            throw new TimezoneServiceError(stderr);
        }
        if (!stdout) {
            throw new TimezoneNotFoundError(timezone);
        }
        const timezones = stdout.split("\n").filter(tz => tz !== "");
        if (timezones.length > 1) {
            throw new TimezoneMatchesMultipleItems(timezone, timezones);
        }
        return timezones[0];
    }

    public clearCachedTimezones(): void {
        this.timezones = [];
    }

    private validateCachedTimezone(timezone: string): string {
        if (!this.timezones.includes(timezone)) {
            throw new TimezoneNotFoundError(timezone);
        }
        return timezone;
    }
}