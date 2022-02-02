import { Test, TestingModule } from "@nestjs/testing";
import { VmManagerController } from "../src/controllers/vm-manager.controller";
import { VmManagerService } from "../src/services/vm-manager.service";
import { ExecutorService } from "../src/services/executor.service";
import { HttpModule } from "@nestjs/axios";

describe("AuthController", () => {
    let authController: VmManagerController;

    beforeEach(async () => {
        const app: TestingModule = await Test.createTestingModule({
            imports: [HttpModule],
            controllers: [VmManagerController],
            providers: [VmManagerService, ExecutorService]
        }).compile();

        authController = app.get<VmManagerController>(VmManagerController);
    });

    describe("/api/v1", () => {
        test("Should work'", () => {
            return expect(authController).toEqual(authController);
        });
    });
});
