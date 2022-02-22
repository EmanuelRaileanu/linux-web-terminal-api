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
import { OperatingSystem } from "@shared/db-entities/operating-system.entity";
import { join } from "path";
import { getRepository, Repository } from "typeorm";
import { ENTITIES } from "@shared/db-entities";
import { VmInstanceService } from "../src/services/vm-instance.service";
import { SessionUserEntity } from "@shared/entities";
import { NetworkService } from "../src/services/network.service";
import { VirshService } from "../src/services/virsh.service";

describe(VirtInstallService, () => {
    const ISO_IMAGE_NAME = "image1.iso";
    const KS_FILE_NAME = "debian.ks";
    let os: OperatingSystem;
    let moduleRef: TestingModule;
    let virtInstallService: VirtInstallService;
    let timezoneService: TimezoneService;
    let virshService: VirshService;
    let osRepository: Repository<OperatingSystem>;
    let user: SessionUserEntity;

    beforeAll(async () => {
        process.chdir(__dirname);
        config.isoImagesDirectoryPath = __dirname;
        config.ksFilesDirectoryPath = __dirname;

        moduleRef = await Test.createTestingModule({
            imports: [
                TypeOrmModule.forFeature(ENTITIES),
                TypeOrmModule.forRoot({
                    type: "mysql",
                    ...config.db,
                    database: config.testDb,
                    entities: ENTITIES
                })
            ],
            providers: [
                VirtInstallService,
                VmInstanceService,
                ExecService,
                IsoImageService,
                TimezoneService,
                NetworkService,
                VirshService
            ]
        }).compile();

        virtInstallService = moduleRef.get<VirtInstallService>(VirtInstallService);
        virshService = moduleRef.get<VirshService>(VirshService);
        timezoneService = moduleRef.get<TimezoneService>(TimezoneService);
        osRepository = getRepository<OperatingSystem>(OperatingSystem);

        jest.spyOn(virshService, "assignStaticIpAndHostName")
            .mockImplementation(() => Promise.resolve({
                message: "Static IP assigned successfully",
                consoleOutput: "Updated network default persistent config and live state"
            }));
        jest.spyOn(timezoneService, "validateTimezone")
            .mockImplementation(timezone => Promise.resolve(timezone));

        os = {
            id: "4b95947f-bad4-441a-ad3f-1c409667c103",
            isoFileName: ISO_IMAGE_NAME,
            ksFileName: KS_FILE_NAME,
            osVariant: "debian",
            createdAt: new Date(),
            updatedAt: new Date()
        };

        user = {
            id: "3e0c1b0d-4dd7-4e08-bc35-0badc221a07d",
            email: "vm-exploiter@redhat.com",
            username: "Tester",
            vmInstances: []
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
            diskSize: 10,
            isoImage: "image2.iso",
            networkInterface: "eth13"
        };
        return expect(virtInstallService.createVirtualMachine(user, options)).rejects.toThrowError(IsoImageNotFoundError);
    });

    test("Running the virt-install command failing with VirtInstallError when not providing enough options", () => {
        const options = {
            isoImage: ISO_IMAGE_NAME
        } as CreateVirtualMachineOptions;
        const promise = virtInstallService.createVirtualMachine(user, options);
        return expect(promise).rejects.toThrowError(VirtInstallError);
    });
});