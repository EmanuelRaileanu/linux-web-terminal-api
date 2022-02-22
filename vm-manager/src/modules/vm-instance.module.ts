import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { VmInstance } from "@shared/db-entities/vm-instance.entity";
import { VmInstanceService } from "../services/vm-instance.service";

@Module({
    imports: [TypeOrmModule.forFeature([VmInstance])],
    providers: [VmInstanceService],
    exports: [TypeOrmModule, VmInstanceService]

})
export class VmInstanceModule {}