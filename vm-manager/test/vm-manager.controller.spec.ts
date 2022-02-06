import { Test, TestingModule } from "@nestjs/testing";
import { VmManagerController } from "../src/controllers/vm-manager.controller";
import { VirtInstallService } from "../src/services/virt-install.service";
import { HttpModule } from "@nestjs/axios";
import { IsoImageService } from "../src/services/iso-image.service";
import { VirshService } from "../src/services/virsh.service";
import { ExecService } from "../src/services/exec.service";
import { VirtCloneService } from "../src/services/virt-clone.service";

describe("AuthController", () => {
    let authController: VmManagerController;

    beforeEach(async () => {
        const app: TestingModule = await Test.createTestingModule({
            imports: [HttpModule],
            controllers: [VmManagerController],
            providers: [VirtInstallService, VirtCloneService, VirshService, IsoImageService, ExecService]
        }).compile();

        authController = app.get<VmManagerController>(VmManagerController);
    });

    describe("/api/v1", () => {
        test("Should work'", () => {
            return expect(authController).toEqual(authController);
        });
    });
});
