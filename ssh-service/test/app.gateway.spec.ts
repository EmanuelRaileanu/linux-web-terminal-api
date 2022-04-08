import { Test, TestingModule } from "@nestjs/testing";
import { AppGateway } from "../src/app.gateway";
import { SSHService } from "../src/services/ssh.service";

describe("AppGateway", () => {
    let gateway: AppGateway;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [AppGateway, SSHService]
        }).compile();

        gateway = module.get<AppGateway>(AppGateway);
    });

    it("should be defined", () => {
        expect(gateway).toBeDefined();
    });
});
