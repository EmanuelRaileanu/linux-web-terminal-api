import { Module } from "@nestjs/common";
import { VmManagerController } from "../controllers/vm-manager.controller";
import { VirtInstallService } from "../services/virt-install.service";
import { HttpModule } from "@nestjs/axios";
import { IsoImageService } from "../services/iso-image.service";
import { VirshService } from "../services/virsh.service";
import { ExecService } from "../services/exec.service";
import { VirtCloneService } from "../services/virt-clone.service";
import { TimezoneService } from "../services/timezone.service";

@Module({
    imports: [HttpModule],
    controllers: [VmManagerController],
    providers: [
        VirtInstallService,
        VirtCloneService,
        VirshService,
        IsoImageService,
        TimezoneService,
        ExecService
    ]
})
export class VmManagerModule {}
