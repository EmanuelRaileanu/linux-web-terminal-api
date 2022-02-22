import { Module } from "@nestjs/common";
import { VmManagerController } from "../controllers/vm-manager.controller";
import { VirtInstallService } from "../services/virt-install.service";
import { HttpModule } from "@nestjs/axios";
import { VirshService } from "../services/virsh.service";
import { ExecService } from "../services/exec.service";
import { VirtCloneService } from "../services/virt-clone.service";
import { TimezoneService } from "../services/timezone.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { config } from "../../../auth/src/config";
import { IsoImageModule } from "./iso-image.module";
import { ENTITIES } from "@shared/db-entities";
import { VmInstanceModule } from "./vm-instance.module";
import { NetworkService } from "../services/network.service";

@Module({
    imports: [
        HttpModule,
        TypeOrmModule.forRoot({
            type: "mysql",
            ...config.db,
            entities: ENTITIES,
            autoLoadEntities: true
        }),
        IsoImageModule,
        VmInstanceModule
    ],
    controllers: [VmManagerController],
    providers: [
        VirtInstallService,
        VirtCloneService,
        VirshService,
        TimezoneService,
        ExecService,
        NetworkService
    ]
})
export class VmManagerModule {}
