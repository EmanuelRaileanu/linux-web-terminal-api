import { VirtInstallService } from "../src/services/virt-install.service";
import { Test, TestingModule } from "@nestjs/testing";
import { IsoImageService } from "../src/services/iso-image.service";
import { ExecService } from "../src/services/exec.service";
import { CreateVirtualMachineOptions } from "../src/entities/vm-manager.entities";
import { IsoImageNotFoundError, VirtInstallError } from "../src/errors";
import { readdir, unlink, writeFile } from "fs/promises";
import { config } from "../src/config";
import { TimezoneService } from "../src/services/timezone.service";

describe(VirtInstallService, () => {
    const ISO_IMAGE_NAME = "image1.iso";
    let moduleRef: TestingModule;
    let virtInstallService: VirtInstallService;
    let timezoneService: TimezoneService;

    beforeAll(async () => {
        process.chdir(__dirname);
        config.isoImagesDirectoryPath = __dirname;

        moduleRef = await Test.createTestingModule({
            providers: [VirtInstallService, ExecService, IsoImageService, TimezoneService]
        }).compile();

        virtInstallService = moduleRef.get<VirtInstallService>(VirtInstallService);
        timezoneService = moduleRef.get<TimezoneService>(TimezoneService);

        jest.spyOn(timezoneService, "validateTimezone")
            .mockImplementation((timezone: string) => Promise.resolve(timezone));

        return await writeFile(ISO_IMAGE_NAME, "");
    });

    afterAll(async () => {
        await unlink(ISO_IMAGE_NAME);
        const filesInCurrentFolder = await readdir(__dirname);
        // Delete .ks files that were created before virt-install in the current directory
        await Promise.all(filesInCurrentFolder.map(file => file.endsWith(".ks") && unlink(file)));
        return moduleRef.close();
    });

    test("Running the virt-install command failing with IsoImageNotFoundError when the image doesn't exist", () => {
        const options: CreateVirtualMachineOptions = {
            name: "vm1",
            username: "superuser",
            password: "superRoot",
            timezone: "Europe/Bucharest",
            numberOfVirtualCpus: 1,
            memory: 1024,
            osVariant: "debian8",
            diskSize: 10,
            isoImage: "image2.iso",
            networkInterface: "eth13"
        };
        return expect(virtInstallService.createVirtualMachine(options)).rejects.toThrowError(IsoImageNotFoundError);
    });

    test("Running the virt-install command failing with VirtInstallError when not providing enough options", () => {
        const options = {
            isoImage: ISO_IMAGE_NAME
        } as CreateVirtualMachineOptions;
        const promise = virtInstallService.createVirtualMachine(options);
        return expect(promise).rejects.toThrowError(VirtInstallError);
    });
});