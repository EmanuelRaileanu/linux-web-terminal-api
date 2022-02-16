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
import { User } from "@shared/db-entities/user.entity";
import { OperatingSystem } from "@shared/db-entities/operating-system.entity";
import { IsoImageModule } from "./iso-image.module";

@Module({
    imports: [
        HttpModule,
        TypeOrmModule.forRoot({
            type: "mysql",
            ...config.db,
            entities: [User, OperatingSystem],
            synchronize: true,
            autoLoadEntities: true
        }),
        IsoImageModule
    ],
    controllers: [VmManagerController],
    providers: [
        VirtInstallService,
        VirtCloneService,
        VirshService,
        TimezoneService,
        ExecService
    ]
})
export class VmManagerModule {}
