import { Module } from "@nestjs/common";
import { VmManagerController } from "./controllers/vm-manager.controller";
import { VmManagerService } from "./services/vm-manager.service";
import { HttpModule } from "@nestjs/axios";
import { IsoImageService } from "./services/iso-image.service";

@Module({
    imports: [HttpModule],
    controllers: [VmManagerController],
    providers: [VmManagerService, IsoImageService]
})
export class VmManagerModule {}
