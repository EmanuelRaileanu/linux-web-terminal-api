import { VirtInstallService } from "../src/services/virt-install.service";
import { Test, TestingModule } from "@nestjs/testing";
import { IsoImageService } from "../src/services/iso-image.service";
import { ExecService } from "../src/services/exec.service";
import { CreateVirtualMachineOptions } from "../src/entities/vm-manager.entities";
import { IsoImageNotFoundError, VirtInstallError } from "../src/errors";
import { readdir, unlink, writeFile } from "fs/promises";
import { config } from "../src/config";
import { TimezoneService } from "../src/services/timezone.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { User } from "@shared/db-entities/user.entity";
import { OperatingSystem } from "@shared/db-entities/operating-system.entity";
import { join } from "path";
import { getRepository, Repository } from "typeorm";

describe(VirtInstallService, () => {
    const ISO_IMAGE_NAME = "image1.iso";
    const KS_FILE_NAME = "debian.ks";
    let os: OperatingSystem;
    let moduleRef: TestingModule;
    let virtInstallService: VirtInstallService;
    let timezoneService: TimezoneService;
    let osRepository: Repository<OperatingSystem>;

    beforeAll(async () => {
        process.chdir(__dirname);
        config.isoImagesDirectoryPath = __dirname;
        config.ksFilesDirectoryPath = __dirname;

        moduleRef = await Test.createTestingModule({
            imports: [
                TypeOrmModule.forFeature([User, OperatingSystem]),
                TypeOrmModule.forRoot({
                    type: "mysql",
                    ...config.db,
                    database: config.testDb,
                    autoLoadEntities: true,
                    synchronize: true
                })
            ],
            providers: [VirtInstallService, ExecService, IsoImageService, TimezoneService]
        }).compile();

        virtInstallService = moduleRef.get<VirtInstallService>(VirtInstallService);
        timezoneService = moduleRef.get<TimezoneService>(TimezoneService);
        osRepository = getRepository<OperatingSystem>(OperatingSystem);

        jest.spyOn(timezoneService, "validateTimezone")
            .mockImplementation(timezone => Promise.resolve(timezone));

        os = {
            id: "4b95947f-bad4-441a-ad3f-1c409667c103",
            isoFileName: ISO_IMAGE_NAME,
            ksFileName: KS_FILE_NAME,
            createdAt: new Date(),
            updatedAt: new Date()
        };

        await writeFile(ISO_IMAGE_NAME, "");
        await writeFile(KS_FILE_NAME, "");

        return osRepository.insert(os);
    });

    afterAll(async () => {
        await unlink(ISO_IMAGE_NAME);
        await unlink(KS_FILE_NAME);

        const publicFolderPath = join(__dirname, "../..", "public");
        const filesInPublicFolder = await readdir(publicFolderPath);
        // Delete .ks files that were created before virt-install in the current directory
        await Promise.all(filesInPublicFolder.map(file => {
            try {
                file.endsWith(".ks") && unlink(join(publicFolderPath, file));
            } catch {} // Probably throws ENOENT: no such file or directory, which is ok, means it was already deleted
        }));

        await osRepository.remove(os);

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