import { Module } from "@nestjs/common";
import { VmManagerController } from "./controllers/vm-manager.controller";
import { VmManagerService } from "./services/vm-manager.service";
import { ExecutorService } from "./services/executor.service";
import { HttpModule } from "@nestjs/axios";

@Module({
    imports: [HttpModule],
    controllers: [VmManagerController],
    providers: [VmManagerService, ExecutorService]
})
export class VmManagerModule {}
