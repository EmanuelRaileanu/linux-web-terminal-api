import { IsoImageService } from "../src/services/iso-image.service";
import { config } from "../src/config";
import { IsoImageNotFoundError } from "../src/errors";
import { Test, TestingModule } from "@nestjs/testing";
import { TypeOrmModule } from "@nestjs/typeorm";
import { OperatingSystem } from "@shared/db-entities/operating-system.entity";
import { getRepository, Repository } from "typeorm";
import { ENTITIES } from "@shared/db-entities";

describe(IsoImageService, () => {
    let moduleRef: TestingModule;
    let isoImageService: IsoImageService;
    let isoImages: OperatingSystem[];
    let osRepository: Repository<OperatingSystem>;

    beforeAll(async () => {
        process.chdir(__dirname);
        config.isoImagesDirectoryPath = __dirname;
        moduleRef = await Test.createTestingModule({
            imports: [
                TypeOrmModule.forFeature([OperatingSystem]),
                TypeOrmModule.forRoot({
                    type: "mysql",
                    ...config.db,
                    database: config.testDb,
                    entities: ENTITIES
                })
            ],
            providers: [IsoImageService]
        }).compile();

        isoImageService = moduleRef.get<IsoImageService>(IsoImageService);
        osRepository = getRepository<OperatingSystem>(OperatingSystem);

        isoImages = [
            {
                id: "4811847d-ce29-4057-8244-3949f0c68538",
                isoFileName: "image21.iso",
                ksFileName: "debian.ks",
                osVariant: "debian",
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                id: "cf6f912b-3f27-4f92-b104-4853ada60cee",
                isoFileName: "image22.iso",
                ksFileName: "centos.ks",
                osVariant: "fedora7",
                createdAt: new Date(),
                updatedAt: new Date()
            }
        ];

        return osRepository.insert(isoImages);
    });

    afterAll(async () => {
        await osRepository.remove(isoImages);
        return moduleRef.close();
    });

    test("Getting available iso images", () => {
        return expect(isoImageService.getAvailableIsoImages()).resolves.toEqual(isoImages.map(i => i.isoFileName));
    });

    test("Fetching the db os entry for the iso image", () => {
        const promise = isoImageService.getIsoImageOsEntry(isoImages[0].isoFileName);
        return expect(promise).resolves.toEqual(isoImages[0]);
    });

    test("Fetching the db os entry for the iso image image fails with IsoImageNotFoundError when it doesn't exist", () => {
        const promise = isoImageService.getIsoImageOsEntry("image3.iso");
        return expect(promise).rejects.toThrowError(IsoImageNotFoundError);
    });
});