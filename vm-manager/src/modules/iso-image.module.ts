import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { OperatingSystem } from "@shared/db-entities/operating-system.entity";
import { IsoImageService } from "../services/iso-image.service";

@Module({
    imports: [TypeOrmModule.forFeature([OperatingSystem])],
    providers: [IsoImageService],
    exports: [IsoImageService, TypeOrmModule]
})
export class IsoImageModule {}