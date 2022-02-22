import { NetworkService } from "../src/services/network.service";
import { Test, TestingModule } from "@nestjs/testing";
import { VmInstanceService } from "../src/services/vm-instance.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { VmInstance } from "@shared/db-entities/vm-instance.entity";
import { User } from "@shared/db-entities/user.entity";
import { config } from "../src/config";
import { ENTITIES } from "@shared/db-entities";

describe(NetworkService, () => {
    let moduleRef: TestingModule;
    let networkService: NetworkService;

    beforeAll(async () => {
        moduleRef = await Test.createTestingModule({
            imports: [
                TypeOrmModule.forFeature([VmInstance, User]),
                TypeOrmModule.forRoot({
                    type: "mysql",
                    ...config.db,
                    database: config.testDb,
                    entities: ENTITIES
                })
            ],
            providers: [VmInstanceService, NetworkService]
        }).compile();

        networkService = moduleRef.get(NetworkService);
    });

    afterAll(() => {
        return moduleRef.close();
    });

    test("Generating a MAC address successfully - should never fail", async () => {
        const ip = await networkService.createKvmMacAddress();
        return expect(ip.startsWith("52:54:00:")).toBeTruthy();
    });

    test("Generating an IP address successfully - should never fail", async () => {
        const ip = await networkService.createIp();
        return expect(ip.startsWith("192.168.")).toBeTruthy();
    });
});