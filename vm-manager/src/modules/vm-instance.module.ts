import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { VmInstance } from "@shared/db-entities/vm-instance.entity";
import { VmInstanceService } from "../services/vm-instance.service";
import { User } from "@shared/db-entities/user.entity";

@Module({
    imports: [TypeOrmModule.forFeature([VmInstance, User])],
    providers: [VmInstanceService],
    exports: [TypeOrmModule, VmInstanceService]

})
export class VmInstanceModule {}