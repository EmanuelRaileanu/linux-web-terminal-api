import { TimezoneService } from "../src/services/timezone.service";
import { Test, TestingModule } from "@nestjs/testing";
import { ExecService } from "../src/services/exec.service";
import { TimezoneNotFoundError } from "../src/errors";

describe(TimezoneService, () => {
    let moduleRef: TestingModule;
    let timezoneService: TimezoneService;

    beforeAll(async () => {
        moduleRef = await Test.createTestingModule({
            providers: [TimezoneService, ExecService]
        }).compile();
        timezoneService = moduleRef.get<TimezoneService>(TimezoneService);
    });

    afterAll(() => {
        return moduleRef.close();
    });

    if (process.platform === "linux") { // Won't run on WSL (systemd is not in WSL 2, at least not right now - 10-Feb-22)
        test("Getting all timezones successfully", async () => {
            const timezones = await timezoneService.getAllTimezones();
            expect(Array.isArray(timezones)).toBeTruthy();
            expect(timezones.length).toBeGreaterThan(0);
        });

        test("Validating timezone successfully", () => {
            const timezone = "Europe/Bucharest";
            return expect(timezoneService.validateTimezone(timezone)).resolves.toEqual(timezone);
        });

        test("Validating timezone rejects with TimezoneNotFoundError when the timezone doesn't exist on the os", () => {
            return expect(timezoneService.validateTimezone("Europe")).rejects.toThrowError(TimezoneNotFoundError);
        });
    } else {
        test("Test suite only supported on linux", () => {
            return expect(1).toEqual(1);
        });
    }
});