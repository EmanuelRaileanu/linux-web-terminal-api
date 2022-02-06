import { ExecService } from "../src/services/exec.service";

describe(ExecService, () => {
    let execService: ExecService;

    beforeAll(() => {
        execService = new ExecService();
    });

    test("Running a command successfully", async () => {
        const { stderr, stdout } = await execService.run("dir");
        expect(stderr).toEqual("");
        expect(stdout).not.toEqual("");
    });
});